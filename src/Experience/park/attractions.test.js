import { describe, it, expect } from "vitest";

import {
  ATTRACTIONS,
  PARK_BOUNDS,
  getAttraction,
  isInsideBounds,
  validateAttractions,
} from "./attractions";

// The spec pins the seven attractions, their ids, and their routes; keep the
// manifest honest against that list.
const EXPECTED_IDS = [
  "agent-arcade",
  "factory",
  "idea-graveyard",
  "library",
  "hardware",
  "launch-tower",
  "fortune",
];
const EXPECTED_ROUTES = [
  "/arcade",
  "/factory",
  "/graveyard",
  "/library",
  "/hardware",
  "/launches",
  "/fortune",
];

describe("ATTRACTIONS", () => {
  it("has exactly the seven spec attractions, in order", () => {
    expect(ATTRACTIONS.map((a) => a.id)).toEqual(EXPECTED_IDS);
  });

  it("uses the spec routes", () => {
    expect(ATTRACTIONS.map((a) => a.route)).toEqual(EXPECTED_ROUTES);
  });

  it("keeps every position inside the park bounds", () => {
    for (const attraction of ATTRACTIONS) {
      expect(isInsideBounds(attraction.position)).toBe(true);
    }
  });

  it("gives every attraction a name, ride, and content key", () => {
    for (const attraction of ATTRACTIONS) {
      expect(attraction.name).toBeTruthy();
      expect(attraction.ride).toBeTruthy();
      expect(attraction.content).toBeTruthy();
    }
  });

  it("ships a valid manifest (no validation problems)", () => {
    expect(validateAttractions()).toEqual([]);
  });
});

describe("getAttraction", () => {
  it("looks attractions up by id", () => {
    expect(getAttraction("launch-tower").route).toBe("/launches");
  });

  it("returns null for unknown ids", () => {
    expect(getAttraction("haunted-house")).toBe(null);
  });
});

describe("isInsideBounds", () => {
  it("accepts the inclusive edges of the bounds", () => {
    expect(
      isInsideBounds([PARK_BOUNDS.minX, 0, PARK_BOUNDS.minZ])
    ).toBe(true);
    expect(
      isInsideBounds([PARK_BOUNDS.maxX, 0, PARK_BOUNDS.maxZ])
    ).toBe(true);
  });

  it("rejects positions outside x or z", () => {
    expect(isInsideBounds([PARK_BOUNDS.minX - 1, 0, 0])).toBe(false);
    expect(isInsideBounds([PARK_BOUNDS.maxX + 1, 0, 0])).toBe(false);
    expect(isInsideBounds([0, 0, PARK_BOUNDS.minZ - 1])).toBe(false);
    expect(isInsideBounds([0, 0, PARK_BOUNDS.maxZ + 1])).toBe(false);
  });

  it("rejects malformed positions", () => {
    expect(isInsideBounds(null)).toBe(false);
    expect(isInsideBounds([0, 0])).toBe(false);
    expect(isInsideBounds([Number.NaN, 0, 0])).toBe(false);
  });
});

describe("validateAttractions", () => {
  const base = {
    name: "Test Ride",
    route: "/test",
    ride: "test-ride",
    position: [0, 0, 0],
    content: "test",
  };

  it("passes a clean manifest", () => {
    expect(validateAttractions([{ id: "test", ...base }])).toEqual([]);
  });

  it("flags duplicate ids and duplicate routes", () => {
    const manifest = [
      { id: "test", ...base },
      { id: "test", ...base, route: "/other" },
      { id: "other", ...base },
    ];
    const problems = validateAttractions(manifest);
    expect(problems.some((p) => p.includes("duplicate id"))).toBe(true);
    expect(problems.some((p) => p.includes("duplicate route"))).toBe(true);
  });

  it("flags positions outside the bounds", () => {
    const manifest = [{ id: "test", ...base, position: [999, 0, 0] }];
    expect(validateAttractions(manifest)).toEqual([
      "test: position outside world bounds",
    ]);
  });

  it("flags missing content keys and bad routes", () => {
    const manifest = [
      { id: "test", ...base, content: undefined, route: "nope" },
    ];
    const problems = validateAttractions(manifest);
    expect(problems.some((p) => p.includes("missing content key"))).toBe(true);
    expect(problems.some((p) => p.includes('route must start with "/"'))).toBe(
      true
    );
  });
});
