/**
 * The Factory (/factory) — the about intro ("i build stuff…"), the
 * "what i'm into" list, and the site/template credit from info.js.
 */
import { about } from "../about";
import { info } from "../info";

export const factoryAttraction = {
  id: "factory",
  route: "/factory",
  title: "The Factory",
  tagline: "where the stuff gets built.",
  aboutSections: about.content,
  siteCreditSections: info.content,
};
