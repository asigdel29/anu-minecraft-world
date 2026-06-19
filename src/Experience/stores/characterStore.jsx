/* eslint-disable react-refresh/only-export-components --
   This is a zustand store, not a React component module: its sole export is a
   create() hook, which react-refresh cannot recognise as a hook, so it wrongly
   flags the file as a fast-refresh boundary. */
import { create } from "zustand";

import { sanitizeCharacterUpdate } from "./characterValidation";

// Minecraft-palette defaults: Steve-inspired skin/cyan-shirt/blue-pants.
const DEFAULTS = {
  username: "",
  headColor: "#c8a07a", // skin tone
  bodyColor: "#00a8a8", // teal shirt
  legColor: "#3b3b9a", // dark blue pants
};

const STORAGE_KEY = "mc-character";

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persist = (state) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        username: state.username,
        headColor: state.headColor,
        bodyColor: state.bodyColor,
        legColor: state.legColor,
      })
    );
  } catch {
    // Storage full or blocked — silently skip.
  }
};

const saved = loadFromStorage();

export const useCharacterStore = create((set, get) => ({
  // Character look.
  username: saved?.username ?? DEFAULTS.username,
  headColor: saved?.headColor ?? DEFAULTS.headColor,
  bodyColor: saved?.bodyColor ?? DEFAULTS.bodyColor,
  legColor: saved?.legColor ?? DEFAULTS.legColor,

  // Whether the user has ever saved a character (drives the first-visit modal).
  hasCustomized: saved !== null,

  // Apply a partial update after sanitising it, persist, and mark customised.
  setCharacter: (partial) => {
    set(sanitizeCharacterUpdate(partial));
    persist(get());
    set({ hasCustomized: true });
  },
}));
