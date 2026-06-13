import { useEffect, useRef } from "react";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Scene from "./Scene";
import { useModalStore } from "./stores/modalStore";
import normalizeWheel from "normalize-wheel";

// Curated stops along the camera path, one per framed floor as the camera
// climbs the house: intro/approach, ground floor (about), middle floor
// (projects), top floor (books + links), and the rooftop terrace. Values map
// to the rotation keyframes in Scene.jsx. On touch we snap to the nearest of
// these when a swipe ends, so every gesture settles on a framed view instead
// of drifting past content. The exterior fly-back (>0.643) carries no stop.
const NAV_STOPS = [0, 0.21, 0.357, 0.5, 0.643];

// Snap a free-scrolled progress value to the closest stop, moving the *short*
// way around the looped path (so snapping near the end rolls forward to 0/1
// rather than scrubbing all the way back). Returns the adjusted absolute target
// so the existing easing glides into the detent.
const snapToNearestStop = (target) => {
  const wrapped = ((target % 1) + 1) % 1;
  let best = wrapped;
  let bestDist = Infinity;
  for (const stop of NAV_STOPS) {
    // Consider each stop and its wrap-around neighbours (±1) so the nearest
    // detent is chosen by true circular distance.
    for (const candidate of [stop - 1, stop, stop + 1]) {
      const dist = Math.abs(candidate - wrapped);
      if (dist < bestDist) {
        bestDist = dist;
        best = candidate;
      }
    }
  }
  return target + (best - wrapped);
};

const Experience = () => {
  const cameraGroup = useRef();
  const camera = useRef();
  // Live scroll progress is a ref, not React state: it changes every frame, and
  // lifting it into state forced a full re-render of the scene (and DetailT's
  // material clones) sixty times a second. The models that need the live value
  // read this ref inside their own useFrame instead.
  const scrollProgress = useRef(0);
  const targetScrollProgress = useRef(0);
  const scrollSpeed = 0.005;
  // Single smoothing stage now lives here (Scene drives the camera straight
  // from this eased value), so a slightly higher factor keeps it responsive
  // without the old multi-lerp lag.
  const lerpFactor = 0.14;
  const isSwiping = useRef(false);
  const mouseOffset = useRef(new THREE.Vector3());
  const { isModalOpen } = useModalStore();
  const lastTouchY = useRef(null);

  useEffect(() => {
    const handleWheel = (e) => {
      if (isModalOpen) return;
      const normalized = normalizeWheel(e);

      targetScrollProgress.current +=
        Math.sign(normalized.pixelY) *
        scrollSpeed *
        Math.min(Math.abs(normalized.pixelY) / 100, 1);
    };

    const handleMouseMove = (e) => {
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (e.clientY / window.innerHeight) * 2 - 1;

      const sensitivityX = 0.25;
      const sensitivityY = 0.25;

      mouseOffset.current.x = mouseX * sensitivityX;
      mouseOffset.current.y = mouseY * sensitivityY;
    };

    const handleTouchStart = (e) => {
      if (isModalOpen) return;
      isSwiping.current = true;
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isSwiping.current) return;

      if (lastTouchY.current !== null) {
        const deltaY = e.touches[0].clientY - lastTouchY.current;
        // Scale by swipe distance but cap modestly: a flick should carry you
        // into the next region, not rocket past several. The touch-end snap
        // then settles the camera on the nearest framed stop, so you never
        // drift to rest mid-pan and miss content.
        const magnitude = Math.min(Math.abs(deltaY) / 10, 2);
        targetScrollProgress.current +=
          Math.sign(deltaY) * scrollSpeed * magnitude;
      }
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      isSwiping.current = false;
      lastTouchY.current = null;
      // Settle on the nearest curated viewpoint so every swipe lands on a
      // framed shot instead of a half-finished pan.
      targetScrollProgress.current = snapToNearestStop(
        targetScrollProgress.current
      );
    };

    const handleMouseDown = (e) => {
      if (isModalOpen || e.pointerType === "touch") return;
      isSwiping.current = true;
    };

    const handleMouseDrag = (e) => {
      if (!isSwiping.current || e.pointerType === "touch") return;
      const mouseMultiplier = 0.2;
      targetScrollProgress.current +=
        Math.sign(e.movementY) * scrollSpeed * mouseMultiplier;
    };

    const handleMouseUp = () => {
      isSwiping.current = false;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseDrag);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseDrag);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isModalOpen]);

  return (
    <>
      <Canvas
        flat={true}
        dpr={[1, 2]}
        gl={{ powerPreference: "high-performance" }}
        eventSource={document.getElementById("root")}
      >
        <Scene
          cameraGroup={cameraGroup}
          camera={camera}
          scrollProgress={scrollProgress}
          targetScrollProgress={targetScrollProgress}
          lerpFactor={lerpFactor}
          mouseOffset={mouseOffset}
        />
        <group ref={cameraGroup}>
          <PerspectiveCamera
            ref={camera}
            makeDefault
            fov={70}
            position={[0, 0, 0]} // Reset to center of group
          />
        </group>
      </Canvas>
    </>
  );
};

export default Experience;
