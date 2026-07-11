import { describe, it, expect } from "vitest";

import { sanitizePlayerState } from "./playerPersistence";

describe("sanitizePlayerState", () => {
  it("accepts a well-formed transform", () => {
    expect(sanitizePlayerState({ pos: [1, 2, 3], yaw: 0.5 })).toEqual({
      pos: [1, 2, 3],
      yaw: 0.5,
    });
  });

  it("rejects null / non-objects", () => {
    expect(sanitizePlayerState(null)).toBe(null);
    expect(sanitizePlayerState("nope")).toBe(null);
  });

  it("rejects a wrong-length or non-numeric position", () => {
    expect(sanitizePlayerState({ pos: [1, 2], yaw: 0 })).toBe(null);
    expect(sanitizePlayerState({ pos: [1, "x", 3], yaw: 0 })).toBe(null);
  });

  it("rejects non-finite numbers", () => {
    expect(sanitizePlayerState({ pos: [1, Infinity, 3], yaw: 0 })).toBe(null);
    expect(sanitizePlayerState({ pos: [1, 2, 3], yaw: NaN })).toBe(null);
  });

  it("rejects a missing or non-numeric yaw", () => {
    expect(sanitizePlayerState({ pos: [1, 2, 3] })).toBe(null);
    expect(sanitizePlayerState({ pos: [1, 2, 3], yaw: "0" })).toBe(null);
  });

  describe("with world extents", () => {
    const extents = { minX: -45, maxX: 45, minZ: -50, maxZ: 55, minY: 40 };

    it("accepts a transform inside the walkable world", () => {
      expect(
        sanitizePlayerState({ pos: [0, 65, 20], yaw: 0 }, extents)
      ).toEqual({ pos: [0, 65, 20], yaw: 0 });
      expect(
        sanitizePlayerState({ pos: [-45, 65, 55], yaw: 0 }, extents)
      ).not.toBe(null);
    });

    it("rejects a transform outside the horizontal bounds", () => {
      expect(
        sanitizePlayerState({ pos: [46, 65, 0], yaw: 0 }, extents)
      ).toBe(null);
      expect(
        sanitizePlayerState({ pos: [0, 65, -51], yaw: 0 }, extents)
      ).toBe(null);
    });

    it("rejects a transform below the world floor", () => {
      expect(
        sanitizePlayerState({ pos: [0, 39, 0], yaw: 0 }, extents)
      ).toBe(null);
    });

    it("ignores the floor when extents carry no minY", () => {
      const flat = { minX: -45, maxX: 45, minZ: -50, maxZ: 55 };
      expect(
        sanitizePlayerState({ pos: [0, -999, 0], yaw: 0 }, flat)
      ).not.toBe(null);
    });
  });
});
