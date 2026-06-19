/* global WebSocketPair */
// Cloudflare Worker + Durable Object relay for the multiplayer "world" room.
//
// Replaces the earlier PartyKit handler: PartyKit cannot deploy to a free
// Cloudflare plan (it requests classic, paid-only Durable Objects), whereas this
// uses a SQLite-backed DO (see the new_sqlite_classes migration in
// wrangler.toml) which is free-tier eligible. It is relay-only: it announces
// join/leave and forwards each client's message to the others, tagged with a
// per-connection id. It persists nothing and inspects no payload field.

export default {
  // Route every socket for the single shared room to one Durable Object
  // instance. Any /party/<room> path maps to the same "world" stub.
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/party/")) {
      return new Response("anu-minecraft-world relay", { status: 200 });
    }
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    const stub = env.ROOM.get(env.ROOM.idFromName("world"));
    return stub.fetch(request);
  },
};

export class Room {
  constructor(state) {
    this.state = state;
  }

  // The connection id is the WebSocket's hibernation tag, so it survives the DO
  // sleeping/waking without any stored state.
  idOf(ws) {
    const tags = this.state.getTags(ws);
    return tags && tags[0];
  }

  broadcast(message, exclude) {
    for (const ws of this.state.getWebSockets()) {
      if (ws === exclude) continue;
      try {
        ws.send(message);
      } catch {
        // Socket already gone — the close handler will clean up.
      }
    }
  }

  async fetch() {
    const { 0: client, 1: server } = new WebSocketPair();
    const id = crypto.randomUUID().slice(0, 8);

    // Accept with hibernation so an idle room costs nothing.
    this.state.acceptWebSocket(server, [id]);

    // Tell existing peers someone joined, and hand the newcomer the peer list.
    const ids = this.state
      .getWebSockets()
      .map((ws) => this.idOf(ws))
      .filter((other) => other && other !== id);
    this.broadcast(JSON.stringify({ type: "join", id, ts: Date.now() }), server);
    server.send(JSON.stringify({ type: "peers", ids }));

    return new Response(null, { status: 101, webSocket: client });
  }

  // Forward each frame to the other peers, stamped with the sender's id. The
  // payload is treated as opaque; the client validates and escapes it.
  webSocketMessage(ws, message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }
    this.broadcast(JSON.stringify({ ...data, id: this.idOf(ws) }), ws);
  }

  webSocketClose(ws) {
    this.broadcast(
      JSON.stringify({ type: "leave", id: this.idOf(ws), ts: Date.now() })
    );
  }

  webSocketError(ws) {
    this.broadcast(
      JSON.stringify({ type: "leave", id: this.idOf(ws), ts: Date.now() })
    );
  }
}
