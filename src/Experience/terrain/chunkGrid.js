// Pure chunk-selection helpers for streamed terrain. They are deliberately
// free of three.js and React so the streaming rules can be unit-tested without
// a live scene; ChunkManager keeps the frame loop and mounting work and defers
// every judgement call to these.
//
// The world is cut into square cells of `chunkSize` world units. Each frame
// (throttled) the manager asks which chunks should be mounted (`active`),
// which of those should register collision meshes (`colliders`), and which
// should be warmed in the loader cache (`prefetch`) for the player's current
// position.

// Chunk-unit radii, measured in Chebyshev (chessboard) distance so the loaded
// region is a square ring around the player's cell. A chunk LOADS when it
// comes within `loadRadius` but UNLOADS only once it passes `unloadRadius`;
// the gap is hysteresis, so pacing along a cell boundary never thrashes a
// chunk in and out of the scene. Colliders are a tighter ring — the player
// can only ever stand on nearby ground — and prefetch is one ring beyond
// load so a chunk's file is usually cached before it mounts.
export const DEFAULT_RADII = {
  loadRadius: 2,
  unloadRadius: 3,
  colliderRadius: 1,
  prefetchRadius: 3,
};

// Tighter ring for touch devices, where fill rate and GPU memory are the
// ceiling. One chunk of view is still ~32 units past the player's cell —
// comfortably beyond the fog's full-opacity distance on mobile tuning.
export const MOBILE_RADII = {
  loadRadius: 1,
  unloadRadius: 2,
  colliderRadius: 1,
  prefetchRadius: 2,
};

/** The streaming radii to use for a device; `coarse` per isCoarsePointer(). */
export const radiiForDevice = (coarse) =>
  coarse ? MOBILE_RADII : DEFAULT_RADII;

/**
 * Distance-culling hysteresis for decorative prop groups: a hidden group
 * shows when the player comes within `showRadius`, a visible one hides only
 * past `hideRadius` (> showRadius), so pacing on the threshold never makes
 * props flicker. Distances squared, so callers never need a sqrt.
 */
export const shouldBeVisible = (distSq, wasVisible, showRadius, hideRadius) =>
  wasVisible
    ? distSq <= hideRadius * hideRadius
    : distSq <= showRadius * showRadius;

/** Cell coordinates [cx, cz] containing world position (x, z). */
export const worldToChunk = (x, z, chunkSize) => [
  Math.floor(x / chunkSize),
  Math.floor(z / chunkSize),
];

/** Chebyshev distance between two cells, in whole chunks. */
export const chunkDistance = (cxA, czA, cxB, czB) =>
  Math.max(Math.abs(cxA - cxB), Math.abs(czA - czB));

/**
 * Chebyshev distance from a cell to a chunk's cell range. A chunk occupies
 * the cells [cx .. cx+spanX-1] x [cz .. cz+spanZ-1] (spans default to 1);
 * the distance is zero anywhere inside the range, so a wide chunk stays
 * loaded while the player stands anywhere on it.
 */
export const chunkRangeDistance = (pcx, pcz, chunk) => {
  const spanX = chunk.spanX ?? 1;
  const spanZ = chunk.spanZ ?? 1;
  const dx = Math.max(chunk.cx - pcx, pcx - (chunk.cx + spanX - 1), 0);
  const dz = Math.max(chunk.cz - pcz, pcz - (chunk.cz + spanZ - 1), 0);
  return Math.max(dx, dz);
};

const sameIds = (a, b) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

/**
 * The selection for a manifest before any player movement is known: only the
 * spawn-eager chunks are mounted (they load under the initial loading screen),
 * and the always-collide ones among them register collision immediately so
 * the character has ground to stand on at spawn.
 */
export const initialSelection = (chunks) => ({
  active: chunks.filter((c) => c.spawnEager).map((c) => c.id),
  colliders: chunks
    .filter((c) => c.spawnEager && c.alwaysCollide)
    .map((c) => c.id),
  prefetch: [],
});

/**
 * Compute the chunk selection for a player at world (x, z).
 *
 * A chunk is active when it is spawn-eager, within `loadRadius`, or already
 * active and still within `unloadRadius` (the hysteresis band). An active
 * chunk contributes colliders when it is within `colliderRadius` of the
 * player, or is marked `alwaysCollide` (used by the interim oversized terrain
 * pieces whose footprint spans many cells). Inactive chunks within
 * `prefetchRadius` are listed for loader warm-up.
 *
 * Returns `prev` itself when nothing changed, so a caller keeping the result
 * in React state can compare by reference and skip the re-render.
 */
export const selectChunks = (x, z, chunks, chunkSize, prev, radii) => {
  const [pcx, pcz] = worldToChunk(x, z, chunkSize);
  const prevActive = new Set(prev ? prev.active : []);
  const active = [];
  const colliders = [];
  const prefetch = [];
  for (const chunk of chunks) {
    const distance = chunkRangeDistance(pcx, pcz, chunk);
    const isActive =
      chunk.spawnEager ||
      distance <= radii.loadRadius ||
      (prevActive.has(chunk.id) && distance <= radii.unloadRadius);
    if (isActive) {
      active.push(chunk.id);
      if (chunk.alwaysCollide || distance <= radii.colliderRadius) {
        colliders.push(chunk.id);
      }
    } else if (distance <= radii.prefetchRadius) {
      prefetch.push(chunk.id);
    }
  }
  if (
    prev &&
    sameIds(active, prev.active) &&
    sameIds(colliders, prev.colliders) &&
    sameIds(prefetch, prev.prefetch)
  ) {
    return prev;
  }
  return { active, colliders, prefetch };
};

/**
 * World-space extents of the cells a manifest covers: the outer edges of the
 * outermost chunks. The island manifest derives the player's soft world
 * bounds from this so terrain and bounds can never drift apart.
 */
export const deriveExtents = (chunks, chunkSize) => {
  if (!chunks.length) return null;
  let minCx = Infinity;
  let maxCx = -Infinity;
  let minCz = Infinity;
  let maxCz = -Infinity;
  for (const chunk of chunks) {
    minCx = Math.min(minCx, chunk.cx);
    maxCx = Math.max(maxCx, chunk.cx + (chunk.spanX ?? 1) - 1);
    minCz = Math.min(minCz, chunk.cz);
    maxCz = Math.max(maxCz, chunk.cz + (chunk.spanZ ?? 1) - 1);
  }
  return {
    minX: minCx * chunkSize,
    maxX: (maxCx + 1) * chunkSize,
    minZ: minCz * chunkSize,
    maxZ: (maxCz + 1) * chunkSize,
  };
};
