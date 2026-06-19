# anu-minecraft-world

Anu's interactive 3D portfolio — an explorable Minecraft world you walk around
in the browser, rendered with [React Three Fiber](https://r3f.docs.pmnd.rs/).

You control a classic blocky character in third person and **explore the grounds
and house freely**. The centrepiece is a three-storey, Kathmandu-style brick
house in the Minecraft voxel idiom; walk through the front door and up the
floors to find content framed on each level: about + manual on the ground
floor, projects on the middle floor, and links + a reading shelf on the top
floor — plus a vintage computer that opens a guestbook. Walk up to any of them
and press **E** (or tap/click) to open it. The grounds are dressed with a walled
garden, gate, trees, a garage, a flat rooftop (water tank, solar panels,
satellite dish), prayer flags, lighting, an idling dog, drifting birds, and
chimney smoke.

It is also lightly **multiplayer**: customize your blocky character, then see
other visitors walking the same world in real time, with name tags and chat. The
presence relay is live as a Cloudflare Worker at
`anu-minecraft-world.anubhavsigdel.workers.dev`. Multiplayer is optional — if the
relay is unreachable the world still loads and plays solo.

Live: [sigdel.world](https://sigdel.world)

## Controls

- **Move** — `W` `A` `S` `D` or the arrow keys (on touch, the on-screen
  joystick); movement is relative to the camera.
- **Look** — drag the mouse / a finger to orbit the third-person camera; the
  wheel zooms.
- **Jump** — `Space` (or the on-screen button).
- **Interact** — walk up to a panel or the guestbook and press `E`; clicking or
  tapping it still works too.
- **Customize** — open the character customizer (auto-shown on first visit, or
  via the customize button) to set your name and skin/shirt/pants colors; your
  look is saved locally and shown to other players.
- **Chat** — type in the chat box (`T`) to talk to anyone else currently in the world.
- **Share** — the share button copies the world link so others can join you.
- **Mobile** — on a phone or tablet, hold the device in landscape (a hint nudges
  you to rotate from portrait): a left-hand joystick moves, drag anywhere to
  look, and on-screen jump and "Use" buttons cover the rest.

The interior content (which framed panel sits on which floor, its image, and the
modal it opens) is defined in one place — [`src/data/floors.js`](src/data/floors.js).

## Tech

- **React + Vite** single-page app (static frontend; no Vercel backend)
- **three.js / React Three Fiber / drei** for the 3D scene
- **KTX2 + Draco** compressed glTF models (self-hosted decoders under
  `public/basis` and `public/draco`), **zustand** for UI and multiplayer state,
  **SCSS** for styling
- **Cloudflare Worker + SQLite Durable Object** (`worker.js`) for optional
  multiplayer presence and chat — a relay-only `world` room, no durable state
- **PostHog** product analytics + **Vercel Web Analytics / Speed Insights**

## Develop

```bash
npm install
npm run dev        # start the dev server
npm run relay:dev  # run the Cloudflare Worker relay locally (wrangler, port 8787)
npm run build      # production build to dist/
npm run lint       # ESLint
npm test           # Vitest unit suite
```

CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs lint, the
production build, and the unit suite on every pull request. The unit tests cover
the pure logic the 3D scene relies on — step-up and camera-follow math, the
multiplayer wire protocol, character validation, remote interpolation, and
orientation detection — so the gameplay rules can change with confidence.

For multiplayer in local dev, run `npm run relay:dev` alongside `npm run dev` and
set `VITE_MULTIPLAYER_HOST=localhost:8787`. Without it, the client simply runs
solo.

## Environment

Analytics is optional and disabled until configured. Copy `.env.example` to
`.env` (local) or set the vars in Vercel → Settings → Environment Variables:

| Variable | Purpose |
| --- | --- |
| `VITE_PUBLIC_POSTHOG_KEY` | PostHog project key; when unset, PostHog is a no-op |
| `VITE_PUBLIC_POSTHOG_HOST` | PostHog host (default `https://us.i.posthog.com`) |
| `VITE_MULTIPLAYER_HOST` | Cloudflare Worker relay host (`localhost:8787` in dev; `anu-minecraft-world.anubhavsigdel.workers.dev` in prod); when unset or unreachable, the client runs solo |

Vercel Web Analytics and Speed Insights need no keys — enable them for the
project in the Vercel dashboard.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — project layout and key
  decisions (content/presentation split, code splitting, caching, baked
  signage, multiplayer presence).
- [`docs/SECURITY.md`](docs/SECURITY.md) — security review and response headers.

## Deployment

Static deploy on Vercel (see [`vercel.json`](vercel.json)); pushes to `main`
deploy automatically. No serverless functions are used, so there is no Vercel
compute cost — only CDN bandwidth.

The multiplayer relay deploys separately to **Cloudflare** as a Worker. A merge
to `develop` or `main` runs the CI gate and then
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publishes the
Worker with `npx wrangler deploy` (configured by [`wrangler.toml`](wrangler.toml)),
authenticated by the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repo
secrets. The relay is a Worker plus a SQLite-backed Durable Object on the free
plan, so it costs nothing to run. It currently runs at
`anu-minecraft-world.anubhavsigdel.workers.dev`; point `VITE_MULTIPLAYER_HOST` at
that host. It is independent of the Vercel deploy: if it is down or unset, the
world still loads and plays solo.

Caching policy:

- Content-hashed build assets (`/assets`) and vendored decoders
  (`/fonts`, `/basis`, `/draco`) are cached immutably for a year.
- Assets that change between deploys (`/models`, `/images`, `/cubemap`,
  `/audio`, `/media`) use `max-age=0, must-revalidate`, so the browser
  revalidates against the ETag — a 304 (no re-download) when unchanged, fresh
  bytes when changed.
- `index.html` is always revalidated so deploys go live immediately.

## Credits

The immersive Minecraft world is built on the wonderful open-source folio
template by **Andrew Woan** — full credit to him for the original 3D scene. See [`LICENSE.md`](LICENSE.md).
