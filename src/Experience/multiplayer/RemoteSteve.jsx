// File: src/Experience/multiplayer/RemoteSteve.jsx
//
// Sentience world — a remote player's Steve avatar.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Render an interpolated remote Steve with a name tag.
//
// Renders another player's character from the shared Steve model. The GLTF scene
// is cached and shared, so it is cloned per avatar (skeleton and all) to animate
// independently. The avatar lerps toward the latest streamed pose so the ~12 Hz
// network updates read as smooth motion, and switches walk/idle/jump clips to
// match. A billboarded name tag floats above the head.

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useAnimations, Billboard, Text } from "@react-three/drei";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { remotePoses } from "./presenceStore";

// toUnlitPixel matches the rest of the scene: unlit, nearest-filtered skin.
const toUnlitPixel = (root) => {
  root.traverse((object) => {
    if (!object.isMesh) return;
    const map = object.material.map || object.material.emissiveMap || null;
    if (map) {
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;
      map.generateMipmaps = false;
      map.needsUpdate = true;
    }
    object.material = new THREE.MeshBasicMaterial({ map });
  });
};

export default function RemoteSteve({ id, name }) {
  const group = useRef();
  const { scene, animations } = useGLTFWithKTX2("/models/PlayerT.glb");
  const cloned = useMemo(() => {
    const copy = cloneSkeleton(scene);
    toUnlitPixel(copy);
    return copy;
  }, [scene]);
  const { actions } = useAnimations(animations, group);

  const lastAction = useRef(null);
  const target = useRef(new THREE.Vector3());
  const placed = useRef(false);

  // Start idle so a still avatar is not frozen on its first frame.
  useEffect(() => {
    actions.idle?.reset().fadeIn(0.2).play();
    lastAction.current = "idle";
  }, [actions]);

  useFrame((_, delta) => {
    const pose = remotePoses.get(id);
    const g = group.current;
    if (!pose || !g) return;
    const k = Math.min(1, delta * 12);

    target.current.set(pose.x, pose.y, pose.z);
    if (!placed.current) {
      g.position.copy(target.current);
      placed.current = true;
    } else {
      g.position.lerp(target.current, k);
    }

    let diff = (pose.yaw ?? 0) - g.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    g.rotation.y += diff * k;

    const act = pose.action || "idle";
    if (act !== lastAction.current) {
      actions[lastAction.current]?.fadeOut(0.2);
      actions[act]?.reset().fadeIn(0.2).play();
      lastAction.current = act;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={cloned} />
      <Billboard position={[0, 2.4, 0]}>
        <Text
          font="/fonts/Minecraft-Regular.ttf"
          fontSize={0.32}
          color="#ffffff"
          outlineWidth={0.02}
          outlineColor="#06283d"
          anchorX="center"
        >
          {name}
        </Text>
      </Billboard>
    </group>
  );
}
