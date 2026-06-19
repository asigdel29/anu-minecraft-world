import { useEffect, useState } from "react";

import "./OrientationHint.scss";
import {
  isCoarsePointer,
  isPortraitViewport,
  shouldPromptRotate,
} from "../../Experience/controls/orientation";

/**
 * On a touch device held in portrait, overlays a prompt to rotate to landscape —
 * the posture the on-screen controls are tuned for. It tracks orientation
 * changes and hides itself the moment the device turns landscape. Never shown on
 * a mouse, so desktop is unaffected.
 */
export default function OrientationHint() {
  const [coarse] = useState(isCoarsePointer);
  const [portrait, setPortrait] = useState(isPortraitViewport);

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

  if (!shouldPromptRotate(coarse, portrait)) return null;

  return (
    <div className="orientation-hint" role="dialog" aria-label="Rotate your device">
      <div className="orientation-hint-card">
        <div className="orientation-hint-icon" aria-hidden="true">
          ⟳
        </div>
        <p>Rotate your device to landscape to explore the world.</p>
      </div>
    </div>
  );
}
