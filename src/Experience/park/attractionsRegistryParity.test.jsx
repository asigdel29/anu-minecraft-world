import { describe, it, expect } from "vitest";

import { ATTRACTIONS } from "./attractions";
import {
  attractions,
  getAttraction,
} from "../../components/AttractionPage/registry";

// Seam parity (LOR-2423): the park manifest's `content` keys must resolve in
// the real attraction-pages registry — every 3D attraction has a real page on
// the same route, so deep links and page mode never fall through to nothing.
describe("park manifest ↔ attraction-pages registry parity", () => {
  it("resolves every manifest content key to a registry entry", () => {
    for (const attraction of ATTRACTIONS) {
      const entry = getAttraction(attraction.content);
      expect(
        entry,
        `${attraction.id} content key "${attraction.content}"`
      ).not.toBe(null);
      expect(typeof entry.component).toBe("function");
    }
  });

  it("agrees with the registry on every attraction route", () => {
    for (const attraction of ATTRACTIONS) {
      expect(getAttraction(attraction.content).route).toBe(attraction.route);
    }
    // The two sides describe the same seven attractions, nothing extra.
    expect(Object.keys(attractions)).toHaveLength(ATTRACTIONS.length);
  });
});
