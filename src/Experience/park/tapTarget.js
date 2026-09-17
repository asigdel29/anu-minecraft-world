// Pure tap-target sizing for in-world markers (LOR-2423 mobile parity).
//
// A touch target must be at least 44 CSS px on screen (WCAG 2.5.5 / platform
// guidance). For 3D geometry the projected size shrinks with distance, so the
// marker hit disc's world radius is chosen against the park scale: how big a
// disc of radius `r` units appears, in pixels, at `distance` units from a
// camera with vertical `fov` degrees on a `viewportPx`-tall screen.
//
//    px = viewportPx * angularSize / fov,  angularSize = 2 * atan(r / distance)
//
// Keeping the maths here (not in the component) makes the guarantee testable
// against the real park distances without a scene.

export const MIN_TAP_PX = 44;

/**
 * Projected height in CSS px of a world-space disc of `radius` units viewed
 * from `distance` units, using the camera's vertical fov on a viewport
 * `viewportPx` px tall. Returns 0 for degenerate inputs (non-positive radius,
 * distance, or viewport).
 */
export const tapTargetPx = ({ radius, distance, fov, viewportPx }) => {
  if (!(radius > 0) || !(distance > 0) || !(fov > 0) || !(viewportPx > 0)) {
    return 0;
  }
  const angularSize = 2 * Math.atan(radius / distance); // radians
  const fovRad = (fov * Math.PI) / 180;
  return (angularSize / fovRad) * viewportPx;
};

/**
 * The farthest distance (world units) at which a disc of `radius` units still
 * projects to at least `minPx` on a `viewportPx`-tall, vertical-`fov` camera.
 * Inverse of the projection above; the marker test uses this to assert the
 * hit disc covers the park's realistic interaction distances.
 */
export const maxDistanceForTapPx = ({ radius, fov, viewportPx, minPx }) => {
  if (
    !(radius > 0) ||
    !(fov > 0) ||
    !(viewportPx > 0) ||
    !(minPx > 0) ||
    minPx >= viewportPx
  ) {
    return 0;
  }
  const fovRad = (fov * Math.PI) / 180;
  const angularSize = (minPx / viewportPx) * fovRad;
  return radius / Math.tan(angularSize / 2);
};
