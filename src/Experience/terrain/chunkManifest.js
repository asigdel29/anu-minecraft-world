// Manifest of the streamable terrain chunks and the world's walkable extents.
// This is the single source of truth the chunk manager mounts from and the
// player derives its soft bounds from, so terrain and bounds cannot drift
// apart as the island grows.
//
// The island (assets/island.blend, exported by assets/pipeline/bake_export.py)
// spans world x/z -160..160 = cells -5..4 at CHUNK_SIZE 32. Terrain ships as
// four baked quadrants, each spanning 5x5 cells (spanX/spanZ) and carrying a
// decimated collision proxy under a "colliders" subtree. The quadrants are
// spawn-eager (all four are visible through the house windows, so the
// SceneSky capture needs them) and always-collide (four cheap proxies).
// Prop clusters are plain streamed chunks: decorative, colliderless, faded
// in and out by distance like any grid chunk.

import { deriveExtents } from "./chunkGrid";

// World units per square chunk cell. Matches the export grid the island
// terrain is cut on; see docs/ASSETS.md.
export const CHUNK_SIZE = 32;

const MODELS = "/models/island";

export const CHUNKS = [
  ...["wn", "en", "ws", "es"].map((key) => ({
    id: `island_${key}`,
    url: `${MODELS}/IslandQ_${key}-transformed.glb`,
    cx: key[0] === "w" ? -5 : 0,
    cz: key[1] === "n" ? -5 : 0,
    spanX: 5,
    spanZ: 5,
    spawnEager: true,
    alwaysCollide: true,
  })),
  {
    id: "water",
    url: `${MODELS}/Water-transformed.glb`,
    cx: -5,
    cz: -5,
    spanX: 10,
    spanZ: 10,
    spawnEager: true,
    alwaysCollide: true,
  },
  ...["wn", "en", "ws", "es"].map((key) => ({
    id: `props_${key}`,
    url: `${MODELS}/PropsQ_${key}-transformed.glb`,
    cx: key[0] === "w" ? -5 : 0,
    cz: key[1] === "n" ? -5 : 0,
    spanX: 5,
    spanZ: 5,
  })),
];

export const CHUNKS_BY_ID = Object.fromEntries(
  CHUNKS.map((chunk) => [chunk.id, chunk])
);

// Soft world boundary for the player: the outer edges of the island cells
// (the water chunk is excluded so the bounds hug the terrain, not the sea).
export const WORLD_EXTENTS = deriveExtents(
  CHUNKS.filter((chunk) => chunk.id !== "water"),
  CHUNK_SIZE
);
