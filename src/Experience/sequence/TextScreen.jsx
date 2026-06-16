// File: src/Experience/sequence/TextScreen.jsx
//
// Sentience world — giant message screen that shatters.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add framed message screen with shatter.
//
// A large framed voxel screen (white border, navy face) carrying the thank-you
// message in the Minecraft font. It is revealed once the logo breaks, holds
// while the player reads it, then shatters (via BlockBreak) when the sequence
// reaches SCREEN_BREAKING and hands off to the battleship stage.

import { useEffect, useMemo, useState } from "react";
import { Text } from "@react-three/drei";
import BlockBreak from "./BlockBreak";
import { STAGES, useSequenceStore } from "./sequenceStore";
import { SCREEN_CENTER, NAVY, WHITE } from "./layout";

const MESSAGE = "Hey, thanks for this awesome task,\nreally had fun, check it out";

const CUBE = 1.2;
const COLS = 18;
const ROWS = 9;

/** buildSlab returns the framed screen's voxel cubes (white border, navy face). */
function buildSlab() {
  const [cx, cy, cz] = SCREEN_CENTER;
  const blocks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const border = r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1;
      blocks.push({
        x: cx + (c - (COLS - 1) / 2) * CUBE,
        y: cy + ((ROWS - 1) / 2 - r) * CUBE,
        z: cz,
        color: border ? WHITE : NAVY,
      });
    }
  }
  return blocks;
}

export default function TextScreen() {
  const stage = useSequenceStore((s) => s.stage);
  const setStage = useSequenceStore((s) => s.setStage);
  const [broken, setBroken] = useState(false);
  const blocks = useMemo(() => buildSlab(), []);

  useEffect(() => {
    if (stage === STAGES.SCREEN_BREAKING) setBroken(true);
  }, [stage]);

  // The screen only exists from the walk stage through its own shatter.
  const visible =
    stage === STAGES.WALK || stage === STAGES.SCREEN || stage === STAGES.SCREEN_BREAKING;
  if (!visible) return null;

  const [cx, cy, cz] = SCREEN_CENTER;

  return (
    <group>
      <BlockBreak
        blocks={blocks}
        size={CUBE}
        broken={broken}
        onComplete={() => setStage(STAGES.BATTLESHIP)}
      />
      {!broken && (
        <Text
          font="/fonts/Minecraft-Regular.ttf"
          position={[cx, cy, cz + CUBE / 2 + 0.15]}
          fontSize={0.92}
          maxWidth={(COLS - 3) * CUBE}
          lineHeight={1.4}
          textAlign="center"
          anchorX="center"
          anchorY="middle"
          color="#bfe9ff"
          outlineWidth={0.04}
          outlineColor="#06283d"
        >
          {MESSAGE}
        </Text>
      )}
    </group>
  );
}
