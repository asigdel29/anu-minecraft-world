// Manifest of the streamable terrain chunks and the world's walkable extents.
// This is the single source of truth the chunk manager mounts from and the
// player derives its soft bounds from, so terrain and bounds cannot drift
// apart as the island grows.
//
// Interim state: the entries below are the three original lawn GLBs, which
// were authored as one lawn split by direction rather than on a grid. Their
// footprints span several cells each, so they are pinned `spawnEager` (they
// are visible through the house windows and must be in the SceneSky capture)
// and `alwaysCollide` (distance-gated colliders assume a chunk fits its
// cell). Island chunks exported on the CHUNK_SIZE grid replace them with
// plain `{ id, url, cx, cz }` entries and get streaming for free.

import BackGrass from "../models/BackGrassT";
import FrontGrass from "../models/FrontGrassT";
import GrassSides from "../models/GrassSidesT";

// World units per square chunk cell. Matches the export grid the island
// terrain is cut on in Blender; see docs/ASSETS.md.
export const CHUNK_SIZE = 32;

export const CHUNKS = [
  {
    id: "lawn_back",
    Component: BackGrass,
    cx: -1,
    cz: -2,
    spawnEager: true,
    alwaysCollide: true,
  },
  {
    id: "lawn_front",
    Component: FrontGrass,
    cx: 0,
    cz: 0,
    spawnEager: true,
    alwaysCollide: true,
  },
  {
    id: "lawn_sides",
    Component: GrassSides,
    cx: -1,
    cz: 0,
    spawnEager: true,
    alwaysCollide: true,
  },
];

export const CHUNKS_BY_ID = Object.fromEntries(
  CHUNKS.map((chunk) => [chunk.id, chunk])
);

// Soft world boundary for the player, kept explicit while the interim lawn
// chunks span cells they are not registered on. Once the island manifest
// lands (chunks cut on the grid), replace this with
// `deriveExtents(CHUNKS, CHUNK_SIZE)` from chunkGrid.js. The values are the
// original hand-tuned lawn bounds.
export const WORLD_EXTENTS = { minX: -45, maxX: 45, minZ: -50, maxZ: 55 };
