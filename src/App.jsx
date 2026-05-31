import "./App.scss";
import { lazy, Suspense } from "react";

import Modal from "./components/Modal/Modal";
import AudioToggleButton from "./components/AudioToggleButton/AudioToggleButton";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import InfoButton from "./components/InfoButton/InfoButton";

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
      <Modal />
      <Suspense fallback={null}>
        <Experience />
      </Suspense>
    </>
  );
}

export default App;
