import { Text } from "@react-three/drei";

// The owner name shown on the baked sign board at the gate. Edit NAME to change
// it — the board geometry is in the house model; only this text is overlaid.
const FONT = "/fonts/Minecraft-Regular.ttf";
const NAME = "anu's house";

export default function GateSign() {
  return (
    <Text
      font={FONT}
      position={[-5.528, 67.6, 12.0]}
      fontSize={0.5}
      color="#f4e9d0"
      outlineWidth={0.01}
      outlineColor="#2a1a0e"
      anchorX="center"
      anchorY="middle"
      maxWidth={5}
    >
      {NAME}
    </Text>
  );
}
