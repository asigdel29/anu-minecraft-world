import "./NavButton.scss";

import { playSound } from "../../utils/audioSystem";
import { useModalStore } from "../../Experience/stores/modalStore";
import { useNavStore } from "../../Experience/stores/navStore";

/**
 * On-screen "next" control for one-tap navigation through the scene.
 *
 * Touch scrolling advances the camera far more slowly than a mouse wheel, so on
 * small screens visitors can tap this to jump straight to the next viewpoint
 * (handled by {@link Experience} via {@link useNavStore}). Hidden on wide
 * screens (where the wheel is fast enough) and whenever a modal is open. See
 * NavButton.scss for the breakpoint.
 */
const NavButton = () => {
  const { isModalOpen } = useModalStore();
  const advance = useNavStore((state) => state.advance);

  if (isModalOpen) return null;

  return (
    <button
      className="nav-next-button"
      aria-label="Move to the next view"
      onClick={() => {
        playSound("buttonClick");
        advance();
      }}
    >
      <span className="nav-next-label">Next</span>
      <span className="nav-next-arrow">▸</span>
    </button>
  );
};

export default NavButton;
