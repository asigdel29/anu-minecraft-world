import { beforeEach, describe, it, expect } from "vitest";

import { parkCameraState, useParkNav } from "./parkStore";

describe("useParkNav", () => {
  // The store and the camera-state mirror are module singletons; reset them
  // so each case starts in the park with no flight armed.
  beforeEach(() => {
    useParkNav.setState({ mode: "park", attractionId: null });
    parkCameraState.returning = false;
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

  it("exit arms the balloon-cam ease-back so the camera never cuts", () => {
    useParkNav.getState().enter("factory");
    useParkNav.getState().exit();
    expect(parkCameraState.returning).toBe(true);
  });

  it("exit is idempotent from park mode", () => {
    useParkNav.getState().exit();
    expect(useParkNav.getState().mode).toBe("park");
    expect(useParkNav.getState().attractionId).toBe(null);
  });
});
