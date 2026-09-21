#!/bin/sh
# Compress exported park GLBs (Draco geometry — the island compress.sh
# contract). No textures are emitted by the park pipeline, so the island
# script's --texture-compress webp step has nothing to act on and is omitted.
# Usage: assets/park/pipeline/compress-park.sh
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
RAW="$HERE/build/raw"
# Output lands straight in the served model tree — the runtime fetches these
# files by URL, so the pipeline writes where public/ serves from.
OUT="$(cd "$HERE/../../.." && pwd)/public/models/park"
mkdir -p "$OUT"
for f in "$RAW"/*.glb; do
  base="$(basename "$f" .glb)"
  npx --yes @gltf-transform/cli optimize "$f" "$OUT/$base-transformed.glb" \
    --compress draco --simplify false \
    --flatten false --join false \
    --palette false --instance false
  echo "compressed $base"
done
