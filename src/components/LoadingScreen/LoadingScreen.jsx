import { useState, useEffect } from "react";

import "./LoadingScreen.scss";

import { useProgress } from "@react-three/drei";

import Button from "../Button/Button";

import { playSound, playBackgroundMusic } from "../../utils/audioSystem";
import { useAudioStore } from "../../Experience/stores/audioStore";
import { useNavStore } from "../../Experience/stores/navStore";

/**
 * Full-screen intro shown while the 3D assets load, gating entry to the scene.
 *
 * Reveal logic: the "Enter World" button must not be gated on
 * `progress === 100`. drei's loading manager can settle just below an exact 100
 * when KTX2/Draco transcoding runs in worker loaders, leaving the bar stuck
 * (observed around 80%). Instead we treat loading as complete once it has
 * actually started and then gone idle (`active` returns to false), or once
 * progress genuinely reaches 100 — whichever comes first.
 */
const LoadingScreen = () => {
  const { active, progress } = useProgress();
  const [isRevealed, setIsRevealed] = useState(false);
  const [isAnimationFinished, setIsAnimationFinished] = useState(false);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const { setIsAudioEnabled } = useAudioStore();
  const setEnteredWorld = useNavStore((state) => state.setEnteredWorld);

  // Record that asset loading has begun, so an idle manager at startup (before
  // any loader registers) is not mistaken for "finished loading".
  useEffect(() => {
    if (active) setHasStartedLoading(true);
  }, [active]);

  const isLoaded = progress >= 100 || (hasStartedLoading && !active);

  const handleReveal = () => {
    setIsAudioEnabled(true);
    setIsRevealed(true);
    setEnteredWorld();
    playBackgroundMusic();
    playSound("buttonClick");
  };

  const handleAnimationFinished = () => {
    setIsAnimationFinished(true);
  };

  if (isAnimationFinished) {
    return null;
  }

  return (
    <>
      <div className="loading-screen">
        <div
          className={`background-top-half ${isRevealed ? "revealed" : ""}`}
          onTransitionEnd={handleAnimationFinished}
        ></div>
        <div
          className={`background-bottom-half ${isRevealed ? "revealed" : ""}`}
        ></div>
        <div className="loading-screen-info-container">
          <div
            className={`intro-message-container ${
              isRevealed ? "revealed" : ""
            }`}
          >
            hi, i&apos;m anu :D thanks for stopping by!! ✨
          </div>
          <div
            className={`instructions-container ${isRevealed ? "revealed" : ""}`}
          >
            🎮 WASD to move · drag to look · explore the world~ ✨
          </div>
          {!isLoaded ? (
            <div className="loading-bar-container">
              <div
                className="loading-bar"
                style={{ width: `${progress}%` }}
              ></div>
              <div className="percentage">{Math.round(progress)}%</div>
            </div>
          ) : !isRevealed ? (
            <Button onClick={handleReveal}>
              &nbsp; &nbsp; &nbsp; Enter World &nbsp; &nbsp; &nbsp;
            </Button>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
