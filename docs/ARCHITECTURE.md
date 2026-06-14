# Architecture

`anu-minecraft-world` is a static single-page application: an explorable 3D
Minecraft world rendered with React Three Fiber, driven by a controllable
third-person character, with HTML overlay UI (loading screen, controls hint,
interaction prompt, touch controls, modals, buttons) layered on top.

## Directory layout

```
public/            Static, un-hashed assets served as-is
  models/          KTX2-textured, Draco-compressed glTF scene meshes
  basis/           Basis/KTX2 WebAssembly transcoder (vendored)
  cubemap/         Environment cubemap (webp)
  audio/           Music and SFX (ogg + mp3 fallback)
  images/          Modal/gallery imagery (webp)
  fonts/           Minecraft webfont
  media/           Favicons + Open Graph image
src/
  main.jsx         React entry
  App.jsx          Composition root; lazy-loads the 3D experience
  components/      Presentational UI (modals, buttons, loading screen,
                   controls hint, interaction prompt, touch controls)
  data/            Content (projects, about, info, links, books) — no JSX
  Experience/      React Three Fiber scene
    Experience.jsx Canvas + default camera (driven by the controller)
    Scene.jsx      Model composition + the collider registry
    Player.jsx     Character controller (movement, gravity, collision, interact)
    WallText.jsx   In-world signage overlay (see "Baked text" below)
    controls/      Input + camera rig (useKeyboard, inputState,
                   useThirdPersonCamera)
    models/        gltfjsx-generated model components (incl. the player rig)
    stores/        Zustand stores (audio, modal, interaction)
    utils/         Material conversion + KTX2-aware glTF loader
  utils/           Cross-cutting helpers (audio system, footsteps, text parsing)
  styles/          Global SCSS (variables, fonts, reset)
```

## Character controller

The world is explored by driving a character rather than scrolling a scripted
camera path. The pieces, all under `Experience/`:

- **Input.** `controls/useKeyboard.js` maps WASD / arrows / Space / Shift / E to
  a shared mutable `controls/inputState.js` object; `components/TouchControls`
  writes the same object from an on-screen joystick. The object is read every
  frame, never lifted into React state, so input causes no re-render.
- **Controller.** `Player.jsx` owns the character's position and facing in refs
  and advances them in one `useFrame`: it moves along the camera-relative axes,
  turns the body toward travel, and swaps the model's idle / walk / jump clips.
- **Camera.** `controls/useThirdPersonCamera.js` is a drag-to-orbit rig (wheel
  zooms) applied after the position settles; it raycasts and pulls in when the
  house would clip between the camera and the head.
- **Collision.** Movement is grounded by raycasts, not a physics engine, to keep
  the bundle light: a downward ray finds the surface (terrain + house floors)
  for gravity and jumps, and a forward ray slides the body off walls. `Scene`
  registers the house shell and terrain GLBs into a collider list the controller
  raycasts against; mobs, props, and panels are excluded on purpose.
- **Interaction.** Content panels and the terminal register a target (position,
  title, modal) in `stores/interactionStore`; the controller surfaces the
  nearest in range to the `InteractPrompt` overlay and opens it on the E press
  edge. Pointer click/tap remains as a fallback.

## Key decisions

- **Content/presentation split.** All page copy lives in `src/data/` so it can
  change without touching views.
- **Code splitting.** `App.jsx` lazy-loads `Experience`, and the build emits
  `three` and `@react-three/*` as separate content-hashed vendor chunks
  (`vite.config.js`). The initial entry chunk is ~60 kB; the heavy 3D bundle
  downloads in parallel while the loading screen paints.
- **Caching / cost.** The site is static, so Vercel runs no serverless
  functions (no compute billing). `vercel.json` caches hashed `/assets`
  immutably for a year and stable public media for a week.

## Baked text (signage)

The project frame photos are baked directly into the model's KTX2 texture
atlas, so they render as part of the scene. The wall **sign and captions**,
however, are text whose glyphs are scattered throughout a packed UV atlas with
no isolable rectangle; repainting them in-texture is not safely possible
without per-glyph UV reconstruction. They are therefore rendered as an in-code
overlay (`Experience/WallText.jsx`) — wood-styled, environment-lit signs
positioned over the wall, which also hides the original baked text. Replacing
this with a baked-in version would require re-authoring the source `.blend`.
