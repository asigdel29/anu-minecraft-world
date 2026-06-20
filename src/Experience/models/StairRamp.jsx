import * as THREE from "three";

// An invisible inclined slab that bridges the interior staircase between the
// middle and top floors. The baked house is a single merged mesh, so its steps
// cannot be edited; instead this slab gives the character a continuous walkable
// surface there. The downward ground-ray hits the slab, and because its slope
// keeps |normal.y| above the controller's WALL_SLOPE_LIMIT (0.5) it is treated
// as floor, not a wall — so it never blocks horizontal movement.
//
// The slab is positioned by two world-space endpoints (the bottom and top of
// the flight) plus a width; all are tunable constants. Flip DEBUG_VISIBLE to see
// it while calibrating in the running app, then leave it invisible.

const DEBUG_VISIBLE = false;

// Bottom and top of the middle -> top flight, in world space. The atrium shaft
// is centred at x ~ -5.5, z ~ 3.0; these span its walking surfaces (~71.3 up to
// ~76.8). Tune against the running app.
const RAMP_BOTTOM = [-5.5, 71.3, 4.0];
const RAMP_TOP = [-5.5, 76.8, -0.5];
const RAMP_WIDTH = 3.2; // across the steps
const RAMP_THICKNESS = 0.3; // slab thickness (kept thin)

/**
 * The invisible stair ramp. Computes a box that spans RAMP_BOTTOM -> RAMP_TOP and
 * tilts to match the flight, then renders it (invisible by default). Accepts the
 * usual group props so the Scene can register it as a collider.
 */
export default function StairRamp(props) {
  const bottom = new THREE.Vector3(...RAMP_BOTTOM);
  const top = new THREE.Vector3(...RAMP_TOP);

  const mid = bottom.clone().add(top).multiplyScalar(0.5);
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  const dz = top.z - bottom.z;

  const run = Math.hypot(dx, dz); // horizontal distance
  const length = Math.hypot(run, dy); // along-slope length of the slab
  const yaw = Math.atan2(dx, dz); // heading of the run in the xz-plane
  const pitch = Math.atan2(dy, run); // upward tilt of the flight

  return (
    <group {...props} dispose={null}>
      <mesh
        position={[mid.x, mid.y, mid.z]}
        rotation={[-pitch, yaw, 0]}
      >
        <boxGeometry args={[RAMP_WIDTH, RAMP_THICKNESS, length]} />
        {/* Kept renderable (mesh stays visible) so it always raycasts; the
            material is fully transparent unless debugging, so it is unseen but
            still acts as ground. */}
        <meshBasicMaterial
          color="#ff00ff"
          transparent={!DEBUG_VISIBLE}
          opacity={DEBUG_VISIBLE ? 1 : 0}
          depthWrite={DEBUG_VISIBLE}
        />
      </mesh>
    </group>
  );
}
