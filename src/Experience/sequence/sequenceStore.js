// File: src/Experience/sequence/sequenceStore.js
//
// Sentience world — guided-walkthrough state machine.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add sequence store driving the intro walkthrough.
//
// A small zustand store holding the current stage of the branded intro: the
// giant Sentience logo block, its shatter, the walk to the message screen, that
// screen's shatter, the battleship block, and the open multiplayer world.
// Components mount/arm themselves off the current stage; transitions are driven
// by timers (logo) and proximity (screen/battleship) in IntroSequence.

import { create } from "zustand";

// STAGES enumerates the ordered walkthrough phases.
export const STAGES = {
  LOGO: "logo", // giant logo block on screen
  LOGO_BREAKING: "logo_breaking", // logo shattering
  WALK: "walk", // player walks forward toward the message
  SCREEN: "screen", // message screen visible
  SCREEN_BREAKING: "screen_breaking", // message screen shattering
  BATTLESHIP: "battleship", // battleship block revealed / playable
  OPEN_WORLD: "open_world", // free roam + multiplayer
};

// useSequenceStore exposes the current stage and a setter. advance() is a
// convenience that moves to an explicit next stage.
export const useSequenceStore = create((set) => ({
  stage: STAGES.LOGO,
  setStage: (stage) => set({ stage }),
}));
