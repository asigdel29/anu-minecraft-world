import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import {
  ARRIVE_DISTANCE,
  distanceBetween,
  easeComponent,
  HANDOFF_DISTANCE,
  markerViewpoint,
  orbitPoseLook,
  orbitPosePosition,
} from "./balloonCam";
import { getAttraction } from "./attractions";
import { groundYAt } from "./groundRay";
import { parkCameraState, parkPlayerState, useParkNav } from "./parkStore";

// Ease a THREE vector toward a plain {x,y,z} goal for one frame.
const easeInto = (vector, goal, step) => {
  vector.set(
    easeComponent(vector.x, goal.x, step),
    easeComponent(vector.y, goal.y, step),
    easeComponent(vector.z, goal.z, step)
  );
};

// The balloon-cam: owns the camera whenever the park is not in roam mode.
// Selecting a marker flies the camera to the marker's viewpoint and opens the
// attraction page; leaving the page (Esc/back) flies it back onto the walk-mode
// orbit pose before handing control back, so neither transition cuts. While
// returning, `parkCameraState.returning` keeps the controller from grabbing
// the camera — a plain module object, so the controller reads it per frame
// without subscribing.
export default function ParkCameraRig({ colliders }) {
  const camera = useThree((state) => state.camera);

  // Eased look-at point, seeded once from wherever the camera first points so
  // the first flight starts from the current framing, not a snap.
  const look = useRef(new THREE.Vector3());
  const lookSeeded = useRef(false);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.1);
    const { mode, attractionId, arrived } = useParkNav.getState();

    if (!lookSeeded.current) {
      const direction = camera.getWorldDirection(new THREE.Vector3());
      look.current.copy(camera.position).addScaledVector(direction, 5);
      lookSeeded.current = true;
    }

    if (mode === "park") {
      if (!parkCameraState.returning) return; // walk-mode orbit owns the camera
      const orbit = parkPlayerState.orbit;
      if (!orbit) {
        parkCameraState.returning = false;
        return;
      }
      const player = parkPlayerState.position;
      const goal = orbitPosePosition(player, orbit);
      camera.position.set(
        easeComponent(camera.position.x, goal.x, step),
        easeComponent(camera.position.y, goal.y, step),
        easeComponent(camera.position.z, goal.z, step)
      );
      easeInto(look.current, orbitPoseLook(player), step);
      camera.lookAt(look.current);
      if (distanceBetween(camera.position, goal) <= HANDOFF_DISTANCE) {
        parkCameraState.returning = false; // orbit takes over from this pose
      }
      return;
    }

    // flying | page: glide to (or hold at) the marker's viewpoint. The manifest
    // y is a placeholder, so aim at the terrain under the marker once its
    // colliders exist.
    const attraction = getAttraction(attractionId);
    if (!attraction) return;
    const groundY = groundYAt(
      colliders,
      attraction.position[0],
      attraction.position[2]
    );
    const at =
      groundY === null
        ? attraction.position
        : [attraction.position[0], groundY, attraction.position[2]];
    const goal = markerViewpoint(at);
    camera.position.set(
      easeComponent(camera.position.x, goal.position.x, step),
      easeComponent(camera.position.y, goal.position.y, step),
      easeComponent(camera.position.z, goal.position.z, step)
    );
    easeInto(look.current, goal.look, step);
    camera.lookAt(look.current);
    if (
      mode === "flying" &&
      distanceBetween(camera.position, goal.position) <= ARRIVE_DISTANCE
    ) {
      arrived();
    }
  });

  return null;
}
