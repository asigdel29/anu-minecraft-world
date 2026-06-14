import { useEffect, useRef } from "react";

import { input, resetInput } from "./inputState";

// Map physical keys to abstract movement actions. Using `event.code` (physical
// position) rather than `event.key` keeps WASD working on non-QWERTY layouts,
// and the arrow keys mirror it for accessibility.
const KEY_ACTIONS = {
  KeyW: "forward",
  ArrowUp: "forward",
  KeyS: "back",
  ArrowDown: "back",
  KeyA: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right",
  Space: "jump",
  ShiftLeft: "run",
  ShiftRight: "run",
  KeyE: "interact",
};

/**
 * Bind the keyboard to the shared movement input.
 *
 * The controller reads {@link input} every frame inside its own `useFrame`, so
 * key changes never trigger a React re-render. The same object is also written
 * by the on-screen joystick, so keyboard and touch drive one controller.
 *
 * @returns a stable ref whose `.current` is the shared input object.
 */
export function useKeyboard() {
  const ref = useRef(input);

  useEffect(() => {
    const setAction = (event, held) => {
      const action = KEY_ACTIONS[event.code];
      if (!action) return;
      // The canvas fills the viewport, so Space and the arrows would otherwise
      // scroll the page; swallow them while they drive the character instead.
      event.preventDefault();
      input[action] = held;
    };

    const onDown = (event) => setAction(event, true);
    const onUp = (event) => setAction(event, false);
    // Releasing focus (tab switch, alt-tab) can drop the keyup, leaving a key
    // stuck "held"; clear everything when the window loses focus.
    const onBlur = () => resetInput();

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return ref;
}
