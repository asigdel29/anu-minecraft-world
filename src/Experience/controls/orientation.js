// Touch-device and orientation detection for the mobile experience. The
// DOM-querying probes are thin wrappers over matchMedia; the decision logic is
// kept as a pure function so it can be unit-tested without a viewport.

const matches = (query) =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia(query).matches;

// True on a touch / stylus device (no fine mouse pointer). Drives whether the
// on-screen controls and the rotate hint are shown at all.
export const isCoarsePointer = () => matches("(pointer: coarse)");

// True when the viewport is taller than it is wide.
export const isPortraitViewport = () => matches("(orientation: portrait)");

/**
 * Whether to prompt the visitor to rotate: only on a touch device that is
 * currently held in portrait, where the on-screen controls are cramped.
 */
export const shouldPromptRotate = (coarse, portrait) => coarse && portrait;
