import { useState, useEffect, useRef, useCallback } from "react";

import "./ChatOverlay.scss";
import { useMultiplayerStore } from "../../Experience/stores/useMultiplayer";
import { useCharacterStore } from "../../Experience/stores/characterStore";
import { useModalStore } from "../../Experience/stores/modalStore";

// How long a message stays visible before fading.
const FADE_AFTER = 8000; // ms

export default function ChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const activityLog = useMultiplayerStore((s) => s.activityLog);
  const username = useCharacterStore((s) => s.username);
  const isModalOpen = useModalStore((s) => s.isModalOpen);

  // Open the chat input on T press (when no modal is open and input isn't focused).
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isModalOpen) return;
      if (e.code === "KeyT" && !isOpen && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.code === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, isModalOpen]);

  // Focus the input when it opens.
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [activityLog]);

  // Use the store's sendChat which accesses the module-level WebSocket.
  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    useMultiplayerStore.getState().sendChat(username || "anon", text);
    setDraft("");
    setIsOpen(false);
  }, [draft, username]);

  // Show the last 5 messages.
  const now = Date.now();
  const visible = activityLog.filter((m) => now - m.ts < FADE_AFTER).slice(-5);

  return (
    <div className="chat-overlay" id="chat-overlay">
      {/* Message log */}
      <div className="chat-messages" ref={logRef}>
        {visible.map((msg, i) => (
          <div
            key={`${msg.ts}-${i}`}
            className={`chat-msg chat-msg--${msg.type}`}
            style={{ opacity: Math.max(0.3, 1 - (now - msg.ts) / FADE_AFTER) }}
          >
            {msg.type === "join" && <span className="chat-icon">→ </span>}
            {msg.type === "leave" && <span className="chat-icon">← </span>}
            {msg.text}
          </div>
        ))}
      </div>

      {/* Chat input */}
      {isOpen && (
        <div className="chat-input-row">
          <input
            ref={inputRef}
            className="chat-input"
            type="text"
            maxLength={120}
            placeholder="say something..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Stop propagation so WASD/Space don't move the character.
              e.stopPropagation();
              if (e.code === "Enter") handleSend();
              if (e.code === "Escape") setIsOpen(false);
            }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      )}

      {/* Mobile chat open button */}
      {!isOpen && (
        <button
          className="chat-open-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>
      )}
    </div>
  );
}
