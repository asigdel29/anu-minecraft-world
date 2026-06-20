import { describe, it, expect } from "vitest";

import {
  MAX_STEP_DOWN,
  MAX_STEP_HEIGHT,
  isBlockedByObstacle,
  isClimbableStep,
  isWalkableStepDown,
} from "./stepUp";

describe("isBlockedByObstacle", () => {
  it("is blocked when sliding cuts the move past the ratio", () => {
    // 50% of the intended distance survived — well past the 5% threshold.
    expect(isBlockedByObstacle(1, 0.5)).toBe(true);
  });

  it("is not blocked when the move is essentially unimpeded", () => {
    expect(isBlockedByObstacle(1, 0.99)).toBe(false);
  });

  it("treats a reduction smaller than the ratio as unblocked", () => {
    // 4% reduction with the default 0.95 ratio is below the trigger.
    expect(isBlockedByObstacle(1, 0.96)).toBe(false);
  });
});

describe("isClimbableStep", () => {
  const baseY = 10;

  it("climbs a step within the height limit", () => {
    expect(isClimbableStep(baseY + 0.4, baseY)).toBe(true);
  });

  it("rejects a step taller than the limit", () => {
    expect(isClimbableStep(baseY + MAX_STEP_HEIGHT + 0.01, baseY)).toBe(false);
  });

  it("rejects when no ground was found", () => {
    expect(isClimbableStep(null, baseY)).toBe(false);
  });

  it("rejects a drop beyond the down tolerance", () => {
    expect(isClimbableStep(baseY - 0.2, baseY)).toBe(false);
  });

  it("accepts the exact step-height boundary", () => {
    expect(isClimbableStep(baseY + MAX_STEP_HEIGHT, baseY)).toBe(true);
  });
});

describe("isWalkableStepDown", () => {
  const currentY = 10;

  it("steps down onto a surface within the drop limit", () => {
    expect(isWalkableStepDown(currentY, currentY - 0.4)).toBe(true);
  });

  it("steps down just inside the drop limit", () => {
    expect(isWalkableStepDown(currentY, currentY - (MAX_STEP_DOWN - 0.01))).toBe(
      true
    );
  });

  it("rejects a drop beyond the step-down limit (a real fall)", () => {
    expect(isWalkableStepDown(currentY, currentY - (MAX_STEP_DOWN + 0.01))).toBe(
      false
    );
  });

  it("does not treat a surface at or above the feet as a step down", () => {
    expect(isWalkableStepDown(currentY, currentY)).toBe(false);
    expect(isWalkableStepDown(currentY, currentY + 0.2)).toBe(false);
  });

  it("rejects when no ground was found", () => {
    expect(isWalkableStepDown(currentY, null)).toBe(false);
  });
});
