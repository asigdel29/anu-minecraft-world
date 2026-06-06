/**
 * Content for the four interactive project frames on the gallery wall.
 *
 * Keyed by the frame identifier ("one".."four") that the 3D model raises on
 * click. Keeping this data separate from the {@link Project} view lets the
 * copy and links be edited without touching presentation logic.
 *
 * Each entry:
 *   name         short title, also used for the link label heuristic
 *   externalLink destination opened from the modal (omit when comingSoon)
 *   comingSoon   when true, the modal shows a placeholder instead of a link
 *   imageUrl     thumbnail shown in the modal
 *   content      array of { header, paragraphs[] } sections
 */
export const projects = {
  one: {
    name: "multiplayer ai agent canvas",
    externalLink: "https://web-xi-roan-47.vercel.app/",
    imageUrl: "/images/agent-canvas.webp",
    content: [
      {
        header: "multiplayer ai agent canvas",
        paragraphs: [
          "a multiplayer, infinite-canvas platform for running cloud ai agents, built on tldraw.",
          "spin up agents on a shared canvas and watch them work together in real time.",
        ],
      },
    ],
  },
  two: {
    name: "matrixportfolio",
    externalLink: "https://github.com/asigdel29/matrixportfolio",
    imageUrl: "/images/matrixportfolio.webp",
    content: [
      {
        header: "portfolio template for devs",
        paragraphs: [
          "a clean, reusable portfolio template for developers — fork it and make it your own.",
        ],
      },
    ],
  },
  three: {
    name: "coding-monkey",
    externalLink: "https://github.com/asigdel29/coding-monkey",
    imageUrl: "/images/coding-monkey.webp",
    content: [
      {
        header: "ai agent platform in rust",
        paragraphs: [
          "an ai agent platform built in rust — fast, lean, and built for tinkering on agent workflows.",
        ],
      },
    ],
  },
  four: {
    name: "ai native sims city",
    externalLink: "https://aiworld.sigdel.world/",
    imageUrl: "/images/ai-native-city.webp",
    content: [
      {
        header: "ai native sims city",
        paragraphs: [
          "an ai-native simcity — a living city simulation where the inhabitants are ai agents.",
          "watch the town come to life and see what the agents get up to.",
        ],
      },
    ],
  },
};
