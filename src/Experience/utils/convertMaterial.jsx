import { MeshBasicMaterial } from "three";

export const convertMaterialsToMeshBasicMaterial = (
  materials,
  alphaTestValue = 0.55
) => {
  Object.keys(materials).forEach((materialKey) => {
    const material = materials[materialKey];

    if (material.emissiveMap) {
      materials[materialKey] = new MeshBasicMaterial({
        map: material.emissiveMap,
      });
    } else {
      materials[materialKey] = new MeshBasicMaterial({
        map: material.map,
        transparent: true,
        alphaTest: alphaTestValue,
      });
    }
  });

  return materials;
};
