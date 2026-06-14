import "./InteractPrompt.scss";

import { useInteractionStore } from "../../Experience/stores/interactionStore";
import { useModalStore } from "../../Experience/stores/modalStore";

/**
 * Walk-up interaction cue. When the character is in range of a content panel or
 * the guestbook terminal, the controller publishes that target to the
 * interaction store and this pinned prompt invites the visitor to press E. It
 * is hidden while a modal is open (there is nothing to walk up to) and never
 * blocks the scene (pointer-events disabled).
 */
const InteractPrompt = () => {
  const prompt = useInteractionStore((state) => state.prompt);
  const { isModalOpen } = useModalStore();
  const shown = Boolean(prompt) && !isModalOpen;

  return (
    <div
      className={`interact-prompt ${
        shown ? "interact-prompt--visible" : ""
      }`}
      aria-hidden="true"
    >
      <span className="interact-prompt-key">E</span>
      <span>{prompt ? `View ${prompt.title}` : ""}</span>
    </div>
  );
};

export default InteractPrompt;
