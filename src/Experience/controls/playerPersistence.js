// Persist the local player's position and facing across sessions so a visitor
// resumes where they left off. The character look is persisted separately by the
// character store; this covers only the transform. The validation is kept pure
// so corrupt or hand-edited storage can never crash the spawn, and so it can be
// unit-tested without a DOM.

// The v2 suffix retired saves from the original small-lawn world layout when
// the open island landed; stale positions could otherwise resume inside new
// geometry. Bump it again on any world change that moves the walkable space.
export const STORAGE_KEY = "mc-player-state-v2";

// Seconds between throttled saves while moving — frequent enough to feel
// continuous, rare enough to be cheap.
export const SAVE_INTERVAL_SEC = 1;

/**
 * Validate a parsed player-state object, returning a clean `{ pos:[x,y,z], yaw }`
 * or null if anything is missing or non-finite. Guards the spawn against corrupt
 * localStorage.
 *
 * When `extents` is given (`{ minX, maxX, minZ, maxZ, minY? }`), a transform
 * outside the walkable world is rejected too, so a save that predates a world
 * layout change resumes at spawn instead of inside new geometry.
 */
export const sanitizePlayerState = (raw, extents = null) => {
  if (!raw || typeof raw !== "object") return null;
  const { pos, yaw } = raw;
  if (!Array.isArray(pos) || pos.length !== 3) return null;
  if (!pos.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return null;
  if (extents) {
    const [x, y, z] = pos;
    if (x < extents.minX || x > extents.maxX) return null;
    if (z < extents.minZ || z > extents.maxZ) return null;
    if (typeof extents.minY === "number" && y < extents.minY) return null;
  }
  return { pos: [pos[0], pos[1], pos[2]], yaw };
};

/**
 * Load the saved player transform, or null when none/invalid. `extents` is
 * forwarded to {@link sanitizePlayerState}.
 */
export const loadPlayerState = (extents = null) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizePlayerState(JSON.parse(raw), extents);
  } catch {
    return null;
  }
};

/**
 * Persist the player transform. `pos` is a THREE.Vector3-like `{x,y,z}`.
 */
export const savePlayerState = (pos, yaw) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pos: [pos.x, pos.y, pos.z], yaw })
    );
  } catch {
    // Storage full or blocked — silently skip.
  }
};
