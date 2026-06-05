import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { convertMaterialsToMeshBasicMaterial } from "../utils/convertMaterial";
import { useAudioStore } from "../stores/audioStore";
import { playSound } from "../../utils/audioSystem";

const doorAnimationConfig = {
  pivotPointOne: 0.17,
  pivotPointTwo: 0.8,
  openAngle: Math.PI / 2,
  closeAngle: 0,
};

export default function Model({ scrollProgress, ...props }) {
  const { nodes, materials } = useGLTFWithKTX2("/models/ExtrasThreeT-v1.glb");
  const doorRef = useRef();
  const doorState = useRef("closed");
  const { isAudioEnabled } = useAudioStore();

  convertMaterialsToMeshBasicMaterial(materials);

  // The door is driven straight off the live scroll ref each frame: the camera
  // crosses the doorway threshold as the scene re-renders no longer happen, so
  // the open/close edges are detected here in useFrame rather than in render.
  useFrame(() => {
    if (!doorRef.current) return;
    const progress = scrollProgress.current;

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
  });

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
