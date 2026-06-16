// File: src/Experience/sequence/BlockBreak.jsx
//
// Sentience world — reusable voxel "block break" structure and shatter effect.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add instanced block-break effect.
//
// Renders a set of coloured cubes as a single InstancedMesh. While intact the
// cubes sit at their given grid positions; when `broken` flips true each cube is
// launched outward from the cluster centre with gravity, spin, and a shrink-to-
// nothing fade, plus a brief additive light flash — reproducing the reference
// "exploding blocks" look. The effect is ref-driven in useFrame (no GSAP), in
// keeping with the project's existing animation style.

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

const DURATION = 2.2; // seconds for the shatter to fully fade
const GRAVITY = -26; // units / s^2 on flying debris

/**
 * BlockBreak renders breakable voxel blocks.
 *
 * @param {{x:number,y:number,z:number,color:string}[]} blocks cube definitions
 * @param {number} size cube edge length in world units
 * @param {boolean} broken when true, triggers the one-shot shatter
 * @param {() => void} [onComplete] called once the shatter has fully faded
 */
export default function BlockBreak({ blocks, size = 1.3, broken = false, onComplete }) {
  const meshRef = useRef();
  const flashRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Per-instance physics, allocated once; populated on the breaking edge.
  const sim = useRef({ started: false, t: 0, vel: [], spin: [] });

  // Cluster centre, used as the explosion origin and the flash position.
  const center = useMemo(() => {
    const c = new THREE.Vector3();
    blocks.forEach((b) => c.add(new THREE.Vector3(b.x, b.y, b.z)));
    if (blocks.length) c.multiplyScalar(1 / blocks.length);
    return c;
  }, [blocks]);

  // Lay out the intact grid and assign per-instance colours once.
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    blocks.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(b.color));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [blocks, dummy, color]);

  // Seed debris velocities on the rising edge of `broken`.
  useEffect(() => {
    if (!broken) return;
    const vel = [];
    const spin = [];
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      const dir = new THREE.Vector3(b.x - center.x, b.y - center.y, b.z - center.z);
      if (dir.lengthSq() < 1e-4) dir.set(0, 1, 0);
      dir.normalize();
      const speed = 6 + Math.random() * 10;
      vel.push(
        new THREE.Vector3(
          dir.x * speed + (Math.random() - 0.5) * 4,
          Math.abs(dir.y) * speed + 4 + Math.random() * 6,
          dir.z * speed + (Math.random() - 0.5) * 4,
        ),
      );
      spin.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
        ),
      );
    }
    sim.current = { started: true, t: 0, vel, spin };
  }, [broken, blocks, center]);

  useFrame((_, delta) => {
    const s = sim.current;
    const mesh = meshRef.current;
    if (!s.started || !mesh) return;
    const step = Math.min(delta, 0.05);
    s.t += step;
    const k = Math.min(1, s.t / DURATION);
    const scale = Math.max(0, 1 - k); // shrink to nothing

    for (let i = 0; i < blocks.length; i++) {
      const v = s.vel[i];
      v.y += GRAVITY * step;
      const b = blocks[i];
      b.x += v.x * step;
      b.y += v.y * step;
      b.z += v.z * step;
      const sp = s.spin[i];
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(sp.x * s.t, sp.y * s.t, sp.z * s.t);
      dummy.scale.setScalar(scale <= 0 ? 0.0001 : scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // Light flash: a quick additive bloom at the cluster centre.
    if (flashRef.current) {
      const f = Math.max(0, 1 - s.t / 0.5);
      flashRef.current.material.opacity = f * 0.9;
      const fs = 6 + (1 - f) * 14;
      flashRef.current.scale.setScalar(fs);
      flashRef.current.visible = f > 0;
    }

    if (k >= 1) {
      s.started = false;
      mesh.visible = false;
      if (onComplete) onComplete();
    }
  });

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, blocks.length]} frustumCulled={false}>
        <boxGeometry args={[size * 0.96, size * 0.96, size * 0.96]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={flashRef} position={[center.x, center.y, center.z]} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
