# anu-minecraft-world

Anu's interactive 3D portfolio: a scroll-driven Minecraft scene in the browser.
**Scroll** to fly through the world; click the framed pictures, the bookshelf,
and the signs to open projects, an about page, a reading shelf, and links.

Live: **[sigdel.world](https://sigdel.world)**

![Home page screenshot](public/media/og/og-image.webp?raw=true "Home page screenshot")

## Stack

React + Vite (static SPA, no backend) · three.js / React Three Fiber / drei ·
KTX2 + Draco compressed glTF · zustand · SCSS.

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # production build → dist/
npm run lint     # ESLint
```

## More

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — layout and key decisions.
- [`docs/SECURITY.md`](docs/SECURITY.md) — security review and headers.
- Deploy: static on Vercel ([`vercel.json`](vercel.json)) — no compute, CDN only.
- Credits: 3D scene from Andrew Woan's open-source folio template
  ([`LICENSE.md`](LICENSE.md)).
