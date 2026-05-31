import "./InfoButton.scss";

import { playSound } from "../../utils/audioSystem";
import { useModalStore } from "../../Experience/stores/modalStore";

import Info from "../Info/Info";

const InfoButton = () => {
  const { openModal } = useModalStore();

  return (
    <>
      <button
        onClick={() => {
          playSound("buttonClick");
          openModal("Information", <Info />, "info");
        }}
        className="info-toggle-button"
      >
        <svg
          width="11"
          height="16"
          viewBox="0 0 11 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect y="2.19998" width="2.2" height="2.2" fill="#currentColor" />
          <rect x="2.19995" width="2.2" height="2.2" fill="#currentColor" />
          <rect x="4.3999" width="2.2" height="2.2" fill="#currentColor" />
          <rect x="6.6001" width="2.2" height="2.2" fill="#currentColor" />
          <rect
            x="8.80005"
            y="2.19998"
            width="2.2"
            height="2.2"
            fill="#currentColor"
          />
          <rect
            x="8.80005"
            y="4.39999"
            width="2.2"
            height="2.2"
            fill="#currentColor"
          />
          <rect
            x="6.6001"
            y="6.60001"
            width="2.2"
            height="2.2"
            fill="#currentColor"
          />
          <rect
            x="4.3999"
            y="8.80002"
            width="2.2"
            height="2.2"
            fill="#currentColor"
          />
          <rect
            x="4.3999"
            y="13.2"
            width="2.2"
            height="2.2"
            fill="#currentColor"
          />
        </svg>
      </button>
    </>
  );
};

export default InfoButton;
