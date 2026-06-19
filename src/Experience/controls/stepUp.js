// Pure decision helpers for the step-up / stair-climbing algorithm used by the
// character controller in Player. They are deliberately free of three.js so the
// movement rules can be unit-tested without a live scene; Player keeps the
// raycasting and vector work and defers the two judgement calls to these.

// Maximum height the player may climb in a single step, and how far below the
// pre-step height a found surface may sit before it is rejected as a drop-off.
export const MAX_STEP_HEIGHT = 0.5;
export const STEP_DOWN_TOLERANCE = 0.1;

/**
 * Whether wall sliding shortened the intended move enough to suspect a climbable
 * obstacle. `intendedLen` is the pre-slide horizontal distance and `slidLen` the
 * post-slide distance; a reduction past `ratio` (default 5%) counts as blocked.
 */
export const isBlockedByObstacle = (intendedLen, slidLen, ratio = 0.95) =>
  slidLen < intendedLen * ratio;

/**
 * Whether the ground found after a tentative step up is a real, climbable
 * surface: present (`groundY` is null when no ground was hit), no higher than
 * `maxStepHeight` above the pre-step height `baseY`, and not lower than `baseY`
 * by more than `drop` — so the test never snaps the player down a cliff.
 */
export const isClimbableStep = (
  groundY,
  baseY,
  maxStepHeight = MAX_STEP_HEIGHT,
  drop = STEP_DOWN_TOLERANCE
) =>
  groundY !== null &&
  groundY <= baseY + maxStepHeight &&
  groundY >= baseY - drop;
