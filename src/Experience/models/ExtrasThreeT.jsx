import React, { useRef } from "react";
import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { convertMaterialsToMeshBasicMaterial } from "../utils/convertMaterial";
import { useAudioStore } from "../stores/audioStore";
import { playSound } from "../../utils/audioSystem";

export default function Model({ progress = 0, ...props }) {
  const { nodes, materials } = useGLTFWithKTX2("/models/ExtrasThreeT-v1.glb");
  const doorRef = useRef();
  const doorState = useRef("closed");
  const { isAudioEnabled } = useAudioStore();

  convertMaterialsToMeshBasicMaterial(materials);

  const doorAnimationConfig = {
    pivotPointOne: 0.17,
    pivotPointTwo: 0.8,
    openAngle: Math.PI / 2,
    closeAngle: 0,
  };

  if (
    progress >= doorAnimationConfig.pivotPointOne &&
    progress < doorAnimationConfig.pivotPointTwo &&
    doorState.current === "closed"
  ) {
    doorRef.current.rotation.z = doorAnimationConfig.openAngle;
    doorState.current = "open";
    if (isAudioEnabled) {
      playSound("doorOpening");
    }
  }

  if (
    progress < doorAnimationConfig.pivotPointOne &&
    doorState.current === "open"
  ) {
    doorRef.current.rotation.z = doorAnimationConfig.closeAngle;
    doorState.current = "closed";
    if (isAudioEnabled) {
      playSound("doorClosing");
    }
  }

  if (
    progress >= doorAnimationConfig.pivotPointTwo &&
    doorState.current === "open"
  ) {
    doorRef.current.rotation.z = doorAnimationConfig.closeAngle;
    doorState.current = "closed";
    if (isAudioEnabled) {
      playSound("doorClosing");
    }
  }

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.extras_three_Baked.geometry}
        material={materials["MergedBake_Baked.006"]}
        position={[0.597, 68.353, 2.812]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        ref={doorRef}
        geometry={nodes.door.geometry}
        material={materials["MergedBake_Baked.006"]}
        position={[-2.935, 67.848, 0.906]}
        rotation={[Math.PI / 2, 0, 0]}
      />
    </group>
  );
}
