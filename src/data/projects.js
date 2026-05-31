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
    name: "Multiplayer AI Agent Canvas",
    externalLink: "https://web-xi-roan-47.vercel.app/",
    imageUrl: "/images/agent-canvas.webp",
    content: [
      {
        header: "Multiplayer AI Agent Canvas",
        paragraphs: [
          "A multiplayer, infinite-canvas platform for running cloud AI agents, built on tldraw.",
          "Spin up agents on a shared canvas and watch them work together in real time.",
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
        header: "Portfolio Template for Devs",
        paragraphs: [
          "A clean, reusable portfolio template for developers — fork it and make it your own.",
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
        header: "AI Agent Platform in Rust",
        paragraphs: [
          "An AI agent platform built in Rust — fast, lean, and built for tinkering on agent workflows.",
        ],
      },
    ],
  },
  four: {
    name: "AI Native Sims City",
    externalLink: "https://aiworld.sigdel.world/",
    imageUrl: "/images/ai-native-city.webp",
    content: [
      {
        header: "AI Native Sims City",
        paragraphs: [
          "An AI-native SimCity — a living city simulation where the inhabitants are AI agents.",
          "Watch the town come to life and see what the agents get up to.",
        ],
      },
    ],
  },
};
