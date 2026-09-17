import { LOOK_HEIGHT } from "../controls/useThirdPersonCamera";

// Pure camera-flight maths for the park balloon-cam, kept three.js-free (plain
// {x, y, z} objects) so it unit-tests without a scene; the rig converts to
// THREE.Vector3. Mirrors the tour.js split — values and timing maths here, the
// three.js work in the hook.

// Fraction of the remaining distance covered per second while flying to (or
// back from) a viewpoint — an exponential glide; the per-frame correction is
// capped at a full move so a long frame never overshoots.
export const FLIGHT_SPEED = 2.4;

// The rig reports "arrived" once the camera sits this close to its viewpoint.
export const ARRIVE_DISTANCE = 0.5;

// The handoff back to the walk-mode orbit camera happens inside this distance.
export const HANDOFF_DISTANCE = 0.25;

/**
 * Ease one scalar toward a target for a frame. `step` is the frame delta in
 * seconds; the correction is capped at a full move per frame.
 */
export const easeComponent = (current, target, step, speed = FLIGHT_SPEED) =>
  current + (target - current) * Math.min(1, speed * step);

/** Ease a whole point toward a target for a frame. */
export const easePoint = (point, target, step, speed = FLIGHT_SPEED) => ({
  x: easeComponent(point.x, target.x, step, speed),
  y: easeComponent(point.y, target.y, step, speed),
  z: easeComponent(point.z, target.z, step, speed),
});

/** Euclidean distance between two points. */
export const distanceBetween = (a, b) =>
  Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Where the balloon-cam parks to frame a marker: up and off to one side,
 * aiming slightly above the base so the label sits in frame.
 */
export const markerViewpoint = (position) => ({
  position: {
    x: position[0] + 9,
    y: position[1] + 7,
    z: position[2] + 9,
  },
  look: {
    x: position[0],
    y: position[1] + 2.5,
    z: position[2],
  },
});

/**
 * The camera position the walk-mode orbit rig would take right now, given the
 * player position and the orbit pose mirrored in parkPlayerState. The
 * balloon-cam eases onto exactly this pose before handing the camera back, so
 * returning from a page never cuts. Mirrors useThirdPersonCamera's maths
 * (LOOK_HEIGHT aim; offset x = sin(yaw), z = cos(yaw)).
 */
export const orbitPosePosition = (playerPos, orbit) => {
  const cosPitch = Math.cos(orbit.pitch);
  const aimY = playerPos.y + LOOK_HEIGHT;
  return {
    x: playerPos.x + orbit.distance * Math.sin(orbit.yaw) * cosPitch,
    y: aimY + orbit.distance * Math.sin(orbit.pitch),
    z: playerPos.z + orbit.distance * Math.cos(orbit.yaw) * cosPitch,
  };
};

/** The point on the character the orbit camera aims at (its head). */
export const orbitPoseLook = (playerPos) => ({
  x: playerPos.x,
  y: playerPos.y + LOOK_HEIGHT,
  z: playerPos.z,
});
