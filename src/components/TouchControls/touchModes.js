// Pure mapping from the park-nav mode to which touch controls show. Kept
// three.js/DOM-free so the swap logic is unit-testable — TouchControls.jsx
// stays a thin renderer over this decision, the same split the park modules
// use.
//
// - roam   — walking the park: joystick + run/jump/interact cluster
// - flight — the balloon-cam owns movement and the camera; movement input is
//            paused (the controller ignores input in flying/page exactly as it
//            does for keyboard), and the cluster swaps for a single control
//            that cancels the flight — the touch twin of the Escape key
// - hidden — an attraction page is open; the page shell owns the screen and
//            its own back control, so a second exit would double-fire

export const CONTROLS_ROAM = "roam";
export const CONTROLS_FLIGHT = "flight";
export const CONTROLS_HIDDEN = "hidden";

export const controlsForParkMode = (mode) => {
  if (mode === "flying") return CONTROLS_FLIGHT;
  if (mode === "page") return CONTROLS_HIDDEN;
  return CONTROLS_ROAM;
};
