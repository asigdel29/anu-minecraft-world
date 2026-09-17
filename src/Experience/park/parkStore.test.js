import { beforeEach, describe, it, expect } from "vitest";

import { useParkNav } from "./parkStore";

describe("useParkNav", () => {
  // The store is a module singleton; reset it so each case starts in the park.
  beforeEach(() => {
    useParkNav.setState({ mode: "park", attractionId: null });
  });

  it("starts in park mode with no attraction selected", () => {
    expect(useParkNav.getState().mode).toBe("park");
    expect(useParkNav.getState().attractionId).toBe(null);
  });

  it("enter flies toward the attraction", () => {
    useParkNav.getState().enter("factory");
    expect(useParkNav.getState().mode).toBe("flying");
    expect(useParkNav.getState().attractionId).toBe("factory");
  });

  it("arrived opens the page", () => {
    useParkNav.getState().enter("factory");
    useParkNav.getState().arrived();
    expect(useParkNav.getState().mode).toBe("page");
    expect(useParkNav.getState().attractionId).toBe("factory");
  });

  it("exit returns to the park and clears the attraction", () => {
    useParkNav.getState().enter("factory");
    useParkNav.getState().arrived();
    useParkNav.getState().exit();
    expect(useParkNav.getState().mode).toBe("park");
    expect(useParkNav.getState().attractionId).toBe(null);
  });

  it("exit is idempotent from park mode", () => {
    useParkNav.getState().exit();
    expect(useParkNav.getState().mode).toBe("park");
    expect(useParkNav.getState().attractionId).toBe(null);
  });
});
