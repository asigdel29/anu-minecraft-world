import { useMultiplayerStore } from "./stores/useMultiplayer";
import RemotePlayer from "./RemotePlayer";

// Renders all remote players currently tracked by the multiplayer store.
export default function RemotePlayers() {
  const remotePlayers = useMultiplayerStore((s) => s.remotePlayers);

  return (
    <>
      {Object.entries(remotePlayers).map(([id, data]) => (
        <RemotePlayer key={id} data={data} />
      ))}
    </>
  );
}
