import { useEffect, useRef, useState } from "react";

import "./ScrollHint.scss";

import { useModalStore } from "../../Experience/stores/modalStore";
import { useNavStore } from "../../Experience/stores/navStore";

// How long the visitor can go without navigating before we surface the hint.
const IDLE_MS = 4000;

const isCoarsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(pointer: coarse)").matches;

/**
 * Idle nudge that tells a stuck visitor how to move through the scene.
 *
 * Appears once the world has been entered and no *navigation* input (wheel,
 * touch, drag, arrow keys) has arrived for {@link IDLE_MS}. On a mouse it
 * trails the cursor and reads "Scroll to explore"; on touch it sits centred and
 * reads "Swipe up / down". Plain mouse movement only repositions the hint — it
 * does not count as navigating, so a visitor who merely looks around still gets
 * the cue. Any real navigation hides it and restarts the idle countdown.
 */
const ScrollHint = () => {
  const enteredWorld = useNavStore((state) => state.enteredWorld);
  const { isModalOpen } = useModalStore();
  const [isVisible, setIsVisible] = useState(false);
  const [coarse] = useState(isCoarsePointer);
  const hintRef = useRef(null);

  useEffect(() => {
    if (!enteredWorld) return undefined;

    let idleTimer;

    // Restart the idle countdown and hide the hint: a real navigation happened.
    const resetIdle = () => {
      setIsVisible(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsVisible(true), IDLE_MS);
    };

    // Pointer movement is not navigation; just trail the cursor.
    const handlePointerMove = (event) => {
      if (hintRef.current) {
        hintRef.current.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
      }
    };

    window.addEventListener("wheel", resetIdle, { passive: true });
    window.addEventListener("touchstart", resetIdle, { passive: true });
    window.addEventListener("touchmove", resetIdle, { passive: true });
    window.addEventListener("mousedown", resetIdle);
    window.addEventListener("keydown", resetIdle);
    window.addEventListener("mousemove", handlePointerMove);

    resetIdle();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("wheel", resetIdle);
      window.removeEventListener("touchstart", resetIdle);
      window.removeEventListener("touchmove", resetIdle);
      window.removeEventListener("mousedown", resetIdle);
      window.removeEventListener("keydown", resetIdle);
      window.removeEventListener("mousemove", handlePointerMove);
    };
  }, [enteredWorld]);

  const shown = isVisible && enteredWorld && !isModalOpen;

  return (
    <div
      ref={hintRef}
      className={`scroll-hint ${coarse ? "scroll-hint--centered" : ""} ${
        shown ? "scroll-hint--visible" : ""
      }`}
      aria-hidden="true"
    >
      <span className="scroll-hint-arrow">{coarse ? "↕" : "🖱️"}</span>
      <span>
        {coarse ? "Swipe up / down to climb" : "Scroll to climb the house"}
      </span>
    </div>
  );
};

export default ScrollHint;
