import { useRef, useState } from "react";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import PlayerModel from "./models/PlayerT";
import { useKeyboard } from "./controls/useKeyboard";
import { useThirdPersonCamera } from "./controls/useThirdPersonCamera";
import { useModalStore } from "./stores/modalStore";

// Ground-plane movement only for now: the character walks a fixed height on the
// front lawn while we prove out input and the camera. Gravity, terrain
// following, and wall collision arrive in later changes. Movement is taken
// relative to where the orbit camera looks, so "forward" always reads as "away
// from the camera" regardless of which way the rig has been orbited.
const SPAWN = new THREE.Vector3(0, 64.85, 20);
const WALK_SPEED = 4.2; // world units per second
const RUN_SPEED = 7.0;
const TURN_RATE = 12; // how quickly the body swings to face travel direction

const UP = new THREE.Vector3(0, 1, 0);

export default function Player() {
  const group = useRef();
  const keys = useKeyboard();
  const orbitCamera = useThirdPersonCamera();
  const camera = useThree((state) => state.camera);
  const { isModalOpen } = useModalStore();
  const [moving, setMoving] = useState(false);

  // Live state kept in refs so per-frame motion never triggers a re-render.
  const position = useRef(SPAWN.clone());
  const yaw = useRef(Math.PI); // start facing the house (down -Z)

  // Scratch vectors reused every frame to avoid per-frame allocation.
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const move = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    if (!group.current) return;
    const step = Math.min(delta, 0.1);
    const held = keys.current;

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
    if (isMoving !== moving) setMoving(isMoving);

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

    group.current.position.copy(position.current);
    group.current.rotation.y = yaw.current;

    // Place the orbit camera last, after this frame's position is settled, so
    // it tracks the character without a frame of lag.
    orbitCamera.apply(camera, position.current);
  });

  return (
    <group ref={group}>
      <PlayerModel action={moving ? "walk" : "idle"} />
    </group>
  );
}
