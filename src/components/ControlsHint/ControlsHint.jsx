import { useEffect, useState } from "react";

import "./ControlsHint.scss";

import { useModalStore } from "../../Experience/stores/modalStore";
import { useNavStore } from "../../Experience/stores/navStore";
import { isCoarsePointer } from "../../Experience/controls/orientation";

// Show the legend briefly on entering, then again whenever the visitor has been
// idle this long — so a stuck visitor is reminded how to move.
const SHOW_MS = 7000;
const IDLE_MS = 8000;

/**
 * Controls legend for driving the character.
 *
 * Appears once the world has been entered, stays up briefly so the controls are
 * read at least once, then auto-hides. Any real input (a key, a drag, the
 * wheel, a touch) hides it and restarts an idle countdown that brings it back if
 * the visitor goes quiet again. On a coarse pointer it points at the on-screen
 * controls instead of the keyboard.
 */
const ControlsHint = () => {
  const enteredWorld = useNavStore((state) => state.enteredWorld);
  const { isModalOpen } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [coarse] = useState(isCoarsePointer);

  useEffect(() => {
    if (!enteredWorld) return undefined;

    let timer;
    // Show now, auto-hiding after the read window.
    setIsVisible(true);
    timer = setTimeout(() => setIsVisible(false), SHOW_MS);

    // Real input hides the legend and restarts the idle countdown.
    const onActivity = () => {
      setIsVisible(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIsVisible(true), IDLE_MS);
    };

    window.addEventListener("keydown", onActivity);
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("wheel", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("wheel", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [enteredWorld]);

  const shown = isVisible && enteredWorld && !isModalOpen;

  return (
    <div
      className={`controls-hint ${shown ? "controls-hint--visible" : ""}`}
      aria-hidden="true"
    >
      {coarse ? (
        <span>Joystick to move · drag to look · run · jump · use</span>
      ) : (
        <>
          <span className="controls-hint-key">WASD</span>
          <span>move</span>
          <span className="controls-hint-key">drag</span>
          <span>look</span>
          <span className="controls-hint-key">Space</span>
          <span>jump</span>
          <span className="controls-hint-key">E</span>
          <span>interact</span>
        </>
      )}
    </div>
  );
};

export default ControlsHint;
