// Data and pure helpers for the guided house tour: a scripted camera sweep that
// climbs the atrium and frames the posters on each floor, then returns control.
// The three.js work (building the spline, slerping orientation, moving the
// camera) lives in useTourCamera; the values and the timing maths here are kept
// three.js-free so they can be unit-tested in isolation.

// How long, in seconds, a full play of the tour takes from start to finish.
export const TOUR_DURATION = 16;

// Control points of the camera path, in world space. The sweep approaches the
// house from the lawn, enters through the doorway, climbs the atrium shaft past
// each floor (facing the back wall where the posters hang), then descends and
// arcs back out. Ported from the original scroll-driven navigation.
export const TOUR_PATH = [
  [2, 65, 47.5], // far approach
  [-2, 65.5, 33],
  [-5.5, 66.2, 20],
  [-5.5, 66.7, 11], // nearing the door
  [-5.5, 67.0, 5.5], // through the doorway
  [-5.5, 67.5, 3.0], // ground floor (about / manual)
  [-5.5, 70.5, 3.0],
  [-5.5, 73.0, 3.0], // middle floor (projects)
  [-5.5, 75.8, 3.0],
  [-5.5, 78.4, 3.0], // top floor (links / books)
  [-5.5, 80.0, 3.0], // top of the climb
  [-5.5, 74.0, 3.2], // descend the shaft
  [-5.5, 67.4, 5.5], // back toward the door
  [-5.5, 66.4, 14], // exit the door
  [-2, 65.5, 30], // arc back out
  [3, 65, 44],
];

// Camera orientation keyframes along the path, as small Euler tilts around a
// base that looks down -Z into the house. Slerped between keyframes so the view
// eases (e.g. glancing up the shaft at the top of the climb).
export const TOUR_ROTATIONS = [
  { progress: 0, euler: [-0.05, 0.06, 0] }, // approach
  { progress: 0.18, euler: [0, 0, 0] }, // doorway
  { progress: 0.31, euler: [0.04, 0, 0] }, // ground floor
  { progress: 0.44, euler: [0.03, 0, 0] }, // middle floor
  { progress: 0.56, euler: [0.03, 0, 0] }, // top floor
  { progress: 0.62, euler: [0.18, 0, 0] }, // glance up the shaft
  { progress: 0.78, euler: [-0.02, 0, 0] }, // descending
  { progress: 0.9, euler: [-0.05, 0.04, 0] }, // exiting
  { progress: 1, euler: [-0.05, 0.06, 0] },
];

// Progress windows over which each floor's posters are highlighted, centred on
// the moment the camera frames that floor while climbing.
export const FLOOR_RANGES = {
  ground: [0.27, 0.38],
  middle: [0.4, 0.5],
  top: [0.52, 0.62],
};

// Floor order, indexed by the tour's `currentFloor`. The labels are used by the
// tour HUD; the keys map to FLOORS / FLOOR_RANGES / PANELS.
export const FLOOR_KEYS = ["ground", "middle", "top"];
export const FLOOR_LABELS = ["Ground Floor", "Middle Floor", "Top Floor"];

// The progress value at which the camera frames each floor — the tour eases to
// the current floor's value and holds there until the visitor steps Next/Prev.
export const FLOOR_VIEW_PROGRESS = [0.31, 0.44, 0.56];

// How quickly the held progress eases toward the target floor (fraction of the
// remaining gap per second), capped at a full correction per frame.
export const TOUR_EASE_SPEED = 1.8;

/**
 * Advance the tour progress by one frame, clamped to the [0, 1] range. `current`
 * is this frame's progress, `step` the frame delta in seconds, and `duration`
 * the full play length. Returns the next progress value.
 */
export const advanceProgress = (current, step, duration = TOUR_DURATION) =>
  Math.min(1, current + step / duration);

/**
 * Ease the tour progress one frame toward a target, moving a fraction of the
 * remaining distance so the camera glides to a floor and settles. `current` is
 * this frame's progress, `target` the floor's view progress, `step` the frame
 * delta in seconds, and `speed` the easing rate. The correction is capped at a
 * full move per frame so a long frame never overshoots.
 */
export const easeTowards = (current, target, step, speed = TOUR_EASE_SPEED) =>
  current + (target - current) * Math.min(1, speed * step);

/**
 * Whether a progress value falls within an inclusive `[min, max]` window.
 */
export const isWithinRange = (progress, [min, max]) =>
  progress >= min && progress <= max;

/**
 * Brightness multiplier for a poster at the given tour progress. Posters on the
 * floor whose range is active pulse between 1 and `1 + amplitude` on a sine of
 * `time`; everything else stays at 1 (its normal brightness).
 *
 * @param progress current tour progress, 0..1.
 * @param range the floor's highlight window `[min, max]`.
 * @param time elapsed seconds, used to drive the pulse.
 * @param amplitude peak extra brightness at the top of the pulse.
 * @returns a colour multiplier >= 1.
 */
export const posterBrightness = (progress, range, time, amplitude = 1.5) => {
  if (!isWithinRange(progress, range)) return 1;
  const pulse = (Math.sin(time * 3) + 1) / 2; // 0..1
  return 1 + pulse * amplitude;
};
