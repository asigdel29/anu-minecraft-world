// ───────────────────────────────────────────────────────────────────────────
// CONTENT MAP — edit this one file to change what shows inside the house.
//
// The camera climbs the interior atrium floor by floor. Each `PANEL` below is a
// framed picture on a floor's interior wall that opens a modal when clicked.
// To change content you usually only touch this file (and the matching data
// file under src/data/ for the modal's text):
//   • swap an image  -> change `img` (drop the file in public/images/)
//   • move a panel   -> change `floor` and/or `x`
//   • rename a tab   -> change `title`
//   • which modal    -> change `modal` ("about" | "manual" | "links" | "books"
//                        | "project"); "project" also needs `projectId` (a key
//                        in src/data/projects.js)
//   • add a floor    -> add an entry to FLOORS, then point a PANEL's `floor` at it
// ───────────────────────────────────────────────────────────────────────────

// Eye-height (`y`) and wall depth (`z`) of each floor, in world units. These are
// tuned to the baked house; nudge them if the camera or house geometry changes.
export const FLOORS = {
  ground: { y: 67.5, z: -3.3 },
  middle: { y: 73.0, z: -2.6 },
  top: { y: 78.4, z: -1.9 },
};

// The framed panels. `x` is the horizontal position along the floor's back wall
// (the house centre is about x = -5.5). `modal` selects which pop-up opens.
export const PANELS = [
  { id: "about", floor: "ground", x: -8.0, img: "/images/me.webp", modal: "about", title: "About me" },
  { id: "manual", floor: "ground", x: -3.0, img: "/images/about-robot.webp", modal: "manual", title: "User Manual" },
  { id: "one", floor: "middle", x: -9.6, img: "/images/agent-canvas.webp", modal: "project", projectId: "one", title: "Multiplayer AI Agent Canvas" },
  { id: "two", floor: "middle", x: -6.7, img: "/images/matrixportfolio.webp", modal: "project", projectId: "two", title: "matrixportfolio" },
  { id: "three", floor: "middle", x: -3.8, img: "/images/coding-monkey.webp", modal: "project", projectId: "three", title: "coding-monkey" },
  { id: "four", floor: "middle", x: -0.9, img: "/images/ai-native-city.webp", modal: "project", projectId: "four", title: "AI Native Sims City" },
  { id: "links", floor: "top", x: -8.5, img: "/images/newsletter.webp", modal: "links", title: "Random Links" },
  { id: "books", floor: "top", x: -2.5, img: "/images/books.webp", modal: "books", title: "Currently Reading" },
];

// The interactive terminal sits between the top-floor panels (x = -5.5). It is
// rendered as its own 3D screen (src/Experience/Terminal3D.jsx), not a framed
// photo, so it lives here only as a note for layout.
