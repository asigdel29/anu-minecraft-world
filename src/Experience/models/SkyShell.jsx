/**
 * Daylight backing for the house windows.
 *
 * The house is a single baked, unlit mesh and its window panes are alpha-cut
 * holes, so from inside the windows read as flat black (nothing is drawn behind
 * the openings). This component places a bright sky-coloured plane just outside
 * each interior wall; the plane shows through that wall's window holes so the
 * windows look like daylight instead of black.
 *
 * Each plane faces the interior and is sized to its wall, sitting on the wall's
 * exterior side. Exterior camera views are unaffected: the opaque outer walls
 * occlude the planes, and each plane's single-sided front faces away from an
 * outside viewer (back-face culled).
 *
 * Wall interior faces (world space, measured from the house geometry):
 *   left  x = -11.03   back z = -4.2   front z = 4.94
 */

const SKY_COLOR = "#bfe3ff";
const PLANE_Y = 69.5; // vertical centre shared by the window bands
const PLANE_H = 6; // tall enough to cover every window on a wall

export default function SkyShell() {
  return (
    <group>
      {/* Left wall: plane just outside (x < -11.03), facing +x into the room. */}
      <mesh position={[-11.4, PLANE_Y, 0.4]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[11, PLANE_H]} />
        <meshBasicMaterial color={SKY_COLOR} />
      </mesh>
      {/* Back wall: plane just outside (z < -4.2), facing +z into the room. */}
      <mesh position={[-7, PLANE_Y, -4.45]}>
        <planeGeometry args={[10, PLANE_H]} />
        <meshBasicMaterial color={SKY_COLOR} />
      </mesh>
      {/* Front wall: plane just outside (z > 4.94), facing -z into the room. */}
      <mesh position={[-7, PLANE_Y, 5.15]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[10, PLANE_H]} />
        <meshBasicMaterial color={SKY_COLOR} />
      </mesh>
    </group>
  );
}
