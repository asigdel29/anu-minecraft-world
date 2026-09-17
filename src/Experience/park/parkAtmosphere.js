import { PARK_BOUNDS } from "./attractions";

/**
 * Night-fog and culling budgets for the park, derived in one place from the
 * walkable bounds instead of being hand-tuned beside the scene. The previous
 * constants (fog 26..92) predate both the manifest scale and the night scene;
 * the distances below come from the park's own geometry:
 *
 * - widest sightline across the walkable lawn is the bounds diagonal:
 *     hypot(45 - (-45), 55 - (-50)) ≈ 138.3 units
 * - fogFar covers the widest sightline plus 10% margin (ceil), so the far
 *   edge never pops in through fog
 * - fogNear starts fog at 40% of fogFar — the night palette keeps it subtle
 *   over the nearby ground while the far edge fades into the sky
 * - cull radii straddle fogFar: hide exactly at fogFar (nothing visible is
 *   ever culled), show at 85% with hysteresis so a cull never flickers
 *
 * At park scale the derived show radius exceeds every sightline (the worst
 * balloon-cam view across the lawn is ~110 units XZ), so nothing decorative
 * is culled today — these numbers exist so that if the park grows, the same
 * derivation moves the culling ring without re-tuning call sites.
 */

/**
 * @param {{minX: number, maxX: number, minZ: number, maxZ: number}} bounds
 * @returns {{fogNear: number, fogFar: number, cullShow: number, cullHide: number}}
 */
export const deriveAtmosphere = (bounds) => {
  const diagonal = Math.hypot(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
  const fogFar = Math.ceil(diagonal * 1.1);
  return {
    fogFar,
    fogNear: Math.round(fogFar * 0.4),
    cullShow: Math.round(fogFar * 0.85),
    cullHide: fogFar,
  };
};

export const PARK_ATMOSPHERE = deriveAtmosphere(PARK_BOUNDS);
