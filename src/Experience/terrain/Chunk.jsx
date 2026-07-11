import { useEffect, useRef } from "react";

import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { convertMaterialsToMeshBasicMaterial } from "../utils/convertMaterial";

// One streamed terrain chunk. Renders either a bespoke wrapper component
// (the interim lawn pieces) or a chunk GLB straight from its url, and owns
// the chunk's collider registration so mounting and unmounting a chunk keeps
// the scene's raycast list in sync.
//
// Collision convention for GLB chunks: a subtree named "colliders" holds
// simplified proxy meshes. It is hidden from rendering — three's Raycaster
// tests layers, never visibility, so the proxies still catch the ground and
// wall rays — and it alone is registered, keeping the per-frame raycasts off
// the dense visual meshes. A chunk without the subtree registers whole, which
// is how the interim lawn wrappers collide (their visuals are their ground,
// exactly as before streaming).

function GlbContent({ url }) {
  const { scene, materials } = useGLTFWithKTX2(url);
  convertMaterialsToMeshBasicMaterial(materials, 0.5);
  // dispose={null} keeps drei's GLTF cache intact across unloads, so a chunk
  // the player circles back to remounts instantly instead of re-decoding.
  return <primitive object={scene} dispose={null} />;
}

export default function Chunk({ chunk, colliderRegistry, withColliders }) {
  const group = useRef();

  // Runs after the chunk's content has loaded and committed (the Suspense
  // boundary sits above this component), so the named subtree is findable.
  // Cleanup runs before the group's children are disposed, upholding the
  // registry's remove-before-dispose rule.
  useEffect(() => {
    const root = group.current;
    if (!root) return undefined;
    const proxies = root.getObjectByName("colliders");
    if (proxies) proxies.visible = false;
    if (!withColliders) return undefined;
    const target = proxies ?? root;
    colliderRegistry.add(target);
    return () => colliderRegistry.remove(target);
  }, [withColliders, colliderRegistry]);

  return (
    <group ref={group}>
      {chunk.Component ? <chunk.Component /> : <GlbContent url={chunk.url} />}
    </group>
  );
}
