# Architecture

`anu-minecraft-world` is a single-page application: an explorable 3D
Minecraft world rendered with React Three Fiber, driven by a controllable
third-person character, with HTML overlay UI (loading screen, controls hint,
interaction prompt, touch controls, modals, buttons) layered on top.

The site itself is static (no backend on Vercel). Optional **multiplayer
presence** — seeing other visitors walk around, with character customization
and chat — is provided by a small, separate Cloudflare Worker relay (see
"Multiplayer" below). The relay is optional: if it is unreachable or
unconfigured, the client logs a warning and runs solo, so the static site
keeps working unchanged.

## Directory layout

```
worker.js          Cloudflare Worker relay (+ wrangler.toml) — see "Multiplayer"
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
                   controls hint, interaction prompt, touch controls,
                   character customizer, chat overlay, share/customize buttons)
  data/            Content (projects, about, info, links, books) — no JSX
  Experience/      React Three Fiber scene
    Experience.jsx Canvas + default camera (driven by the controller)
    Scene.jsx      Model composition + the collider registry
    Player.jsx     Character controller (movement, gravity, collision, interact,
                   multiplayer state broadcast)
    RemotePlayer.jsx   One other visitor: interpolated rig + name/chat bubble
    RemotePlayers.jsx  Renders every remote player tracked in the store
    WallText.jsx   In-world signage overlay (see "Baked text" below)
    controls/      Input + camera rig (useKeyboard, inputState,
                   useThirdPersonCamera)
    models/        gltfjsx-generated model components (incl. the player rig)
    stores/        Zustand stores (audio, modal, interaction, character,
                   multiplayer)
    utils/         Material conversion + KTX2-aware glTF loader
  utils/           Cross-cutting helpers (audio system, footsteps, text parsing)
  styles/          Global SCSS (variables, fonts, reset)
```

## Character controller

The world is explored by driving a character rather than scrolling a scripted
camera path. The pieces, all under `Experience/`:

- **Input.** `controls/useKeyboard.js` maps WASD / arrows / Space / Shift / E to
  a shared mutable `controls/inputState.js` object; `components/TouchControls`
  writes the same object from an on-screen joystick and jump / "Use" buttons. The
  object is read every frame, never lifted into React state, so input causes no
  re-render. Keyboard capture is suppressed while a text field (chat, name) is
  focused, so typing never walks the character.
- **Mobile.** On a coarse pointer the on-screen controls render and are tuned for
  landscape; `controls/orientation.js` detects pointer type and orientation, and
  `components/OrientationHint` overlays a rotate prompt while the device is held
  in portrait. The "Use" button toggles the same `interact` input the `E` key
  drives, so the proximity-interaction path is shared.
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

## Multiplayer

Presence is best-effort and entirely client-driven; the server keeps no
durable state. The pieces:

- **Server.** `worker.js` is a Cloudflare Worker whose `Room` Durable Object
  runs a single shared room named `world`. It is a pure relay: on connect it
  announces a `join` and sends the newcomer the list of existing peers; on each
  message it re-broadcasts (tagged with the sender's connection id) to everyone
  else; on close it broadcasts a `leave`. It stores nothing and inspects no
  payloads. The DO uses the SQLite backend (the only kind the Workers free plan
  allows — see `wrangler.toml`'s `new_sqlite_classes` migration) and accepts
  sockets with the hibernation API so an idle room costs nothing.
- **Client transport.** `Experience/stores/useMultiplayer.jsx` owns the single
  WebSocket (kept at module scope so both the R3F `Player` and the DOM-level
  `ChatOverlay` send through it). It connects to `VITE_MULTIPLAYER_HOST`, and on a
  failed connection logs a warning and degrades to solo. `Player` calls
  `sendState` every frame; it is throttled to **10 Hz** (`SEND_INTERVAL`) and
  broadcasts position, yaw, action, and character appearance. Inbound `state`,
  `join`, `leave`, and `chat` messages update a Zustand store.
- **Rendering remotes.** The store holds `remotePlayers` keyed by connection id.
  `RemotePlayers` maps it to a `RemotePlayer` each — a player rig that
  interpolates toward the latest position/yaw, plays the broadcast action clip,
  tints to the peer's colors, and floats a name tag plus a transient chat
  bubble.
- **Identity.** `stores/characterStore.jsx` holds the local username and
  head/body/leg colors, persisted to `localStorage` (`mc-character`). First
  visit (no saved character) auto-opens the `CharacterCustomizer` modal;
  `CustomizeButton` reopens it later. The appearance rides along on every state
  broadcast so peers render the right colors.
- **Chat + activity.** `ChatOverlay` sends `chat` messages and shows the recent
  activity log (joins, leaves, messages); the same log feeds the in-world
  terminal. `ShareButton` copies the world URL so others can join the room.
  All remote-supplied strings (chat text, usernames) are rendered as React text
  children — never `dangerouslySetInnerHTML` — so they are escaped on display.

## Key decisions

- **Content/presentation split.** All page copy lives in `src/data/` so it can
  change without touching views.
- **Code splitting.** `App.jsx` lazy-loads `Experience`, and the build emits
  `three` and `@react-three/*` as separate content-hashed vendor chunks
  (`vite.config.js`). The initial entry chunk is ~60 kB; the heavy 3D bundle
  downloads in parallel while the loading screen paints.
- **Caching / cost.** The Vercel deploy is static — no serverless functions, no
  compute billing. `vercel.json` caches hashed `/assets` immutably for a year
  and stable public media for a week. Multiplayer runs on a Cloudflare Worker, a
  separate service from the Vercel host; because it is optional and the client
  falls back to solo, the static site has no hard dependency on it.

## Staying lightweight

The bundle is dominated by the 3D vendor chunks — `three` (~688 kB raw) and
`@react-three/*` (~590 kB raw) — which load lazily, in parallel with the loading
screen, and are content-hashed for a one-year immutable cache. Everything added
for multiplayer, chat, customization, and mobile is **first-party logic and DOM
overlay**, kept out of those vendor chunks. Measured against the pre-multiplayer
baseline:

| Chunk | Baseline (raw) | With all features (raw / gzip) |
| --- | --- | --- |
| `index.js` (entry + DOM overlay) | ~69 kB | ~78 kB / ~19 kB |
| `Experience.js` (scene + controllers) | ~33 kB | ~38 kB / ~12 kB |
| `index.css` | ~16 kB | ~26 kB / ~3.4 kB |
| `three.js`, `r3f.js` (vendor) | ~1278 kB | unchanged |

The whole feature set adds roughly **+15 kB raw / ~5 kB gzip of JS** and never
touches the heavy vendor chunks. Choices that keep it that way:

- **No client networking dependency.** Multiplayer uses the browser's native
  `WebSocket`; `wrangler` is a **devDependency** (deploy/CLI only) and is never
  bundled into the client.
- **Pure logic, no engines.** Step-up, camera follow, interpolation, the wire
  protocol, validation, and orientation are small pure helpers (unit-tested) — no
  physics or networking library is pulled in.
- **CSS-only customizer preview.** The character preview is styled boxes, not a
  second 3D canvas.
- **Optional and degrading.** With no `VITE_MULTIPLAYER_HOST` the socket is never
  opened, so solo visitors pay nothing for the multiplayer code beyond its small
  static weight.

## Baked text (signage)

The project frame photos are baked directly into the model's KTX2 texture
atlas, so they render as part of the scene. The wall **sign and captions**,
however, are text whose glyphs are scattered throughout a packed UV atlas with
no isolable rectangle; repainting them in-texture is not safely possible
without per-glyph UV reconstruction. They are therefore rendered as an in-code
overlay (`Experience/WallText.jsx`) — wood-styled, environment-lit signs
positioned over the wall, which also hides the original baked text. Replacing
this with a baked-in version would require re-authoring the source `.blend`.
