import { MeshBasicMaterial } from "three";

export const convertMaterialsToMeshBasicMaterial = (
  materials,
  alphaTestValue = 0.55
) => {
  Object.keys(materials).forEach((materialKey) => {
    const material = materials[materialKey];

    // useGLTF caches one `materials` object that persists across renders, and
    // each model re-renders every frame. Convert once and tag the result, so
    // repeat calls are no-ops — otherwise we replaced every material with a
    // fresh MeshBasicMaterial on every frame (the original guard checked
    // `emissiveMap`, which the converted basic material no longer has, so it
    // re-wrapped forever — heavy per-frame churn).
    if (material.userData.__basicConverted) return;

    // Three shapes of source material, same unlit result:
    // - baked lighting (emissive map): map it straight through
    // - albedo texture (island props): keep the map, cut out transparent
    //   texels at the shared alphaTest threshold
    // - flat base colour (park pipeline emits no textures): plain unlit
    //   colour — no transparency, so the ride geometry stays in the opaque
    //   queue and the GPU early-z keeps it cheap
    const converted = material.emissiveMap
      ? new MeshBasicMaterial({ map: material.emissiveMap })
      : material.map
      ? new MeshBasicMaterial({
          map: material.map,
          transparent: true,
          alphaTest: alphaTestValue,
        })
      : new MeshBasicMaterial({ color: material.color });
    converted.userData.__basicConverted = true;
    materials[materialKey] = converted;
  });

  return materials;
};
