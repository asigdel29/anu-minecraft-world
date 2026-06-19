import { describe, it, expect } from "vitest";

import { dampFraction, stepAngle } from "./remoteInterp";

describe("dampFraction", () => {
  it("closes none of the gap for a zero step", () => {
    expect(dampFraction(8, 0)).toBe(0);
  });

  it("closes a fraction between 0 and 1 for a normal frame", () => {
    const f = dampFraction(8, 1 / 60);
    expect(f).toBeGreaterThan(0);
    expect(f).toBeLessThan(1);
  });

  it("approaches 1 as the step grows large", () => {
    expect(dampFraction(8, 10)).toBeGreaterThan(0.99);
  });
});

describe("stepAngle", () => {
  it("moves partway toward the target", () => {
    expect(stepAngle(0, 1, 0.5)).toBeCloseTo(0.5, 5);
  });

  it("snaps to the target when t caps at 1", () => {
    expect(stepAngle(0, 1.2, 5)).toBeCloseTo(1.2, 5);
  });

  it("takes the shortest path across the +/-PI seam", () => {
    // From just below +PI toward just above -PI, the short way is to keep
    // increasing through the wrap, not to sweep back down through zero.
    const next = stepAngle(3.1, -3.1, 0.5);
    expect(next).toBeGreaterThan(3.1);
  });

  it("holds when current already equals target", () => {
    expect(stepAngle(1.5, 1.5, 0.5)).toBeCloseTo(1.5, 5);
  });
});
