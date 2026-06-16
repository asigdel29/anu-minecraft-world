// File: src/Experience/sequence/IntroSequence.jsx
//
// Sentience world — guided intro orchestrator.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Orchestrate the timed logo shatter.
//
// Mounts the walkthrough structures and drives the stage transitions that are
// not owned by a structure itself: the timed hold before the Sentience logo
// shatters. Proximity-driven transitions (message screen, battleship) arrive
// with their structures in later phases.

import { useEffect } from "react";
import { STAGES, useSequenceStore } from "./sequenceStore";
import LogoWall from "./LogoWall";

const LOGO_HOLD = 3.5; // seconds the giant logo holds before it shatters

export default function IntroSequence() {
  const stage = useSequenceStore((s) => s.stage);
  const setStage = useSequenceStore((s) => s.setStage);

  // Hold the logo for a beat after spawn, then trigger the shatter.
  useEffect(() => {
    if (stage !== STAGES.LOGO) return undefined;
    const timer = setTimeout(() => setStage(STAGES.LOGO_BREAKING), LOGO_HOLD * 1000);
    return () => clearTimeout(timer);
  }, [stage, setStage]);

  return <LogoWall />;
}
