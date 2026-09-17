/**
 * The Library (/library) — the six "currently reading" books.
 *
 * TODO(anu): books.js is still the placeholder reading list; migrate the real
 * list here when it exists.
 */
import { books } from "../books";

export const libraryAttraction = {
  id: "library",
  route: "/library",
  title: "The Library",
  tagline: "the current reading shelf.",
  books,
};
