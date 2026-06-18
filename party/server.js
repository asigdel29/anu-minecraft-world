// PartyKit server: manages the "world" room for multiplayer presence.
// Each connected client sends periodic state updates (position, rotation,
// action, character appearance). The server broadcasts to all other clients.

/** @type {import("partykit/server").default} */
export default {
  onConnect(connection, room) {
    // Announce to all existing clients that a new player joined.
    room.broadcast(
      JSON.stringify({
        type: "join",
        id: connection.id,
        ts: Date.now(),
      }),
      [connection.id]
    );

    // Send the new player the list of current connections so it can render them.
    const ids = [];
    for (const conn of room.getConnections()) {
      if (conn.id !== connection.id) {
        ids.push(conn.id);
        // Request state from each existing connection so the new player gets
        // their latest position. The client is expected to periodically send
        // state anyway, so this just accelerates the first frame.
      }
    }
    connection.send(JSON.stringify({ type: "peers", ids }));
  },

  onMessage(message, connection, room) {
    // Forward the message to all other connections with the sender's id.
    const data = JSON.parse(message);
    room.broadcast(
      JSON.stringify({ ...data, id: connection.id }),
      [connection.id]
    );
  },

  onClose(connection, room) {
    room.broadcast(
      JSON.stringify({
        type: "leave",
        id: connection.id,
        ts: Date.now(),
      })
    );
  },
};
