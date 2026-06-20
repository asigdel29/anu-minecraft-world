import { create } from "zustand";

// State for the guided house tour. `isTourActive` is React-facing so the player
// controller can suspend input and the UI can show a skip hint; it changes only
// at start and end, so subscribing to it is cheap. The per-frame `progress`
// lives on a plain module object (like inputState) so advancing it every frame
// never triggers a re-render — the camera and the poster highlight read it
// directly inside their useFrame loops.
export const tourProgress = { value: 0 };

export const useTourStore = create((set) => ({
  isTourActive: false,

  /** Begin the tour from the top. */
  startTour: () => {
    tourProgress.value = 0;
    set({ isTourActive: true });
  },

  /** End the tour and hand control back to the character. Idempotent. */
  endTour: () => set({ isTourActive: false }),
}));
