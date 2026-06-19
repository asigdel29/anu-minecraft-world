# Security Review

This document records the security review performed on `anu-minecraft-world`.
The application is a **static single-page site** served from a CDN — no Vercel
backend, no authentication, no database. The one piece of server code is a
**relay-only Cloudflare Worker** (`worker.js`) that powers optional multiplayer
presence and chat; it persists nothing and inspects no payloads. This keeps the
attack surface small. The relevant surfaces are covered below.

## Threat model

| Surface | Assessment |
| --- | --- |
| Vercel backend | None. The site is static files served from a CDN; there are no serverless functions, so no server-side injection, SSRF, or auth surface on the host. |
| Multiplayer relay | `worker.js` is a relay-only Cloudflare Worker + Durable Object: it tags messages with the sender's connection id and re-broadcasts them, storing nothing and parsing no field beyond the envelope. There is no authentication and no persistence, so there is no account, session, or stored-data surface. Payloads are untrusted and treated as such on the client (see XSS / Untrusted peer data). |
| User input | Chat messages, a username, and character colors. None is persisted server-side; the character is saved only to the sender's `localStorage`. Inputs are sanitised before they are stored or sent: chat is length-capped (`clampChat`, 120), usernames are trimmed and length-capped (`sanitizeUsername`, 16), and colors must be 6-digit hex (`sanitizeCharacterUpdate`) — an invalid value is dropped rather than applied. All other copy is build-time constant data under `src/data/`. |
| Cross-site scripting | Content is rendered as React elements; `parseText` builds elements, never `dangerouslySetInnerHTML`. |
| Untrusted peer data | Strings arriving over the WebSocket (chat text, usernames) are rendered as React text children in the chat overlay, in-world chat bubbles, and the terminal activity log — never via `dangerouslySetInnerHTML` — so React escapes them on display. Numeric peer state (position, yaw) only drives transforms. A peer cannot inject markup or script into another client. |
| Third-party scripts | None loaded at runtime. All JavaScript is first-party and bundled; no external `<script>` tags. |
| Secrets | None in the repository (verified by scan); `.env.example` lists only public `VITE_`-prefixed config (PostHog, multiplayer relay host), all client-visible by design. The relay's deploy credentials (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) live only as GitHub Actions secrets, never in the repo or the client bundle. |
| Reverse tabnabbing | All `target="_blank"` links use `rel="noopener noreferrer"`. |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'none'`. |

## Response headers (configured in `vercel.json`)

- `Content-Security-Policy` — same-origin by default. The 3D pipeline forces a
  few specific allowances: `'unsafe-eval'` in `script-src` (the Basis/KTX2 and
  Draco WebAssembly modules are Emscripten builds whose embind glue calls
  `new Function`, which `'wasm-unsafe-eval'` alone does not permit), and `blob:`
  in `script-src`/`worker-src`/`child-src`/`connect-src` (the transcoders run in
  blob-URL workers that fetch their payloads via blob:/data:). The Draco decoder
  is **self-hosted** under `public/draco/`, so no external origin is needed.
  `connect-src` also allows `wss://anu-minecraft-world.anubhavsigdel.workers.dev`
  for the multiplayer WebSocket; it is scoped to that exact relay host and to the
  `wss:` scheme only.
  `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`.
  Trade-off: `'unsafe-eval'` weakens XSS defense-in-depth, but the site accepts
  no user input and loads no third-party scripts, so the practical exposure is
  low; it is required for the WASM 3D stack to run.
- `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  (camera/microphone/geolocation denied).

## Dependency audit

`npm audit` was run and non-breaking fixes applied (17 → 1 advisory).

- **Remaining:** `picomatch` ReDoS (`GHSA-c2c7-rcm5-vvqj`). **Accepted.** It is a
  build-time-only transitive dependency of the bundler; it is never shipped in
  the browser bundle, so it presents no runtime risk for this static site. The
  available remediation requires a breaking major upgrade of the build chain;
  revisit when the parent package ships a compatible release.

## Re-running the review

```
npm audit
npm run build   # confirm the bundle still builds clean
```
