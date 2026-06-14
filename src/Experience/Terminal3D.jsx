import { useEffect, useState } from "react";

import { Text } from "@react-three/drei";

import { useModalStore } from "./stores/modalStore";
import Terminal from "../components/Terminal/Terminal";

// A small interactive terminal screen on the top floor's back wall (between the
// Links and Books panels). Clicking it opens the terminal/guestbook modal. The
// screen is a dark plane with green text; an invisible plane in front handles
// the click, mirroring the content-panel pattern in DetailT.
const FONT = "/fonts/Minecraft-Regular.ttf";
const POS = [-5.5, 78.4, -1.9]; // top-floor back wall, facing the climbing camera (+z)
const SCREEN = [2.0, 1.45];

export default function Terminal3D() {
  const { openModal } = useModalStore();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
  }, [hovered]);

  return (
    <group position={POS}>
      <mesh raycast={() => null}>
        <planeGeometry args={SCREEN} />
        <meshBasicMaterial color="#0b0f0b" toneMapped={false} />
      </mesh>
      <Text
        font={FONT}
        position={[0, 0, 0.02]}
        fontSize={0.16}
        color="#5dff7a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="center"
      >
        {"> guestbook\n> climb complete\n> say hi :)"}
      </Text>
      <mesh
        position={[0, 0, 0.06]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => openModal("Terminal", <Terminal />, "terminal")}
      >
        <planeGeometry args={SCREEN} />
        <meshBasicMaterial
          transparent
          opacity={hovered ? 0.1 : 0}
          color="#5dff7a"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
