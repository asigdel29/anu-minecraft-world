import { useRef, useState } from "react";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import PlayerModel from "./models/PlayerT";
import { useKeyboard } from "./controls/useKeyboard";
import { useThirdPersonCamera } from "./controls/useThirdPersonCamera";
import { useModalStore } from "./stores/modalStore";

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

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

export default function Player({ colliders }) {
  const group = useRef();
  const keys = useKeyboard();
  const orbitCamera = useThirdPersonCamera();
  const camera = useThree((state) => state.camera);
  const { isModalOpen } = useModalStore();
  const [action, setAction] = useState("idle");

  // Live state kept in refs so per-frame motion never triggers a re-render.
  const position = useRef(SPAWN.clone());
  const yaw = useRef(Math.PI); // start facing the house (down -Z)
  const velocityY = useRef(0);
  const grounded = useRef(true);

  // Scratch objects reused every frame to avoid per-frame allocation.
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const move = useRef(new THREE.Vector3());
  const rayOrigin = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

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

    const isMoving = move.current.lengthSq() > 0;
    if (isMoving) {
      move.current.normalize();
      const speed = held.run ? RUN_SPEED : WALK_SPEED;
      position.current.addScaledVector(move.current, speed * step);

      // Turn the body toward travel; the model faces +Z at yaw 0, so the target
      // yaw is atan2(x, z). Lerp the angle (shortest way) for a smooth pivot.
      const target = Math.atan2(move.current.x, move.current.z);
      let diff = target - yaw.current;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      yaw.current += diff * Math.min(1, TURN_RATE * step);
    }

    // --- ground following, gravity, and jump --------------------------------
    // Find the surface directly under the head. While the world is still
    // streaming in (no colliders yet) we hold height so the character cannot
    // fall through the unloaded floor.
    const list = colliders && colliders.current;
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

    // Place the orbit camera last, after this frame's position is settled, so
    // it tracks the character without a frame of lag.
    orbitCamera.apply(camera, position.current);
  });

  return (
    <group ref={group}>
      <PlayerModel action={action} />
    </group>
  );
}
