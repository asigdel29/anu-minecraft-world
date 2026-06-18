import { create } from "zustand";

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
  // Character look
  username: saved?.username ?? DEFAULTS.username,
  headColor: saved?.headColor ?? DEFAULTS.headColor,
  bodyColor: saved?.bodyColor ?? DEFAULTS.bodyColor,
  legColor: saved?.legColor ?? DEFAULTS.legColor,

  // Whether the user has ever saved a character (drives first-visit modal).
  hasCustomized: saved !== null,

  setCharacter: (partial) => {
    set(partial);
    const next = get();
    persist(next);
    set({ hasCustomized: true });
  },
}));
