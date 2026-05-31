import { create } from "zustand";

export const useAudioStore = create((set) => ({
  isAudioEnabled: false,
  setIsAudioEnabled: (state) => set({ isAudioEnabled: state }),
}));
