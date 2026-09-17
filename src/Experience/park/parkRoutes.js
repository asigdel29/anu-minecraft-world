// Pure URL resolution for park deep links. The attraction manifest owns the
// route table; this module maps location paths to attractions and back. The
// history wiring (pushState / popstate listeners) stays in the thin
// useParkRouting hook — the resolution here is three.js-free and unit-tested.

import { ATTRACTIONS } from "./attractions";

/**
 * Resolve a location pathname to an attraction id, or null for non-attraction
 * paths (the park itself lives at "/"). Only exact manifest routes match; a
 * trailing slash is tolerated, case is not normalized.
 */
export const resolveRoute = (pathname) => {
  if (typeof pathname !== "string") return null;
  const path =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;
  const attraction = ATTRACTIONS.find((a) => a.route === path);
  return attraction ? attraction.id : null;
};

/** The shareable URL for an attraction id, or null for unknown ids. */
export const routeForId = (id) => {
  const attraction = ATTRACTIONS.find((a) => a.id === id);
  return attraction ? attraction.route : null;
};
