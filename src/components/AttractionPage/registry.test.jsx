import { describe, it, expect } from "vitest";

import { attractions, attractionRoutes, getAttraction } from "./registry";

const LOCKED_ROUTES = [
  "/arcade",
  "/factory",
  "/graveyard",
  "/library",
  "/hardware",
  "/launches",
  "/fortune",
];

const LOCKED_IDS = [
  "arcade",
  "factory",
  "graveyard",
  "library",
  "hardware",
  "launches",
  "fortune",
];

describe("attraction registry", () => {
  it("exposes exactly the seven locked route slugs, in park order", () => {
    expect(attractionRoutes).toEqual(LOCKED_ROUTES);
    expect(
      Object.values(attractions).map((attraction) => attraction.route)
    ).toEqual(LOCKED_ROUTES);
  });

  it("keys each attraction by id and carries title, component, and content", () => {
    expect(Object.keys(attractions)).toEqual(LOCKED_IDS);
    for (const [id, attraction] of Object.entries(attractions)) {
      expect(attraction.id).toBe(id);
      expect(typeof attraction.title).toBe("string");
      expect(typeof attraction.component).toBe("function");
      expect(attraction.content).toBeDefined();
      expect(attraction.content.route).toBe(attraction.route);
    }
  });

  it("looks attractions up by id and returns null for unknown ids", () => {
    expect(getAttraction("arcade")?.route).toBe("/arcade");
    expect(getAttraction("fortune")?.title).toBe("Fortune Booth");
    expect(getAttraction("haunted-house")).toBeNull();
  });
});
