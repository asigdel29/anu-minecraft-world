/**
 * Agent Arcade (/arcade) — the four portfolio projects from the current
 * gallery wall, mapped onto the arcade attraction.
 *
 * Content is derived from src/data/projects.js so the arcade can never drift
 * from the source data (LOR-2423 recon §8).
 */
import { projects } from "../projects";

export const arcadeAttraction = {
  id: "arcade",
  route: "/arcade",
  title: "Agent Arcade",
  tagline: "four machines from the workshop floor.",
  projects: Object.values(projects),
};
