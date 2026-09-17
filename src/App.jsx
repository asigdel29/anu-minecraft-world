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
import ParkPageOverlay from "./components/ParkPageOverlay/ParkPageOverlay";
import { resolveRoute, routeForId } from "./Experience/park/parkRoutes";
import { useParkNav } from "./Experience/park/parkStore";
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
  const didMount = useRef(false);
  const bootedFromUrl = useRef(false);
  const parkMode = useParkNav((s) => s.mode);
  const parkAttractionId = useParkNav((s) => s.attractionId);

  // Minimal history routing (LOR-2423): a deep link to an attraction slug
  // ("/arcade") boots straight into that attraction's page — no flight;
  // everything else is roam mode. Thereafter the URL mirrors the store:
  // opening a page pushes its slug, leaving it pushes "/", and popstate
  // re-syncs the store so Back/Forward navigate the park too. App is the URL's
  // single writer; the pure path↔attraction mapping lives in parkRoutes.js.
  useEffect(() => {
    if (bootedFromUrl.current) return undefined;
    bootedFromUrl.current = true;
    const deepLinkId = resolveRoute(window.location.pathname);
    if (!deepLinkId) return undefined;
    const nav = useParkNav.getState();
    nav.enter(deepLinkId);
    nav.arrived();
    return undefined;
  }, []);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return undefined;
    }
    const { pathname } = window.location;
    if (parkMode === "page" && parkAttractionId) {
      const route = routeForId(parkAttractionId);
      if (route && pathname !== route) window.history.pushState(null, "", route);
    } else if (pathname !== "/") {
      window.history.pushState(null, "", "/");
    }
    return undefined;
  }, [parkMode, parkAttractionId]);

  useEffect(() => {
    const onPop = () => {
      const nav = useParkNav.getState();
      const deepLinkId = resolveRoute(window.location.pathname);
      if (deepLinkId) {
        if (nav.mode !== "page" || nav.attractionId !== deepLinkId) {
          nav.enter(deepLinkId);
          nav.arrived();
        }
      } else if (nav.mode !== "park") {
        nav.exit();
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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
      {parkMode === "page" && <ParkPageOverlay />}
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
