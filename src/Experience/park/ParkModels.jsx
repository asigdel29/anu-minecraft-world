import { Suspense, useEffect } from "react";
import { useGLTFWithKTX2 } from "../utils/useGLTFWithKTX2";
import { convertMaterialsToMeshBasicMaterial } from "../utils/convertMaterial";
import DistanceGroup from "./DistanceGroup";
import { PARK_ATMOSPHERE } from "./parkAtmosphere";

// The eight park GLBs (ground + 7 rides) are Draco-compressed and world-baked:
// geometry sits at absolute world coordinates with identity node transforms,
// so the mount renders the GLB scene untransformed. Runtime contract mirrors
// the island chunks — find the "colliders" node, hide it, and register it with
// Scene's collider registry (Player raycasts the registry directly, and a raw
// raycast ignores visibility, so hidden colliders still block movement).
const parkGlbUrl = (key) => `/models/park/${key}-transformed.glb`;

function ParkGltfModel({ glbKey, registerCollider }) {
  const { scene, materials } = useGLTFWithKTX2(parkGlbUrl(glbKey));
  convertMaterialsToMeshBasicMaterial(materials);

  useEffect(() => {
    scene.traverse((node) => {
      if (node.name === "colliders") {
        node.visible = false;
        registerCollider(node);
      }
    });
  }, [scene, registerCollider]);

  return <primitive object={scene} />;
}

// Ground mounts first and is never culled — it is the floor the player walks
// on and the backdrop every marker sits on.
export function ParkGround({ registerCollider }) {
  return (
    <Suspense fallback={null}>
      <ParkGltfModel glbKey="ground" registerCollider={registerCollider} />
    </Suspense>
  );
}

// Rides cull as whole clusters at the derived park radii. The DistanceGroup
// measures from the manifest position because the GLB geometry is world-baked
// (the wrapper itself carries no transform to query).
export function ParkRide({ attraction, registerCollider }) {
  return (
    <Suspense fallback={null}>
      <DistanceGroup
        showRadius={PARK_ATMOSPHERE.cullShow}
        hideRadius={PARK_ATMOSPHERE.cullHide}
        position={attraction.position}
      >
        <ParkGltfModel
          glbKey={attraction.id}
          registerCollider={registerCollider}
        />
      </DistanceGroup>
    </Suspense>
  );
}
