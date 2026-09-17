// Scene builder: collects primitive parts as pure data, merges them per
// material color into world-space meshes, and assembles a THREE.Group ready
// for GLTFExporter binary output. Collider proxies go under a child node
// named "colliders" — the island contract (Chunk.jsx:
// root.getObjectByName("colliders"), hidden at runtime and registered with
// the collider registry when chunks load with colliders enabled).

import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { PALETTE } from "./palette.mjs";
import { boxGeometry } from "./primitives.mjs";

export class ParkScene {
  constructor() {
    /** @type {{ geometry: THREE.BufferGeometry, colorKey: string }[]} */
    this.parts = [];
    /** @type {{ w:number, d:number, h:number, x:number, z:number, y0:number }[]} */
    this.colliders = [];
  }

  /** Add a world-space geometry part under a palette color key. */
  add(geometry, colorKey) {
    this.parts.push({ geometry, colorKey });
  }

  /** Register an axis-aligned collision proxy (world-space box). */
  colliderBox(w, d, h, px, pz, y0) {
    this.colliders.push({ w, d, h, x: px, z: pz, y0 });
  }

  partCount() {
    return this.parts.length;
  }

  /** Merge parts per color into meshes; returns { group, colliderGroup }. */
  toGroup() {
    const byColor = new Map();
    for (const part of this.parts) {
      const list = byColor.get(part.colorKey) ?? [];
      list.push(part.geometry);
      byColor.set(part.colorKey, list);
    }
    const group = new THREE.Group();
    group.name = "park-content";
    for (const [colorKey, geos] of byColor) {
      const merged = mergeGeometries(geos, false);
      if (!merged) {
        throw new Error(`mergeGeometries returned null for ${colorKey}`);
      }
      const mesh = new THREE.Mesh(
        merged,
        new THREE.MeshBasicMaterial({ color: PALETTE[colorKey] })
      );
      mesh.name = `park_${colorKey}`;
      group.add(mesh);
    }
    const colliderGroup = new THREE.Group();
    colliderGroup.name = "colliders";
    if (this.colliders.length > 0) {
      const proxies = this.colliders.map((c) =>
        boxGeometry(c.w, c.d, c.h, c.x, c.z, c.y0)
      );
      const merged = mergeGeometries(proxies, false);
      if (!merged) {
        throw new Error("mergeGeometries returned null for colliders");
      }
      const proxyMesh = new THREE.Mesh(
        merged,
        new THREE.MeshBasicMaterial({ color: PALETTE.collider_proxy })
      );
      proxyMesh.name = "collider_proxies";
      colliderGroup.add(proxyMesh);
    }
    return { group, colliderGroup };
  }
}
