/*
The model is a three-storey stylized-island house (assets/island.blend,
exported by assets/pipeline/bake_export.py): tiered set-back storeys with
chamfered edges, gable roof, and interior stairs, merged to a single mesh
with sun and sky baked into one atlas. Interior floor heights and panel
walls match src/data/floors.js exactly. Geometry is baked in world
coordinates, so the mesh needs no position or rotation here.
*/


import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { convertMaterialsToMeshBasicMaterial } from "../utils/convertMaterial";

// Multiplier applied to the house's baked material colour. The scene is fully
// baked and unlit, so scaling the MeshBasicMaterial colour (which multiplies the
// texture) is the only runtime lever. The atlas is baked from flat emission, so
// it already reads at full brightness; keep this at 1.0 and tune against the dev
// server if the house needs to sit lighter or darker against the surroundings.
const INTERIOR_BRIGHTNESS = 1.0;

export default function Model(props) {
  const { nodes, materials } = useGLTFWithKTX2(
    "/models/island/House-transformed.glb"
  );
  convertMaterialsToMeshBasicMaterial(materials);
  // The house exports as exactly one mesh with one baked material; take both
  // by position rather than by name, which Blender may suffix on export
  // (House.001 / MergedBake.001) when the reference import owns the name.
  const geometry = Object.values(nodes).find((n) => n.geometry)?.geometry;
  const material = materials[Object.keys(materials)[0]];
  material.color.setScalar(INTERIOR_BRIGHTNESS);

  // Render the house in the opaque queue. Opaque geometry writes depth and lets
  // the GPU early-z reject the exterior shaded through window openings; left
  // transparent it tanks scroll framerate once the SkyShell occluder is gone.
  material.transparent = false;

  return (
    <group {...props} dispose={null}>
      <mesh geometry={geometry} material={material} />
    </group>
  );
}
