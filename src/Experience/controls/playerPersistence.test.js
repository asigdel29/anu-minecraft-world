import { describe, it, expect, beforeEach, afterEach } from "vitest";

import {
  STORAGE_KEY,
  loadPlayerState,
  savePlayerState,
  sanitizePlayerState,
} from "./playerPersistence";

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

describe("v3 save migration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("uses the v3 storage key", () => {
    expect(STORAGE_KEY).toBe("mc-player-state-v3");
  });

  it("round-trips a transform through the v3 key", () => {
    savePlayerState({ x: 1, y: 2, z: 3 }, 0.5);
    expect(loadPlayerState()).toEqual({ pos: [1, 2, 3], yaw: 0.5 });
  });

  it("ignores pre-park saves under the old key (respawn at spawn)", () => {
    localStorage.setItem(
      "mc-player-state",
      JSON.stringify({ pos: [10, 20, 30], yaw: 1 })
    );
    expect(loadPlayerState()).toBe(null);
  });
});
