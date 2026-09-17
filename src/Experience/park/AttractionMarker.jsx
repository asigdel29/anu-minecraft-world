import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";

import { groundYAt } from "./groundRay";
import DistanceGroup from "./DistanceGroup";
import { PARK_ATMOSPHERE } from "./parkAtmosphere";
import { useParkNav } from "./parkStore";
import { registerInteractable } from "../stores/interactionStore";

// Interaction anchors for the real park rides: a neon base disc, a floating
// label, and a generous invisible tap target, distance-culled as a cluster
// and registered as a walk-up interactable — E, or a tap/click, starts the
// balloon-cam flight. The ride geometry itself mounts as its own world-baked
// GLB beside the marker (ParkModels.jsx); these props only invite you in.
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

// Touch hit target. The visible disc is art; an invisible, larger base disc
// (HIT_RADIUS 4.5) plus a full-height invisible cylinder carry the taps, so
// the marker stays a ≥44px target (MIN_TAP_PX, see tapTarget.js) out to ~60
// units on a 375px-tall phone viewport at the camera's 70° fov — the walk-up
// and flight-viewpoint range. Farther taps still enter (raycasts are
// world-space); the guarantee covers the designed interaction range.
const HIT_RADIUS = 4.5;

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
      <DistanceGroup
        showRadius={PARK_ATMOSPHERE.cullShow}
        hideRadius={PARK_ATMOSPHERE.cullHide}
      >
        {/* One tap path for the whole marker: a single handler on the group,
            with stopPropagation so nested meshes never double-fire. Invisible
            hit geometry (base disc + full-height pill) gives touch a ≥44px
            target across the designed interaction range; the label sits
            inside the group so tapping it enters too. */}
        <group
          onClick={(event) => {
            event.stopPropagation();
            useParkNav.getState().enter(attraction.id);
          }}
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
          <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[HIT_RADIUS, 16]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[HIT_RADIUS * 0.7, HIT_RADIUS * 0.7, 6, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
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
        </group>
      </DistanceGroup>
    </group>
  );
}
