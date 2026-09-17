// Night-carnival palette — flat base colors only, mirroring the staged
// Blender builder (assets staged from the park-nav manifest, LOR-2423).
// Runtime contract: convertMaterial.jsx maps textureless materials to a
// color-only unlit MeshBasicMaterial, so saturated colors read as neon under
// the night sky. No textures are emitted, so the island pipeline's WebP step
// has nothing to do here.

/** sRGB hex -> glTF linear-space baseColorFactor. */
export function hexToLinear(hex) {
  const h = hex.replace("#", "");
  const out = [];
  for (let i = 0; i < 3; i += 1) {
    out.push((parseInt(h.slice(i * 2, i * 2 + 2), 16) / 255) ** 2.2);
  }
  return [...out, 1];
}

export const PALETTE = {
  lawn: "#122A1A",
  path: "#232738",
  dark: "#12142A",
  metal: "#2E3242",
  wood: "#4A3628",
  stone: "#3A3E4C",
  soil: "#1A1414",
  canvas: "#3A2E20",
  booth: "#1A1030",
  white: "#F5F0E6",
  pale: "#BFE8FF",
  smoke: "#8FA3BF",
  neon_cyan: "#29E6FF",
  neon_magenta: "#FF2FA8",
  neon_yellow: "#FFD24A",
  neon_orange: "#FF7A2F",
  neon_green: "#3BFF6E",
  neon_purple: "#9B5BFF",
  neon_warm: "#FFB86B",
  collider_proxy: "#808080",
};
