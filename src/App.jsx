import "./App.scss";
import { lazy, Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

import Modal from "./components/Modal/Modal";
import AudioToggleButton from "./components/AudioToggleButton/AudioToggleButton";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import InfoButton from "./components/InfoButton/InfoButton";
import ScrollHint from "./components/ScrollHint/ScrollHint";

// The 3D experience pulls in three.js and React Three Fiber (the bulk of the
// bundle). Loading it lazily lets the lightweight DOM overlay — including the
// loading screen — paint first while that chunk downloads in parallel.
const Experience = lazy(() => import("./Experience/Experience"));

function App() {
  return (
    <>
      <LoadingScreen />
      <AudioToggleButton />
      <InfoButton />
      <ScrollHint />
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
