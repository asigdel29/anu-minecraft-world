// File: src/Experience/multiplayer/presenceStore.js
//
// Sentience world — multiplayer roster + remote pose state.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add presence store and remote pose map.
//
// Membership (who is in the room) lives in a zustand store so React adds/removes
// remote avatars when players join/leave. Per-frame transforms live in a plain
// module-level map so streaming poses never trigger re-renders (the project's
// no-re-render convention).

import { create } from "zustand";

// remotePoses maps a remote player id to its latest target transform; read each
// frame by the avatar and lerped toward.
export const remotePoses = new Map();

// usePresenceStore holds the roster: id -> { name }.
export const usePresenceStore = create((set) => ({
  selfId: null,
  players: {},
  setSelf: (selfId) => set({ selfId }),
  addPlayer: (id, name) =>
    set((s) => (s.players[id] ? s : { players: { ...s.players, [id]: { name: name || "Steve" } } })),
  removePlayer: (id) =>
    set((s) => {
      if (!s.players[id]) return s;
      const players = { ...s.players };
      delete players[id];
      return { players };
    }),
  reset: () => set({ players: {} }),
}));
