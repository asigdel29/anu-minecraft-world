# Asset pipeline

The world's source of truth is `assets/island.blend`. The shipped GLBs under
`public/models/island/` are derived from it by two scripts — never hand-edit
the GLBs, and never let the .blend and the shipped files drift (the original
Minecraft world suffered exactly that).

## Layout constraints

The house must preserve, exactly:

- interior floor slab tops at world y `67.5 / 73.0 / 78.4`
  (`src/data/floors.js` — all portfolio panel placement derives from them);
- interior panel-wall faces at world z `-3.3 / -2.6 / -1.9` per storey;
- stair risers no taller than `MAX_STEP_HEIGHT` (0.65) from
  `src/Experience/controls/stepUp.js` — this is the movement-feel contract.

The `CONSTRAINTS` collection in the .blend holds empties marking these planes.

## Export

```
blender -b assets/island.blend -P assets/pipeline/bake_export.py -- <out_dir>
sh assets/pipeline/compress.sh <out_dir>
```

`bake_export.py` merges, UV-unwraps, and bakes each export unit with Cycles
(sun + sky), then wires the bake into the material's Emission socket with a
black base color. That is the engine contract: `convertMaterial.jsx` turns
`emissiveTexture` into an unlit `MeshBasicMaterial` map; a base-color texture
with alpha becomes a foliage cutout; a bare base color becomes a flat-color
unlit material (the prop clusters ship this way, unbaked).

`compress.sh` Draco-compresses geometry and converts textures to WebP into
`public/models/island/*-transformed.glb`. (KTX2/Basis would halve GPU memory
but needs the external `ktx` binary; WebP matches what the original house
GLB shipped with. Follow-up welcome.)

## Chunk contract

Terrain exports as four quadrants, each spanning 5x5 cells of the 32-unit
grid in `src/Experience/terrain/chunkManifest.js` (`spanX`/`spanZ`). Each
carries a `colliders`-named subtree holding a decimated collision proxy —
the scene raycasts only that subtree, never the visual mesh. New chunks must
export with world-coordinate geometry and identity node transforms.

## Gotchas the pipeline already handles

- Export duplicates coincide with their source objects; sources are hidden
  from rendering before baking or every bake comes out black.
- The REFERENCE collection (the imported original world) is deleted in the
  headless copy so its names (`House`, `MergedBake`) don't force Blender to
  suffix the export names.
- Sun energy 2.0 / sky strength 1.2 keeps the bake unclipped (values above
  ~1.0 clamp to white in the PNG) with lifted, saturated shadows.
