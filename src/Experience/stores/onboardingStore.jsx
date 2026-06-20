import { create } from "zustand";

// Tracks whether the visitor has seen the first-visit welcome, persisted so the
// popup (and the tour it offers) is shown only once, ever. Mirrors the storage
// pattern used by the character store.
const STORAGE_KEY = "mc-welcome-seen";

const loadSeen = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const persistSeen = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage full or blocked — silently skip.
  }
};

export const useOnboardingStore = create((set) => ({
  // Whether the welcome popup has already been shown and dismissed.
  hasSeenWelcome: loadSeen(),

  // Mark the welcome as seen and persist it so it never shows again.
  markWelcomeSeen: () => {
    persistSeen();
    set({ hasSeenWelcome: true });
  },
}));
