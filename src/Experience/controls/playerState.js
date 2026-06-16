// File: src/Experience/controls/playerState.js
//
// Sentience world — live player transform shared without re-renders.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add shared player state for sequence + multiplayer.
//
// A mutable module-level snapshot of the local character, written every frame by
// the controller (Player.jsx) and read by the guided-sequence triggers and the
// multiplayer presence client. It follows the project's existing no-re-render
// pattern (see controls/inputState and stores/interactionStore): per-frame
// motion must never trigger React updates.

import * as THREE from "three";

// playerState mirrors the character each frame: world position, body yaw, and
// the current animation action ("idle" | "walk" | "jump").
export const playerState = {
  position: new THREE.Vector3(),
  yaw: 0,
  action: "idle",
  moving: false,
};
