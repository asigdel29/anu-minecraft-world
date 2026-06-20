/* global WebSocketPair */
// Cloudflare Worker + Durable Object relay for the multiplayer "world" room.
//
// Uses a SQLite-backed DO (see the new_sqlite_classes migration in
// wrangler.toml), which is free-tier eligible. It relays presence (join/leave)
// and forwards each client's frame to the others, tagged with that client's id.
//
// It also remembers recent players: each client supplies a stable id (?pid=),
// the DO persists that player's latest transform, and a newcomer receives a
// snapshot of everyone seen within STATE_TTL_MS — so the world looks populated
// the instant you arrive, not only once others move. Storage survives
// hibernation, so the room is persistent across idle periods.

// How long a stored player is kept (and shown to joiners) after its last frame.
const STATE_TTL_MS = 5 * 60 * 1000;
// Don't write to storage more often than this per player (state arrives ~10 Hz).
const PERSIST_INTERVAL_MS = 1000;
// Longest id we accept as a storage key / hibernation tag.
const MAX_ID_LENGTH = 36;

const sanitizeId = (raw) =>
  typeof raw === "string"
    ? raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, MAX_ID_LENGTH)
    : "";

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
    // Per-id wall-clock of the last persisted frame, to throttle storage writes.
    // Best-effort: a hibernation wake resets it, costing at most one extra write.
    this.lastPersist = new Map();
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

  // Read stored players that are still fresh, deleting any that have expired.
  async freshPlayers(now) {
    const stored = await this.state.storage.list();
    const players = [];
    const expired = [];
    for (const [id, record] of stored) {
      if (record && now - record.ts <= STATE_TTL_MS) {
        players.push({ id, ...record });
      } else {
        expired.push(id);
      }
    }
    if (expired.length) await this.state.storage.delete(expired);
    return players;
  }

  async fetch(request) {
    const { 0: client, 1: server } = new WebSocketPair();
    // Prefer the client-supplied stable id so persistence keys survive reloads;
    // fall back to a random id for anonymous connections.
    const url = new URL(request.url);
    const id = sanitizeId(url.searchParams.get("pid")) || crypto.randomUUID().slice(0, 8);

    // Accept with hibernation so an idle room costs nothing.
    this.state.acceptWebSocket(server, [id]);

    const now = Date.now();
    // Announce the join to existing peers and hand the newcomer a snapshot of
    // everyone remembered (minus itself) so they render immediately.
    this.broadcast(JSON.stringify({ type: "join", id, ts: now }), server);
    const players = (await this.freshPlayers(now)).filter((p) => p.id !== id);
    server.send(JSON.stringify({ type: "snapshot", players }));

    return new Response(null, { status: 101, webSocket: client });
  }

  // Forward each frame to the other peers, stamped with the sender's id, and
  // persist state frames (throttled) so joiners can be shown recent players.
  webSocketMessage(ws, message) {
    let data;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }
    const id = this.idOf(ws);
    this.broadcast(JSON.stringify({ ...data, id }), ws);

    if (data.type === "state") {
      const now = Date.now();
      if (now - (this.lastPersist.get(id) || 0) >= PERSIST_INTERVAL_MS) {
        this.lastPersist.set(id, now);
        this.state.storage.put(id, {
          pos: data.pos,
          yaw: data.yaw,
          action: data.action,
          character: data.character,
          ts: now,
        });
      }
    }
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
