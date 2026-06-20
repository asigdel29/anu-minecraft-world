import { describe, it, expect } from "vitest";

import { followYaw } from "./followYaw";

describe("followYaw", () => {
  it("holds the yaw when the player is not moving", () => {
    const yaw = 1.23;
    expect(
      followYaw(yaw, 0, { isMoving: false, isDragging: false, step: 0.016 })
    ).toBe(yaw);
  });

  it("holds the yaw while the user is dragging", () => {
    const yaw = 1.23;
    expect(
      followYaw(yaw, 0, { isMoving: true, isDragging: true, step: 0.016 })
    ).toBe(yaw);
  });

  it("eases toward behind the player (playerYaw + PI)", () => {
    // From 0, easing toward PI should move partway, not overshoot.
    const next = followYaw(0, 0, {
      isMoving: true,
      isDragging: false,
      step: 0.1,
      followSpeed: 2,
    });
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(Math.PI);
    expect(next).toBeCloseTo(Math.PI * 0.2, 5); // 0 + PI * min(1, 2*0.1)
  });

  it("snaps fully when the easing fraction caps at 1", () => {
    // A large step caps the correction at one full move to the target.
    const next = followYaw(0, 0, {
      isMoving: true,
      isDragging: false,
      step: 10,
    });
    expect(next).toBeCloseTo(Math.PI, 5);
  });

  it("holds the yaw when travel is not aligned with the camera (strafe/back)", () => {
    const yaw = 1.23;
    // Strafing sits near 0 alignment and backing near -1; both must hold so the
    // camera does not whip around to chase a body that turned sideways/back.
    expect(
      followYaw(yaw, 0, {
        isMoving: true,
        isDragging: false,
        step: 0.1,
        alignment: 0,
      })
    ).toBe(yaw);
    expect(
      followYaw(yaw, 0, {
        isMoving: true,
        isDragging: false,
        step: 0.1,
        alignment: -1,
      })
    ).toBe(yaw);
  });

  it("re-centers when travel is aligned with the camera (forward)", () => {
    const next = followYaw(0, 0, {
      isMoving: true,
      isDragging: false,
      step: 0.1,
      alignment: 1,
      followSpeed: 2,
    });
    expect(next).toBeCloseTo(Math.PI * 0.2, 5);
  });

  it("takes the shortest angular path across the wrap", () => {
    // Current yaw sits just below +PI; the target behind the player sits just
    // above -PI. The short way is to keep increasing through the +PI/-PI wrap,
    // not to sweep all the way back down through zero.
    const currentYaw = 3.1; // ~ +PI
    const playerYaw = -3.1 - Math.PI; // targetYaw = playerYaw + PI = -3.1 (~ -PI)
    const next = followYaw(currentYaw, playerYaw, {
      isMoving: true,
      isDragging: false,
      step: 0.1,
      followSpeed: 2,
    });
    expect(next).toBeGreaterThan(currentYaw);
  });
});
