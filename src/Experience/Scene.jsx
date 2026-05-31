import { Suspense, useState } from "react";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";

import House from "./models/HouseT";
import BackGrass from "./models/BackGrassT";
import Detail from "./models/DetailT";
import Extras from "./models/ExtrasT";
import ExtrasTwo from "./models/ExtrasTwoT";
import ExtrasThree from "./models/ExtrasThreeT";
import FrontGrass from "./models/FrontGrassT";
import GrassBlocks from "./models/GrassBlocksT";
import GrassSides from "./models/GrassSidesT";
import Mobs from "./models/MobsT";
import WallText from "./WallText";

const Scene = ({
  cameraGroup,
  camera,
  scrollProgress,
  setscrollProgress,
  targetScrollProgress,
  lerpFactor,
  mouseOffset,
}) => {
  const [pulseIntensity, setPulseIntensity] = useState(0);
  const [rotationBufferQuat] = useState(
    new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.12, 0.17, 0.02))
  );

  const cameraCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(2, 65, 47.5),
      new THREE.Vector3(1.4, 65, 39),
      new THREE.Vector3(-2, 70, 17),
      new THREE.Vector3(-2.6, 68.5, 4.8),
      new THREE.Vector3(-2.45, 67.9, 0),
      new THREE.Vector3(-3.42, 68.9, 0.145),
      new THREE.Vector3(-8.05, 69.36, -0.875),
      new THREE.Vector3(-10.05, 69.36, -0.88),
      new THREE.Vector3(-7.148, 69.22, 0.37),
      new THREE.Vector3(-9, 69.2, 1.22),
      new THREE.Vector3(-7.8, 68.72, 3.04),
      new THREE.Vector3(-8.01, 69.97, -1.72),
      new THREE.Vector3(-3, 68.21, 0.308), //close door
      new THREE.Vector3(-2.4, 68.47, 7.1),
      new THREE.Vector3(-2, 70, 17),
      new THREE.Vector3(1.4, 65, 39),
    ],
    true
  );

  const rotationTargets = [
    {
      progress: 0,
      rotation: new THREE.Euler(-0.12, 0.17, 0.02),
    },
    {
      progress: 0.14,
      rotation: new THREE.Euler(-0.11, 0.003, 0.0),
    },
    {
      progress: 0.2,
      rotation: new THREE.Euler(-0.11, 0.003, 0.0),
    },
    {
      progress: 0.24,
      rotation: new THREE.Euler(0.173, 1.042, -0.15),
    },
    {
      progress: 0.365,
      rotation: new THREE.Euler(0.023, 0.024, -0.001),
    },
    {
      progress: 0.42,
      rotation: new THREE.Euler(0.177, 0.972, -0.147),
    },
    {
      progress: 0.5,
      rotation: new THREE.Euler(-2.725, 1.02, 2.782),
    },
    {
      progress: 0.56,
      rotation: new THREE.Euler(-2.9, -0.069, -3.125),
    },
    {
      progress: 0.62,
      rotation: new THREE.Euler(-2.76, 0.21, 3.06),
    },
    {
      progress: 0.715,
      rotation: new THREE.Euler(-0.467, -0.681, -0.308),
    },
    {
      progress: 0.735,
      rotation: new THREE.Euler(-0.043, 0.012, 0.0005),
    },
    {
      progress: 0.85,
      rotation: new THREE.Euler(-0.043, 0.012, 0.0005),
    },
    {
      progress: 1,
      rotation: new THREE.Euler(-0.12, 0.17, 0.02),
    },
  ];

  const getLerpedRotation = (progress) => {
    for (let i = 0; i < rotationTargets.length - 1; i++) {
      const start = rotationTargets[i];
      const end = rotationTargets[i + 1];
      if (progress >= start.progress && progress <= end.progress) {
        const lerpFactor =
          (progress - start.progress) / (end.progress - start.progress);

        const startQuaternion = new THREE.Quaternion().setFromEuler(
          start.rotation
        );
        const endQuaternion = new THREE.Quaternion().setFromEuler(end.rotation);

        const lerpingQuaternion = new THREE.Quaternion();
        lerpingQuaternion.slerpQuaternions(
          startQuaternion,
          endQuaternion,
          lerpFactor
        );

        return lerpingQuaternion;
      }
    }

    return new THREE.Quaternion().setFromEuler(
      rotationTargets[rotationTargets.length - 1].rotation
    );
  };

  useFrame((state) => {
    if (camera) {
      const newPulseIntensity = (Math.sin(state.clock.elapsedTime * 3) + 1) / 2;
      setPulseIntensity(newPulseIntensity);

      let newProgress = THREE.MathUtils.lerp(
        scrollProgress,
        targetScrollProgress.current,
        lerpFactor
      );

      if (newProgress > 1) {
        newProgress = 0;
        targetScrollProgress.current = 0;
      } else if (newProgress < 0) {
        newProgress = 1;
        targetScrollProgress.current = 1;
      }

      setscrollProgress(newProgress);

      const basePoint = cameraCurve.getPoint(newProgress);

      // Update group position (path animation)
      cameraGroup.current.position.x = THREE.MathUtils.lerp(
        cameraGroup.current.position.x,
        basePoint.x,
        0.1
      );
      cameraGroup.current.position.y = THREE.MathUtils.lerp(
        cameraGroup.current.position.y,
        basePoint.y,
        0.1
      );
      cameraGroup.current.position.z = THREE.MathUtils.lerp(
        cameraGroup.current.position.z,
        basePoint.z,
        0.1
      );

      // Update camera local position (parallax)
      camera.current.position.x = THREE.MathUtils.lerp(
        camera.current.position.x,
        mouseOffset.current.x,
        0.1
      );
      camera.current.position.y = THREE.MathUtils.lerp(
        camera.current.position.y,
        -mouseOffset.current.y,
        0.1
      );
      camera.current.position.z = 0;

      const targetQuaternion = getLerpedRotation(newProgress);

      rotationBufferQuat.slerp(targetQuaternion, 0.1);

      cameraGroup.current.quaternion.copy(rotationBufferQuat);
    }
  });

  return (
    <>
      <Environment
        background={true}
        backgroundRotation={[0, Math.PI / 2, 0]}
        files={[
          "/cubemap/px.webp",
          "/cubemap/nx.webp",
          "/cubemap/py.webp",
          "/cubemap/ny.webp",
          "/cubemap/pz.webp",
          "/cubemap/nz.webp",
        ]}
      />
      <Suspense fallback={null}>
        <House />
        <BackGrass />
        <Detail progress={scrollProgress} pulseIntensity={pulseIntensity} />
        <Extras />
        <ExtrasTwo />
        <ExtrasThree progress={scrollProgress} />
        <FrontGrass />
        <GrassBlocks />
        <GrassSides />
        <Mobs />
        <WallText />
      </Suspense>
    </>
  );
};

export default Scene;
