import { describe, it, expect } from "vitest";

import {
  FLOOR_RANGES,
  advanceProgress,
  isWithinRange,
  posterBrightness,
} from "./tour";

describe("advanceProgress", () => {
  it("advances by step/duration", () => {
    expect(advanceProgress(0, 1, 16)).toBeCloseTo(1 / 16, 5);
  });

  it("clamps at 1 and never overshoots", () => {
    expect(advanceProgress(0.99, 10, 16)).toBe(1);
  });
});

describe("isWithinRange", () => {
  it("is inside on the boundaries and between them", () => {
    expect(isWithinRange(0.3, [0.27, 0.38])).toBe(true);
    expect(isWithinRange(0.27, [0.27, 0.38])).toBe(true);
    expect(isWithinRange(0.38, [0.27, 0.38])).toBe(true);
  });

  it("is outside beyond the window", () => {
    expect(isWithinRange(0.2, [0.27, 0.38])).toBe(false);
    expect(isWithinRange(0.5, [0.27, 0.38])).toBe(false);
  });
});

describe("posterBrightness", () => {
  it("stays at 1 when the floor is not active", () => {
    expect(posterBrightness(0.1, FLOOR_RANGES.ground, 0)).toBe(1);
  });

  it("brightens within the active window", () => {
    // time chosen so sin(time*3) = 1 -> full pulse -> 1 + amplitude.
    const time = Math.PI / 6; // sin(3 * PI/6) = sin(PI/2) = 1
    expect(posterBrightness(0.3, FLOOR_RANGES.ground, time, 1.5)).toBeCloseTo(
      2.5,
      5
    );
  });

  it("never dims below the base brightness", () => {
    for (let t = 0; t < 6; t += 0.3) {
      expect(posterBrightness(0.3, FLOOR_RANGES.ground, t)).toBeGreaterThanOrEqual(
        1
      );
    }
  });
});
