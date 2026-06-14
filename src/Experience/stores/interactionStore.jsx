import { create } from "zustand";

// Walk-up interaction. Each in-world thing the character can act on (a content
// panel, the guestbook terminal) registers a target here; the character
// controller picks the nearest one in range each frame and the DOM prompt shows
// it. The registry itself is a plain module-level array — registering must not
// re-render the scene — while only the currently-prompted target lives in the
// store, so just the prompt overlay updates when it changes.
//
// A target is `{ id, position: THREE.Vector3, title, open: () => void }`.
const targets = [];

export const registerInteractable = (target) => {
  targets.push(target);
  return () => {
    const index = targets.indexOf(target);
    if (index !== -1) targets.splice(index, 1);
  };
};

export const getInteractables = () => targets;

export const useInteractionStore = create((set) => ({
  prompt: null, // { id, title } of the in-range target, or null
  setPrompt: (prompt) => set({ prompt }),
}));
