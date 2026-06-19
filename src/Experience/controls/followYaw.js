// Pure auto-follow step for the third-person camera yaw. Kept three.js-free so
// the easing can be unit-tested in isolation from the camera rig.

// Gentle default easing rate for the auto-follow, in radians-of-correction per
// second of `step` (capped at a full correction per frame).
export const DEFAULT_FOLLOW_SPEED = 2.0;

/**
 * Next camera yaw for one frame. While the player is moving and not dragging,
 * the yaw eases toward "behind the player" (`playerYaw + PI`) along the shortest
 * angular path; otherwise the current yaw is held so a manual orbit is never
 * fought. `step` is the frame delta in seconds.
 */
export const followYaw = (
  currentYaw,
  playerYaw,
  { isMoving, isDragging, step, followSpeed = DEFAULT_FOLLOW_SPEED }
) => {
  if (!isMoving || isDragging) return currentYaw;
  const targetYaw = playerYaw + Math.PI;
  let diff = targetYaw - currentYaw;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest path
  return currentYaw + diff * Math.min(1, followSpeed * step);
};
