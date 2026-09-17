// Ground + shared props GLB: lawn, paths, entrance gate, perimeter fence,
// path lamps, mascots, the hot-air balloon landmark, and construction zones
// for the two not-yet-built attractions. Ported from the staged Blender
// builder sections (sec_ground.py + sec_extras.py) into park space (y-up).

import { PARK_BOUNDS, ATTRACTIONS } from "../lib/manifest.mjs";
import {
  boxGeometry,
  cylinderGeometry,
  sphereGeometry,
  torusGeometry,
} from "../lib/primitives.mjs";

export function buildGround(scene) {
  const { minX, maxX, minZ, maxZ } = PARK_BOUNDS;
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;
  const w = maxX - minX;
  const d = maxZ - minZ;

  // Lawn slab spanning PARK_BOUNDS exactly; paths are thin overlays.
  scene.add(boxGeometry(w, d, 0.5, cx, cz, -0.25), "lawn");
  scene.add(boxGeometry(4, d, 0.1, cx, cz, 0), "path");
  scene.add(boxGeometry(w, 4, 0.1, cx, cz, 0), "path");

  // L-shaped path spurs from the central cross to each attraction.
  for (const a of ATTRACTIONS) {
    if (Math.abs(a.x) > 2) {
      scene.add(boxGeometry(Math.abs(a.x), 2.5, 0.1, a.x / 2, a.z, 0), "path");
    }
    if (Math.abs(a.z - 2.5) > 2) {
      scene.add(boxGeometry(2.5, Math.abs(a.z - 2.5), 0.1, a.x, (a.z + 2.5) / 2, 0), "path");
    }
  }

  // Entrance gate on the south path; abstract neon signage (runtime <Text>
  // carries the glyphs, matching the GateSign pattern).
  scene.add(boxGeometry(1.2, 1.2, 5, -3.2, minZ, 0), "dark");
  scene.add(boxGeometry(1.2, 1.2, 5, 3.2, minZ, 0), "dark");
  scene.add(boxGeometry(8.8, 1.2, 1.1, 0, minZ, 5.0), "dark");
  scene.add(boxGeometry(7.6, 0.3, 0.35, 0, minZ, 4.35), "neon_magenta");
  const gateDots = ["neon_cyan", "neon_yellow", "neon_magenta"];
  for (let i = 0; i < 3; i += 1) {
    scene.add(boxGeometry(1.1, 0.25, 0.45, -2.6 + i * 2.6, minZ - 0.75, 2.0), gateDots[i]);
  }

  // Perimeter fence: posts every 7.5 units + one rail per side.
  const POST = 7.5;
  for (let i = 0; i <= Math.floor(w / POST); i += 1) {
    const x = minX + i * POST;
    scene.add(boxGeometry(0.35, 0.35, 1.4, x, minZ, 0), "metal");
    scene.add(boxGeometry(0.35, 0.35, 1.4, x, maxZ, 0), "metal");
  }
  for (let i = 1; i < Math.floor(d / POST); i += 1) {
    const z = minZ + i * POST;
    scene.add(boxGeometry(0.35, 0.35, 1.4, minX, z, 0), "metal");
    scene.add(boxGeometry(0.35, 0.35, 1.4, maxX, z, 0), "metal");
  }
  scene.add(boxGeometry(w, 0.14, 0.14, cx, minZ, 0.9), "metal");
  scene.add(boxGeometry(w, 0.14, 0.14, cx, maxZ, 0.9), "metal");
  scene.add(boxGeometry(0.14, d, 0.14, minX, cz, 0.9), "metal");
  scene.add(boxGeometry(0.14, d, 0.14, maxX, cz, 0.9), "metal");

  // Path lighting: poles with glowing orbs.
  const lamps = [
    [-3.5, -35], [3.5, -25], [-3.5, -5], [3.5, 5], [-3.5, 25], [3.5, 38],
  ];
  for (const [lx, lz] of lamps) {
    scene.add(cylinderGeometry(0.15, 4.0, lx, lz, 0, 10), "metal");
    scene.add(sphereGeometry(0.38, lx, lz, 4.35, 10), "neon_cyan");
  }

  // Mascots: spark bots near the arcade, library, and entrance.
  const mascots = [[-33.5, 18.5], [16.5, 26.0], [-2.0, -44.0]];
  for (const [mx, mz] of mascots) {
    scene.add(sphereGeometry(0.5, mx, mz, 0.7, 14, [1, 1.2, 1]), "neon_cyan");
    scene.add(sphereGeometry(0.33, mx, mz, 1.55, 14), "pale");
    scene.add(cylinderGeometry(0.03, 0.35, mx, mz, 1.85, 6), "metal");
    scene.add(sphereGeometry(0.09, mx, mz, 2.25, 8), "neon_magenta");
  }

  // Hot-air balloon landmark (the manifest's balloon-cam counterpart).
  const [bpx, bpz, bup] = [-5.0, 40.0, 22.0];
  scene.add(sphereGeometry(2.6, bpx, bpz, bup + 2.8, 20, [1, 1.2, 1]), "neon_magenta");
  scene.add(torusGeometry(2.55, 0.2, bpx, bpz, bup + 2.8), "neon_cyan");
  for (const [rxo, rzo] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) {
    scene.add(cylinderGeometry(0.035, 2.6, bpx + rxo, bpz + rzo, bup, 6), "dark");
  }
  scene.add(boxGeometry(1.3, 1.3, 1.0, bpx, bpz, bup), "wood");

  // Construction zones for the not-yet-built attractions.
  buildConstructionZone(scene, -25.0, 45.0);
  buildConstructionZone(scene, 22.0, -38.0);

  // Ground collider: the walkable slab itself.
  scene.colliderBox(w, d, 0.5, cx, cz, -0.25);
  return scene;
}

function buildConstructionZone(scene, zx, zz) {
  scene.add(boxGeometry(8, 8, 0.12, zx, zz, 0), "soil");
  const corners = [
    [-3.5, -3.5], [0, -3.5], [3.5, -3.5], [3.5, 0],
    [3.5, 3.5], [0, 3.5], [-3.5, 3.5], [-3.5, 0],
  ];
  for (const [dx, dz] of corners) {
    scene.add(boxGeometry(0.18, 0.18, 1.3, zx + dx, zz + dz, 0.12), "neon_orange");
  }
  scene.add(boxGeometry(7.2, 0.12, 0.12, zx, zz - 3.5, 1.0), "neon_orange");
  scene.add(boxGeometry(0.12, 7.2, 0.12, zx - 3.5, zz, 1.0), "neon_orange");
  for (const [dx, dz] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) {
    scene.add(cylinderGeometry(0.09, 3.2, zx + dx, zz + dz, 0.12, 8), "metal");
  }
  for (const h of [1.6, 3.1]) {
    scene.add(boxGeometry(4.2, 0.12, 0.12, zx, zz, h), "metal");
    scene.add(boxGeometry(0.12, 4.2, 0.12, zx, zz, h), "metal");
  }
  // Crane.
  scene.add(boxGeometry(0.5, 0.5, 6.5, zx + 2.8, zz + 2.8, 0.12), "neon_yellow");
  scene.add(boxGeometry(5.0, 0.4, 0.4, zx + 0.2, zz + 2.8, 6.7), "neon_yellow");
  scene.add(boxGeometry(1.6, 0.4, 0.4, zx + 3.9, zz + 2.8, 6.7), "metal");
  scene.add(cylinderGeometry(0.03, 1.8, zx - 1.2, zz + 2.8, 4.9, 6), "dark");
  // Unfinished ride base + coming-soon sign.
  scene.add(cylinderGeometry(1.5, 0.8, zx - 1.5, zz - 1.5, 0.12, 16), "stone");
  scene.add(boxGeometry(2.2, 0.12, 1.1, zx, zz - 3.3, 1.3), "dark");
  scene.add(boxGeometry(1.8, 0.16, 0.22, zx, zz - 3.3, 1.85), "neon_orange");
  scene.colliderBox(8, 8, 1.5, zx, zz, 0);
}
