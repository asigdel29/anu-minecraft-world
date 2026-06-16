// File: src/Experience/battleship/BattleshipBlock.jsx
//
// Sentience world — interactable Battleship block.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add the battleship block that launches the game.
//
// The big block revealed once the message screen shatters. It registers with the
// existing walk-up interaction system, so approaching it shows the "press E"
// prompt; interacting opens the in-world Battleship board and marks the open
// world (enabling multiplayer/free roam).

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { registerInteractable } from "../stores/interactionStore";
import { STAGES, useSequenceStore } from "../sequence/sequenceStore";
import { useBattleshipStore } from "./battleshipStore";
import { BATTLESHIP_CENTER, NAVY } from "../sequence/layout";

const SIZE = 3;

export default function BattleshipBlock() {
  const stage = useSequenceStore((s) => s.stage);
  const position = useRef(new THREE.Vector3(...BATTLESHIP_CENTER));

  const visible = stage === STAGES.BATTLESHIP || stage === STAGES.OPEN_WORLD;

  useEffect(() => {
    if (!visible) return undefined;
    const target = {
      id: "battleship",
      position: position.current,
      title: "Play Battleship",
      open: () => {
        useBattleshipStore.getState().open();
        useSequenceStore.getState().setStage(STAGES.OPEN_WORLD);
      },
    };
    return registerInteractable(target);
  }, [visible]);

  if (!visible) return null;
  const [x, y, z] = BATTLESHIP_CENTER;

  return (
    <group position={[x, y, z]}>
      <mesh>
        <boxGeometry args={[SIZE, SIZE, SIZE]} />
        <meshBasicMaterial color={NAVY} toneMapped={false} />
      </mesh>
      {/* Water-blue cap so it reads as a sea tile. */}
      <mesh position={[0, SIZE / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshBasicMaterial color="#1b3a5b" toneMapped={false} />
      </mesh>
      <Text
        font="/fonts/Minecraft-Regular.ttf"
        position={[0, 0, SIZE / 2 + 0.02]}
        fontSize={0.42}
        maxWidth={SIZE * 0.9}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        color="#f5f5f7"
        outlineWidth={0.02}
        outlineColor="#06283d"
      >
        BATTLESHIP
      </Text>
    </group>
  );
}
