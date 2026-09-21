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

export default function DistanceGroup({
  showRadius = 60,
  hideRadius = 78,
  position,
  children,
}) {
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
    // Horizontal distance only: markers drop to terrain height and the
    // balloon-cam sits far above, so height deltas are noise for "how far
    // into the park is this", not signal. When `position` is given it is the
    // measurement origin (for world-baked geometry whose wrapper carries no
    // transform); otherwise the wrapper's own world position is used.
    if (position) {
      scratch.set(position[0], 0, position[2]);
    } else {
      node.getWorldPosition(scratch);
      scratch.y = 0;
    }
    const dx = camera.position.x - scratch.x;
    const dz = camera.position.z - scratch.z;
    shown.current = shouldShowGroup(Math.hypot(dx, dz), {
      shown: shown.current,
      showRadius,
      hideRadius,
    });
    node.visible = shown.current;
  });

  return <group ref={group}>{children}</group>;
}
