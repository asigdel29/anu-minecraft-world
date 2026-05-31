# Architecture

`anu-minecraft-world` is a static single-page application: a scroll-driven 3D
Minecraft scene rendered with React Three Fiber, with HTML overlay UI (loading
screen, modals, buttons) layered on top.

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
  components/      Presentational UI (modals, buttons, loading screen)
  data/            Content (projects, about, info, links, books) — no JSX
  Experience/      React Three Fiber scene
    Experience.jsx Canvas + scroll/pointer input wiring
    Scene.jsx      Camera path, lighting, model composition
    WallText.jsx   In-world signage overlay (see "Baked text" below)
    models/        gltfjsx-generated model components
    stores/        Zustand stores (audio, modal)
    utils/         Material conversion + KTX2-aware glTF loader
  utils/           Cross-cutting helpers (audio system, text parsing)
  styles/          Global SCSS (variables, fonts, reset)
```

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
