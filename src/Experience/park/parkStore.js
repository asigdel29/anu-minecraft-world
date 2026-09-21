import { create } from "zustand";

// Park navigation state, shared between the canvas (camera rig, markers) and
// the DOM overlay (page view) without per-frame re-renders. Shape per the
// LOR-2423 spec: three modes plus the attraction the visitor is heading into.
//
// - park    — roam the carnival; attraction markers are interactable
// - flying  — the balloon-cam is flying the camera to a marker
// - page    — the attraction's readable page is open over a paused park
//
// Per-frame values (the player-transform mirror and the camera-rig handoff
// flag) live in plain module objects below — like inputState and tourProgress
// — so updating them every frame never triggers a React re-render.
export const parkPlayerState = {
  // Mirrored from the character controller each frame while it is active.
  position: { x: 0, y: 0, z: 0 },
  yaw: Math.PI,
  // The orbit camera's pose at its last active frame; the balloon-cam eases
  // back onto exactly this pose on exit so the orbit rig takes over without
  // a cut.
  orbit: null, // { yaw, pitch, distance }
};

// Set while the balloon-cam is easing the camera back onto the orbit pose
// after a page closes; the controller reads it (never subscribes to it).
export const parkCameraState = { returning: false };

export const useParkNav = create((set) => ({
  mode: "park",
  attractionId: null,
  enter: (id) => set({ mode: "flying", attractionId: id }),
  arrived: () => set({ mode: "page" }),
  // Leaving the balloon-cam arms the rig's ease-back: it glides the camera
  // onto the walk-mode orbit pose before handing control back (the rig clears
  // the flag when the pose is reached). Without this the orbit rig would snap
  // the camera on the first park-mode frame — a hard cut.
  exit: () => {
    parkCameraState.returning = true;
    set({ mode: "park", attractionId: null });
  },
}));
