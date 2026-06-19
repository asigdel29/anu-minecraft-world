import { describe, it, expect } from "vitest";

import { input, resetInput } from "./inputState";

// Seed test for the shared movement-input object. It guards the contract the
// keyboard hook, the on-screen joystick, and the character controller all rely
// on: every action starts false, and resetInput clears every action without
// adding or removing keys.
describe("inputState", () => {
  it("starts with every action disabled", () => {
    resetInput();
    for (const action of Object.keys(input)) {
      expect(input[action]).toBe(false);
    }
  });

  it("resetInput clears all set actions and changes no keys", () => {
    const keysBefore = Object.keys(input).sort();
    input.forward = true;
    input.jump = true;
    input.run = true;

    resetInput();

    expect(Object.values(input).some(Boolean)).toBe(false);
    expect(Object.keys(input).sort()).toEqual(keysBefore);
  });
});
