import { useEffect, useRef } from "react";

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
};

/**
 * Track which movement actions are currently held.
 *
 * The state is exposed as a ref (never React state) because the controller
 * reads it every frame inside its own `useFrame`; lifting it into state would
 * re-render the whole scene on each key change for no benefit.
 *
 * @returns a ref whose `.current` holds boolean flags keyed by action name.
 */
export function useKeyboard() {
  const actions = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    jump: false,
    run: false,
  });

  useEffect(() => {
    const setAction = (event, held) => {
      const action = KEY_ACTIONS[event.code];
      if (!action) return;
      // The canvas fills the viewport, so Space and the arrows would otherwise
      // scroll the page; swallow them while they drive the character instead.
      event.preventDefault();
      actions.current[action] = held;
    };

    const onDown = (event) => setAction(event, true);
    const onUp = (event) => setAction(event, false);
    // Releasing focus (tab switch, alt-tab) can drop the keyup, leaving a key
    // stuck "held"; clear everything when the window loses focus.
    const onBlur = () => {
      Object.keys(actions.current).forEach((key) => {
        actions.current[key] = false;
      });
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return actions;
}
