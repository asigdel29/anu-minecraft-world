# anu-minecraft-world

Anu's interactive 3D portfolio — a scroll-driven Minecraft scene rendered in
the browser with [React Three Fiber](https://r3f.docs.pmnd.rs/).

The centrepiece is a three-storey, Kathmandu-style brick house in the Minecraft
voxel idiom. Scrolling **enters through the front door and climbs the interior
atrium floor by floor**, with content framed on each level: about + manual on
the ground floor, projects on the middle floor, and links + a reading shelf on
the top floor — plus a clickable vintage computer that opens a guestbook. The
grounds are dressed with a walled garden, gate, trees, a garage, a flat rooftop
(water tank, solar panels, satellite dish), prayer flags, lighting, an idling
dog, drifting birds, and chimney smoke.

Live: [sigdel.world](https://sigdel.world)

The interior content (which framed panel sits on which floor, its image, and the
modal it opens) is defined in one place — [`src/data/floors.js`](src/data/floors.js).

## Tech

- **React + Vite** single-page app (static; no backend)
- **three.js / React Three Fiber / drei** for the 3D scene
- **KTX2 + Draco** compressed glTF models (self-hosted decoders under
  `public/basis` and `public/draco`), **zustand** for UI state, **SCSS** for
  styling
- **PostHog** product analytics + **Vercel Web Analytics / Speed Insights**

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run lint     # ESLint
```

## Environment

Analytics is optional and disabled until configured. Copy `.env.example` to
`.env` (local) or set the vars in Vercel → Settings → Environment Variables:

| Variable | Purpose |
| --- | --- |
| `VITE_PUBLIC_POSTHOG_KEY` | PostHog project key; when unset, PostHog is a no-op |
| `VITE_PUBLIC_POSTHOG_HOST` | PostHog host (default `https://us.i.posthog.com`) |

Vercel Web Analytics and Speed Insights need no keys — enable them for the
project in the Vercel dashboard.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — project layout and key
  decisions (content/presentation split, code splitting, caching, baked
  signage).
- [`docs/SECURITY.md`](docs/SECURITY.md) — security review and response headers.

## Deployment

Static deploy on Vercel (see [`vercel.json`](vercel.json)); pushes to `main`
deploy automatically. No serverless functions are used, so there is no compute
cost — only CDN bandwidth.

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
