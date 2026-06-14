import { useEffect, useState } from "react";

import { Vector3 } from "three";
import { Text } from "@react-three/drei";

import { useModalStore } from "./stores/modalStore";
import { registerInteractable } from "./stores/interactionStore";
import Terminal from "../components/Terminal/Terminal";

// The vintage CRT computer on the top floor (its body is baked into the house
// model). This overlays the powered-on green screen text and an invisible
// click-zone that opens the terminal/guestbook modal — same UI as before.
const FONT = "/fonts/Minecraft-Regular.ttf";
const POS = [-5.528, 78.0, -1.5]; // on the baked CRT screen, facing the camera (+z)
const SCREEN = [1.25, 0.85];

export default function Terminal3D() {
  const { openModal } = useModalStore();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    document.body.style.cursor = hovered ? "pointer" : "auto";
  }, [hovered]);

  // Walk-up interactable; the pointer click below stays as a desktop fallback.
  useEffect(() => {
    return registerInteractable({
      id: "terminal",
      title: "Guestbook",
      position: new Vector3(POS[0], POS[1], POS[2]),
      open: () => openModal("Terminal", <Terminal />, "terminal"),
    });
    // openModal is stable, so this registers once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group position={POS}>
      <Text
        font={FONT}
        position={[0, 0, 0.02]}
        fontSize={0.1}
        color="#5dff7a"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.05}
        textAlign="center"
      >
        {"> guestbook\n> click me :)"}
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
          opacity={hovered ? 0.14 : 0}
          color="#5dff7a"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
