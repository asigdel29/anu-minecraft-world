// File: src/Experience/battleship/battleshipStore.js
//
// Sentience world — in-world Battleship UI state.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Port the Battleship game store into the world.
//
// Zustand store driving the in-world Battleship board: a JS port of the deployed
// game's store, adapted to this app. Adds `active` (whether the board is engaged
// from the battleship block) on top of the create/join/place/fire/rehydrate flow
// against the existing backend.

import { create } from "zustand";
import * as api from "./client";

// FLEET is the placement order; ships are placed one at a time in this order.
export const FLEET = [
  { ship: "carrier", len: 5 },
  { ship: "battleship", len: 4 },
  { ship: "cruiser", len: 3 },
  { ship: "submarine", len: 3 },
  { ship: "destroyer", len: 2 },
];

const CUMULATIVE = [5, 9, 12, 15, 17];

/** placedCount derives how many ships are placed from the authoritative view. */
export function placedCount(view) {
  const cells = view.you.cells.flat().filter((c) => c.ship).length;
  const idx = CUMULATIVE.indexOf(cells);
  return idx < 0 ? 0 : idx + 1;
}

export const useBattleshipStore = create((set, get) => ({
  active: false, // board engaged from the battleship block
  view: null,
  busy: false,
  error: null,
  lastResult: null,
  socket: null,
  orientation: "horizontal",

  open: () => set({ active: true }),

  newGame: async (mode) => {
    set({ busy: true, error: null, lastResult: null });
    try {
      const res = await api.createGame(mode);
      set({ view: res.view });
      get().connect(res.gameId);
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ busy: false });
    }
  },

  joinGame: async (gameId) => {
    set({ busy: true, error: null, lastResult: null, active: true });
    try {
      const res = await api.joinGame(gameId);
      set({ view: res.view });
      get().connect(res.gameId);
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ busy: false });
    }
  },

  placeAt: async (x, y) => {
    const view = get().view;
    if (!view || view.status !== "placing") return;
    const n = placedCount(view);
    if (n >= FLEET.length) return;
    set({ busy: true, error: null });
    try {
      const updated = await api.placeShip(view.gameId, FLEET[n].ship, x, y, get().orientation);
      set({ view: updated });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ busy: false });
    }
  },

  autoPlace: async () => {
    const view = get().view;
    if (!view) return;
    set({ busy: true, error: null });
    try {
      let latest = view;
      for (let i = placedCount(view); i < FLEET.length; i++) {
        latest = await api.placeShip(view.gameId, FLEET[i].ship, 0, i, "horizontal");
      }
      set({ view: latest });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ busy: false });
    }
  },

  toggleOrientation: () =>
    set((s) => ({ orientation: s.orientation === "horizontal" ? "vertical" : "horizontal" })),

  shoot: async (x, y) => {
    const view = get().view;
    if (!view || !view.yourTurn) return;
    set({ busy: true, error: null });
    try {
      const res = await api.fire(view.gameId, x, y);
      set({ view: res.view, lastResult: res.sunkShip ? `Sunk ${res.sunkShip}!` : res.result });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ busy: false });
    }
  },

  connect: (gameId) => {
    get().socket?.close();
    const socket = api.openSocket(gameId, (view) => set({ view }));
    set({ socket });
  },

  rematch: async () => {
    const mode = get().view?.mode === "ai" ? "ai" : "human";
    get().socket?.close();
    api.clearSession();
    set({ view: null, lastResult: null, socket: null });
    await get().newGame(mode);
  },

  close: () => {
    get().socket?.close();
    set({ active: false, view: null, error: null, lastResult: null, socket: null });
  },
}));
