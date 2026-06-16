// File: src/Experience/sequence/LogoWall.jsx
//
// Sentience world — giant Sentience logo block that shatters.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add procedural Sentience "S" logo wall.
//
// A huge wall of voxel cubes spelling the Sentience "S" (white on navy), placed
// in front of the spawn so it is the first thing the player sees. It shatters
// (via BlockBreak) when the sequence reaches LOGO_BREAKING, then hands off to the
// WALK stage. Built procedurally as cubes (not a baked GLB) precisely so it can
// break apart.

import { useEffect, useMemo, useState } from "react";
import BlockBreak from "./BlockBreak";
import { STAGES, useSequenceStore } from "./sequenceStore";
import { LOGO_CENTER, NAVY, WHITE } from "./layout";

// Scale (world units). Tunable here; placement lives in layout.js.
const CUBE = 1.35;
const PAD = 3; // navy border cells around the "S"

// The "S" glyph as a 7-wide x 9-tall bitmap (row 0 = top). 1 = white cube.
const GLYPH = [
  "0111110",
  "1111111",
  "1100000",
  "1100000",
  "0111110",
  "0000011",
  "0000011",
  "1111111",
  "0111110",
];

/**
 * buildBlocks returns the voxel cubes for the logo wall: a solid navy slab with
 * the white "S" overlaid, centred on LOGO_CENTER.
 */
function buildBlocks() {
  const glyphRows = GLYPH.length;
  const glyphCols = GLYPH[0].length;
  const rows = glyphRows + PAD * 2;
  const cols = glyphCols + PAD * 2;
  const [cx, cy, cz] = LOGO_CENTER;
  const blocks = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gr = r - PAD;
      const gc = c - PAD;
      const isWhite =
        gr >= 0 && gr < glyphRows && gc >= 0 && gc < glyphCols && GLYPH[gr][gc] === "1";
      blocks.push({
        x: cx + (c - (cols - 1) / 2) * CUBE,
        y: cy + ((rows - 1) / 2 - r) * CUBE,
        z: cz,
        color: isWhite ? WHITE : NAVY,
      });
    }
  }
  return blocks;
}

export default function LogoWall() {
  const stage = useSequenceStore((s) => s.stage);
  const setStage = useSequenceStore((s) => s.setStage);
  const [broken, setBroken] = useState(false);
  const blocks = useMemo(() => buildBlocks(), []);

  useEffect(() => {
    if (stage === STAGES.LOGO_BREAKING) setBroken(true);
  }, [stage]);

  // Once the logo is gone, advance to the walk stage.
  const handleComplete = () => setStage(STAGES.WALK);

  // Unmount entirely after the open world begins to free the instances.
  if (stage === STAGES.OPEN_WORLD) return null;

  return <BlockBreak blocks={blocks} size={CUBE} broken={broken} onComplete={handleComplete} />;
}
