import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import { groundYAt } from "./groundRay";
import DistanceGroup from "./DistanceGroup";
import { useParkNav } from "./parkStore";
import { registerInteractable } from "../stores/interactionStore";

// Placeholder low-poly attraction markers — stand-ins for the Blender-authored
// rides (the assets task swaps these for real GLBs at the same manifest
// positions). Each is a neon base disc, a per-ride primitive topper, and a
// floating label, distance-culled as a prop cluster and registered as a
// walk-up interactable: E — or click/tap — starts the balloon-cam flight.
const FONT = "/fonts/Minecraft-Regular.ttf";

// Neon palette per attraction id; unlit materials read as glow at night.
const NEON = {
  "agent-arcade": "#ff4d6d",
  factory: "#ffb84d",
  "idea-graveyard": "#9b5dff",
  library: "#4dd2ff",
  hardware: "#52ff7a",
  "launch-tower": "#ff5cf4",
  fortune: "#ffe14d",
};

// A small distinct topper per ride type so the seven read apart at a glance.
const topperFor = (ride, color) => {
  switch (ride) {
    case "drop-tower":
      return (
        <mesh position={[0, 4.4, 0]}>
          <coneGeometry args={[0.7, 4.4, 6]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    case "carousel":
      return (
        <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.18, 8, 24]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    case "smokestack":
      return (
        <mesh position={[0, 3.4, 0]}>
          <cylinderGeometry args={[0.45, 0.6, 5.2, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    default:
      // arcade-cabinet, tombstone-gate, workshop-tent, fortune-booth: a booth box.
      return (
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.7, 2.4, 1.7]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
  }
};

export default function AttractionMarker({ attraction, colliders }) {
  const group = useRef();
  const label = useRef();
  const dropped = useRef(false);
  const [x, , z] = attraction.position;
  const color = NEON[attraction.id] || "#ffe16b";

  // The interactable's position is mutated in place when the marker drops, so
  // the registry never re-registers and E-range stays exact.
  const interactAt = useRef(
    new THREE.Vector3(attraction.position[0], attraction.position[1], attraction.position[2])
  );

  // Drop to the terrain once its colliders are registered (the manifest y is a
  // placeholder 0; markers may mount before the lawn GLBs finish).
  useFrame(() => {
    if (dropped.current || !group.current) return;
    const y = groundYAt(colliders, x, z);
    if (y === null) return;
    dropped.current = true;
    group.current.position.y = y;
    interactAt.current.set(x, y, z);
  });

  // Gentle label bob — cheap life for the placeholder props.
  useFrame((state) => {
    if (label.current) {
      label.current.position.y =
        4.2 + Math.sin(state.clock.elapsedTime * 1.4 + x) * 0.12;
    }
  });

  // Walk-up interaction: selecting the marker starts the flight to it.
  // getState() keeps the open callback stable; the manifest rows are static
  // module constants, so this registers once per attraction.
  useEffect(() => {
    return registerInteractable({
      id: attraction.id,
      title: attraction.name,
      position: interactAt.current,
      open: () => useParkNav.getState().enter(attraction.id),
    });
  }, [attraction]);

  return (
    <group ref={group} position={[x, attraction.position[1], z]}>
      <DistanceGroup>
        <group
          onClick={() => useParkNav.getState().enter(attraction.id)}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.2, 24]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.3}
              depthWrite={false}
            />
          </mesh>
          {topperFor(attraction.ride, color)}
        </group>
        <Text
          ref={label}
          font={FONT}
          position={[0, 4.2, 0]}
          fontSize={0.55}
          color={color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#0a0a14"
        >
          {attraction.name}
        </Text>
      </DistanceGroup>
    </group>
  );
}
