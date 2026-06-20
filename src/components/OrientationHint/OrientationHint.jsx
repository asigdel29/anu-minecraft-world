import { useEffect, useState } from "react";

import "./OrientationHint.scss";
import {
  isCoarsePointer,
  isPortraitViewport,
  shouldPromptRotate,
} from "../../Experience/controls/orientation";

// Persisted flag so the landscape advisory is shown at most once, ever.
const STORAGE_KEY = "mc-landscape-warned";

const loadWarned = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const persistWarned = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // Storage full or blocked — silently skip.
  }
};

/**
 * One-time landscape advisory for touch devices. The world is playable in any
 * orientation, so this no longer blocks: on a coarse pointer held in portrait it
 * shows a small, dismissible banner suggesting landscape, then never appears
 * again once dismissed (persisted in localStorage). Never shown on a mouse.
 */
export default function OrientationHint() {
  const [coarse] = useState(isCoarsePointer);
  const [portrait, setPortrait] = useState(isPortraitViewport);
  const [dismissed, setDismissed] = useState(loadWarned);

  useEffect(() => {
    if (!coarse) return undefined;
    const update = () => setPortrait(isPortraitViewport());
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, [coarse]);

  const dismiss = () => {
    persistWarned();
    setDismissed(true);
  };

  if (dismissed || !shouldPromptRotate(coarse, portrait)) return null;

  return (
    <div className="orientation-hint" role="status" aria-label="Landscape advisory">
      <div className="orientation-hint-card">
        <span className="orientation-hint-icon" aria-hidden="true">
          ⟳
        </span>
        <p>This world plays best in landscape.</p>
        <button
          type="button"
          className="orientation-hint-dismiss"
          onClick={dismiss}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
