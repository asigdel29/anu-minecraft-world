import { create } from "zustand";

/**
 * Cross-component navigation state for the scroll-driven camera.
 *
 * The camera path is advanced imperatively inside the render loop (a ref in
 * {@link Experience}), but a few DOM overlays outside the Canvas need to drive
 * or react to it. This store bridges them without forcing per-frame re-renders:
 *
 * - `advanceSignal` is a monotonically increasing counter. The on-screen
 *   "next" button calls {@link advance}; {@link Experience} watches the counter
 *   and steps the camera to the next viewpoint. A counter (rather than a
 *   boolean) lets repeated clicks register even when the value is "the same
 *   request".
 * - `enteredWorld` flips once the visitor dismisses the loading screen, gating
 *   the idle "scroll to explore" hint so it never shows behind the intro.
 */
export const useNavStore = create((set) => ({
  advanceSignal: 0,
  advance: () => set((state) => ({ advanceSignal: state.advanceSignal + 1 })),

  enteredWorld: false,
  setEnteredWorld: () => set({ enteredWorld: true }),
}));
