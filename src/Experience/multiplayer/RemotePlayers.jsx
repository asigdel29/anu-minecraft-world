// File: src/Experience/multiplayer/RemotePlayers.jsx
//
// Sentience world — renders every connected remote player.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Render the live roster of remote Steves.
//
// Opens the presence connection (usePresence) and renders one RemoteSteve per
// player currently in the room. Membership comes from the presence store, so
// avatars appear and vanish as players join and leave.

import { usePresence } from "./usePresence";
import { usePresenceStore } from "./presenceStore";
import RemoteSteve from "./RemoteSteve";

export default function RemotePlayers() {
  usePresence();
  const players = usePresenceStore((s) => s.players);
  return (
    <>
      {Object.entries(players).map(([id, p]) => (
        <RemoteSteve key={id} id={id} name={p.name} />
      ))}
    </>
  );
}
