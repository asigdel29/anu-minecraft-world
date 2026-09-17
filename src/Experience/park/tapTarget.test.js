import { describe, it, expect } from "vitest";

import {
  MIN_TAP_PX,
  tapTargetPx,
  maxDistanceForTapPx,
} from "./tapTarget";

// The marker hit disc (HIT_RADIUS 4.5 in AttractionMarker.jsx) must stay a
// ≥44px touch target across the designed interaction range: walking up to a
// marker and tapping it from the balloon-cam viewpoint (~12 units out) on a
// small phone viewport. The camera's vertical fov is 70 (Experience.jsx).
const FOV = 70;
const PHONE_PORTRAIT_PX = 375;
const HIT_RADIUS = 4.5;

describe("tapTargetPx", () => {
  it("grows with viewport height and shrinks with distance", () => {
    const close = tapTargetPx({
      radius: HIT_RADIUS,
      distance: 12,
      fov: FOV,
      viewportPx: PHONE_PORTRAIT_PX,
    });
    const far = tapTargetPx({
      radius: HIT_RADIUS,
      distance: 48,
      fov: FOV,
      viewportPx: PHONE_PORTRAIT_PX,
    });
    const tall = tapTargetPx({
      radius: HIT_RADIUS,
      distance: 12,
      fov: FOV,
      viewportPx: PHONE_PORTRAIT_PX * 2,
    });
    expect(close).toBeGreaterThan(far);
    expect(tall).toBeCloseTo(close * 2, 5);
  });

  it("returns zero for degenerate inputs", () => {
    expect(
      tapTargetPx({ radius: 0, distance: 10, fov: FOV, viewportPx: 375 })
    ).toBe(0);
    expect(
      tapTargetPx({ radius: 4.5, distance: 0, fov: FOV, viewportPx: 375 })
    ).toBe(0);
    expect(
      tapTargetPx({ radius: 4.5, distance: 10, fov: 0, viewportPx: 375 })
    ).toBe(0);
    expect(
      tapTargetPx({ radius: 4.5, distance: 10, fov: FOV, viewportPx: 0 })
    ).toBe(0);
  });
});

describe("maxDistanceForTapPx", () => {
  it("inverts tapTargetPx", () => {
    const distance = 37;
    expect(
      maxDistanceForTapPx({
        radius: HIT_RADIUS,
        fov: FOV,
        viewportPx: PHONE_PORTRAIT_PX,
        minPx: tapTargetPx({
          radius: HIT_RADIUS,
          distance,
          fov: FOV,
          viewportPx: PHONE_PORTRAIT_PX,
        }),
      })
    ).toBeCloseTo(distance, 5);
  });

  it("keeps the shipped hit disc a ≥44px target at walk-up range", () => {
    // On a 375px-tall phone viewport the 4.5-unit disc must still project to
    // MIN_TAP_PX well past the INTERACT_RANGE (3.2) walk-up distance and the
    // ~12-unit balloon-cam viewpoint.
    const reach = maxDistanceForTapPx({
      radius: HIT_RADIUS,
      fov: FOV,
      viewportPx: PHONE_PORTRAIT_PX,
      minPx: MIN_TAP_PX,
    });
    expect(reach).toBeGreaterThan(48);
  });

  it("returns zero when the minimum cannot fit the viewport", () => {
    expect(
      maxDistanceForTapPx({
        radius: HIT_RADIUS,
        fov: FOV,
        viewportPx: PHONE_PORTRAIT_PX,
        minPx: PHONE_PORTRAIT_PX,
      })
    ).toBe(0);
  });
});
