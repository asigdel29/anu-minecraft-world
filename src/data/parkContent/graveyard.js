/**
 * Idea Graveyard (/graveyard) — all eight randomLinks entries.
 *
 * The three "(verify)" flags in randomLinks.js live in comments, so they are
 * carried over here verbatim to stay visible on the page.
 */
import { randomLinks } from "../randomLinks";

const VERIFY_NOTES = {
  "cognitive security":
    '(verify) — LessWrong "Cognitive Security as an AI Safety Cause Area"',
  "ftc: protect your identity":
    '(verify) — FTC "5 Ways to Help Protect Your Identity"',
  "how to prepare for the next decade":
    "(verify) — Scott Barker, The Wake Up Call",
};

export const graveyardAttraction = {
  id: "graveyard",
  route: "/graveyard",
  title: "Idea Graveyard",
  tagline: "essays worth keeping, buried here.",
  links: randomLinks.map((link) => ({
    ...link,
    verifyNote: VERIFY_NOTES[link.title] ?? null,
  })),
};
