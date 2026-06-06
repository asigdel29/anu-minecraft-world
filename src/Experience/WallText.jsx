import { useEffect, useState } from "react";

import { Text } from "@react-three/drei";

import Project from "../components/Project/Project";
import { useModalStore } from "./stores/modalStore";

// In-code overlay for the projects wall: replaces the baked "Andrew Woan's
// Selected Works" sign + the four captions with Anu's text. The four caption
// plaques double as clickable buttons that open the same project modal as the
// frame above them (the frames are wired in DetailT.jsx); the plaques are tinted
// to match the brick wall so they read as part of the wall rather than as
// pasted-on wooden signs.
//
// NOTE(anu): positions are world-space in the live scene. Tune `cfg` against
// the running dev server (scroll to the projects view). If text faces away from
// the camera, set cfg.rotationY to Math.PI.

const FONT = "/fonts/Minecraft-Regular.ttf";

// Caption order maps to the project ids raised by the frames in DetailT.jsx.
// Kept in sync with `projectNames` there so the caption and its frame open the
// same modal.
const projectNames = {
  one: "multiplayer ai agent canvas",
  two: "matrixportfolio",
  three: "coding-monkey",
  four: "ai native sims city",
};

const cfg = {
  rotationY: 0,
  // text
  signTextColor: "#ffe16b", // brand yellow on wood
  captionTextColor: "#f6eede", // warm cream, legible over brick
  outlineColor: "#2a1a0e", // dark carved edge for legibility
  outlineWidth: 0.006,
  // sign plaque palette (matches the picture-frame wood) — beveled. Albedo
  // colors lit by the scene Environment so the face shades like the wood.
  faceColor: "#7a5532", // wood face albedo
  hiColor: "#9a6d3c", // top-left lit edge
  loColor: "#3a2614", // bottom-right shadow + outer border
  // caption plaque palette — brick tones so the buttons blend into the wall.
  // Sampled from the brick wall; tune live against the dev server.
  captionFaceColor: "#9c4f37", // brick face
  captionHiColor: "#b56848", // lit brick edge
  captionLoColor: "#5e2c1d", // shadowed brick edge + border
  // brightened face shown while a caption button is hovered.
  captionHoverFaceColor: "#c46a4a",
  bevel: 0.04,
  // depth (wall plane ~ z = -4.13)
  plaqueZ: -4.06,
  textZ: -4.0,
  clickZ: -3.98, // invisible hit-plane, just in front of the plaque
  // sizing
  charW: 0.64, // avg glyph advance / fontSize (Minecraft font)
  // sign (above the frames)
  sign: { text: "anu's random links", x: -9.03, y: 70.42, fontSize: 0.23, padX: 0.36, h: 0.46 },
  // captions (below each frame) — all single-line, uniform height. Each carries
  // the project id of the frame above it so the caption can open that project.
  captionY: 68.95,
  captionFontSize: 0.073,
  captionPadX: 0.2,
  captionH: 0.3,
  captions: [
    { x: -10.528, text: "ai agent canvas", projectId: "one" },
    { x: -9.532, text: "matrixportfolio", projectId: "two" },
    { x: -8.536, text: "coding-monkey", projectId: "three" },
    { x: -7.541, text: "ai sims city", projectId: "four" },
  ],
};

/**
 * A beveled Minecraft-style sign rendered as three stacked unlit quads (dark
 * base, lit top-left edge, raised face) to fake a pixel bevel.
 *
 * @param x        world-space x of the plaque centre
 * @param y        world-space y of the plaque centre
 * @param w        plaque width
 * @param h        plaque height
 * @param faceColor face (centre) albedo
 * @param hiColor   lit top-left edge albedo
 * @param loColor   shadowed bottom-right edge / outer border albedo
 */
function Plaque({ x, y, w, h, faceColor, hiColor, loColor }) {
  const t = cfg.bevel;
  return (
    <group position={[x, y, cfg.plaqueZ]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={loColor} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[-t / 2, t / 2, 0.002]}>
        <planeGeometry args={[w - t, h - t]} />
        <meshStandardMaterial color={hiColor} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[w - 2 * t, h - 2 * t]} />
        <meshStandardMaterial color={faceColor} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}

function captionWidth(text) {
  return text.length * cfg.captionFontSize * cfg.charW + cfg.captionPadX;
}

export default function WallText() {
  const signW = cfg.sign.text.length * cfg.sign.fontSize * cfg.charW + cfg.sign.padX;
  const { openModal } = useModalStore();
  const [hoveredCaption, setHoveredCaption] = useState(null);

  // Mirror the pointer-cursor behaviour of the frames in DetailT.jsx so the
  // caption buttons feel clickable.
  useEffect(() => {
    document.body.style.cursor = hoveredCaption ? "pointer" : "auto";
  }, [hoveredCaption]);

  // Open the same project modal the frame above this caption opens.
  const handleCaptionClick = (projectId) => {
    openModal(
      projectNames[projectId],
      <Project projectID={projectId} />,
      projectId
    );
  };

  return (
    <group rotation={[0, cfg.rotationY, 0]}>
      {/* Sign */}
      <Plaque
        x={cfg.sign.x}
        y={cfg.sign.y}
        w={signW}
        h={cfg.sign.h}
        faceColor={cfg.faceColor}
        hiColor={cfg.hiColor}
        loColor={cfg.loColor}
      />
      <Text
        font={FONT}
        position={[cfg.sign.x, cfg.sign.y, cfg.textZ]}
        fontSize={cfg.sign.fontSize}
        color={cfg.signTextColor}
        outlineWidth={cfg.outlineWidth}
        outlineColor={cfg.outlineColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={signW - cfg.sign.padX * 0.6}
      >
        {cfg.sign.text}
      </Text>

      {/* Caption buttons — brick-tinted, clickable, open their project modal. */}
      {cfg.captions.map((c) => {
        const w = captionWidth(c.text);
        const cx = c.x + (c.xOffset || 0);
        const hovered = hoveredCaption === c.projectId;
        return (
          <group key={c.projectId}>
            <Plaque
              x={cx}
              y={cfg.captionY}
              w={w}
              h={cfg.captionH}
              faceColor={
                hovered ? cfg.captionHoverFaceColor : cfg.captionFaceColor
              }
              hiColor={cfg.captionHiColor}
              loColor={cfg.captionLoColor}
            />
            <Text
              font={FONT}
              position={[cx, cfg.captionY, cfg.textZ]}
              fontSize={cfg.captionFontSize}
              color={cfg.captionTextColor}
              outlineWidth={cfg.outlineWidth}
              outlineColor={cfg.outlineColor}
              anchorX="center"
              anchorY="middle"
            >
              {c.text}
            </Text>
            {/* Invisible hit-plane just in front of the plaque; covers the full
                plaque so the whole button is clickable, not only the frame. */}
            <mesh
              position={[cx, cfg.captionY, cfg.clickZ]}
              onPointerOver={() => setHoveredCaption(c.projectId)}
              onPointerOut={() => setHoveredCaption(null)}
              onClick={() => handleCaptionClick(c.projectId)}
            >
              <planeGeometry args={[w, cfg.captionH]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
