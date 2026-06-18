import { useState } from "react";

import "./CharacterCustomizer.scss";
import { useCharacterStore } from "../../Experience/stores/characterStore";
import { playSound } from "../../utils/audioSystem";

// Minecraft-palette swatch colors for each body zone.
const PALETTE = [
  "#c8a07a", "#e0ac69", "#f1c27d", "#ffdbac", // skin tones
  "#6b4226", "#3b2014", "#1a0e07", "#f5f5dc", // browns & cream
  "#00a8a8", "#2d89ef", "#3b3b9a", "#7b2ff7", // blues & purples
  "#da3b01", "#ff6f3c", "#ffd700", "#ffe16b", // reds & yellows
  "#388e3c", "#81c784", "#e0e0e0", "#4c4c4c", // greens & grays
  "#ff69b4", "#ffffff", "#1a1a1a", "#000000", // pinks, white, blacks
];

// Pixel-art style character preview rendered as pure CSS boxes (no 3D canvas
// inside the modal — keeps it lightweight).
function CharacterPreview({ headColor, bodyColor, legColor }) {
  return (
    <div className="char-preview">
      {/* Head */}
      <div className="char-head" style={{ backgroundColor: headColor }}>
        <div className="char-eye char-eye--l" />
        <div className="char-eye char-eye--r" />
        <div className="char-mouth" />
      </div>
      {/* Body + arms */}
      <div className="char-torso-row">
        <div className="char-arm" style={{ backgroundColor: bodyColor }} />
        <div className="char-body" style={{ backgroundColor: bodyColor }} />
        <div className="char-arm" style={{ backgroundColor: bodyColor }} />
      </div>
      {/* Legs */}
      <div className="char-legs-row">
        <div className="char-leg" style={{ backgroundColor: legColor }} />
        <div className="char-leg" style={{ backgroundColor: legColor }} />
      </div>
    </div>
  );
}

function SwatchPicker({ label, value, onChange }) {
  return (
    <div className="swatch-group">
      <label className="swatch-label">{label}</label>
      <div className="swatch-grid">
        {PALETTE.map((c) => (
          <button
            key={c}
            className={`swatch ${c === value ? "swatch--active" : ""}`}
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            aria-label={`Select color ${c}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function CharacterCustomizer({ onDone }) {
  const store = useCharacterStore();

  const [username, setUsername] = useState(store.username);
  const [headColor, setHeadColor] = useState(store.headColor);
  const [bodyColor, setBodyColor] = useState(store.bodyColor);
  const [legColor, setLegColor] = useState(store.legColor);

  const handleSave = () => {
    store.setCharacter({ username, headColor, bodyColor, legColor });
    playSound("buttonClick");
    if (onDone) onDone();
  };

  return (
    <div className="customizer">
      <div className="customizer-layout">
        {/* Left: live preview */}
        <div className="customizer-preview">
          <CharacterPreview
            headColor={headColor}
            bodyColor={bodyColor}
            legColor={legColor}
          />
          {username && <div className="preview-name">{username}</div>}
        </div>

        {/* Right: controls */}
        <div className="customizer-controls">
          <div className="name-group">
            <label className="swatch-label" htmlFor="mc-username">
              username
            </label>
            <input
              id="mc-username"
              className="name-input"
              type="text"
              maxLength={16}
              placeholder="steve"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <SwatchPicker
            label="head"
            value={headColor}
            onChange={setHeadColor}
          />
          <SwatchPicker
            label="body"
            value={bodyColor}
            onChange={setBodyColor}
          />
          <SwatchPicker
            label="legs"
            value={legColor}
            onChange={setLegColor}
          />

          <button className="save-btn" onClick={handleSave}>
            save &amp; play
          </button>
        </div>
      </div>
    </div>
  );
}
