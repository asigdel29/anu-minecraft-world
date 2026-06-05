import { create } from "zustand";

/**
 * Cross-component navigation state for the scroll-driven camera.
 *
 * The camera path is advanced imperatively inside the render loop (a ref in
 * {@link Experience}); a couple of DOM overlays outside the Canvas need to
 * react to it. This store bridges them without forcing per-frame re-renders:
 *
 * - `enteredWorld` flips once the visitor dismisses the loading screen, gating
 *   the idle "swipe / scroll to explore" hint so it never shows behind the
 *   intro.
 */
export const useNavStore = create((set) => ({
  enteredWorld: false,
  setEnteredWorld: () => set({ enteredWorld: true }),
}));
