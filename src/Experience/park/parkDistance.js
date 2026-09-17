// Pure hysteresis maths for distance-culling decorative park prop clusters
// (DistanceGroup). Same discipline as the terrain streaming: a cluster shows
// once the camera is within `showRadius`, hides beyond `hideRadius` (> show),
// and between the two keeps whatever it was — so a camera loitering on the
// boundary never flickers the props.

// Check cadence in seconds, matching the streaming selection interval.
export const DISTANCE_CADENCE_SEC = 0.25;

/**
 * Next visibility for a prop cluster. `shown` is the current visibility (the
 * caller holds it): inside `showRadius` the cluster shows, beyond `hideRadius`
 * it hides, and the hysteresis band in between holds the previous value.
 */
export const shouldShowGroup = (distance, { shown, showRadius, hideRadius }) => {
  if (distance <= showRadius) return true;
  if (distance > hideRadius) return false;
  return Boolean(shown);
};
