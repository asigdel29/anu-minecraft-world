import { describe, it, expect } from "vitest";

import {
  ATTRACTIONS,
  PARK_BOUNDS,
  PARK_SPAWN,
  attractionsByProximity,
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

describe("PARK_SPAWN", () => {
  it("sits inside the walkable bounds", () => {
    expect(isInsideBounds([PARK_SPAWN[0], 0, PARK_SPAWN[1]])).toBe(true);
  });
});

describe("attractionsByProximity", () => {
  it("orders attractions nearest-first to the spawn point", () => {
    const order = attractionsByProximity(PARK_SPAWN).map((a) => a.id);
    // From spawn (0, 20): The Library (12, 30) is ~15.6 units out, Fortune
    // Booth (4, -6) ~26.3; Idea Graveyard (-14, -34) is farthest at ~55.8.
    expect(order[0]).toBe("library");
    expect(order[1]).toBe("fortune");
    expect(order[order.length - 1]).toBe("idea-graveyard");
  });

  it("sorts by true distance, not declared order", () => {
    const farFirst = attractionsByProximity([40, 40]).map((a) => a.id);
    // From the park's far corner, Launch Tower (36, 16) is nearest — even
    // though it is declared sixth of seven.
    expect(farFirst[0]).toBe("launch-tower");
  });

  it("breaks ties by declared order and never mutates the manifest", () => {
    const manifest = [
      { id: "a", position: [0, 0, 10] },
      { id: "b", position: [0, 0, 10] },
    ];
    const snapshot = JSON.stringify(manifest);
    const sorted = attractionsByProximity([0, 0], manifest);
    expect(sorted.map((a) => a.id)).toEqual(["a", "b"]);
    expect(JSON.stringify(manifest)).toBe(snapshot);
  });

  it("returns every attraction exactly once", () => {
    const sorted = attractionsByProximity(PARK_SPAWN);
    expect(sorted).toHaveLength(ATTRACTIONS.length);
    expect(new Set(sorted.map((a) => a.id)).size).toBe(ATTRACTIONS.length);
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
