#!/bin/sh
# Compress exported island GLBs (Draco geometry + WebP textures — the same
# format the original house GLB shipped with; KTX2 needs the external ktx
# binary and is left as a follow-up) into public/models/island/.
# Usage: assets/pipeline/compress.sh <export_dir>
set -e
EXPORT_DIR="$1"
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$REPO/public/models/island"
mkdir -p "$OUT"
for f in "$EXPORT_DIR"/*.glb; do
  base="$(basename "$f" .glb)"
  npx --yes @gltf-transform/cli optimize "$f" "$OUT/$base-transformed.glb" \
    --compress draco --texture-compress webp --simplify false
  echo "compressed $base"
done
npx --yes @gltf-transform/cli inspect "$OUT/IslandQ_es-transformed.glb" | head -30
