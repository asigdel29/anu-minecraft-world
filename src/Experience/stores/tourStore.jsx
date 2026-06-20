import { create } from "zustand";

import { FLOOR_KEYS } from "../controls/tour";

// State for the guided house tour. `isTourActive` and `currentFloor` are
// React-facing so the player controller can suspend input and the HUD can render
// the floor controls; they change only on start/end and on Next/Previous, so
// subscribing is cheap. The per-frame `progress` lives on a plain module object
// (like inputState) so easing it every frame never triggers a re-render — the
// camera and the poster highlight read it directly inside their useFrame loops.
export const tourProgress = { value: 0 };

const LAST_FLOOR = FLOOR_KEYS.length - 1;

export const useTourStore = create((set) => ({
  isTourActive: false,
  currentFloor: 0, // index into FLOOR_KEYS: 0 = ground, 1 = middle, 2 = top

  /** Begin the tour at the ground floor. */
  startTour: () => {
    tourProgress.value = 0;
    set({ isTourActive: true, currentFloor: 0 });
  },

  /** Step up one floor, clamped at the top. */
  nextFloor: () =>
    set((state) => ({ currentFloor: Math.min(LAST_FLOOR, state.currentFloor + 1) })),

  /** Step down one floor, clamped at the ground. */
  prevFloor: () =>
    set((state) => ({ currentFloor: Math.max(0, state.currentFloor - 1) })),

  /** End the tour and hand control back to the character. Idempotent. */
  endTour: () => set({ isTourActive: false }),
}));
