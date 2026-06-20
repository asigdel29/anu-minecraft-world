import { useEffect, useMemo, useRef, useState } from "react";

import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

import { useModalStore } from "../stores/modalStore";
import { registerInteractable } from "../stores/interactionStore";
import { tourProgress } from "../stores/tourStore";
import { FLOOR_RANGES, posterBrightness } from "../controls/tour";
import { FLOORS, PANELS } from "../../data/floors";

import About from "../../components/About/About";
import Project from "../../components/Project/Project";
import UserManual from "../../components/UserManual/UserManual";
import RandomLinks from "../../components/RandomLinks/RandomLinks";
import Bookshelf from "../../components/Bookshelf/Bookshelf";

// The interior content. As the camera climbs the atrium, each floor's panels
// (defined in src/data/floors.js) hang on its back wall as framed pictures that
// open a modal on click. This component only builds the framed panels in code —
// it no longer loads any GLB, so the floor content is pure data + planes.

// Modal registry: maps a panel's `modal` key to the title + body it opens. The
// title falls back to the panel's own `title` from the config.
const MODALS = {
  about: () => <About />,
  manual: () => <UserManual />,
  links: () => <RandomLinks />,
  books: () => <Bookshelf />,
  project: (panel) => <Project projectID={panel.projectId} />,
};

// Panel sizing. The camera frames each floor from a few units out, so panels are
// large enough to read at that distance. The matte fully backs the photo, which
// is aspect-fitted inside `photo` so nothing is cropped or stretched.
const PANEL = { matte: [2.6, 1.9], photo: [2.25, 1.55], click: [2.6, 1.9] };
const ABOUT_MATTE = "#1c130b";
const PROJECT_MATTE = "#0d0d10";

const prepOverlayTexture = (texture) => {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.center.set(0.5, 0.5);
  texture.offset.set(0, 0);
  texture.repeat.set(1, 1);
  texture.needsUpdate = true;
};

// A single framed poster: a matte backing, the photo, and a transparent click
// zone. During the guided tour the photo brightens with a pulse while the camera
// frames its floor (see posterBrightness); hover still tints the matte and the
// click overlay as before.
function Panel({ panel, floor, texture, matteColor, hovered, onHover, onClick }) {
  const photoMaterial = useRef();
  const range = FLOOR_RANGES[panel.floor];
  const [mw, mh] = PANEL.matte;
  const [iw, ih] = containSize(texture, PANEL.photo[0], PANEL.photo[1]);

  useFrame((state) => {
    if (!photoMaterial.current) return;
    const brightness = range
      ? posterBrightness(tourProgress.value, range, state.clock.elapsedTime)
      : 1;
    photoMaterial.current.color.setScalar(brightness);
  });

  return (
    <group position={[panel.x, floor.y, floor.z]}>
      <mesh position={[0, 0, -0.01]} raycast={() => null}>
        <planeGeometry args={[mw, mh]} />
        <meshBasicMaterial
          color={hovered ? "#3a2a18" : matteColor}
          toneMapped={false}
        />
      </mesh>
      <mesh raycast={() => null}>
        <planeGeometry args={[iw, ih]} />
        <meshBasicMaterial ref={photoMaterial} map={texture} toneMapped={false} />
      </mesh>
      <mesh
        position={[0, 0, 0.04]}
        onPointerOver={() => onHover(panel.id)}
        onPointerOut={() => onHover(null)}
        onClick={() => onClick(panel)}
      >
        <planeGeometry args={PANEL.click} />
        <meshBasicMaterial
          transparent
          opacity={hovered ? 0.12 : 0}
          color={"#1aa89c"}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

// Fit an image fully inside a box (contain), preserving aspect ratio.
const containSize = (texture, boxW, boxH) => {
  const img = texture && texture.image;
  const aspect = img && img.height ? img.width / img.height : 1;
  let w = boxW;
  let h = boxW / aspect;
  if (h > boxH) {
    h = boxH;
    w = boxH * aspect;
  }
  return [w, h];
};

export default function Model(props) {
  const [hoveredPanel, setHoveredPanel] = useState(null);
  const { openModal } = useModalStore();

  const srcByID = useMemo(
    () => Object.fromEntries(PANELS.map((p) => [p.id, p.img])),
    []
  );
  const textures = useTexture(srcByID, (loaded) => {
    Object.values(loaded).forEach(prepOverlayTexture);
  });

  const handleClick = (panel) => {
    const render = MODALS[panel.modal];
    if (render) openModal(panel.title, render(panel), panel.id);
  };

  useEffect(() => {
    document.body.style.cursor = hoveredPanel ? "pointer" : "auto";
  }, [hoveredPanel]);

  // Register each panel as a walk-up interactable so the character can open it
  // with E from nearby; the pointer click above remains as a desktop fallback.
  useEffect(() => {
    const unregisters = PANELS.map((panel) => {
      const floor = FLOORS[panel.floor];
      return registerInteractable({
        id: panel.id,
        title: panel.title,
        position: new THREE.Vector3(panel.x, floor.y, floor.z),
        open: () => handleClick(panel),
      });
    });
    return () => unregisters.forEach((unregister) => unregister());
    // openModal (used by handleClick) is stable, so registering once is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group {...props} dispose={null}>
      {PANELS.map((panel) => (
        <Panel
          key={panel.id}
          panel={panel}
          floor={FLOORS[panel.floor]}
          texture={textures[panel.id]}
          matteColor={panel.modal === "project" ? PROJECT_MATTE : ABOUT_MATTE}
          hovered={hoveredPanel === panel.id}
          onHover={setHoveredPanel}
          onClick={handleClick}
        />
      ))}
    </group>
  );
}
