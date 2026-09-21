import { describe, it, expect } from "vitest";

import {
  controlsForParkMode,
  CONTROLS_ROAM,
  CONTROLS_FLIGHT,
  CONTROLS_HIDDEN,
} from "./touchModes";

// The park-nav modes map one-to-one onto touch layouts: roaming shows the
// movement controls, a balloon-cam flight swaps them for the stop control,
// and an open page yields entirely to the page shell's back button.
describe("controlsForParkMode", () => {
  it("shows movement controls while roaming the park", () => {
    expect(controlsForParkMode("park")).toBe(CONTROLS_ROAM);
  });

  it("swaps to the stop control while the balloon-cam flies", () => {
    expect(controlsForParkMode("flying")).toBe(CONTROLS_FLIGHT);
  });

  it("hides the controls while an attraction page is open", () => {
    expect(controlsForParkMode("page")).toBe(CONTROLS_HIDDEN);
  });

  it("falls back to movement controls for unknown modes", () => {
    expect(controlsForParkMode(undefined)).toBe(CONTROLS_ROAM);
    expect(controlsForParkMode("bogus")).toBe(CONTROLS_ROAM);
  });
});
