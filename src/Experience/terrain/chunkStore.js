import { create } from "zustand";

/**
 * Streaming state shared between the chunk manager and the rest of the scene:
 *
 * - `eagerReady` flips once every spawn-eager chunk has mounted, meaning the
 *   terrain visible through the house windows is in the graph. SceneSky gates
 *   its one-time background capture on this instead of the global loading
 *   manager, so later chunk streaming can never interfere with the capture.
 */
export const useChunkStore = create((set) => ({
  eagerReady: false,
  setEagerReady: () => set({ eagerReady: true }),
}));
