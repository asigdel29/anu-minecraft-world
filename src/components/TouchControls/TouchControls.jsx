import { useRef, useState } from "react";

import "./TouchControls.scss";

import { input } from "../../Experience/controls/inputState";

// Joystick geometry and dead zone. The thumb is clamped to RADIUS px from the
// base centre; a push past DEAD (as a fraction of RADIUS) along an axis sets
// that direction, so a small wobble does not creep the character.
const RADIUS = 46;
const DEAD = 0.28;

const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(pointer: coarse)").matches;

/**
 * On-screen controls for touch devices: a left-hand virtual joystick that
 * drives the same movement input the keyboard does, and a jump button. Looking
 * around already works on touch via the camera rig's pointer listeners, so the
 * rest of the screen drags the camera; these controls call `stopPropagation`
 * so touching them never also orbits the camera. Rendered only on a coarse
 * pointer, and never on a mouse.
 */
const TouchControls = () => {
  const [coarse] = useState(isCoarsePointer);
  const baseRef = useRef(null);
  const thumbRef = useRef(null);
  const center = useRef(null);

  if (!coarse) return null;

  const updateFromPointer = (event) => {
    if (!center.current) return;
    const dx = event.clientX - center.current.x;
    const dy = event.clientY - center.current.y;
    const dist = Math.hypot(dx, dy) || 1;
    const clamped = Math.min(dist, RADIUS);
    thumbRef.current.style.transform = `translate(${
      (dx / dist) * clamped
    }px, ${(dy / dist) * clamped}px)`;

    const nx = dx / RADIUS;
    const ny = dy / RADIUS; // screen y grows downward, so up is "forward"
    input.forward = ny < -DEAD;
    input.back = ny > DEAD;
    input.left = nx < -DEAD;
    input.right = nx > DEAD;
  };

  const onStart = (event) => {
    event.stopPropagation();
    const rect = baseRef.current.getBoundingClientRect();
    center.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    baseRef.current.setPointerCapture(event.pointerId);
    updateFromPointer(event);
  };

  const onMove = (event) => {
    if (!center.current) return;
    event.stopPropagation();
    updateFromPointer(event);
  };

  const onEnd = (event) => {
    event.stopPropagation();
    center.current = null;
    thumbRef.current.style.transform = "translate(0px, 0px)";
    input.forward = false;
    input.back = false;
    input.left = false;
    input.right = false;
  };

  const setJump = (held) => (event) => {
    event.stopPropagation();
    input.jump = held;
  };

  return (
    <div className="touch-controls" aria-hidden="true">
      <div
        ref={baseRef}
        className="touch-joystick"
        onPointerDown={onStart}
        onPointerMove={onMove}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
      >
        <div ref={thumbRef} className="touch-joystick-thumb" />
      </div>
      <button
        type="button"
        className="touch-jump"
        onPointerDown={setJump(true)}
        onPointerUp={setJump(false)}
        onPointerCancel={setJump(false)}
        onPointerLeave={setJump(false)}
      >
        Jump
      </button>
    </div>
  );
};

export default TouchControls;
