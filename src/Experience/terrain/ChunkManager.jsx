import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { useFrame } from "@react-three/fiber";

import Chunk from "./Chunk";
import { initialSelection, radiiForDevice, selectChunks } from "./chunkGrid";
import { CHUNKS, CHUNKS_BY_ID, CHUNK_SIZE } from "./chunkManifest";
import { isCoarsePointer } from "../controls/orientation";
import { useChunkStore } from "./chunkStore";
import { useNavStore } from "../stores/navStore";
import { usePreloadGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";

// Streams the terrain in and out around the player. Mounts the spawn-eager
// chunks up front — they load under the initial loading screen alongside the
// house — and once the visitor has entered the world, re-selects the mounted
// set on a slow cadence as the player moves. Selection math lives in
// chunkGrid.js; this component only owns the React state and the frame loop.
//
// Streaming stays dormant until `enteredWorld` so no chunk load can wake
// drei's global loading manager while LoadingScreen and SceneSky are still
// gated on it.

// Seconds between chunk-selection passes. Selection is a handful of integer
// comparisons, but state churn mounts and unmounts subtrees, so it is kept
// far below frame cadence. At run speed (7 u/s) the player crosses a 32-unit
// cell in ~4.5 s; a quarter-second check never lets terrain fall behind.
const SELECT_INTERVAL_SEC = 0.25;

const EAGER_IDS = CHUNKS.filter((c) => c.spawnEager).map((c) => c.id);

export default function ChunkManager({ colliderRegistry, playerPositionRef }) {
  const enteredWorld = useNavStore((state) => state.enteredWorld);
  const [selection, setSelection] = useState(() => initialSelection(CHUNKS));
  const selectionRef = useRef(selection);
  const accumulator = useRef(0);
  // Streaming radii picked once per mount: touch devices get a tighter ring
  // (fill rate and GPU memory are their ceiling), everything else the default.
  const radii = useRef(radiiForDevice(isCoarsePointer()));

  // Flip the shared eagerReady flag once every spawn-eager chunk has mounted;
  // SceneSky waits on this before its one-time background capture. Chunks
  // report every mount, but only the first sighting of each eager id counts.
  const setEagerReady = useChunkStore((state) => state.setEagerReady);
  const readyEagerIds = useRef(new Set());
  const handleChunkReady = useCallback(
    (id) => {
      if (!CHUNKS_BY_ID[id].spawnEager) return;
      readyEagerIds.current.add(id);
      if (readyEagerIds.current.size === EAGER_IDS.length) setEagerReady();
    },
    [setEagerReady]
  );
  useEffect(() => {
    if (EAGER_IDS.length === 0) setEagerReady();
  }, [setEagerReady]);

  useFrame((state, delta) => {
    if (!enteredWorld) return;
    const position = playerPositionRef.current;
    if (!position) return;
    accumulator.current += delta;
    if (accumulator.current < SELECT_INTERVAL_SEC) return;
    accumulator.current = 0;
    const next = selectChunks(
      position.x,
      position.z,
      CHUNKS,
      CHUNK_SIZE,
      selectionRef.current,
      radii.current
    );
    // selectChunks returns the previous object untouched when nothing
    // changed, so this reference check skips the setState (and re-render)
    // on the overwhelming majority of passes.
    if (next !== selectionRef.current) {
      selectionRef.current = next;
      setSelection(next);
    }
  });

  // Warm the loader cache for the ring just beyond the loaded region, so a
  // chunk's file is usually decoded before its mount is requested.
  const preload = usePreloadGLTFWithKTX2();
  useEffect(() => {
    for (const id of selection.prefetch) {
      const chunk = CHUNKS_BY_ID[id];
      if (chunk.url) preload(chunk.url);
    }
  }, [selection, preload]);

  const colliderIds = new Set(selection.colliders);
  return selection.active.map((id) => (
    <Suspense key={id} fallback={null}>
      <Chunk
        chunk={CHUNKS_BY_ID[id]}
        colliderRegistry={colliderRegistry}
        withColliders={colliderIds.has(id)}
        onReady={handleChunkReady}
      />
    </Suspense>
  ));
}
