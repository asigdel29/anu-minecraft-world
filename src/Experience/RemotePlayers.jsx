import { useMultiplayerStore } from "./stores/useMultiplayer";
import RemotePlayer from "./RemotePlayer";

// Renders one RemotePlayer for every peer the multiplayer store is tracking.
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
