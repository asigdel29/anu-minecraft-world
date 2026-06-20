// Pure auto-follow step for the third-person camera yaw. Kept three.js-free so
// the easing can be unit-tested in isolation from the camera rig.

// Gentle default easing rate for the auto-follow, in radians-of-correction per
// second of `step` (capped at a full correction per frame).
export const DEFAULT_FOLLOW_SPEED = 2.0;

// Minimum alignment (cosine of the angle between the travel direction and the
// camera's forward axis) required before the auto-follow re-centers. Forward
// travel sits near +1 and re-centers; strafing sits near 0 and backing near -1,
// both of which hold the yaw so the view never whips around to chase a body that
// turned to face sideways or back toward the camera.
export const FOLLOW_ALIGN_MIN = 0.5;

/**
 * Next camera yaw for one frame. While the player is moving forward-ish (its
 * travel direction roughly aligned with where the camera looks) and the user is
 * not dragging, the yaw eases toward "behind the player" (`playerYaw + PI`)
 * along the shortest angular path; otherwise the current yaw is held so a manual
 * orbit, a strafe, or a backpedal never yanks the camera around.
 *
 * @param currentYaw current camera azimuth, in radians.
 * @param playerYaw the character's facing direction, in radians.
 * @param opts.isMoving whether the character is travelling this frame.
 * @param opts.isDragging whether the user is manually orbiting this frame.
 * @param opts.step frame delta, in seconds.
 * @param opts.alignment cosine of the angle between travel and camera-forward
 *   (−1..1); defaults to 1 so callers that omit it always re-center.
 * @param opts.followSpeed easing rate, in radians of correction per second.
 * @returns the camera yaw for this frame, in radians.
 */
export const followYaw = (
  currentYaw,
  playerYaw,
  {
    isMoving,
    isDragging,
    step,
    alignment = 1,
    followSpeed = DEFAULT_FOLLOW_SPEED,
  }
) => {
  if (!isMoving || isDragging) return currentYaw;
  if (alignment < FOLLOW_ALIGN_MIN) return currentYaw;
  const targetYaw = playerYaw + Math.PI;
  let diff = targetYaw - currentYaw;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest path
  return currentYaw + diff * Math.min(1, followSpeed * step);
};
