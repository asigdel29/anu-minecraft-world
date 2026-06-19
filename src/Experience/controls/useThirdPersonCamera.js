import { useEffect, useRef } from "react";

import * as THREE from "three";

import { followYaw } from "./followYaw";

// Orbit limits and sensitivities for the third-person rig. Pitch is kept just
// above the ground and just below straight-down so the camera never flips or
// buries itself in the lawn; distance clamps keep the character framed.
const PITCH_MIN = 0.05;
const PITCH_MAX = 1.3;
const DISTANCE_MIN = 4;
const DISTANCE_MAX = 16;
const ORBIT_SENSITIVITY = 0.005;
const ZOOM_SENSITIVITY = 0.8;
const LOOK_HEIGHT = 1.5; // aim at the character's head, not its feet
const CAMERA_NEAR_MIN = 2; // never pull closer than this when a wall intrudes
const CAMERA_SKIN = 0.3; // keep the camera just off the surface it hit

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * A drag-to-orbit third-person camera rig.
 *
 * Dragging (left button / touch) orbits the camera around the character and the
 * wheel zooms. Drag — rather than pointer lock — is deliberate: the cursor stays
 * free to click the DOM overlay (audio, info, modals) and the in-world panels.
 *
 * Orbit state lives in refs and is consumed each frame by `apply`, so pointer
 * input never triggers a React re-render.
 *
 * @returns `{ apply }` where `apply(camera, target)` places the camera on its
 *   orbit around `target` (a THREE.Vector3) and looks at the head.
 */
export function useThirdPersonCamera() {
  const yaw = useRef(0); // start behind the character (facing the house)
  const pitch = useRef(0.35);
  const distance = useRef(9);
  const isDragging = useRef(false);

  // Scratch objects reused each frame so `apply` allocates nothing.
  const aim = useRef(new THREE.Vector3());
  const desired = useRef(new THREE.Vector3());
  const toCamera = useRef(new THREE.Vector3());
  const raycaster = useRef(new THREE.Raycaster());

  useEffect(() => {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onDown = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      dragging = true;
      isDragging.current = true;
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onMove = (event) => {
      if (!dragging) return;
      yaw.current -= (event.clientX - lastX) * ORBIT_SENSITIVITY;
      pitch.current = clamp(
        pitch.current - (event.clientY - lastY) * ORBIT_SENSITIVITY,
        PITCH_MIN,
        PITCH_MAX
      );
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onUp = () => {
      dragging = false;
      isDragging.current = false;
    };
    const onWheel = (event) => {
      distance.current = clamp(
        distance.current + Math.sign(event.deltaY) * ZOOM_SENSITIVITY,
        DISTANCE_MIN,
        DISTANCE_MAX
      );
    };

    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Place the camera on its orbit around `target`, looking at the head. If
  // `colliders` are given and the house wall would sit between the head and the
  // camera, pull the camera in to the wall so the view never clips inside.
  const apply = (camera, target, playerYaw, isMoving, step, colliders) => {
    aim.current.set(target.x, target.y + LOOK_HEIGHT, target.z);

    // Auto-follow: ease the yaw to sit behind the player while moving (and not
    // while the user is dragging the orbit). See followYaw for the easing.
    yaw.current = followYaw(yaw.current, playerYaw, {
      isMoving,
      isDragging: isDragging.current,
      step,
    });

    const cosPitch = Math.cos(pitch.current);
    desired.current.set(
      target.x + distance.current * Math.sin(yaw.current) * cosPitch,
      aim.current.y + distance.current * Math.sin(pitch.current),
      target.z + distance.current * Math.cos(yaw.current) * cosPitch
    );

    const list = colliders && colliders.current;
    if (list && list.length) {
      toCamera.current.subVectors(desired.current, aim.current);
      const reach = toCamera.current.length();
      toCamera.current.divideScalar(reach || 1);
      raycaster.current.set(aim.current, toCamera.current);
      raycaster.current.far = reach;
      const hits = raycaster.current.intersectObjects(list, true);
      if (hits.length) {
        const pulled = Math.max(CAMERA_NEAR_MIN, hits[0].distance - CAMERA_SKIN);
        desired.current
          .copy(aim.current)
          .addScaledVector(toCamera.current, pulled);
      }
    }

    camera.position.copy(desired.current);
    camera.lookAt(aim.current);
  };

  return { apply };
}
