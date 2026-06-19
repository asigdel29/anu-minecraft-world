import { describe, it, expect, vi, afterEach } from "vitest";

import {
  isCoarsePointer,
  isPortraitViewport,
  shouldPromptRotate,
} from "./orientation";

describe("shouldPromptRotate", () => {
  it("prompts only on a coarse pointer held in portrait", () => {
    expect(shouldPromptRotate(true, true)).toBe(true);
  });

  it("does not prompt on a coarse pointer in landscape", () => {
    expect(shouldPromptRotate(true, false)).toBe(false);
  });

  it("never prompts on a fine pointer (desktop)", () => {
    expect(shouldPromptRotate(false, true)).toBe(false);
    expect(shouldPromptRotate(false, false)).toBe(false);
  });
});

describe("matchMedia probes", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const stubMatchMedia = (map) =>
    vi.stubGlobal("matchMedia", (query) => ({ matches: !!map[query] }));

  it("reads the coarse-pointer media query", () => {
    stubMatchMedia({ "(pointer: coarse)": true });
    expect(isCoarsePointer()).toBe(true);
  });

  it("reads the portrait-orientation media query", () => {
    stubMatchMedia({ "(orientation: portrait)": true });
    expect(isPortraitViewport()).toBe(true);
  });

  it("reports false when the query does not match", () => {
    stubMatchMedia({});
    expect(isCoarsePointer()).toBe(false);
    expect(isPortraitViewport()).toBe(false);
  });
});
