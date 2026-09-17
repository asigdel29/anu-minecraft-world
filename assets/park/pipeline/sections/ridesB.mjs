// Rides B: The Library (book carousel), Hardware Workshop, Launch Tower, and
// Fortune Booth — ported from the staged Blender sections (sec_rides_b.py)
// into park space (y-up).

import {
  boxGeometry,
  cylinderGeometry,
  coneGeometry,
  sphereGeometry,
  torusGeometry,
  torusGeometryVertical,
} from "../lib/primitives.mjs";

// --- The Library: book-carousel (platform, roof, book "horses") -------------
export function buildLibrary(scene) {
  const lx = 12.0;
  const lz = 30.0;
  scene.add(cylinderGeometry(4.0, 0.5, lx, lz, 0, 32), "dark");
  scene.add(torusGeometry(4.0, 0.16, lx, lz, 0.55), "neon_cyan");
  scene.add(cylinderGeometry(0.4, 4.2, lx, lz, 0.5, 16), "metal");
  scene.add(coneGeometry(4.7, 1.9, lx, lz, 4.6, 32), "neon_magenta");
  scene.add(torusGeometry(4.35, 0.15, lx, lz, 4.72), "neon_yellow");
  const bookColors = ["neon_cyan", "white", "neon_yellow", "neon_magenta", "neon_green"];
  for (let i = 0; i < 4; i += 1) {
    const ang = (Math.PI / 2) * i + Math.PI / 4;
    const bx = lx + 2.6 * Math.cos(ang);
    const bz = lz + 2.6 * Math.sin(ang);
    scene.add(cylinderGeometry(0.07, 3.4, bx, bz, 0.5, 8), "metal");
    for (let j = 0; j < 5; j += 1) {
      scene.add(boxGeometry(0.95, 0.72, 0.3, bx, bz, 0.85 + j * 0.33, ang), bookColors[j]);
    }
  }
  scene.colliderBox(8.4, 8.4, 6.5, lx, lz, 0);
  return scene;
}

// --- Hardware Workshop: tent, bench, tool wall, crates ----------------------
export function buildHardware(scene) {
  const hx = -40.0;
  const hz = -8.0;
  scene.add(boxGeometry(11, 9, 0.15, hx, hz, 0), "wood");
  scene.add(coneGeometry(4.6, 4.4, hx, hz, 0.15, 8, Math.PI / 4), "canvas");
  scene.add(cylinderGeometry(0.06, 1.6, hx, hz, 4.5, 8), "metal");
  scene.add(boxGeometry(0.9, 0.08, 0.55, hx + 0.5, hz, 5.5), "neon_orange");
  scene.add(boxGeometry(3.2, 1.1, 0.95, hx + 2.2, hz + 2.6, 0.15), "wood");
  scene.add(boxGeometry(3.2, 0.2, 2.1, hx + 2.2, hz + 3.3, 1.3), "dark");
  const toolColors = ["neon_orange", "neon_yellow", "neon_cyan", "neon_warm"];
  for (let i = 0; i < 4; i += 1) {
    scene.add(boxGeometry(0.5, 0.28, 0.5, hx + 1.1 + i * 0.75, hz + 3.1, 1.7), toolColors[i]);
  }
  const crates = [
    [-43.0, -10.0, 0.15],
    [-41.6, -10.2, 0.15],
    [-42.4, -10.1, 1.3],
  ];
  for (const [cx2, cz2, cz3] of crates) {
    scene.add(boxGeometry(1.15, 1.15, 1.15, cx2, cz2, cz3), "wood");
  }
  const bulbs = [[-42.6, -4.2], [-40.0, -3.8], [-37.4, -4.2]];
  for (const [bx2, bz2] of bulbs) {
    scene.add(sphereGeometry(0.17, bx2, bz2, 3.1, 8), "neon_warm");
  }
  scene.colliderBox(9, 9, 4.5, hx, hz, 0);
  scene.colliderBox(3.2, 1.1, 1.2, hx + 2.2, hz + 2.6, 0.15);
  scene.colliderBox(3.4, 3.4, 2.5, -42.3, -10.1, 0.15);
  return scene;
}

// --- Launch Tower: striped column, gondola ring, beacon ---------------------
export function buildLaunchTower(scene) {
  const tx = 36.0;
  const tz = 16.0;
  scene.add(boxGeometry(6.5, 6.5, 0.4, tx, tz, 0), "dark");
  scene.add(boxGeometry(2.2, 2.2, 15, tx, tz, 0.4), "metal");
  for (const sx of [-0.95, 0.95]) {
    for (const sz of [-0.95, 0.95]) {
      scene.add(boxGeometry(0.16, 0.16, 14.2, tx + sx, tz + sz, 0.6), "neon_cyan");
    }
  }
  scene.add(boxGeometry(3.4, 0.7, 0.85, tx, tz, 9.6), "neon_magenta");
  scene.add(boxGeometry(0.7, 3.4, 0.85, tx, tz, 9.6), "neon_magenta");
  scene.add(cylinderGeometry(0.07, 1.6, tx, tz, 15.4, 8), "metal");
  scene.add(sphereGeometry(0.5, tx, tz, 17.2, 12), "neon_yellow");
  scene.colliderBox(2.6, 2.6, 15.4, tx, tz, 0);
  return scene;
}

// --- Fortune Booth: pyramid roof, glowing window, crystal ball --------------
export function buildFortune(scene) {
  const ox = 4.0;
  const oz = -6.0;
  scene.add(boxGeometry(3.4, 3.4, 3.0, ox, oz, 0), "booth");
  scene.add(coneGeometry(2.7, 1.5, ox, oz, 3.0, 4, Math.PI / 4), "neon_magenta");
  scene.add(boxGeometry(2.0, 0.12, 1.4, ox, oz - 1.74, 1.0), "pale");
  scene.add(boxGeometry(2.3, 0.16, 0.16, ox, oz - 1.76, 2.45), "neon_purple");
  scene.add(boxGeometry(2.4, 0.7, 0.9, ox, oz - 2.0, 0), "dark");
  scene.add(cylinderGeometry(0.4, 0.7, ox - 1.1, oz + 1.0, 0, 12), "dark");
  scene.add(sphereGeometry(0.58, ox - 1.1, oz + 1.0, 1.35, 16), "neon_cyan");
  scene.add(torusGeometryVertical(0.85, 0.16, ox, oz, 5.6), "neon_purple");
  scene.colliderBox(3.8, 3.8, 4.5, ox, oz, 0);
  return scene;
}
