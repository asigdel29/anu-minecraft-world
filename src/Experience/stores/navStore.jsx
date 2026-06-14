import { create } from "zustand";

/**
 * Cross-component navigation state shared between the Canvas and the DOM
 * overlays, without forcing per-frame re-renders:
 *
 * - `enteredWorld` flips once the visitor dismisses the loading screen, gating
 *   the controls-hint legend so it never shows behind the intro.
 */
export const useNavStore = create((set) => ({
  enteredWorld: false,
  setEnteredWorld: () => set({ enteredWorld: true }),
}));
