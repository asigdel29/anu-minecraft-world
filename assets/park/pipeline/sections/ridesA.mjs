// Rides A: Agent Arcade, The Factory, Idea Graveyard — one builder per
// attraction, ported from the staged Blender sections (sec_rides_a.py) into
// park space (y-up). Each builder populates one GLB; colliders are simplified
// axis-aligned proxies under the "colliders" subtree.

import {
  boxGeometry,
  cylinderGeometry,
  coneGeometry,
  sphereGeometry,
  torusGeometry,
  torusGeometryVertical,
  rng,
} from "../lib/primitives.mjs";

// --- Agent Arcade: cabinet row under a marquee, glow ring floor -------------
export function buildArcade(scene) {
  const ax = -38.0;
  const az = 22.0;
  scene.add(boxGeometry(10, 8, 0.3, ax, az, 0), "dark");
  const cabs = ["neon_cyan", "neon_magenta", "neon_yellow"];
  for (let i = 0; i < 3; i += 1) {
    const cx = ax - 3 + i * 3;
    scene.add(boxGeometry(1.3, 1.0, 2.1, cx, az - 1.6, 0.3), "dark");
    scene.add(boxGeometry(1.0, 0.12, 0.75, cx, az - 2.12, 1.15), cabs[i]);
    scene.add(boxGeometry(1.3, 0.18, 0.3, cx, az - 2.05, 2.0), cabs[i]);
  }
  // Marquee: two posts, dark panel, neon underline.
  scene.add(boxGeometry(0.3, 0.3, 4, ax - 3.1, az + 2.6, 0), "metal");
  scene.add(boxGeometry(0.3, 0.3, 4, ax + 3.1, az + 2.6, 0), "metal");
  scene.add(boxGeometry(7.0, 0.35, 1.5, ax, az + 2.6, 2.4), "dark");
  scene.add(boxGeometry(6.5, 0.42, 0.3, ax, az + 2.6, 2.75), "neon_cyan");
  scene.add(torusGeometry(2.4, 0.14, ax, az + 0.8, 0.12), "neon_magenta");
  scene.colliderBox(10, 8, 2.5, ax, az, 0);
  return scene;
}

// --- The Factory: warehouse, ringed smokestacks, smoke puffs ----------------
export function buildFactory(scene) {
  const fx = 30.0;
  const fz = -18.0;
  scene.add(boxGeometry(13, 10, 0.3, fx, fz, 0), "dark");
  scene.add(boxGeometry(8, 5, 3.6, fx, fz + 1, 0.3), "metal");
  scene.add(boxGeometry(8.4, 5.4, 0.35, fx, fz + 1, 3.9), "neon_orange");
  scene.add(boxGeometry(1.8, 0.15, 2.2, fx, fz - 1.42, 0.3), "neon_yellow");
  for (const sx of [fx - 3.2, fx + 3.2]) {
    scene.add(cylinderGeometry(0.85, 8.5, sx, fz - 2.5, 0.3, 16), "dark");
    scene.add(torusGeometry(0.95, 0.13, sx, fz - 2.5, 7.2), "neon_cyan");
    const puffs = [[0.75, 9.6], [0.55, 10.6], [0.4, 11.5]];
    for (const [r, h] of puffs) {
      scene.add(sphereGeometry(r, sx, fz - 2.5, h, 10), "smoke");
    }
  }
  scene.add(torusGeometryVertical(1.3, 0.28, fx, fz + 3.62, 5.4), "neon_magenta");
  scene.colliderBox(8, 5, 4, fx, fz + 1, 0.3);
  scene.colliderBox(2, 2, 8.8, fx - 3.2, fz - 2.5, 0.3);
  scene.colliderBox(2, 2, 8.8, fx + 3.2, fz - 2.5, 0.3);
  return scene;
}

// --- Idea Graveyard: gate, tilted tombstones, dead tree, ghost --------------
export function buildGraveyard(scene) {
  const gx = -14.0;
  const gz = -34.0;
  const rand = rng(7);
  scene.add(boxGeometry(14, 11, 0.12, gx, gz, 0), "soil");
  scene.add(boxGeometry(0.9, 0.9, 3.4, gx - 3, gz + 4.4, 0), "stone");
  scene.add(boxGeometry(0.9, 0.9, 3.4, gx + 3, gz + 4.4, 0), "stone");
  scene.add(boxGeometry(7.2, 1.0, 0.9, gx, gz + 4.4, 3.4), "stone");
  scene.add(boxGeometry(6.2, 0.5, 0.28, gx, gz + 4.4, 2.9), "neon_green");
  for (let i = 0; i < 8; i += 1) {
    const tx = gx - 5.5 + (i % 4) * 3.6;
    const tz = gz - 3.5 + Math.floor(i / 4) * 2.8;
    const tilt = rand() * 0.5 - 0.25; // ±0.25 rad decorative yaw jitter
    scene.add(boxGeometry(0.85, 0.28, 1.15, tx, tz, 0.12, tilt), "stone");
  }
  scene.add(cylinderGeometry(0.26, 2.8, gx + 5.4, gz - 3.4, 0.12, 10), "dark");
  scene.add(boxGeometry(1.6, 0.18, 0.18, gx + 4.8, gz - 3.4, 2.5, 0.5), "dark");
  scene.add(boxGeometry(1.3, 0.15, 0.15, gx + 6.0, gz - 3.6, 2.1, -0.7), "dark");
  scene.add(sphereGeometry(0.55, gx - 1, gz - 0.5, 1.7, 12, [1, 1.25, 1]), "pale");
  scene.add(coneGeometry(0.4, 0.8, gx - 1, gz - 0.5, 0.9, 12), "pale");
  scene.colliderBox(1.6, 1.2, 3.4, gx - 3, gz + 4.4, 0);
  scene.colliderBox(1.6, 1.2, 3.4, gx + 3, gz + 4.4, 0);
  scene.colliderBox(0.8, 0.8, 2.9, gx + 5.4, gz - 3.4, 0);
  return scene;
}
