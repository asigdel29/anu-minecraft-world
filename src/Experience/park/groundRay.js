import * as THREE from "three";

// Shared terrain probe for park props: casts straight down from high above a
// world position against the registered collider list and returns the surface
// height, or null when nothing is loaded there yet. Markers use it to drop to
// the ground after mount (their manifest y is a placeholder) and the camera
// rig uses it to aim flight viewpoints at the terrain.
const RAY_TOP = 100;
const RAY_FAR = 200;

const DOWN = new THREE.Vector3(0, -1, 0);
const origin = new THREE.Vector3();
const raycaster = new THREE.Raycaster();

export const groundYAt = (colliders, x, z) => {
  const list = colliders && colliders.current;
  if (!list || !list.length) return null;
  origin.set(x, RAY_TOP, z);
  raycaster.set(origin, DOWN);
  raycaster.far = RAY_FAR;
  const hits = raycaster.intersectObjects(list, true);
  return hits.length ? hits[0].point.y : null;
};
