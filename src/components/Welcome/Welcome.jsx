import "./Welcome.scss";
import { useOnboardingStore } from "../../Experience/stores/onboardingStore";
import { playSound } from "../../utils/audioSystem";

/**
 * First-visit welcome popup. Greets a new visitor once and offers a guided tour
 * of the house. Either action marks the welcome as seen (so it never shows
 * again) and closes the modal; "Take the tour" additionally starts the tour.
 *
 * @param onClose closes the hosting modal.
 * @param onStartTour begins the guided house tour.
 */
export default function Welcome({ onClose, onStartTour }) {
  const markWelcomeSeen = useOnboardingStore((s) => s.markWelcomeSeen);

  const handleTour = () => {
    playSound("buttonClick");
    markWelcomeSeen();
    onClose();
    onStartTour();
  };

  const handleSkip = () => {
    playSound("buttonClick");
    markWelcomeSeen();
    onClose();
  };

  return (
    <div className="welcome">
      <h2 className="welcome-title">You&apos;re here for the first time!</h2>
      <p className="welcome-body">
        Welcome to the world. Take a quick guided tour of the house and its
        posters, or jump straight in and explore on your own.
      </p>
      <div className="welcome-actions">
        <button className="welcome-btn welcome-btn--primary" onClick={handleTour}>
          take the tour
        </button>
        <button className="welcome-btn" onClick={handleSkip}>
          skip
        </button>
      </div>
      <p className="welcome-hint">You can press Esc to leave the tour anytime.</p>
    </div>
  );
}
