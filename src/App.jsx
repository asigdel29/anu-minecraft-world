import "./App.scss";
import { lazy, Suspense, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Modal from "./components/Modal/Modal";
import AudioToggleButton from "./components/AudioToggleButton/AudioToggleButton";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import InfoButton from "./components/InfoButton/InfoButton";
import ControlsHint from "./components/ControlsHint/ControlsHint";
import InteractPrompt from "./components/InteractPrompt/InteractPrompt";
import TouchControls from "./components/TouchControls/TouchControls";
import CustomizeButton from "./components/CustomizeButton/CustomizeButton";
import ChatOverlay from "./components/Chat/ChatOverlay";
import ShareButton from "./components/ShareButton/ShareButton";
import CharacterCustomizer from "./components/CharacterCustomizer/CharacterCustomizer";
import { useCharacterStore } from "./Experience/stores/characterStore";
import { useModalStore } from "./Experience/stores/modalStore";

// The 3D experience pulls in three.js and React Three Fiber (the bulk of the
// bundle). Loading it lazily lets the lightweight DOM overlay — including the
// loading screen — paint first while that chunk downloads in parallel.
const Experience = lazy(() => import("./Experience/Experience"));

function App() {
  const hasCustomized = useCharacterStore((s) => s.hasCustomized);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const didAutoOpen = useRef(false);

  // Auto-open the character customizer on first visit.
  useEffect(() => {
    if (!hasCustomized && !didAutoOpen.current) {
      didAutoOpen.current = true;
      // Small delay so the loading screen has time to render first.
      const t = setTimeout(() => {
        openModal(
          "Create Your Character",
          <CharacterCustomizer onDone={closeModal} />,
          "customizer"
        );
      }, 800);
      return () => clearTimeout(t);
    }
  }, [hasCustomized, openModal, closeModal]);

  return (
    <>
      <LoadingScreen />
      <ShareButton />
      <CustomizeButton />
      <AudioToggleButton />
      <InfoButton />
      <ControlsHint />
      <InteractPrompt />
      <TouchControls />
      <ChatOverlay />
      <Modal />
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
      {/* Vercel Web Analytics + Core Web Vitals; served same-origin from
          /_vercel, active only on Vercel deployments. */}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
