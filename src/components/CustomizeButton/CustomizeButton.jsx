import "./CustomizeButton.scss";

import { playSound } from "../../utils/audioSystem";
import { useModalStore } from "../../Experience/stores/modalStore";
import CharacterCustomizer from "../CharacterCustomizer/CharacterCustomizer";

const CustomizeButton = () => {
  const { openModal, closeModal } = useModalStore();

  const open = () => {
    playSound("buttonClick");
    openModal(
      "Customize Character",
      <CharacterCustomizer onDone={closeModal} />,
      "customizer"
    );
  };

  return (
    <button onClick={open} className="customize-button" aria-label="Customize character">
      {/* Pixel-art character silhouette icon */}
      <svg
        width="16"
        height="18"
        viewBox="0 0 16 18"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head */}
        <rect x="4" y="0" width="8" height="6" />
        {/* Body */}
        <rect x="4" y="6" width="8" height="6" />
        {/* Left arm */}
        <rect x="0" y="6" width="4" height="6" />
        {/* Right arm */}
        <rect x="12" y="6" width="4" height="6" />
        {/* Left leg */}
        <rect x="4" y="12" width="4" height="6" />
        {/* Right leg */}
        <rect x="8" y="12" width="4" height="6" />
      </svg>
    </button>
  );
};

export default CustomizeButton;
