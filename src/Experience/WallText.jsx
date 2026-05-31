import { Text } from "@react-three/drei";

// In-code overlay for the projects wall: replaces the baked "Andrew Woan's
// Selected Works" sign + the four captions with Anu's text, styled as in-world
// wooden Minecraft signs (beveled, warm wood matching the picture frames) so
// they sit in the scene instead of looking pasted on. Plaques auto-size to
// their text, wrapping long captions to a taller sign.
//
// NOTE(anu): positions are world-space in the live scene. Tune `cfg` against
// the running dev server (scroll to the projects view). If text faces away from
// the camera, set cfg.rotationY to Math.PI.

const FONT = "/fonts/Minecraft-Regular.ttf";

const cfg = {
  rotationY: 0,
  // text
  signTextColor: "#ffe16b", // brand yellow on wood
  captionTextColor: "#f6eede", // warm cream on wood
  outlineColor: "#2a1a0e", // dark carved edge for legibility
  outlineWidth: 0.006,
  // wood plaque palette (matches the picture-frame wood) — beveled. These are
  // albedo colors; the face is lit by the scene Environment so it shades like
  // the surrounding wood instead of reading as a flat sticker.
  faceColor: "#7a5532", // wood face albedo
  hiColor: "#9a6d3c", // top-left lit edge
  loColor: "#3a2614", // bottom-right shadow + outer border
  bevel: 0.04,
  // depth (wall plane ~ z = -4.13)
  plaqueZ: -4.06,
  textZ: -4.0,
  // sizing
  charW: 0.64, // avg glyph advance / fontSize (Minecraft font)
  // sign (above the frames)
  sign: { text: "anu's random links", x: -9.03, y: 70.42, fontSize: 0.23, padX: 0.36, h: 0.46 },
  // captions (below each frame) — all single-line, uniform height. The
  // rightmost is long, so it gets a small right shift (xOffset) to extend into
  // empty wall instead of overlapping its left neighbour.
  captionY: 68.95,
  captionFontSize: 0.073,
  captionPadX: 0.2,
  captionH: 0.3,
  captions: [
    { x: -10.528, text: "AI Agent Canvas" },
    { x: -9.532, text: "matrixportfolio" },
    { x: -8.536, text: "coding-monkey" },
    { x: -7.541, text: "AI Sims City" },
  ],
};

// A beveled wooden Minecraft-style sign: dark base, lit top-left edge, shadowed
// bottom-right edge, raised wood face. Three stacked unlit quads = pixel bevel.
function Plaque({ x, y, w, h }) {
  const t = cfg.bevel;
  return (
    <group position={[x, y, cfg.plaqueZ]}>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={cfg.loColor} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[-t / 2, t / 2, 0.002]}>
        <planeGeometry args={[w - t, h - t]} />
        <meshStandardMaterial color={cfg.hiColor} roughness={0.95} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <planeGeometry args={[w - 2 * t, h - 2 * t]} />
        <meshStandardMaterial color={cfg.faceColor} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}

function captionWidth(text) {
  return text.length * cfg.captionFontSize * cfg.charW + cfg.captionPadX;
}

export default function WallText() {
  const signW = cfg.sign.text.length * cfg.sign.fontSize * cfg.charW + cfg.sign.padX;
  return (
    <group rotation={[0, cfg.rotationY, 0]}>
      {/* Sign */}
      <Plaque x={cfg.sign.x} y={cfg.sign.y} w={signW} h={cfg.sign.h} />
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

      {/* Captions */}
      {cfg.captions.map((c) => {
        const w = captionWidth(c.text);
        const cx = c.x + (c.xOffset || 0);
        return (
          <group key={c.x}>
            <Plaque x={cx} y={cfg.captionY} w={w} h={cfg.captionH} />
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
          </group>
        );
      })}
    </group>
  );
}
