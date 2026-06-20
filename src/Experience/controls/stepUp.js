// Pure decision helpers for the step-up / stair-climbing algorithm used by the
// character controller in Player. They are deliberately free of three.js so the
// movement rules can be unit-tested without a live scene; Player keeps the
// raycasting and vector work and defers the two judgement calls to these.

// Maximum height the player may climb in a single step, and how far below the
// pre-step height a found surface may sit before it is rejected as a drop-off.
// The climb height is sized to the interior staircase treads, which rise a
// little more than half a unit per step; a smaller limit left the character
// unable to mount the steps and slipping back off them.
export const MAX_STEP_HEIGHT = 0.65;
export const STEP_DOWN_TOLERANCE = 0.1;

// Greatest drop the character follows down in a single frame while walking,
// rather than going airborne. Sized to the stair treads so descending a
// staircase reads as walking down the steps instead of launching off each lip
// and falling through the gap to the floor below.
export const MAX_STEP_DOWN = 0.65;

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

/**
 * Whether a surface found just beneath a walking, grounded character is close
 * enough below to step straight down onto instead of falling. `currentY` is the
 * character's height this frame and `groundY` the surface under it; the surface
 * must sit below the feet but no further than `maxDrop`. `groundY` is null when
 * no surface was hit, which is never a step-down.
 */
export const isWalkableStepDown = (
  currentY,
  groundY,
  maxDrop = MAX_STEP_DOWN
) =>
  groundY !== null &&
  groundY < currentY &&
  currentY - groundY <= maxDrop;
