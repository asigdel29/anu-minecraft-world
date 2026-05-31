# anu-minecraft-world

Anu's interactive 3D portfolio — a scroll-driven Minecraft scene rendered in
the browser with [React Three Fiber](https://r3f.docs.pmnd.rs/). Navigate the
world to explore projects, an about page, a reading shelf, and a set of links.

Live: [sigdel.world](https://sigdel.world)

![Home page screenshot](public/media/og/og-image.webp?raw=true "Home page screenshot")

## Tech

- **React + Vite** single-page app (static; no backend)
- **three.js / React Three Fiber / drei** for the 3D scene
- **KTX2 + Draco** compressed glTF models, **zustand** for UI state, **SCSS**
  for styling

## Develop

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
npm run lint     # ESLint
```

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — project layout and key
  decisions (content/presentation split, code splitting, caching, baked
  signage).
- [`docs/SECURITY.md`](docs/SECURITY.md) — security review and response headers.

## Deployment

Static deploy on Vercel (see [`vercel.json`](vercel.json)). No serverless
functions are used, so there is no compute cost — only CDN bandwidth. Hashed
build assets are cached immutably; `index.html` is always revalidated so
deploys go live immediately.

## Credits

The immersive Minecraft world is built on the wonderful open-source folio
template by **Andrew Woan** — full credit to him for the original 3D scene. See [`LICENSE.md`](LICENSE.md).
