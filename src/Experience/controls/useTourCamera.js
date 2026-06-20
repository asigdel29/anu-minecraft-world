import { useMemo, useRef } from "react";

import * as THREE from "three";

import { TOUR_PATH, TOUR_ROTATIONS } from "./tour";

/**
 * Drives the camera along the scripted tour path. Builds a smooth Catmull-Rom
 * spline through TOUR_PATH once and precomputes a quaternion per rotation
 * keyframe, then `apply(camera, progress)` places the camera at the sampled
 * point and slerps its orientation between the surrounding keyframes.
 *
 * Orientation is expressed as small Euler tilts around the camera's default
 * -Z look, so along the atrium climb the camera faces the back wall where the
 * posters hang.
 *
 * @returns `{ apply }` where `apply(camera, progress)` poses the camera for a
 *   tour progress in [0, 1].
 */
export function useTourCamera() {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        TOUR_PATH.map(([x, y, z]) => new THREE.Vector3(x, y, z))
      ),
    []
  );

  const keyframes = useMemo(
    () =>
      TOUR_ROTATIONS.map(({ progress, euler }) => ({
        progress,
        quaternion: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(euler[0], euler[1], euler[2])
        ),
      })),
    []
  );

  const point = useRef(new THREE.Vector3());

  const apply = (camera, progress) => {
    const t = THREE.MathUtils.clamp(progress, 0, 1);
    curve.getPoint(t, point.current);
    camera.position.copy(point.current);

    // Find the surrounding rotation keyframes and slerp between them.
    let lower = keyframes[0];
    let upper = keyframes[keyframes.length - 1];
    for (let i = 0; i < keyframes.length - 1; i += 1) {
      if (t >= keyframes[i].progress && t <= keyframes[i + 1].progress) {
        lower = keyframes[i];
        upper = keyframes[i + 1];
        break;
      }
    }
    const span = upper.progress - lower.progress;
    const local = span > 0 ? (t - lower.progress) / span : 0;
    camera.quaternion
      .copy(lower.quaternion)
      .slerp(upper.quaternion, local);
  };

  return { apply };
}
