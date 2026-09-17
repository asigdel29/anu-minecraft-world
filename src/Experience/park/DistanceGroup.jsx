import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

import { DISTANCE_CADENCE_SEC, shouldShowGroup } from "./parkDistance";

// Visibility wrapper for decorative park props. Flips `group.visible` directly
// (no React state, no re-render) on the streaming cadence with show/hide
// hysteresis — the same discipline as terrain's DistanceGroup. This is the
// park-scoped twin, written for this tree before the island streaming PRs
// land upstream; when they do, prefer terrain's and retire this one.
const scratch = new THREE.Vector3();

export default function DistanceGroup({ showRadius = 60, hideRadius = 78, children }) {
  const group = useRef();
  const shown = useRef(true);
  const timer = useRef(DISTANCE_CADENCE_SEC);
  const camera = useThree((state) => state.camera);

  useFrame((_, delta) => {
    const node = group.current;
    if (!node) return;
    timer.current += delta;
    if (timer.current < DISTANCE_CADENCE_SEC) return;
    timer.current = 0;
    node.getWorldPosition(scratch);
    shown.current = shouldShowGroup(camera.position.distanceTo(scratch), {
      shown: shown.current,
      showRadius,
      hideRadius,
    });
    node.visible = shown.current;
  });

  return <group ref={group}>{children}</group>;
}
