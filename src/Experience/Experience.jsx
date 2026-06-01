import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import Scene from "./Scene";
import { useModalStore } from "./stores/modalStore";
import { useNavStore } from "./stores/navStore";
import normalizeWheel from "normalize-wheel";

// Curated forward stops along the camera path (intro, house approach, the
// project wall, the bookshelf, the links sign, ...). The "next" button jumps to
// the closest stop ahead so each tap lands on a framed view rather than a
// mid-pan. Values map to the rotation keyframes in Scene.jsx.
const NAV_STOPS = [0, 0.14, 0.24, 0.365, 0.42, 0.5, 0.62, 0.715, 0.85];

const Experience = () => {
  const cameraGroup = useRef();
  const camera = useRef();
  const [scrollProgress, setscrollProgress] = useState(0);
  const targetScrollProgress = useRef(0);
  const scrollSpeed = 0.005;
  const lerpFactor = 0.1;
  const isSwiping = useRef(false);
  const mouseOffset = useRef(new THREE.Vector3());
  const { isModalOpen } = useModalStore();
  const advanceSignal = useNavStore((state) => state.advanceSignal);
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
        // Scale by swipe distance (as the wheel does) and cap per event, so a
        // flick advances several keyframes instead of crawling one fixed
        // sign-step at a time — the old constant step made touch feel stuck.
        const magnitude = Math.min(Math.abs(deltaY) / 8, 4);
        targetScrollProgress.current +=
          Math.sign(deltaY) * scrollSpeed * magnitude;
      }
      lastTouchY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      isSwiping.current = false;
      lastTouchY.current = null;
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

  // "Next" button: jump the camera to the closest stop ahead on the path. The
  // path is a closed loop, so when nothing is ahead we ride forward to its
  // start (progress 1 == progress 0) rather than scrubbing backwards.
  useEffect(() => {
    if (advanceSignal === 0) return;
    const current = ((targetScrollProgress.current % 1) + 1) % 1;
    const next = NAV_STOPS.find((stop) => stop > current + 0.02);
    targetScrollProgress.current = next !== undefined ? next : 1;
  }, [advanceSignal, targetScrollProgress]);

  return (
    <>
      <Canvas flat={true} eventSource={document.getElementById("root")}>
        <Scene
          cameraGroup={cameraGroup}
          camera={camera}
          scrollProgress={scrollProgress}
          setscrollProgress={setscrollProgress}
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
