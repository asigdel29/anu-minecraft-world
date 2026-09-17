# Park assets (LOR-2423)

The night-carnival park world geometry is eight compressed GLBs — one per
attraction (7) plus shared ground/props — living in `public/models/park/` and
served at `/models/park/`; the generating pipeline stays under
`assets/park/pipeline/`. The runtime mounts them in
`src/Experience/park/ParkModels.jsx` the same way island chunks are loaded
(`*-transformed.glb`, Draco, `colliders` subtrees, world-coordinate geometry
with identity node transforms).

## Provenance: procedural fallback (approved deviation)

**These assets are procedurally generated with a Node/three.js + glTF-Transform
pipeline, with Anu's explicit approval.** This deviates from the original
LOR-2423 contract that called for Blender-authored geometry with `.blend`
sources: the Blender MCP connection was unavailable for authoring at delivery
time (addon disconnected), and the approved fallback is deterministic
Node-authored geometry.

### Migration path back to Blender-authored assets

A staged Blender MCP builder exists outside the repo (blender-python sections
under `stage-assets/src/`: `preamble.py`, `sec_ground.py`, `sec_rides_a.py`,
`sec_rides_b.py`, `sec_extras.py`) implementing the same layout and collection
structure (one collection per attraction, `colliders` proxy subtrees, neon
night-carnival palette). If the BlenderMCP addon reconnects later:

1. run the staged builder sections through `execute_blender_code`,
2. export per-collection GLBs at the same attraction origins,
3. compress through this directory's `compress-park.sh`,
4. replace the `*-transformed.glb` files via PR — no runtime code changes; the
   material contract (flat `baseColorFactor` → unlit `MeshBasicMaterial` via
   `convertMaterial.jsx`) is identical for both authoring paths.

Until then, do not hand-edit the GLBs — they are generated. Rebuild them with
the pipeline below.

## Pipeline

Self-contained parallel entry at `assets/park/pipeline/` — the island pipeline
(`assets/pipeline/`) is untouched.

```
pipeline/
  lib/manifest.mjs      park layout source of truth (mirrors staged park-nav
                        patch 0001: PARK_BOUNDS + 7 attraction positions)
  lib/palette.mjs       night-carnival palette (sRGB→linear flat materials)
  lib/primitives.mjs    world-space box/cylinder/cone/sphere/torus helpers
  lib/scene.mjs         per-attraction scene assembly + per-color merge +
                        collider subtree wiring
  sections/ground.mjs   lawn, paths, gate, fence, lamps, mascots, balloon
                        landmark, construction zones
  sections/ridesA.mjs   Agent Arcade, The Factory, Idea Graveyard
  sections/ridesB.mjs   The Library, Hardware Workshop, Launch Tower,
                        Fortune Booth
  build.mjs             exports one raw GLB per key (three.js GLTFExporter,
                        identity transforms, world-baked geometry, `colliders`
                        node)
  compress-park.sh      gltf-transform optimize: Draco geometry, no simplify,
                        no flatten/join (named hierarchy must survive), no
                        palette/instance. No WebP step — the fallback emits no
                        textures (island compress.sh runs textureCompress only
                        when textures exist)
  scratch/index.html    minimal three.js render check for the 8 GLBs
                        (CDN three; verification harness, not app wiring)
```

Rebuild:

```bash
cd assets/park/pipeline
npm install
node build.mjs        # raw GLBs → pipeline/build/
./compress-park.sh    # Draco → public/models/park/<key>-transformed.glb
```

Verify (also runs in CI):

```bash
npx vitest run src/assets/park/parkAssets.test.js
```

Manual render check (not wired into the app):

```bash
cd <repo root> && python3 -m http.server 8123
# open http://localhost:8123/assets/park/pipeline/scratch/
```

## Size budgets (measured, replaces the stale 54 MB island claim)

Enforced by `src/assets/park/parkAssets.test.js`: ≤ 2 MB per GLB, ≤ 12 MB
total.

| GLB                       | measured | budget |
| ------------------------- | -------: | -----: |
| agent-arcade-transformed  |  5.5 KB  | 2.0 MB |
| factory-transformed       |  9.3 KB  |  2.0 MB |
| idea-graveyard-transformed|  5.7 KB  |  2.0 MB |
| library-transformed       |  8.7 KB  |  2.0 MB |
| hardware-transformed      |  7.8 KB  |  2.0 MB |
| launch-tower-transformed  |  5.3 KB  |  2.0 MB |
| fortune-transformed       |  6.6 KB  |  2.0 MB |
| ground-transformed        | 16.3 KB  |  2.0 MB |
| **total**                 | **65.2 KB** | **12.0 MB** |

The GLBs are the binary payload; their only cap is the budget. All text slices
of the pipeline stay under 300 changed lines per commit.

## Runtime contract

Enforced by the colocated test, matching `Chunk.jsx` and
`convertMaterial.jsx`:

- binary glTF (`*.glb`), Draco geometry (`KHR_draco_mesh_compression`)
- a node named exactly `colliders` (hidden + registered with the collider
  system at load)
- identity node transforms — geometry is baked in world coordinates; the
  park manifest drives placement, not node transforms
- textureless flat `baseColorFactor` materials → unlit `MeshBasicMaterial` at
  runtime; no fabricated baked-lighting textures