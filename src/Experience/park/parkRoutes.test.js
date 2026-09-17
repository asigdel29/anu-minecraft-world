import { describe, it, expect } from "vitest";

import { ATTRACTIONS } from "./attractions";
import { resolveRoute, routeForId } from "./parkRoutes";

describe("resolveRoute", () => {
  it("resolves each attraction route to its id", () => {
    for (const attraction of ATTRACTIONS) {
      expect(resolveRoute(attraction.route)).toBe(attraction.id);
    }
  });

  it("boots the deep-link attractions by their spec routes", () => {
    expect(resolveRoute("/arcade")).toBe("agent-arcade");
    expect(resolveRoute("/launches")).toBe("launch-tower");
    expect(resolveRoute("/graveyard")).toBe("idea-graveyard");
  });

  it("returns null for the park root and unknown paths", () => {
    expect(resolveRoute("/")).toBe(null);
    expect(resolveRoute("/nowhere")).toBe(null);
  });

  it("tolerates a trailing slash", () => {
    expect(resolveRoute("/arcade/")).toBe("agent-arcade");
  });

  it("does not match route prefixes", () => {
    expect(resolveRoute("/arc")).toBe(null);
  });

  it("returns null for non-string input", () => {
    expect(resolveRoute(null)).toBe(null);
  });
});

describe("routeForId", () => {
  it("round-trips every attraction id to its shareable route", () => {
    for (const attraction of ATTRACTIONS) {
      expect(routeForId(attraction.id)).toBe(attraction.route);
    }
  });

  it("returns null for unknown ids", () => {
    expect(routeForId("haunted-house")).toBe(null);
  });
});
