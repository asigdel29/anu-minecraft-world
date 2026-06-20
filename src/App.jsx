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
import OrientationHint from "./components/OrientationHint/OrientationHint";
import CustomizeButton from "./components/CustomizeButton/CustomizeButton";
import ShareButton from "./components/ShareButton/ShareButton";
import ChatOverlay from "./components/Chat/ChatOverlay";
import TourControls from "./components/TourControls/TourControls";
import CharacterCustomizer from "./components/CharacterCustomizer/CharacterCustomizer";
import Welcome from "./components/Welcome/Welcome";
import { useCharacterStore } from "./Experience/stores/characterStore";
import { useModalStore } from "./Experience/stores/modalStore";
import { useOnboardingStore } from "./Experience/stores/onboardingStore";
import { useTourStore } from "./Experience/stores/tourStore";

// The 3D experience pulls in three.js and React Three Fiber (the bulk of the
// bundle). Loading it lazily lets the lightweight DOM overlay — including the
// loading screen — paint first while that chunk downloads in parallel.
const Experience = lazy(() => import("./Experience/Experience"));

function App() {
  const hasCustomized = useCharacterStore((s) => s.hasCustomized);
  const hasSeenWelcome = useOnboardingStore((s) => s.hasSeenWelcome);
  const startTour = useTourStore((s) => s.startTour);
  const openModal = useModalStore((s) => s.openModal);
  const closeModal = useModalStore((s) => s.closeModal);
  const didAutoOpen = useRef(false);
  const didWelcome = useRef(false);

  // Open the character customizer once on a first visit, after a short delay so
  // the loading screen paints first.
  useEffect(() => {
    if (hasCustomized || didAutoOpen.current) return undefined;
    didAutoOpen.current = true;
    const t = setTimeout(() => {
      openModal(
        "Create Your Character",
        <CharacterCustomizer onDone={closeModal} />,
        "customizer"
      );
    }, 800);
    return () => clearTimeout(t);
  }, [hasCustomized, openModal, closeModal]);

  // Once a character exists (right after creating one, or on a later visit that
  // predates this feature), greet a first-time visitor and offer the tour. It
  // is shown only once — the onboarding store persists that it has been seen.
  useEffect(() => {
    if (!hasCustomized || hasSeenWelcome || didWelcome.current) return undefined;
    didWelcome.current = true;
    const t = setTimeout(() => {
      openModal(
        "Welcome",
        <Welcome
          onClose={closeModal}
          onStartTour={startTour}
        />,
        "welcome"
      );
    }, 400);
    return () => clearTimeout(t);
  }, [hasCustomized, hasSeenWelcome, startTour, openModal, closeModal]);

  return (
    <>
      <LoadingScreen />
      <ShareButton />
      <CustomizeButton />
      <AudioToggleButton />
      <InfoButton />
      <ControlsHint />
      <InteractPrompt />
      <TourControls />
      <TouchControls />
      <OrientationHint />
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
