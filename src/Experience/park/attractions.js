// Data and pure validation for the amusement-park attractions — the single
// source the scene (markers), the router, and the content pages all read.
// Pure module: no three.js or React, so it stays unit-testable (the repo's
// chunkGrid-style split — data + pure helpers here, thin wiring in JSX).
//
// This extends the manifest-driven world-bounds pattern: bounds are declared
// once here and consumed by the controller clamp, save validation, and the
// attraction placement check, so attractions and the walkable area cannot
// drift apart.

// Walkable world extents, in world units. Derived from the baked lawn the
// character controller already clamps to (Player.jsx BOUNDS) so behaviour is
// unchanged; when the park island manifest lands this should be re-derived
// from it, the same way terrain derives WORLD_EXTENTS from its chunk manifest.
export const PARK_BOUNDS = { minX: -45, maxX: 45, minZ: -50, maxZ: 55 };

// The visitor spawn point on the lawn, [x, z] — the y is terrain height and
// stays in Player.jsx, which drops the character on mount. Declared here so
// the GLB load order (see attractionsByProximity) and the player start cannot
// drift apart.
export const PARK_SPAWN = [0, 20];

// The seven attractions (LOR-2423 spec). `position` is [x, ground, z]; the y
// entry is a manifest placeholder (0) — markers drop to the terrain height at
// mount, so the scene stays correct when the ground under an attraction moves.
export const ATTRACTIONS = [
  {
    id: "agent-arcade",
    name: "Agent Arcade",
    route: "/arcade",
    ride: "arcade-cabinet",
    position: [-38, 0, 22],
    content: "arcade",
  },
  {
    id: "factory",
    name: "The Factory",
    route: "/factory",
    ride: "smokestack",
    position: [30, 0, -18],
    content: "factory",
  },
  {
    id: "idea-graveyard",
    name: "Idea Graveyard",
    route: "/graveyard",
    ride: "tombstone-gate",
    position: [-14, 0, -34],
    content: "graveyard",
  },
  {
    id: "library",
    name: "The Library",
    route: "/library",
    ride: "carousel",
    position: [12, 0, 30],
    content: "library",
  },
  {
    id: "hardware",
    name: "Hardware Workshop",
    route: "/hardware",
    ride: "workshop-tent",
    position: [-40, 0, -8],
    content: "hardware",
  },
  {
    id: "launch-tower",
    name: "Launch Tower",
    route: "/launches",
    ride: "drop-tower",
    position: [36, 0, 16],
    content: "launches",
  },
  {
    id: "fortune",
    name: "Fortune Booth",
    route: "/fortune",
    ride: "fortune-booth",
    position: [4, 0, -6],
    content: "fortune",
  },
];

// id → attraction and route → attraction lookups.
export const ATTRACTIONS_BY_ID = Object.fromEntries(
  ATTRACTIONS.map((attraction) => [attraction.id, attraction])
);
export const ATTRACTIONS_BY_ROUTE = Object.fromEntries(
  ATTRACTIONS.map((attraction) => [attraction.route, attraction])
);

export const getAttraction = (id) => ATTRACTIONS_BY_ID[id] || null;

/**
 * Manifest copy sorted nearest-first to an `[x, z]` origin. Stable on the
 * declared order for ties (and never mutates the manifest). The ride-GLB
 * mount order uses this so a visitor's first paint shows the rides around
 * the spawn point before the far side of the park.
 */
export const attractionsByProximity = (origin, manifest = ATTRACTIONS) =>
  manifest
    .map((attraction, index) => ({
      attraction,
      index,
      distance: Math.hypot(
        attraction.position[0] - origin[0],
        attraction.position[2] - origin[1]
      ),
    }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index)
    .map((entry) => entry.attraction);

/**
 * Whether a `[x, y, z]` position sits inside the walkable bounds, inclusive.
 * Only x and z are constrained — y is terrain height and varies.
 */
export const isInsideBounds = (position, bounds = PARK_BOUNDS) => {
  if (!Array.isArray(position) || position.length !== 3) return false;
  if (!position.every((n) => typeof n === "number" && Number.isFinite(n))) {
    return false;
  }
  return (
    position[0] >= bounds.minX &&
    position[0] <= bounds.maxX &&
    position[2] >= bounds.minZ &&
    position[2] <= bounds.maxZ
  );
};

/**
 * Validate a manifest, returning a list of human-readable problems (empty when
 * the manifest is sound). Guards the invariants the scene, router, and pages
 * all rely on: unique ids, unique routes, a name/ride/content key per
 * attraction, and positions inside the walkable bounds.
 */
export const validateAttractions = (
  manifest = ATTRACTIONS,
  bounds = PARK_BOUNDS
) => {
  const problems = [];
  const ids = new Set();
  const routes = new Set();
  for (const attraction of manifest) {
    const label = attraction?.id || "<unnamed entry>";
    if (!attraction || typeof attraction !== "object") {
      problems.push(`${label}: entry is not an object`);
      continue;
    }
    if (!attraction.id || typeof attraction.id !== "string") {
      problems.push(`${label}: id must be a non-empty string`);
    } else if (ids.has(attraction.id)) {
      problems.push(`${label}: duplicate id`);
    } else {
      ids.add(attraction.id);
    }
    if (
      !attraction.route ||
      typeof attraction.route !== "string" ||
      !attraction.route.startsWith("/")
    ) {
      problems.push(`${label}: route must start with "/"`);
    } else if (routes.has(attraction.route)) {
      problems.push(`${label}: duplicate route ${attraction.route}`);
    } else {
      routes.add(attraction.route);
    }
    if (!attraction.name) problems.push(`${label}: missing name`);
    if (!attraction.ride) problems.push(`${label}: missing ride key`);
    if (!attraction.content) problems.push(`${label}: missing content key`);
    if (!isInsideBounds(attraction.position, bounds)) {
      problems.push(`${label}: position outside world bounds`);
    }
  }
  return problems;
};
