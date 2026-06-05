import { Suspense, useMemo, useRef, useState } from "react";

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

// The four project frames span the wall (world x -10.5..-7.5). On a wide screen
// the fixed camera frames them all, but on a narrow / portrait phone the same
// view sits too close and slightly right of centre, clipping the leftmost
// frame. Across the project view we dolly the camera straight back (local +z)
// so every frame fits; wider screens are untouched.
//
// The project framing runs progress ~0.53..0.67 (camera near x-8.4, looking
// down -z, ~5-6.6 units from the wall) — derived from the camera curve +
// rotation keyframes. The window is centred there so the pull-back peaks where
// the frames are actually on screen.
const PROJECTS_VIEW = { start: 0.5, end: 0.7 };

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
  setscrollProgress,
  targetScrollProgress,
  lerpFactor,
  mouseOffset,
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);
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
          new THREE.Vector3(2, 65, 47.5),
      new THREE.Vector3(1.4, 65, 39),
      new THREE.Vector3(-2, 70, 17),
      new THREE.Vector3(-2.6, 68.5, 4.8),
      new THREE.Vector3(-2.45, 67.9, 0),
      new THREE.Vector3(-3.42, 68.9, 0.145),
      new THREE.Vector3(-8.05, 69.36, -0.875),
      new THREE.Vector3(-10.05, 69.36, -0.88),
      new THREE.Vector3(-7.148, 69.22, 0.37),
      new THREE.Vector3(-9, 69.2, 1.22),
      new THREE.Vector3(-7.8, 68.72, 3.04),
      new THREE.Vector3(-8.01, 69.97, -1.72),
      new THREE.Vector3(-3, 68.21, 0.308), //close door
      new THREE.Vector3(-2.4, 68.47, 7.1),
      new THREE.Vector3(-2, 70, 17),
      new THREE.Vector3(1.4, 65, 39),
        ],
        true
      ),
    []
  );

  // Rotation keyframes, pre-baked into quaternions once (eulers are only ever
  // needed as quats for slerp). Scratch Vector3 reused by the path lookup.
  const rotationQuats = useMemo(() => {
    const targets = [
      { progress: 0, rotation: [-0.12, 0.17, 0.02] },
      { progress: 0.14, rotation: [-0.11, 0.003, 0.0] },
      { progress: 0.2, rotation: [-0.11, 0.003, 0.0] },
      { progress: 0.24, rotation: [0.173, 1.042, -0.15] },
      { progress: 0.365, rotation: [0.023, 0.024, -0.001] },
      { progress: 0.42, rotation: [0.177, 0.972, -0.147] },
      { progress: 0.5, rotation: [-2.725, 1.02, 2.782] },
      { progress: 0.56, rotation: [-2.9, -0.069, -3.125] },
      { progress: 0.62, rotation: [-2.76, 0.21, 3.06] },
      { progress: 0.715, rotation: [-0.467, -0.681, -0.308] },
      { progress: 0.735, rotation: [-0.043, 0.012, 0.0005] },
      { progress: 0.85, rotation: [-0.043, 0.012, 0.0005] },
      { progress: 1, rotation: [-0.12, 0.17, 0.02] },
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

    setPulseIntensity((Math.sin(state.clock.elapsedTime * 3) + 1) / 2);

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
      scrollProgress,
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

    setscrollProgress(newProgress);

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
      <Suspense fallback={null}>
        <group ref={houseRef}>
          <House />
        </group>
        <SceneSky houseRef={houseRef} />
        <BackGrass />
        <Detail progress={scrollProgress} pulseIntensity={pulseIntensity} />
        <Extras />
        <ExtrasTwo />
        <ExtrasThree progress={scrollProgress} />
        <FrontGrass />
        <GrassBlocks />
        <GrassSides />
        <Mobs />
        <WallText />
      </Suspense>
    </>
  );
};

export default Scene;
