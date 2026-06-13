import { Suspense, useMemo, useRef } from "react";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import House from "./models/HouseT";
import SceneSky from "./SceneSky";
import BackGrass from "./models/BackGrassT";
import Detail from "./models/DetailT";
import Extras from "./models/ExtrasT";
import ExtrasTwo from "./models/ExtrasTwoT";
import ExtrasThree from "./models/ExtrasThreeT";
import FrontGrass from "./models/FrontGrassT";
import GrassBlocks from "./models/GrassBlocksT";
import GrassSides from "./models/GrassSidesT";
import Mobs from "./models/MobsT";
import WallText from "./WallText";

// The project frames live on the middle floor's front face. On a wide screen
// the climbing camera frames them all, but on a narrow / portrait phone the
// same view sits too close to fit every frame. Across the middle-floor view we
// dolly the camera straight back (local +z) so they all fit; wider screens are
// untouched. The window is centred on the middle-floor stop (~0.357) so the
// pull-back peaks where the frames are actually on screen.
const PROJECTS_VIEW = { start: 0.3, end: 0.42 };

const getProjectsDolly = (progress, size) => {
  if (size.width > 768) return 0;
  if (progress <= PROJECTS_VIEW.start || progress >= PROJECTS_VIEW.end) return 0;

  // Portrait needs the most pull-back (its horizontal field of view is
  // narrowest); landscape phones need only a nudge.
  const portrait = size.height >= size.width;
  const peak = portrait ? 2.8 : 1.4;
  const t =
    (progress - PROJECTS_VIEW.start) /
    (PROJECTS_VIEW.end - PROJECTS_VIEW.start);

  // Smooth 0 -> peak -> 0 bump so the pull-back eases in and out of the view.
  return peak * Math.sin(Math.PI * t);
};

const Scene = ({
  cameraGroup,
  camera,
  scrollProgress,
  targetScrollProgress,
  lerpFactor,
  mouseOffset,
}) => {
  const size = useThree((state) => state.size);
  const houseRef = useRef();

  // The camera path and rotation keyframes are constant, but Scene re-renders
  // every frame (it lifts scroll progress into state). Building them in useMemo
  // — and pre-baking the rotation eulers into quaternions — keeps us from
  // allocating ~30 throwaway objects per frame, which was a real source of GC
  // jank during scroll.
  const cameraCurve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          // The path ascends the front (world +Z) face of the three-storey
          // house: a far approach, then a near-vertical climb past each floor
          // (ground -> middle -> top -> rooftop), then an exterior fly-back
          // that descends to the start so the closed loop reads as a graceful
          // return. Camera X holds near the house centre (world x -5.5) and Z
          // sits a few units in front of the balconies; only Y rises. Floor
          // heights: ground ~67, middle ~72, top ~77, rooftop ~82.
          new THREE.Vector3(2, 65, 47.5), // far approach
          new THREE.Vector3(-2, 65.5, 36),
          new THREE.Vector3(-5.5, 66.5, 27),
          new THREE.Vector3(-5.5, 68.0, 23), // ground floor (about)
          new THREE.Vector3(-5.5, 70.0, 22.5),
          new THREE.Vector3(-5.5, 72.5, 22), // middle floor (projects)
          new THREE.Vector3(-5.5, 75.0, 21.5),
          new THREE.Vector3(-5.5, 77.0, 21), // top floor (books + links)
          new THREE.Vector3(-5.5, 80.0, 21),
          new THREE.Vector3(-5.0, 83.0, 22), // rooftop terrace hero
          new THREE.Vector3(-3, 85, 27),
          new THREE.Vector3(5, 80, 34), // exterior fly-back
          new THREE.Vector3(6, 70, 42),
          new THREE.Vector3(3, 66, 47),
        ],
        true
      ),
    []
  );

  // Rotation keyframes, pre-baked into quaternions once (eulers are only ever
  // needed as quats for slerp). Scratch Vector3 reused by the path lookup.
  const rotationQuats = useMemo(() => {
    // The camera faces the house (world -Z) throughout the climb; only pitch
    // changes — tilted up while low and close, levelling out as it rises, then
    // looking out and down from the rooftop. The fly-back yaws away as it
    // descends. Pitch up is +X here (the camera group's forward is -Z).
    const targets = [
      { progress: 0, rotation: [-0.08, 0.1, 0.0] }, // approach
      { progress: 0.1, rotation: [0.02, 0.03, 0.0] },
      { progress: 0.21, rotation: [0.09, 0.0, 0.0] }, // ground, slight up
      { progress: 0.357, rotation: [0.05, 0.0, 0.0] }, // middle
      { progress: 0.5, rotation: [0.0, 0.0, 0.0] }, // top, level
      { progress: 0.643, rotation: [-0.14, 0.0, 0.0] }, // rooftop, look out
      { progress: 0.72, rotation: [-0.18, 0.3, 0.0] }, // pull out
      { progress: 0.85, rotation: [-0.04, 0.22, 0.0] }, // fly-back descend
      { progress: 1, rotation: [-0.08, 0.1, 0.0] },
    ];
    return targets.map(({ progress, rotation }) => ({
      progress,
      quat: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rotation[0], rotation[1], rotation[2])
      ),
    }));
  }, []);

  const basePoint = useMemo(() => new THREE.Vector3(), []);

  // Slerp the keyframe quaternions into `out` (no per-frame allocation).
  const writeLerpedRotation = (progress, out) => {
    for (let i = 0; i < rotationQuats.length - 1; i++) {
      const start = rotationQuats[i];
      const end = rotationQuats[i + 1];
      if (progress >= start.progress && progress <= end.progress) {
        const t =
          (progress - start.progress) / (end.progress - start.progress);
        out.slerpQuaternions(start.quat, end.quat, t);
        return out;
      }
    }
    return out.copy(rotationQuats[rotationQuats.length - 1].quat);
  };

  useFrame((state, delta) => {
    if (!camera.current || !cameraGroup.current) return;

    // Frame-rate-independent smoothing. A plain per-frame lerp converges in a
    // fixed number of FRAMES, so when the heavy outdoor scenery drops the frame
    // rate the camera needs twice as long in REAL time to catch the scroll
    // target — that is the "slow outside the house" lag. Deriving the blend
    // from elapsed time keeps the catch-up duration constant at any FPS. `step`
    // is clamped so a long stall (backgrounded tab) can't snap the camera.
    const step = Math.min(delta, 0.1);
    const scrollAlpha = 1 - Math.pow(1 - lerpFactor, step * 60);
    const localAlpha = 1 - Math.pow(1 - 0.1, step * 60);

    // The ONE smoothing stage for scroll: ease the live progress toward the
    // input target. Everything below reads straight off this eased value, so
    // the camera tracks it tightly instead of through the old extra position
    // and rotation lerps that stacked up into perceptible lag.
    let newProgress = THREE.MathUtils.lerp(
      scrollProgress.current,
      targetScrollProgress.current,
      scrollAlpha
    );

    if (newProgress > 1) {
      newProgress = 0;
      targetScrollProgress.current = 0;
    } else if (newProgress < 0) {
      newProgress = 1;
      targetScrollProgress.current = 1;
    }

    scrollProgress.current = newProgress;

    // Path position: driven directly from the eased progress (no second lerp).
    cameraCurve.getPoint(newProgress, basePoint);
    cameraGroup.current.position.copy(basePoint);

    // Camera-local parallax keeps its own gentle lerp — it follows the pointer,
    // not the scroll, so a little independent softening reads well. Same
    // frame-rate-independent blend so it stays consistent when FPS dips.
    camera.current.position.x = THREE.MathUtils.lerp(
      camera.current.position.x,
      mouseOffset.current.x,
      localAlpha
    );
    camera.current.position.y = THREE.MathUtils.lerp(
      camera.current.position.y,
      -mouseOffset.current.y,
      localAlpha
    );
    camera.current.position.z = THREE.MathUtils.lerp(
      camera.current.position.z,
      getProjectsDolly(newProgress, size),
      localAlpha
    );

    // Rotation: also straight off the eased progress.
    writeLerpedRotation(newProgress, cameraGroup.current.quaternion);
  });

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
        <group ref={houseRef}>
          <House />
        </group>
        <SceneSky houseRef={houseRef} />
        <Detail scrollProgress={scrollProgress} />
        <WallText />
      </Suspense>
      <Suspense fallback={null}>
        <BackGrass />
      </Suspense>
      <Suspense fallback={null}>
        <Extras />
      </Suspense>
      <Suspense fallback={null}>
        <ExtrasTwo />
      </Suspense>
      <Suspense fallback={null}>
        <ExtrasThree scrollProgress={scrollProgress} />
      </Suspense>
      <Suspense fallback={null}>
        <FrontGrass />
      </Suspense>
      <Suspense fallback={null}>
        <GrassBlocks />
      </Suspense>
      <Suspense fallback={null}>
        <GrassSides />
      </Suspense>
      <Suspense fallback={null}>
        <Mobs />
      </Suspense>
    </>
  );
};

export default Scene;
