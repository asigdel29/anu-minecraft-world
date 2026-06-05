import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";

/**
 * Bakes the scene's own surrounding exterior into the background so the house
 * windows look out onto the real world instead of a flat sky.
 *
 * The sky cubemap shipped with the scene is only a blue gradient, and the house
 * windows are alpha-cut holes with no scenery framed behind them. Rather than
 * ship a separate panorama, this captures the world once with a {@link
 * THREE.CubeCamera} placed at the camera's orbit centre and installs the result
 * as {@code scene.background}.
 *
 * Two tricks keep the capture clean without per-object bookkeeping:
 *   - the house is hidden for the single capture frame (its shell would
 *     otherwise wrap the camera), and
 *   - a near plane of {@link NEAR} clips the room's interior furniture (all
 *     within a few units of the centre), leaving only the exterior terrain
 *     (nearest grass ~13u out) and the sky behind it.
 *
 * The capture runs once, after the GLB models finish loading (gated on
 * {@link useProgress}); there is no per-frame cost.
 */

// Camera orbit centre, at the window-band height (see Scene.jsx camera curve).
const CAPTURE_POSITION = [-8, 69.5, 0];
// Clips the surrounding house shell and interior props; keeps the far exterior.
const NEAR = 5;
const FAR = 2000;
const CUBE_SIZE = 1024;

export default function SceneSky({ houseRef }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const loading = useProgress((state) => state.active);
  const captured = useRef(false);

  useEffect(() => {
    if (loading || captured.current) return;
    captured.current = true;

    // Let one frame settle so every model is in the graph before the capture.
    const raf = requestAnimationFrame(() => {
      const renderTarget = new THREE.WebGLCubeRenderTarget(CUBE_SIZE);
      const cubeCamera = new THREE.CubeCamera(NEAR, FAR, renderTarget);
      cubeCamera.position.set(...CAPTURE_POSITION);
      scene.add(cubeCamera);

      // Hide the house shell so it does not wrap the capture; the flat sky
      // cubemap is still the background here, so it becomes the captured sky.
      const house = houseRef?.current;
      const houseWasVisible = house ? house.visible : null;
      if (house) house.visible = false;

      cubeCamera.update(gl, scene);

      if (house) house.visible = houseWasVisible;
      scene.remove(cubeCamera);

      // Swap the flat-gradient background for the freshly baked panorama.
      scene.background = renderTarget.texture;
    });

    return () => cancelAnimationFrame(raf);
  }, [loading, gl, scene, houseRef]);

  return null;
}
