import "./App.scss";
import { lazy, Suspense, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Modal from "./components/Modal/Modal";
import AudioToggleButton from "./components/AudioToggleButton/AudioToggleButton";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import InfoButton from "./components/InfoButton/InfoButton";
import ControlsHint from "./components/ControlsHint/ControlsHint";
import InteractPrompt from "./components/InteractPrompt/InteractPrompt";
import TouchControls from "./components/TouchControls/TouchControls";
import BattleshipHud from "./components/BattleshipHud/BattleshipHud";
import { useBattleshipStore } from "./Experience/battleship/battleshipStore";

// The 3D experience pulls in three.js and React Three Fiber (the bulk of the
// bundle). Loading it lazily lets the lightweight DOM overlay — including the
// loading screen — paint first while that chunk downloads in parallel.
const Experience = lazy(() => import("./Experience/Experience"));

function App() {
  // A Battleship invite link (?bsjoin=<id>) joins that game as seat 1 directly,
  // engaging the in-world board for the second player.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("bsjoin");
    if (!id) return;
    void useBattleshipStore.getState().joinGame(id);
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  return (
    <>
      <LoadingScreen />
      <AudioToggleButton />
      <InfoButton />
      <ControlsHint />
      <InteractPrompt />
      <TouchControls />
      <BattleshipHud />
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
