// Park layout source of truth — mirrored from the staged park-nav manifest
// (patch 0001: PARK_BOUNDS + ATTRACTIONS). Keep in sync with
// src/park/manifest.js when that patch lands; the budget/refs test asserts
// id parity.

export const PARK_BOUNDS = { minX: -45, maxX: 45, minZ: -50, maxZ: 55 };

// (id, export key, park x, park z) — one GLB per attraction.
export const ATTRACTIONS = [
  { id: "agent-arcade", key: "agent-arcade", x: -38.0, z: 22.0 },
  { id: "factory", key: "factory", x: 30.0, z: -18.0 },
  { id: "idea-graveyard", key: "idea-graveyard", x: -14.0, z: -34.0 },
  { id: "library", key: "library", x: 12.0, z: 30.0 },
  { id: "hardware", key: "hardware", x: -40.0, z: -8.0 },
  { id: "launch-tower", key: "launch-tower", x: 36.0, z: 16.0 },
  { id: "fortune", key: "fortune", x: 4.0, z: -6.0 },
];

// Shared ground/props GLB (lawn, paths, gate, fence, lamps, mascots,
// balloon landmark, construction zones for not-yet-built attractions).
export const GROUND_KEY = "ground";

export const GLB_KEYS = [...ATTRACTIONS.map((a) => a.key), GROUND_KEY];
