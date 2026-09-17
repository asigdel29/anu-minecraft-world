import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

import { PARK_BOUNDS } from "./attractions";

// The hot-air balloon landmark (the Madbox spatial reference calls for one): a
// decorative low-poly balloon drifting a slow circle over the park centre.
// Pure scenery — the balloon-cam flight reads as riding with it.
const CENTRE_X = (PARK_BOUNDS.minX + PARK_BOUNDS.maxX) / 2;
const CENTRE_Z = (PARK_BOUNDS.minZ + PARK_BOUNDS.maxZ) / 2;
const DRIFT_RADIUS = 24;
const HOVER_HEIGHT = 30;
// Lawn height near the centre (the spawn sits at y ≈ 64.85); the bob is small
// enough that the balloon never clips terrain.
const GROUND_Y = 64;

export default function ParkBalloon() {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.position.set(
      CENTRE_X + Math.cos(t * 0.05) * DRIFT_RADIUS,
      GROUND_Y + HOVER_HEIGHT + Math.sin(t * 0.4) * 1.2,
      CENTRE_Z + Math.sin(t * 0.05) * DRIFT_RADIUS
    );
    // Face along the drift so the balloon leads its own orbit.
    group.current.rotation.y = -t * 0.05;
  });

  return (
    <group ref={group}>
      {/* envelope */}
      <mesh>
        <sphereGeometry args={[2.6, 12, 12]} />
        <meshBasicMaterial color="#ff5c5c" />
      </mesh>
      {/* basket */}
      <mesh position={[0, -3.6, 0]}>
        <boxGeometry args={[1.2, 1, 1.2]} />
        <meshBasicMaterial color="#8a5a2b" />
      </mesh>
      {/* ropes */}
      <mesh position={[0, -2.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 4]} />
        <meshBasicMaterial color="#3a2a1a" />
      </mesh>
    </group>
  );
}
