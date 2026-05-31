# Security Review

This document records the security review performed on `anu-minecraft-world`.
The application is a **fully static single-page site** (no server, no API, no
authentication, no user input persisted anywhere), which keeps the attack
surface small.

## Threat model

| Surface | Assessment |
| --- | --- |
| Server-side code | None. The site is static files served from a CDN; there are no serverless functions, so no server-side injection, SSRF, or auth surface. |
| User input | None is accepted or stored. All copy is build-time constant data under `src/data/`. |
| Third-party scripts | None loaded at runtime. All JavaScript is first-party and bundled; no external `<script>` tags. |
| Secrets | None. No `.env` files, API keys, or tokens in the repository (verified by scan). |
| Cross-site scripting | Content is rendered as React elements; `parseText` builds elements, never `dangerouslySetInnerHTML`. No user-controlled strings reach the DOM. |
| Reverse tabnabbing | All `target="_blank"` links use `rel="noopener noreferrer"`. |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` and CSP `frame-ancestors 'none'`. |

## Response headers (configured in `vercel.json`)

- `Content-Security-Policy` — restricts to same-origin scripts plus
  `'wasm-unsafe-eval'` (the Basis/KTX2 and Draco transcoders are WebAssembly)
  and `worker-src blob:` (the KTX2 transcoder runs in a worker created from a
  blob URL). `object-src 'none'`, `base-uri 'self'`.
  **Verify in-browser on first deploy** and relax only if a needed origin is
  blocked.
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
