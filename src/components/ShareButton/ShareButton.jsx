import "./ShareButton.scss";
import { playSound } from "../../utils/audioSystem";

const SHARE_TEXT = "come explore anu's minecraft world with me! 🏠";
const SHARE_URL = "https://sigdel.world";

export default function ShareButton() {
  const handleShare = async () => {
    playSound("buttonClick");

    if (navigator.share) {
      try {
        await navigator.share({
          title: "anu's minecraft world",
          text: SHARE_TEXT,
          url: SHARE_URL,
        });
      } catch {
        // User cancelled the share sheet — no-op.
      }
    } else {
      // Fallback: copy URL to clipboard.
      try {
        await navigator.clipboard.writeText(SHARE_URL);
        // Brief visual feedback could be added via a toast, but for now
        // the button hover state change is enough.
      } catch {
        // Clipboard access denied — no-op.
      }
    }
  };

  return (
    <button
      className="share-button"
      onClick={handleShare}
      aria-label="Share this world"
      title="Share"
    >
      {/* Pixel-art share / link icon */}
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top-right arrow */}
        <rect x="8" y="0" width="6" height="2" />
        <rect x="12" y="2" width="2" height="4" />
        <rect x="10" y="2" width="2" height="2" />
        <rect x="8" y="4" width="2" height="2" />
        <rect x="6" y="6" width="2" height="2" />
        {/* Box outline */}
        <rect x="0" y="4" width="2" height="10" />
        <rect x="2" y="12" width="10" height="2" />
        <rect x="10" y="8" width="2" height="4" />
        <rect x="2" y="4" width="4" height="2" />
      </svg>
    </button>
  );
}
