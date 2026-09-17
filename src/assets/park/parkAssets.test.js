// Budget + reference checks for the park GLB pipeline (LOR-2423).
//
// Pure module over node:fs — no app code, no DOM. Three gates:
// 1. every GLB the park manifest expects exists at assets/park/
// 2. per-file ≤ 2 MB and park-total ≤ 12 MB (replaces the stale island
//    "54 MB" claim with measured numbers)
// 3. each GLB honors the runtime contract: glTF binary magic, Draco
//    geometry, a "colliders" node subtree, and identity node transforms
//    (world-baked geometry — Chunk.jsx drives placement from the manifest)

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ATTRACTIONS,
  GLB_KEYS,
} from "../../../assets/park/pipeline/lib/manifest.mjs";

const PER_FILE_BUDGET = 2 * 1024 * 1024;
const TOTAL_BUDGET = 12 * 1024 * 1024;

// The seven attraction ids from the staged park-nav manifest — the GLB set
// must match one-to-one.
const PARK_NAV_IDS = [
  "agent-arcade",
  "factory",
  "idea-graveyard",
  "library",
  "hardware",
  "launch-tower",
  "fortune",
];

const here = dirname(fileURLToPath(import.meta.url));
const parkDir = resolve(here, "../../../assets/park");

function glbPath(key) {
  return join(parkDir, `${key}-transformed.glb`);
}

function readGlbJson(path) {
  const buf = readFileSync(path);
  // Binary glTF container: 12-byte header, then a JSON chunk.
  expect(buf.readUInt32BE(0), `${path} is not a GLB (bad magic)`).toBe(
    0x676c5446 // "glTF"
  );
  const jsonLen = buf.readUInt32LE(12);
  return JSON.parse(buf.subarray(20, 20 + jsonLen).toString("utf8"));
}

function isIdentityTransform(node) {
  if (node.matrix) {
    return node.matrix.every((v, i) => v === (i % 5 === 0 ? 1 : 0));
  }
  const t = node.translation;
  const r = node.rotation;
  const s = node.scale;
  if (t && !t.every((v) => v === 0)) return false;
  if (r && !r.every((v, i) => (i === 3 ? v === 1 : v === 0))) return false;
  if (s && !s.every((v) => v === 1)) return false;
  return true;
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

describe("park assets (LOR-2423)", () => {
  it("manifest matches the staged park-nav attraction ids one-to-one", () => {
    expect(ATTRACTIONS.map((a) => a.id)).toEqual(PARK_NAV_IDS);
    expect(GLB_KEYS).toEqual([...PARK_NAV_IDS, "ground"]);
  });

  it("every referenced GLB resolves under assets/park/ with real meshes", () => {
    for (const key of GLB_KEYS) {
      const json = readGlbJson(glbPath(key));
      expect(
        json.meshes?.length ?? 0,
        `${key} GLB has no meshes`
      ).toBeGreaterThan(0);
    }
  });

  it("each GLB honors the runtime contract (Draco, colliders, identity transforms)", () => {
    for (const key of GLB_KEYS) {
      const json = readGlbJson(glbPath(key));
      expect(
        json.extensionsUsed,
        `${key}: expected Draco geometry compression`
      ).toContain("KHR_draco_mesh_compression");
      expect(
        json.nodes?.some((n) => n.name === "colliders"),
        `${key}: missing "colliders" subtree (Chunk.jsx contract)`
      ).toBe(true);
      const nonIdentity = (json.nodes ?? [])
        .filter((n) => !isIdentityTransform(n))
        .map((n) => n.name);
      expect(nonIdentity, `${key}: non-identity node transforms`).toEqual([]);
    }
  });

  it("fits the size budgets (≤2 MB per GLB, ≤12 MB total)", () => {
    const rows = GLB_KEYS.map((key) => {
      const bytes = readFileSync(glbPath(key)).byteLength;
      return { key, bytes, ok: bytes <= PER_FILE_BUDGET };
    });
    const total = rows.reduce((sum, r) => sum + r.bytes, 0);
    for (const r of rows) {
      console.info(
        `${r.ok ? "✅" : "❌"} ${r.key.padEnd(16)} ${kb(r.bytes).padStart(10)}`
      );
    }
    console.info(`${"".padEnd(16, "-")} ${"".padStart(10, "-")}`);
    console.info(`${"total".padEnd(16)} ${kb(total).padStart(10)} / 12.0 MB`);
    for (const r of rows) {
      expect(
        r.bytes,
        `${r.key}: ${kb(r.bytes)} exceeds 2.0 MB`
      ).toBeLessThanOrEqual(PER_FILE_BUDGET);
    }
    expect(total, `park total ${kb(total)} exceeds 12.0 MB`).toBeLessThanOrEqual(
      TOTAL_BUDGET
    );
  });
});
