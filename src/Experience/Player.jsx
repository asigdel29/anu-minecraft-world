import { useRef, useState } from "react";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import PlayerModel from "./models/PlayerT";
import { useKeyboard } from "./controls/useKeyboard";
import { useThirdPersonCamera } from "./controls/useThirdPersonCamera";
import { useModalStore } from "./stores/modalStore";
import {
  getInteractables,
  useInteractionStore,
} from "./stores/interactionStore";
import { playFootstep } from "../utils/footsteps";

// The character walks the world's baked geometry: a downward ray finds the
// surface under it each frame so it follows the uneven lawn and climbs onto the
// house floors, while gravity pulls it back down and Space jumps. Movement is
// taken relative to where the orbit camera looks, so "forward" always reads as
// "away from the camera" regardless of orbit angle. Horizontal wall collision
// arrives in a later change.
const SPAWN = new THREE.Vector3(0, 64.85, 20);
const WALK_SPEED = 4.2; // world units per second
const RUN_SPEED = 7.0;
const TURN_RATE = 12; // how quickly the body swings to face travel direction

const GRAVITY = -22; // units per second squared
const JUMP_SPEED = 8.5; // initial upward speed (~1.6 units of height)
const RAY_ABOVE = 2.2; // start the ground ray at head height
const RAY_FAR = 12; // how far below the head to search for ground

const PLAYER_RADIUS = 0.35; // keep the body this far off a wall
const WALL_CAST_H = 1.0; // cast for walls at mid-body height
const WALL_SLOPE_LIMIT = 0.5; // |normal.y| above this is floor, not wall

const INTERACT_RANGE = 3.2; // how close to a panel/terminal to prompt for E

// Soft world boundary: a box around the lawn that keeps the character from
// wandering off the terrain into the void. Generous enough to reach every mob.
const BOUNDS = { minX: -45, maxX: 45, minZ: -50, maxZ: 55 };
// Footstep cadence (seconds between steps); a touch quicker while running.
const STEP_WALK = 0.34;
const STEP_RUN = 0.26;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

export default function Player({ colliders }) {
  const group = useRef();
  const keys = useKeyboard();
  const orbitCamera = useThirdPersonCamera();
  const camera = useThree((state) => state.camera);
  const { isModalOpen } = useModalStore();
  const setPrompt = useInteractionStore((state) => state.setPrompt);
  const [action, setAction] = useState("idle");

  // Live state kept in refs so per-frame motion never triggers a re-render.
  const position = useRef(SPAWN.clone());
  const yaw = useRef(Math.PI); // start facing the house (down -Z)
  const velocityY = useRef(0);
  const grounded = useRef(true);
  const nearest = useRef(null);
  const interactWasHeld = useRef(false);
  const stepTimer = useRef(0);

  // Scratch objects reused every frame to avoid per-frame allocation.
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const move = useRef(new THREE.Vector3());
  const disp = useRef(new THREE.Vector3());
  const wallNormal = useRef(new THREE.Vector3());
  const rayOrigin = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  // Cast along the intended horizontal step; if a wall is within the body
  // radius, remove the component of the step that drives into it so the
  // character slides along the wall instead of stopping dead or passing
  // through. Near-horizontal surfaces (the lawn, the floor ahead on a slope)
  // are skipped so they read as walkable ground, not walls.
  const slideOffWalls = (delta, list) => {
    if (!list || !list.length) return;
    const len = Math.hypot(delta.x, delta.z);
    if (len === 0) return;
    rayOrigin.current.set(
      position.current.x,
      position.current.y + WALL_CAST_H,
      position.current.z
    );
    raycaster.current.set(
      rayOrigin.current,
      wallNormal.current.set(delta.x / len, 0, delta.z / len)
    );
    raycaster.current.far = PLAYER_RADIUS + len;
    const hits = raycaster.current.intersectObjects(list, true);
    for (const hit of hits) {
      if (!hit.face) continue;
      wallNormal.current
        .copy(hit.face.normal)
        .transformDirection(hit.object.matrixWorld);
      if (Math.abs(wallNormal.current.y) > WALL_SLOPE_LIMIT) continue;
      wallNormal.current.y = 0;
      wallNormal.current.normalize();
      const into =
        delta.x * wallNormal.current.x + delta.z * wallNormal.current.z;
      if (into < 0) {
        delta.x -= wallNormal.current.x * into;
        delta.z -= wallNormal.current.z * into;
      }
      return; // resolve against the nearest wall only
    }
  };

  useFrame((state, delta) => {
    if (!group.current) return;
    const step = Math.min(delta, 0.1);
    const held = keys.current;

    // --- horizontal travel ---------------------------------------------------
    // Camera-relative axes, flattened onto the ground so looking down never
    // slows travel.
    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();
    right.current.crossVectors(forward.current, UP).normalize();

    move.current.set(0, 0, 0);
    if (!isModalOpen) {
      if (held.forward) move.current.add(forward.current);
      if (held.back) move.current.sub(forward.current);
      if (held.right) move.current.add(right.current);
      if (held.left) move.current.sub(right.current);
    }

    const list = colliders && colliders.current;
    const isMoving = move.current.lengthSq() > 0;
    if (isMoving) {
      move.current.normalize();
      const speed = held.run ? RUN_SPEED : WALK_SPEED;
      disp.current.copy(move.current).multiplyScalar(speed * step);

      // --- Step Up / Stair Climbing Algorithm ---
      const oldX = position.current.x;
      const oldY = position.current.y;
      const oldZ = position.current.z;

      // 1. Try normal horizontal movement with sliding
      let tempDisp = disp.current.clone();
      slideOffWalls(tempDisp, list);

      const originalLen = disp.current.length();
      const slidLen = tempDisp.length();

      // If we were blocked/reduced by more than 5%, try to step up over the obstacle
      if (slidLen < originalLen * 0.95) {
        const MAX_STEP_HEIGHT = 0.5;
        // Temporarily raise the character
        position.current.y += MAX_STEP_HEIGHT;

        // Try the horizontal move again at the raised height
        let stepUpDisp = disp.current.clone();
        slideOffWalls(stepUpDisp, list);

        // If stepping up allowed us to move further forward horizontally
        if (stepUpDisp.length() > slidLen) {
          position.current.x += stepUpDisp.x;
          position.current.z += stepUpDisp.z;

          // Find the ground height at this new position
          let groundY = null;
          if (list && list.length) {
            rayOrigin.current.set(
              position.current.x,
              position.current.y + RAY_ABOVE,
              position.current.z
            );
            raycaster.current.set(rayOrigin.current, DOWN);
            raycaster.current.far = RAY_FAR + MAX_STEP_HEIGHT;
            const hits = raycaster.current.intersectObjects(list, true);
            if (hits.length) groundY = hits[0].point.y;
          }

          // If valid ground is found and it's within step limits
          if (
            groundY !== null &&
            groundY <= oldY + MAX_STEP_HEIGHT &&
            groundY >= oldY - 0.1
          ) {
            // Success! Walk on the new stepped ground
            position.current.y = groundY;
          } else {
            // Step up invalid, revert and apply normal horizontal slide
            position.current.x = oldX + tempDisp.x;
            position.current.y = oldY;
            position.current.z = oldZ + tempDisp.z;
          }
        } else {
          // Raising didn't help, revert and apply normal horizontal slide
          position.current.x = oldX + tempDisp.x;
          position.current.y = oldY;
          position.current.z = oldZ + tempDisp.z;
        }
      } else {
        // Apply normal horizontal slide directly
        position.current.x += tempDisp.x;
        position.current.z += tempDisp.z;
      }

      // Turn the body toward the intended travel direction (not the slid one),
      // so it keeps facing where the player is steering while brushing a wall.
      // The model faces +Z at yaw 0, so the target yaw is atan2(x, z); lerp the
      // angle the short way for a smooth pivot.
      const target = Math.atan2(move.current.x, move.current.z);
      let diff = target - yaw.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      yaw.current += diff * Math.min(1, TURN_RATE * step);
    }

    // Keep the character on the terrain, not out in the void.
    position.current.x = clamp(position.current.x, BOUNDS.minX, BOUNDS.maxX);
    position.current.z = clamp(position.current.z, BOUNDS.minZ, BOUNDS.maxZ);

    // --- ground following, gravity, and jump --------------------------------
    // Find the surface directly under the head. While the world is still
    // streaming in (no colliders yet) we hold height so the character cannot
    // fall through the unloaded floor.
    let groundY = null;
    if (list && list.length) {
      rayOrigin.current.set(
        position.current.x,
        position.current.y + RAY_ABOVE,
        position.current.z
      );
      raycaster.current.set(rayOrigin.current, DOWN);
      raycaster.current.far = RAY_FAR;
      const hits = raycaster.current.intersectObjects(list, true);
      if (hits.length) groundY = hits[0].point.y;
    }

    if (groundY === null) {
      velocityY.current = 0;
      grounded.current = true;
    } else {
      if (grounded.current && held.jump && !isModalOpen) {
        velocityY.current = JUMP_SPEED;
        grounded.current = false;
      }
      velocityY.current += GRAVITY * step;
      let newY = position.current.y + velocityY.current * step;
      if (newY <= groundY) {
        newY = groundY;
        velocityY.current = 0;
        grounded.current = true;
      } else {
        grounded.current = false;
      }
      position.current.y = newY;
    }

    group.current.position.copy(position.current);
    group.current.rotation.y = yaw.current;

    const nextAction = !grounded.current ? "jump" : isMoving ? "walk" : "idle";
    if (nextAction !== action) setAction(nextAction);

    // Footsteps on a cadence while walking on the ground.
    if (isMoving && grounded.current && !isModalOpen) {
      stepTimer.current += step;
      const interval = held.run ? STEP_RUN : STEP_WALK;
      if (stepTimer.current >= interval) {
        playFootstep();
        stepTimer.current = 0;
      }
    } else {
      stepTimer.current = STEP_WALK; // so the next step lands as soon as we move
    }

    // --- nearest interactable + E to open -----------------------------------
    // While a modal is open there is nothing to prompt; otherwise find the
    // closest registered target in range and surface it to the DOM prompt. E
    // opens it on the press edge so a held key does not reopen every frame.
    if (isModalOpen) {
      if (nearest.current) {
        nearest.current = null;
        setPrompt(null);
      }
    } else {
      const targets = getInteractables();
      let best = null;
      let bestDistSq = INTERACT_RANGE * INTERACT_RANGE;
      for (const target of targets) {
        const distSq = target.position.distanceToSquared(position.current);
        if (distSq < bestDistSq) {
          bestDistSq = distSq;
          best = target;
        }
      }
      if (best !== nearest.current) {
        nearest.current = best;
        setPrompt(best ? { id: best.id, title: best.title } : null);
      }
      if (best && held.interact && !interactWasHeld.current) best.open();
    }
    interactWasHeld.current = held.interact;

    // Place the orbit camera last, after this frame's position is settled, so
    // it tracks the character without a frame of lag; pass the colliders so it
    // can pull in when the house would come between the camera and the head.
    orbitCamera.apply(
      camera,
      position.current,
      yaw.current,
      isMoving,
      step,
      colliders
    );
  });

  return (
    <group ref={group}>
      <PlayerModel action={action} />
    </group>
  );
}
