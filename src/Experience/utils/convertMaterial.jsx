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

    // Three conversions, by how the asset was authored: baked lighting rides
    // in the emissive slot (terrain, house); foliage cutouts ride the base
    // color texture with alpha; untextured stylized props carry only a flat
    // base color, which maps to a plain color-only unlit material.
    let converted;
    if (material.emissiveMap) {
      converted = new MeshBasicMaterial({ map: material.emissiveMap });
    } else if (material.map) {
      converted = new MeshBasicMaterial({
        map: material.map,
        transparent: true,
        alphaTest: alphaTestValue,
      });
    } else {
      converted = new MeshBasicMaterial({ color: material.color });
    }
    converted.userData.__basicConverted = true;
    materials[materialKey] = converted;
  });

  return materials;
};
