// File: src/Experience/sequence/IntroSequence.jsx
//
// Sentience world — guided intro orchestrator.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Orchestrate the timed logo shatter.
//   2026-06-16  asigdel29   Add walk-proximity progression, screen, and SFX.
//
// Mounts the walkthrough structures and drives the stage transitions not owned
// by a structure: the timed hold before the logo shatters, the walk toward the
// message screen (proximity), the read-hold before the screen shatters, and the
// shatter sound effects. Each structure handles its own break animation.

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { STAGES, useSequenceStore } from "./sequenceStore";
import { SCREEN_CENTER } from "./layout";
import LogoWall from "./LogoWall";
import TextScreen from "./TextScreen";
import { playBlockBreak } from "../../utils/sequenceAudio";
import { playerState } from "../controls/playerState";

const LOGO_HOLD = 3.5; // seconds the giant logo holds before it shatters
const READ_HOLD = 2.6; // seconds to read the message before it shatters
const SCREEN_TRIGGER_DIST = 8; // how close (XZ) to the screen arms its shatter

const screenPos = new THREE.Vector3(SCREEN_CENTER[0], SCREEN_CENTER[1], SCREEN_CENTER[2]);

export default function IntroSequence() {
  const stage = useSequenceStore((s) => s.stage);
  const setStage = useSequenceStore((s) => s.setStage);
  const tmp = useRef(new THREE.Vector3());

  // Hold the logo for a beat after spawn, then trigger the shatter.
  useEffect(() => {
    if (stage !== STAGES.LOGO) return undefined;
    const timer = setTimeout(() => setStage(STAGES.LOGO_BREAKING), LOGO_HOLD * 1000);
    return () => clearTimeout(timer);
  }, [stage, setStage]);

  // After the player reaches and reads the screen, shatter it.
  useEffect(() => {
    if (stage !== STAGES.SCREEN) return undefined;
    const timer = setTimeout(() => setStage(STAGES.SCREEN_BREAKING), READ_HOLD * 1000);
    return () => clearTimeout(timer);
  }, [stage, setStage]);

  // Play a shatter sound on each break stage.
  useEffect(() => {
    if (stage === STAGES.LOGO_BREAKING || stage === STAGES.SCREEN_BREAKING) playBlockBreak();
  }, [stage]);

  // Walk stage: advance to SCREEN once the player approaches the message (XZ).
  useFrame(() => {
    if (stage !== STAGES.WALK) return;
    tmp.current.copy(playerState.position);
    tmp.current.y = screenPos.y;
    if (tmp.current.distanceTo(screenPos) < SCREEN_TRIGGER_DIST) {
      setStage(STAGES.SCREEN);
    }
  });

  return (
    <>
      <LogoWall />
      <TextScreen />
    </>
  );
}
