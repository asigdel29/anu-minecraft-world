import { Suspense, useRef } from "react";

import { Environment } from "@react-three/drei";

import House from "./models/HouseT";
import SceneSky from "./SceneSky";
import BackGrass from "./models/BackGrassT";
import Detail from "./models/DetailT";
import FrontGrass from "./models/FrontGrassT";
import GrassSides from "./models/GrassSidesT";
import Mobs from "./models/MobsT";
import Player from "./Player";
import GateSign from "./GateSign";
import Terminal3D from "./Terminal3D";
import AmbientLife from "./AmbientLife";

// The world is static, baked geometry. It used to be toured by a scripted
// camera that scrolling slid along a spline; that path (and its rotation
// keyframes and per-view dolly) is gone. The camera is now driven by the
// character controller in Player.jsx, so Scene just composes the world.
const Scene = () => {
  const houseRef = useRef();

  return (
    <>
      <Environment
        background={true}
        backgroundRotation={[0, Math.PI / 2, 0]}
        files={[
          "/cubemap/px.webp",
          "/cubemap/nx.webp",
          "/cubemap/py.webp",
          "/cubemap/ny.webp",
          "/cubemap/pz.webp",
          "/cubemap/nz.webp",
        ]}
      />
      {/* The ten GLBs total ~54 MB. A single Suspense made the whole scene wait
          for the slowest one; separate boundaries let each model appear as its
          own file arrives, so the house and its interior show long before the
          outdoor scenery finishes streaming. The sky capture still waits for the
          full load (it is gated on useProgress in SceneSky), so the world behind
          the windows is unaffected. House + sky stay paired so the capture sees
          the shell it hides for that one frame. */}
      <Suspense fallback={null}>
        {/* Detail (the framed content panels) lives inside the houseRef group so
            it is hidden alongside the house during the one-frame SceneSky
            capture — otherwise the far top-floor panels get baked into the
            background sky. */}
        <group ref={houseRef}>
          <House />
          <Detail />
          <Terminal3D />
          <AmbientLife />
        </group>
        <SceneSky houseRef={houseRef} />
      </Suspense>
      <Suspense fallback={null}>
        <GateSign />
      </Suspense>
      <Suspense fallback={null}>
        <BackGrass />
      </Suspense>
      <Suspense fallback={null}>
        <FrontGrass />
      </Suspense>
      <Suspense fallback={null}>
        <GrassSides />
      </Suspense>
      <Suspense fallback={null}>
        <Mobs />
      </Suspense>
      {/* The controllable character. It owns the camera each frame. */}
      <Suspense fallback={null}>
        <Player />
      </Suspense>
    </>
  );
};

export default Scene;
