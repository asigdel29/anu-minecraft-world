import { useState, useEffect } from "react";

import "./Modal.scss";

import { useModalStore } from "../../Experience/stores/modalStore";
import { playSound } from "../../utils/audioSystem";

const Modal = () => {
  const { isModalOpen, modalTitle, modalContent, closeModal } = useModalStore();
  const [isAnimating, setIsAnimating] = useState(false);
  const [cachedContent, setCachedContent] = useState(null);
  const [cachedTitle, setCachedTitle] = useState("");
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setIsAnimating(true);
      setCachedContent(modalContent);
      setCachedTitle(modalTitle);
      requestAnimationFrame(() => {
        setShouldAnimate(true);
      });
    } else {
      setShouldAnimate(false);
      const timer = setTimeout(() => {
        setCachedContent(null);
        setCachedTitle("");
        setIsAnimating(false);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isModalOpen, modalContent, modalTitle]);

  if (!isModalOpen && !isAnimating) return null;

  return (
    <>
      <div onClick={closeModal} className="overlay"></div>

      <div className={`modal ${shouldAnimate ? "modal-enter" : "modal-exit"}`}>
        <div className="modal-header">
          <div className="modal-header-wrapper">
            <h1 className="modal-title">{cachedTitle || modalTitle}</h1>
            <button
              onClick={() => {
                closeModal();
                playSound("buttonClick");
              }}
              className="modal-close-button"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 14 14"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="12.0002"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="12.0002"
                  y="11.9999"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="10"
                  y="2.00006"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="8"
                  y="3.99994"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="6"
                  y="6"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="8"
                  y="8"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="10"
                  y="10.0001"
                  width="1.99999"
                  height="1.99999"
                  fill="currentColor"
                />
                <rect
                  x="1.99976"
                  y="14"
                  width="1.99999"
                  height="1.99999"
                  transform="rotate(-180 1.99976 14)"
                  fill="currentColor"
                />
                <rect
                  x="1.99976"
                  y="2.00006"
                  width="1.99999"
                  height="1.99999"
                  transform="rotate(-180 1.99976 2.00006)"
                  fill="currentColor"
                />
                <rect
                  x="4"
                  y="11.9999"
                  width="1.99999"
                  height="1.99999"
                  transform="rotate(-180 4 11.9999)"
                  fill="currentColor"
                />
                <rect
                  x="6"
                  y="10.0001"
                  width="1.99999"
                  height="1.99999"
                  transform="rotate(-180 6 10.0001)"
                  fill="currentColor"
                />
                <rect
                  x="6"
                  y="6"
                  width="1.99999"
                  height="1.99999"
                  transform="rotate(-180 6 6)"
                  fill="currentColor"
                />
                <rect
                  x="4"
                  y="3.99994"
                  width="1.99999"
                  height="1.99999"
                  transform="rotate(-180 4 3.99994)"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="modal-body"> {cachedContent || modalContent}</div>
      </div>
    </>
  );
};

export default Modal;
