// Pure interpolation helpers for smoothing remote players toward their latest
// network state. Kept three.js-free so the easing math is unit-testable; the
// RemotePlayer component applies them to its group each frame.

// How quickly a remote player eases toward its latest known transform, in
// units of correction per second. Higher is snappier but jerkier.
export const LERP_SPEED = 8;

/**
 * Frame-rate-independent damping fraction for exponential smoothing: the share
 * of the remaining gap to close this frame given `speed` and `step` seconds.
 * Used for position lerps so they converge at the same rate regardless of FPS.
 */
export const dampFraction = (speed, step) => 1 - Math.exp(-speed * step);

/**
 * Step `current` toward `target` along the shortest angular path by fraction `t`
 * (capped at 1, so a large t snaps rather than overshoots). Wraps correctly
 * across the +/-PI seam.
 */
export const stepAngle = (current, target, t) => {
  let diff = target - current;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  return current + diff * Math.min(1, t);
};
