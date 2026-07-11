import { describe, it, expect } from "vitest";

import {
  DEFAULT_RADII,
  worldToChunk,
  chunkDistance,
  initialSelection,
  selectChunks,
  deriveExtents,
  shouldBeVisible,
} from "./chunkGrid";

const SIZE = 32;

const grid = (ids) =>
  ids.map(([cx, cz, extra]) => ({ id: `c_${cx}_${cz}`, cx, cz, ...extra }));

describe("worldToChunk", () => {
  it("floors positive and negative positions into cells", () => {
    expect(worldToChunk(0, 0, SIZE)).toEqual([0, 0]);
    expect(worldToChunk(31.9, 31.9, SIZE)).toEqual([0, 0]);
    expect(worldToChunk(32, 0, SIZE)).toEqual([1, 0]);
    expect(worldToChunk(-0.1, -32, SIZE)).toEqual([-1, -1]);
    expect(worldToChunk(-32.1, 0, SIZE)).toEqual([-2, 0]);
  });
});

describe("chunkDistance", () => {
  it("is the chessboard distance in whole chunks", () => {
    expect(chunkDistance(0, 0, 0, 0)).toBe(0);
    expect(chunkDistance(0, 0, 3, 1)).toBe(3);
    expect(chunkDistance(-2, 0, 2, -3)).toBe(4);
  });
});

describe("initialSelection", () => {
  it("mounts only spawn-eager chunks, colliding only the always-collide ones", () => {
    const chunks = grid([
      [0, 0, { spawnEager: true, alwaysCollide: true }],
      [0, 1, { spawnEager: true }],
      [5, 5, {}],
    ]);
    expect(initialSelection(chunks)).toEqual({
      active: ["c_0_0", "c_0_1"],
      colliders: ["c_0_0"],
      prefetch: [],
    });
  });
});

describe("selectChunks", () => {
  const chunks = grid([
    [0, 0, {}],
    [1, 0, {}],
    [2, 0, {}],
    [3, 0, {}],
    [4, 0, {}],
  ]);

  it("activates chunks within loadRadius and prefetches the ring beyond", () => {
    const selection = selectChunks(16, 16, chunks, SIZE, null, DEFAULT_RADII);
    expect(selection.active).toEqual(["c_0_0", "c_1_0", "c_2_0"]);
    expect(selection.prefetch).toEqual(["c_3_0"]);
  });

  it("registers colliders only within colliderRadius", () => {
    const selection = selectChunks(16, 16, chunks, SIZE, null, DEFAULT_RADII);
    expect(selection.colliders).toEqual(["c_0_0", "c_1_0"]);
  });

  it("keeps colliders a subset of active", () => {
    const selection = selectChunks(16, 16, chunks, SIZE, null, DEFAULT_RADII);
    for (const id of selection.colliders) {
      expect(selection.active).toContain(id);
    }
  });

  it("holds an active chunk through the hysteresis band before unloading", () => {
    const near = selectChunks(16, 16, chunks, SIZE, null, DEFAULT_RADII);
    expect(near.active).toContain("c_2_0");
    // One cell further: c_2_0 is now distance 3 — outside loadRadius but
    // inside unloadRadius — so it stays mounted only because it already was.
    const mid = selectChunks(-16, 16, chunks, SIZE, near, DEFAULT_RADII);
    expect(mid.active).toContain("c_2_0");
    const fresh = selectChunks(-16, 16, chunks, SIZE, null, DEFAULT_RADII);
    expect(fresh.active).not.toContain("c_2_0");
    // Another cell out it passes unloadRadius and finally unloads.
    const far = selectChunks(-48, 16, chunks, SIZE, mid, DEFAULT_RADII);
    expect(far.active).not.toContain("c_2_0");
  });

  it("always keeps spawn-eager chunks active and always-collide ones colliding", () => {
    const special = grid([[10, 10, { spawnEager: true, alwaysCollide: true }]]);
    const selection = selectChunks(0, 0, special, SIZE, null, DEFAULT_RADII);
    expect(selection.active).toEqual(["c_10_10"]);
    expect(selection.colliders).toEqual(["c_10_10"]);
  });

  it("returns the previous selection by reference when nothing changed", () => {
    const first = selectChunks(16, 16, chunks, SIZE, null, DEFAULT_RADII);
    const second = selectChunks(17, 15, chunks, SIZE, first, DEFAULT_RADII);
    expect(second).toBe(first);
  });
});

describe("shouldBeVisible", () => {
  it("shows a hidden group only within showRadius", () => {
    expect(shouldBeVisible(9 * 9, false, 10, 15)).toBe(true);
    expect(shouldBeVisible(12 * 12, false, 10, 15)).toBe(false);
  });

  it("hides a visible group only past hideRadius", () => {
    expect(shouldBeVisible(12 * 12, true, 10, 15)).toBe(true);
    expect(shouldBeVisible(16 * 16, true, 10, 15)).toBe(false);
  });
});

describe("deriveExtents", () => {
  it("covers the outer edges of the outermost cells", () => {
    const chunks = grid([
      [-2, -1, {}],
      [1, 2, {}],
    ]);
    expect(deriveExtents(chunks, SIZE)).toEqual({
      minX: -64,
      maxX: 64,
      minZ: -32,
      maxZ: 96,
    });
  });

  it("is null for an empty manifest", () => {
    expect(deriveExtents([], SIZE)).toBe(null);
  });
});
