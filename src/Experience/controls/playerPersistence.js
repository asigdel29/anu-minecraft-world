// Persist the local player's position and facing across sessions so a visitor
// resumes where they left off. The character look is persisted separately by the
// character store; this covers only the transform. The validation is kept pure
// so corrupt or hand-edited storage can never crash the spawn, and so it can be
// unit-tested without a DOM.

export const STORAGE_KEY = "mc-player-state";

// Seconds between throttled saves while moving — frequent enough to feel
// continuous, rare enough to be cheap.
export const SAVE_INTERVAL_SEC = 1;

/**
 * Validate a parsed player-state object, returning a clean `{ pos:[x,y,z], yaw }`
 * or null if anything is missing or non-finite. Guards the spawn against corrupt
 * localStorage.
 */
export const sanitizePlayerState = (raw) => {
  if (!raw || typeof raw !== "object") return null;
  const { pos, yaw } = raw;
  if (!Array.isArray(pos) || pos.length !== 3) return null;
  if (!pos.every((n) => typeof n === "number" && Number.isFinite(n))) return null;
  if (typeof yaw !== "number" || !Number.isFinite(yaw)) return null;
  return { pos: [pos[0], pos[1], pos[2]], yaw };
};

/**
 * Load the saved player transform, or null when none/invalid.
 */
export const loadPlayerState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizePlayerState(JSON.parse(raw));
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
