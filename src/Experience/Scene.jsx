import { Suspense, useCallback, useRef } from "react";

import { Environment } from "@react-three/drei";

import House from "./models/HouseT";
import AttractionMarker from "./park/AttractionMarker";
import { ATTRACTIONS } from "./park/attractions";
import BackGrass from "./models/BackGrassT";
import Detail from "./models/DetailT";
import FrontGrass from "./models/FrontGrassT";
import GrassSides from "./models/GrassSidesT";
import Pool from "./models/Pool";
import StairRamp from "./models/StairRamp";
import Mobs from "./models/MobsT";
import Player from "./Player";
import GateSign from "./GateSign";
import Terminal3D from "./Terminal3D";
import AmbientLife from "./AmbientLife";
import RemotePlayers from "./RemotePlayers";
import { useMultiplayer } from "./stores/useMultiplayer";

// The world is static, baked geometry. It used to be toured by a scripted
// camera that scrolling slid along a spline; that path (and its rotation
// keyframes and per-view dolly) is gone. The camera is now driven by the
// character controller in Player.jsx, so Scene just composes the world.

// Night palette (LOR-2423): sky and fog share one colour so far terrain fades
// seamlessly into the sky — the two are revised together (recon risk #5).
// Near/far suit the current ~90-unit lawn; retune with the park island.
const NIGHT_SKY = "#0d1330";
const NIGHT_FOG_NEAR = 26;
const NIGHT_FOG_FAR = 92;

const Scene = () => {

  // Multiplayer presence — opens the relay socket and returns the throttled
  // state broadcaster the Player feeds. Runs solo when no host is configured.
  const { sendState } = useMultiplayer();

  // The character raycasts straight down against this list to find the ground.
  // The house shell and the three terrain GLBs register here as they mount; the
  // mobs, ambient props, and content panels are deliberately excluded so the
  // character can never "stand on" a cow or a picture frame.
  const colliders = useRef([]);
  const registerCollider = useCallback((object) => {
    if (object && !colliders.current.includes(object)) {
      colliders.current.push(object);
    }
  }, []);

  return (
    <>
      <Environment
        // Lighting only: the flat night colour below owns the background. The
        // cubemap's day faces stay as image-based lighting until the night
        // cubemap lands, at which point `background` can flip back on.
        background={false}
        files={[
          "/cubemap/px.webp",
          "/cubemap/nx.webp",
          "/cubemap/py.webp",
          "/cubemap/ny.webp",
          "/cubemap/pz.webp",
          "/cubemap/nz.webp",
        ]}
      />
      {/* Night theme (LOR-2423): a flat night sky and fog that fades terrain
          into the same colour before the world edge. The two read as one
          decision — see the palette note above. */}
      <color attach="background" args={[NIGHT_SKY]} />
      <fog attach="fog" args={[NIGHT_SKY, NIGHT_FOG_NEAR, NIGHT_FOG_FAR]} />
      {/* A single Suspense made the whole scene wait for the slowest GLB;
          separate boundaries let each model appear as its own file arrives, so
          the house and its interior show long before the outdoor scenery
          streams in. SceneSky used to ride with the house here, baking the day
          panorama into the windows — dropped with the night theme (a day sky
          fights it); a night cubemap restores the background when the assets
          task lands. */}
      <Suspense fallback={null}>
        <group ref={registerCollider}>
          <House />
        </group>
        <Detail />
        <Terminal3D />
        <AmbientLife />
      </Suspense>
      <Suspense fallback={null}>
        <GateSign />
      </Suspense>
      <Suspense fallback={null}>
        <group ref={registerCollider}>
          <BackGrass />
        </group>
      </Suspense>
      <Suspense fallback={null}>
        <group ref={registerCollider}>
          <FrontGrass />
        </group>
      </Suspense>
      <Suspense fallback={null}>
        <group ref={registerCollider}>
          <GrassSides />
        </group>
      </Suspense>
      {/* The plaza swimming pool is built from primitives and registers as a
          collider so the character walks on its water and low deck. */}
      <group ref={registerCollider}>
        <Pool />
      </group>
      {/* Invisible ramp bridging the middle -> top staircase flight so the
          character does not fall through the gap between its treads. */}
      <group ref={registerCollider}>
        <StairRamp />
      </group>
      <Suspense fallback={null}>
        <Mobs />
      </Suspense>
      {/* Attraction markers: placeholder low-poly props at the manifest
          positions, registered for walk-up interaction (E) with click/tap as
          the pointer path. Selecting one starts the balloon-cam flight. */}
      {ATTRACTIONS.map((attraction) => (
        <AttractionMarker
          key={attraction.id}
          attraction={attraction}
          colliders={colliders}
        />
      ))}
      {/* The controllable character. It owns the camera each frame and raycasts
          against the registered colliders to follow the ground. */}
      <Suspense fallback={null}>
        <Player colliders={colliders} sendState={sendState} />
      </Suspense>
      {/* Other visitors currently connected to the same world. */}
      <Suspense fallback={null}>
        <RemotePlayers />
      </Suspense>
    </>
  );
};

export default Scene;
