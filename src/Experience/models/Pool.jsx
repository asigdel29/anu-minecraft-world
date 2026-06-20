// A second swimming pool, built from primitives so it adds no model asset to
// the bundle. It mirrors the look and physics of the baked pool in BackGrassT:
// a flat, semi-transparent water surface the character walks on top of (the
// controller raycasts straight down to find the ground), framed by a low tiled
// deck that reads as a pool edge and is shallow enough to step over.
//
// The whole group is registered as a collider by the Scene, so the water and
// deck both act as ground. Placement constants are kept here and are easy to
// nudge: POOL_POSITION is the world-space centre of the water surface.

// World-space centre of the water surface, on the paved plaza beside the house.
const POOL_POSITION = [2.5, 64.85, 22];

// Footprint (X by Z) of the water, the deck border width, and the heights that
// give the pool its shape.
const WATER_SIZE = [6, 6];
const DECK_WIDTH = 0.7;
const WATER_THICKNESS = 0.12; // thin slab; its top sits at POOL_POSITION.y
const BASIN_DEPTH = 0.6; // dark interior below the water, for visible depth
const DECK_HEIGHT = 0.25; // low enough to step over (< MAX_STEP_HEIGHT)

// Unlit colours matching the world's baked-basic palette.
const WATER_COLOR = "#3aa6d6";
const BASIN_COLOR = "#0d4f63";
const DECK_COLOR = "#c8c8c2";

/**
 * The new plaza swimming pool. Renders four low deck rails around a flat water
 * slab over a darker basin. All meshes are unlit MeshBasicMaterial to match the
 * surrounding baked geometry, and the water is semi-transparent like the
 * existing pool. Accepts the usual group props (e.g. a collider ref).
 */
export default function Pool(props) {
  const [sizeX, sizeZ] = WATER_SIZE;
  const outerX = sizeX + DECK_WIDTH * 2;
  // Deck rails sit centred between the water edge and the outer footprint.
  const railOffsetX = (sizeX + DECK_WIDTH) / 2;
  const railOffsetZ = (sizeZ + DECK_WIDTH) / 2;

  return (
    <group {...props} position={POOL_POSITION} dispose={null}>
      {/* Darker basin just under the water for a sense of depth. */}
      <mesh position={[0, -WATER_THICKNESS - BASIN_DEPTH / 2, 0]}>
        <boxGeometry args={[sizeX, BASIN_DEPTH, sizeZ]} />
        <meshBasicMaterial color={BASIN_COLOR} toneMapped={false} />
      </mesh>

      {/* Flat water surface; its top sits exactly at POOL_POSITION.y so the
          character walks on it like the existing pool. */}
      <mesh position={[0, -WATER_THICKNESS / 2, 0]}>
        <boxGeometry args={[sizeX, WATER_THICKNESS, sizeZ]} />
        <meshBasicMaterial
          color={WATER_COLOR}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>

      {/* Low tiled deck framing the water on all four sides. */}
      {[
        { pos: [0, DECK_HEIGHT / 2, railOffsetZ], size: [outerX, DECK_HEIGHT, DECK_WIDTH] },
        { pos: [0, DECK_HEIGHT / 2, -railOffsetZ], size: [outerX, DECK_HEIGHT, DECK_WIDTH] },
        { pos: [railOffsetX, DECK_HEIGHT / 2, 0], size: [DECK_WIDTH, DECK_HEIGHT, sizeZ] },
        { pos: [-railOffsetX, DECK_HEIGHT / 2, 0], size: [DECK_WIDTH, DECK_HEIGHT, sizeZ] },
      ].map((rail, index) => (
        <mesh key={index} position={rail.pos}>
          <boxGeometry args={rail.size} />
          <meshBasicMaterial color={DECK_COLOR} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}
