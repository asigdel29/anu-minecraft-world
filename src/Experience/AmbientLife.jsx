import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

// Lightweight exterior life: an idling voxel dog in the front garden, a few
// birds drifting overhead, and smoke rising from the chimney. All motion is
// ref-driven in one useFrame — no per-frame React state, no allocation.

const DOG_POS = [-3, 64.85, 13]; // front garden, on the ground
const CHIMNEY = [-2.6, 85.0, -0.3]; // chimney top in world space
const N_BIRDS = 4;
const N_SMOKE = 5;

function Dog({ groupRef, tailRef }) {
  const brown = "#6b4a2b";
  const dark = "#3a2614";
  const legs = [
    [-0.55, 0.35],
    [0.55, 0.35],
    [-0.55, -0.35],
    [0.55, -0.35],
  ];
  return (
    <group ref={groupRef} position={DOG_POS}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.6, 0.7, 0.8]} />
        <meshBasicMaterial color={brown} />
      </mesh>
      <mesh position={[0.95, 1.05, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshBasicMaterial color={brown} />
      </mesh>
      <mesh position={[1.3, 1.15, 0]}>
        <boxGeometry args={[0.25, 0.25, 0.45]} />
        <meshBasicMaterial color={dark} />
      </mesh>
      <mesh position={[0.78, 1.5, 0.28]}>
        <boxGeometry args={[0.2, 0.35, 0.15]} />
        <meshBasicMaterial color={dark} />
      </mesh>
      <mesh position={[0.78, 1.5, -0.28]}>
        <boxGeometry args={[0.2, 0.35, 0.15]} />
        <meshBasicMaterial color={dark} />
      </mesh>
      {legs.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.3, z]}>
          <boxGeometry args={[0.25, 0.6, 0.25]} />
          <meshBasicMaterial color={brown} />
        </mesh>
      ))}
      <group ref={tailRef} position={[-0.8, 1.0, 0]}>
        <mesh position={[-0.25, 0.12, 0]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.5, 0.16, 0.16]} />
          <meshBasicMaterial color={brown} />
        </mesh>
      </group>
    </group>
  );
}

export default function AmbientLife() {
  const dog = useRef();
  const tail = useRef();
  const birds = useRef([]);
  const smoke = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dog.current) dog.current.position.y = DOG_POS[1] + Math.sin(t * 2) * 0.06;
    if (tail.current) tail.current.rotation.y = Math.sin(t * 6) * 0.6;
    for (let i = 0; i < birds.current.length; i++) {
      const b = birds.current[i];
      if (!b) continue;
      const p = t * 0.3 + i * 1.7;
      b.position.set(
        -3 + Math.cos(p) * 11,
        74 + i * 1.4 + Math.sin(p * 2) * 0.7,
        8 + Math.sin(p) * 11
      );
      b.rotation.y = -p;
    }
    for (let i = 0; i < smoke.current.length; i++) {
      const s = smoke.current[i];
      if (!s) continue;
      const life = (t * 0.35 + i / N_SMOKE) % 1; // 0 -> 1, looping
      s.position.y = CHIMNEY[1] + life * 5;
      const sc = 0.3 + life * 1.0;
      s.scale.setScalar(sc);
      s.material.opacity = 0.45 * (1 - life);
    }
  });

  return (
    <group>
      <Dog groupRef={dog} tailRef={tail} />
      {Array.from({ length: N_BIRDS }).map((_, i) => (
        <group key={i} ref={(el) => (birds.current[i] = el)}>
          <mesh position={[-0.3, 0, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.5, 0.06, 0.12]} />
            <meshBasicMaterial color="#222222" />
          </mesh>
          <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.5, 0.06, 0.12]} />
            <meshBasicMaterial color="#222222" />
          </mesh>
        </group>
      ))}
      {Array.from({ length: N_SMOKE }).map((_, i) => (
        <mesh
          key={i}
          position={[CHIMNEY[0], CHIMNEY[1], CHIMNEY[2]]}
          ref={(el) => (smoke.current[i] = el)}
        >
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshBasicMaterial
            color="#dadada"
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
