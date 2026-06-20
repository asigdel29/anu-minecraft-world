import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";

import Scene from "./Scene";

// The world is now explored by driving a character (WASD / arrow keys) rather
// than scrolling a fixed camera path. Input lives with the character controller
// (Player.jsx) and the camera is positioned each frame to follow it, so this
// component is just the canvas and the default camera the controller drives.
const Experience = () => {
  return (
    <Canvas
      flat={true}
      dpr={[1, 2]}
      // preserveDrawingBuffer lets PostHog session replay snapshot the WebGL
      // canvas; without it the captured frames read back blank.
      gl={{ powerPreference: "high-performance", preserveDrawingBuffer: true }}
      eventSource={document.getElementById("root")}
    >
      <PerspectiveCamera makeDefault fov={70} position={[0, 69, 30]} />
      <Scene />
    </Canvas>
  );
};

export default Experience;
