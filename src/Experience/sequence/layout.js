// File: src/Experience/sequence/layout.js
//
// Sentience world — shared placement constants for the guided walkthrough.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Centralize sequence placement coordinates.
//
// One place to tune where the intro structures sit relative to the spawn. The
// player spawns near z=20 facing -Z (toward the house world), so structures are
// laid out at decreasing z: logo nearest, then the message screen, then the
// battleship block, leading into the existing open world.

// Brand colours.
export const NAVY = "#0a0e2e";
export const WHITE = "#f5f5f7";

// World-space centres [x, y, z] of each intro structure.
export const LOGO_CENTER = [0, 71, 9];
export const SCREEN_CENTER = [0, 70, -1];
export const BATTLESHIP_CENTER = [0, 66.5, -13];
