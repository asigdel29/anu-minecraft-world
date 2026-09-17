// Primitive helpers: build world-space, y-up BufferGeometry in park
// coordinates with identity node transforms (the island "APPLY" contract —
// vertices land in park space directly; GLB nodes carry no transforms).
// Every helper bakes its transform before returning, so parts can be merged
// losslessly per material.

import * as THREE from "three";

/** Axis box in park space: w along x, d along z, h up, base at (px, pz), y=z0. */
export function boxGeometry(w, d, h, px, pz, z0, rotY = 0) {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (rotY) geo.rotateY(rotY);
  geo.translate(px, z0 + h / 2, pz);
  return geo;
}

/** Cylinder, base at (px, pz, z0), axis up. */
export function cylinderGeometry(r, h, px, pz, z0, seg = 12) {
  const geo = new THREE.CylinderGeometry(r, r, h, seg);
  geo.translate(px, z0 + h / 2, pz);
  return geo;
}

/** Cone, base at (px, pz, z0), apex up. */
export function coneGeometry(r, h, px, pz, z0, seg = 12, rotY = 0) {
  const geo = new THREE.ConeGeometry(r, h, seg);
  if (rotY) geo.rotateY(rotY);
  geo.translate(px, z0 + h / 2, pz);
  return geo;
}

/** UV sphere centered at (px, pz, zc); scale is [x, y, z]. */
export function sphereGeometry(r, px, pz, zc, seg = 12, scale = [1, 1, 1]) {
  const geo = new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg / 2)));
  geo.scale(scale[0], scale[1], scale[2]);
  geo.translate(px, zc, pz);
  return geo;
}

/** Torus lying flat on the ground plane (ring around y), center (px, pz, zc). */
export function torusGeometry(bigR, smallR, px, pz, zc, seg = 16) {
  const geo = new THREE.TorusGeometry(bigR, smallR, Math.max(6, seg / 2), seg);
  geo.rotateX(Math.PI / 2);
  geo.translate(px, zc, pz);
  return geo;
}

/** Torus standing vertically (ring in the XY plane, facing along z). */
export function torusGeometryVertical(bigR, smallR, px, pz, zc, seg = 16) {
  const geo = new THREE.TorusGeometry(bigR, smallR, Math.max(6, seg / 2), seg);
  geo.translate(px, zc, pz);
  return geo;
}

/**
 * Deterministic PRNG (mulberry32) for decorative jitter — replaces Python's
 * random.seed(7) so rebuilds are byte-stable.
 */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
