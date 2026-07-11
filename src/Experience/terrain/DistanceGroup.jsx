import { useRef } from "react";

import { useFrame } from "@react-three/fiber";

import { shouldBeVisible } from "./chunkGrid";

// Hides decorative content when the player is far from it. Visibility flips
// straight on the group (never through React state), on a slow cadence, and
// with a show/hide hysteresis band so props never flicker at the threshold.
// Meant for POI dressing — ambient critters, plaza props — whose draw calls
// add up across an open island; terrain itself streams via ChunkManager.
const CHECK_INTERVAL_SEC = 0.25;

export default function DistanceGroup({
  playerPositionRef,
  position = [0, 0, 0],
  showRadius,
  hideRadius,
  children,
}) {
  const group = useRef();
  const accumulator = useRef(0);

  useFrame((state, delta) => {
    const root = group.current;
    const player = playerPositionRef.current;
    if (!root || !player) return;
    accumulator.current += delta;
    if (accumulator.current < CHECK_INTERVAL_SEC) return;
    accumulator.current = 0;
    const dx = player.x - position[0];
    const dz = player.z - position[2];
    root.visible = shouldBeVisible(
      dx * dx + dz * dz,
      root.visible,
      showRadius,
      hideRadius
    );
  });

  return (
    <group ref={group} position={position}>
      {children}
    </group>
  );
}
