import { Suspense, useMemo, useRef } from "react";

import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import House from "./models/HouseT";
import SceneSky from "./SceneSky";
import BackGrass from "./models/BackGrassT";
import Detail from "./models/DetailT";
import FrontGrass from "./models/FrontGrassT";
import GrassSides from "./models/GrassSidesT";
import Mobs from "./models/MobsT";
import Player from "./models/PlayerT";
import GateSign from "./GateSign";
import Terminal3D from "./Terminal3D";
import AmbientLife from "./AmbientLife";

// The project frames live on the middle floor's front face. On a wide screen
// the climbing camera frames them all, but on a narrow / portrait phone the
// same view sits too close to fit every frame. Across the middle-floor view we
// dolly the camera straight back (local +z) so they all fit; wider screens are
// untouched. The window is centred on the middle-floor stop (~0.357) so the
// pull-back peaks where the frames are actually on screen.
const PROJECTS_VIEW = { start: 0.39, end: 0.5 };

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
          // The visitor enters through the front door and climbs the interior
          // atrium floor by floor. The path approaches, passes through the
          // doorway (world z ~8) into the central shaft (world x -5.5, z ~1.3),
          // then rises through the open floors (ground ~67 -> middle ~72 ->
          // top ~77). It then descends the shaft and exits back out the door,
          // arcing to the start so the closed loop returns without clipping the
          // walls. Only the climb (0 -> ~0.6) is the journey; the rest returns.
          new THREE.Vector3(2, 65, 47.5), // far approach
          new THREE.Vector3(-2, 65.5, 33),
          new THREE.Vector3(-5.5, 66.2, 20),
          new THREE.Vector3(-5.5, 66.7, 11), // nearing the door
          new THREE.Vector3(-5.5, 67.0, 5.5), // through the doorway
          new THREE.Vector3(-5.5, 67.5, 3.0), // ground floor interior (about)
          new THREE.Vector3(-5.5, 70.5, 3.0),
          new THREE.Vector3(-5.5, 73.0, 3.0), // middle floor (projects)
          new THREE.Vector3(-5.5, 75.8, 3.0),
          new THREE.Vector3(-5.5, 78.4, 3.0), // top floor (books + links)
          new THREE.Vector3(-5.5, 80.0, 3.0), // top of the climb
          new THREE.Vector3(-5.5, 74.0, 3.2), // descend the shaft
          new THREE.Vector3(-5.5, 67.4, 5.5), // back toward the door
          new THREE.Vector3(-5.5, 66.4, 14), // exit the door
          new THREE.Vector3(-2, 65.5, 30), // arc back out
          new THREE.Vector3(3, 65, 44),
        ],
        true
      ),
    []
  );

  // Rotation keyframes, pre-baked into quaternions once (eulers are only ever
  // needed as quats for slerp). Scratch Vector3 reused by the path lookup.
  const rotationQuats = useMemo(() => {
    // The camera faces into the house (world -Z, toward the interior back wall
    // where the floor content sits) for the whole climb; only a gentle pitch
    // changes so each floor's wall stays framed as it rises. On the way back
    // down and out it stays facing in, so backing out the door reads naturally.
    // Pitch up is +X here (the camera group's forward is -Z).
    const targets = [
      { progress: 0, rotation: [-0.05, 0.06, 0.0] }, // approach
      { progress: 0.18, rotation: [0.0, 0.0, 0.0] }, // doorway
      { progress: 0.31, rotation: [0.04, 0.0, 0.0] }, // ground floor
      { progress: 0.44, rotation: [0.03, 0.0, 0.0] }, // middle floor
      { progress: 0.56, rotation: [0.03, 0.0, 0.0] }, // top floor
      { progress: 0.62, rotation: [0.18, 0.0, 0.0] }, // glance up the shaft
      { progress: 0.78, rotation: [-0.02, 0.0, 0.0] }, // descending
      { progress: 0.9, rotation: [-0.05, 0.04, 0.0] }, // exiting
      { progress: 1, rotation: [-0.05, 0.06, 0.0] },
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
      {/* The Extras / ExtrasTwo / ExtrasThree prop blobs (furniture and the old
          door mechanism) were baked for the previous single-room house. Inside
          the new multi-storey house they sit at the wrong places and block the
          interior and doorway view, so they are no longer rendered — the new
          house GLB carries its own door, trim, garden, and lamps. */}
      <Suspense fallback={null}>
        <FrontGrass />
      </Suspense>
      {/* GrassBlocks (the dense grass tufts) crowded the new doorway and the
          camera clipped through them on entry; the house now has its own garden
          at the entrance, so the tufts are dropped. */}
      <Suspense fallback={null}>
        <GrassSides />
      </Suspense>
      <Suspense fallback={null}>
        <Mobs />
      </Suspense>
      {/* The controllable character. For now it stands at a fixed spawn on the
          front lawn facing the house so we can confirm the asset loads and its
          idle clip plays; the movement controller that drives this position
          arrives in a later change. */}
      <Suspense fallback={null}>
        <Player position={[0, 64.85, 20]} rotation={[0, Math.PI, 0]} />
      </Suspense>
    </>
  );
};

export default Scene;
