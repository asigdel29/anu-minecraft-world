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
});
