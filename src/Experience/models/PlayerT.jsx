import { useEffect, useMemo, useRef } from "react";

import * as THREE from "three";
import { useAnimations } from "@react-three/drei";

import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";

// The controllable character: a rigid Minecraft-style cuboid rig (head, body,
// two arms, two legs parented to a "Player" root) carrying three baked clips —
// "idle", "walk", and "jump". The geometry is authored feet-on-floor at the
// origin, so the caller positions it by world coordinate and turns it with a
// y-rotation. The active clip is chosen by the `action` prop and cross-faded so
// gait changes never pop.

// The whole scene is baked and unlit (emission only), so the character is drawn
// with MeshBasicMaterial too; the skin is nearest-filtered so it reads as the
// hard-edged Minecraft texture instead of a blurred gradient. Converting on the
// loaded scene's meshes (rather than the cached materials dict) keeps the
// animated node hierarchy intact for `useAnimations`.

// Classify a node into a body zone by walking up its ancestors to find a named
// group. Returns "head", "body", or "leg" (arm nodes get body colour).
const classifyZone = (object) => {
  let cur = object;
  while (cur) {
    const n = (cur.name || "").toLowerCase();
    if (n.includes("head")) return "head";
    if (n.includes("leg") || n.includes("ll") || n.includes("rl")) return "leg";
    if (n.includes("arm") || n.includes("body")) return "body";
    cur = cur.parent;
  }
  return "body"; // fallback
};

const toUnlitPixelMaterial = (scene, colors) => {
  scene.traverse((object) => {
    if (!object.isMesh) return;
    const map = object.material.map || object.material.emissiveMap || null;
    if (map) {
      map.magFilter = THREE.NearestFilter;
      map.minFilter = THREE.NearestFilter;
      map.generateMipmaps = false;
      map.needsUpdate = true;
    }
    const basic = new THREE.MeshBasicMaterial({ map });

    // Apply colour tint per body zone if provided.
    if (colors) {
      const zone = classifyZone(object);
      if (zone === "head" && colors.headColor) {
        basic.color = new THREE.Color(colors.headColor);
      } else if (zone === "body" && colors.bodyColor) {
        basic.color = new THREE.Color(colors.bodyColor);
      } else if (zone === "leg" && colors.legColor) {
        basic.color = new THREE.Color(colors.legColor);
      }
    }

    object.material = basic;
  });
};

export default function Player({ action = "idle", colors, ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTFWithKTX2("/models/PlayerT.glb");

  useMemo(() => toUnlitPixelMaterial(scene, colors), [scene, colors]);

  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    const clip = actions[action];
    if (!clip) return;
    clip.reset().fadeIn(0.2).play();
    return () => clip.fadeOut(0.2);
  }, [actions, action]);

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

