import { describe, it, expect } from "vitest";

import { deriveAtmosphere, PARK_ATMOSPHERE } from "./parkAtmosphere";
import { PARK_BOUNDS } from "./attractions";

// The widest sightline across the walkable lawn is the bounds diagonal:
// hypot(90, 105) ≈ 138.29 units — see parkAtmosphere.js for the derivation.
describe("deriveAtmosphere", () => {
  it("covers the widest sightline plus a 10% margin in fog far", () => {
    const { fogFar } = deriveAtmosphere(PARK_BOUNDS);
    expect(fogFar).toBe(153); // ceil(138.29 * 1.1)
  });

  it("starts fog at 40% of fogFar", () => {
    const { fogNear, fogFar } = deriveAtmosphere(PARK_BOUNDS);
    expect(fogNear).toBe(Math.round(fogFar * 0.4));
    expect(fogNear).toBe(61);
  });

  it("straddles the cull ring around fogFar with hysteresis", () => {
    const { cullShow, cullHide, fogFar } = deriveAtmosphere(PARK_BOUNDS);
    expect(cullHide).toBe(fogFar);
    expect(cullShow).toBeLessThan(cullHide);
    expect(cullShow).toBe(130); // round(153 * 0.85)
  });

  it("keeps the show radius past every sightline at park scale", () => {
    // Worst balloon-cam view across the lawn is ~110 units XZ (marker at one
    // corner, camera viewpoint, opposite bounds corner); nothing decorative
    // should be culled today. If the park grows past the show radius, the
    // same derivation moves the ring without re-tuning call sites.
    const { cullShow } = deriveAtmosphere(PARK_BOUNDS);
    const maxSightline = Math.hypot(
      PARK_BOUNDS.maxX - PARK_BOUNDS.minX,
      PARK_BOUNDS.maxZ - PARK_BOUNDS.minZ
    );
    expect(cullShow).toBeGreaterThan(maxSightline * 0.8);
  });
});

describe("PARK_ATMOSPHERE", () => {
  it("is the derivation applied to the shipped park bounds", () => {
    expect(PARK_ATMOSPHERE).toEqual(deriveAtmosphere(PARK_BOUNDS));
  });
});
