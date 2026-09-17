// Park GLB builder — LOR-2423 night-carnival park.
//
// Authoring: deterministic procedural geometry (three.js BufferGeometry
// primitives), world-space baked with identity node transforms, flat
// base-color materials (the island pipeline's unlit "props" contract).
// Emission: one GLB per attraction plus one shared ground/props GLB, written
// uncompressed to build/raw/, then compressed by compress-park.sh into
// assets/park/<key>-transformed.glb (Draco, mirroring the island's
// compress.sh).
//
// Coordinate space: park space from the staged park-nav manifest — x/z ground
// plane, y up. Positions come from lib/manifest.mjs and must not drift.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { ParkScene } from "./lib/scene.mjs";
import { GROUND_KEY } from "./lib/manifest.mjs";
import { buildGround } from "./sections/ground.mjs";
import { buildArcade, buildFactory, buildGraveyard } from "./sections/ridesA.mjs";
import {
  buildLibrary,
  buildHardware,
  buildLaunchTower,
  buildFortune,
} from "./sections/ridesB.mjs";

const BUILDERS = {
  [GROUND_KEY]: buildGround,
  "agent-arcade": buildArcade,
  factory: buildFactory,
  "idea-graveyard": buildGraveyard,
  library: buildLibrary,
  hardware: buildHardware,
  "launch-tower": buildLaunchTower,
  fortune: buildFortune,
};

// GLTFExporter's binary path needs FileReader (Node 20 exposes Blob but not
// FileReader). Only the surface the exporter uses is provided; the result is
// delivered in a microtask because the exporter assigns onloadend after
// calling readAsArrayBuffer.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReaderPolyfill {
    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf;
          if (typeof this.onloadend === "function") {
            this.onloadend();
          }
        })
        .catch((err) => {
          if (typeof this.onerror === "function") this.onerror(err);
          else throw err;
        });
    }
  };
}

const here = dirname(fileURLToPath(import.meta.url));
const RAW_DIR = resolve(here, "build/raw");
mkdirSync(RAW_DIR, { recursive: true });

const exporter = new GLTFExporter();
const summary = [];

for (const key of Object.keys(BUILDERS)) {
  const scene = new ParkScene();
  BUILDERS[key](scene);
  const { group, colliderGroup } = scene.toGroup();
  const root = new THREE.Group();
  root.name = key;
  root.add(group);
  root.add(colliderGroup);

  const glb = await exporter.parseAsync(root, { binary: true });
  const outPath = resolve(RAW_DIR, `${key}.glb`);
  writeFileSync(outPath, Buffer.from(glb));
  summary.push({ key, parts: scene.partCount(), bytes: glb.byteLength });
  console.log(`built ${key}: ${scene.partCount()} parts, ${glb.byteLength} bytes (raw)`);
}

console.log(JSON.stringify(summary));
