import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard, useAnimations } from "@react-three/drei";

import { useGLTFWithKTX2 } from "./utils/useGLTFWithKTX2";
import { LERP_SPEED, dampFraction, stepAngle } from "./remoteInterp";

// A single remote visitor: the shared player model, eased toward the latest
// position/yaw/action received over the socket, with a floating name tag. The
// model reuses the local player's GLB and is cloned per peer so each can be
// tinted independently from its broadcast appearance (default until a peer
// sends colours).
const MODEL_PATH = "/models/PlayerT.glb";
const CHAT_DURATION = 5000; // ms a chat speech bubble stays visible

// Classify a mesh node into a body zone by name (mirrors PlayerT's own tinting).
const classifyZone = (object) => {
  let cur = object;
  while (cur) {
    const n = (cur.name || "").toLowerCase();
    if (n.includes("head")) return "head";
    if (n.includes("leg") || n.includes("ll") || n.includes("rl")) return "leg";
    if (n.includes("arm") || n.includes("body")) return "body";
    cur = cur.parent;
  }
  return "body";
};

export default function RemotePlayer({ data }) {
  const group = useRef();
  const targetPos = useRef(new THREE.Vector3());
  const targetYaw = useRef(0);

  const { scene, animations } = useGLTFWithKTX2(MODEL_PATH);

  // Clone the scene so each remote player owns its materials to tint.
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    const colors = data.character || {};
    clone.traverse((object) => {
      if (!object.isMesh) return;
      const map = object.material.map || object.material.emissiveMap || null;
      if (map) {
        map.magFilter = THREE.NearestFilter;
        map.minFilter = THREE.NearestFilter;
        map.generateMipmaps = false;
      }
      const basic = new THREE.MeshBasicMaterial({
        map: map ? map.clone() : null,
      });
      const zone = classifyZone(object);
      if (zone === "head" && colors.headColor) {
        basic.color = new THREE.Color(colors.headColor);
      } else if (zone === "body" && colors.bodyColor) {
        basic.color = new THREE.Color(colors.bodyColor);
      } else if (zone === "leg" && colors.legColor) {
        basic.color = new THREE.Color(colors.legColor);
      }
      object.material = basic;
    });
    return clone;
    // Re-clone when character colours change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scene,
    data.character?.headColor,
    data.character?.bodyColor,
    data.character?.legColor,
  ]);

  const { actions } = useAnimations(animations, group);

  // Ease toward the latest network transform each frame.
  useFrame((_, delta) => {
    if (!group.current) return;
    const step = Math.min(delta, 0.1);

    if (data.pos) {
      targetPos.current.set(data.pos[0], data.pos[1], data.pos[2]);
    }
    if (data.yaw !== undefined) {
      targetYaw.current = data.yaw;
    }

    group.current.position.lerp(
      targetPos.current,
      dampFraction(LERP_SPEED, step)
    );
    group.current.rotation.y = stepAngle(
      group.current.rotation.y,
      targetYaw.current,
      LERP_SPEED * step
    );

    // Play the animation matching the broadcast action.
    const wantAction = data.action || "idle";
    for (const [name, clip] of Object.entries(actions)) {
      if (name === wantAction && !clip.isRunning()) {
        clip.reset().fadeIn(0.2).play();
      } else if (name !== wantAction && clip.isRunning()) {
        clip.fadeOut(0.2);
      }
    }
  });

  const username = data.character?.username || "";
  const showBubble =
    data.chatBubble && Date.now() - (data.chatBubbleTs || 0) < CHAT_DURATION;

  return (
    <group ref={group}>
      <primitive object={clonedScene} />
      {username && (
        <Billboard position={[0, 2.4, 0]}>
          <Text
            font="/fonts/TitanOne-Regular.ttf"
            fontSize={0.18}
            color="#ffe16b"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.012}
            outlineColor="#1a1a1a"
          >
            {username}
          </Text>
        </Billboard>
      )}
      {showBubble && (
        <Billboard position={[0, 2.8, 0]}>
          <Text
            font="/fonts/TitanOne-Regular.ttf"
            fontSize={0.14}
            color="#ffffff"
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.01}
            outlineColor="#333333"
            maxWidth={2}
            textAlign="center"
          >
            {data.chatBubble}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
