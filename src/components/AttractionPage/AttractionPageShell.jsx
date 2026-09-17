import { useEffect, useRef } from "react";
import "./AttractionPage.scss";

/**
 * Shared layout for the seven attraction pages: plain typography on a dark
 * scrim. ESC and the back control return the visitor to the park; the
 * park-nav router (sibling change) supplies `onBack`. Focus moves to the
 * page heading on mount so keyboard and screen-reader visitors land on the
 * content.
 */
const AttractionPageShell = ({ title, tagline, onBack, children }) => {
  const headingRef = useRef(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!onBack) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  return (
    <div className="attraction-page">
      <article className="attraction-page-panel">
        <button type="button" className="attraction-page-back" onClick={onBack}>
          ← back to the park
        </button>
        <h1 ref={headingRef} tabIndex={-1} className="attraction-page-title">
          {title}
        </h1>
        {tagline ? <p className="attraction-page-tagline">{tagline}</p> : null}
        {children}
      </article>
    </div>
  );
};

export default AttractionPageShell;
