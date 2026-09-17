import { describe, it, expect } from "vitest";

import { shouldShowGroup } from "./parkDistance";

const RADII = { showRadius: 60, hideRadius: 75 };

describe("shouldShowGroup", () => {
  it("shows inside the show radius", () => {
    expect(shouldShowGroup(30, { ...RADII, shown: false })).toBe(true);
  });

  it("shows exactly at the show radius (inclusive)", () => {
    expect(shouldShowGroup(60, { ...RADII, shown: false })).toBe(true);
  });

  it("hides beyond the hide radius (unload at > radius, like terrain)", () => {
    expect(shouldShowGroup(80, { ...RADII, shown: true })).toBe(false);
  });

  it("holds the previous value exactly at the hide radius", () => {
    expect(shouldShowGroup(75, { ...RADII, shown: true })).toBe(true);
  });

  it("holds the previous value inside the hysteresis band", () => {
    // Between show and hide, whatever the cluster was doing it keeps doing —
    // that is what stops flicker for a camera loitering on the boundary.
    expect(shouldShowGroup(68, { ...RADII, shown: true })).toBe(true);
    expect(shouldShowGroup(68, { ...RADII, shown: false })).toBe(false);
  });
});
