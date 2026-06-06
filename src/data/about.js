/**
 * Content for the "About me" modal: profile photo, social links, prose
 * sections, and the supplementary photo frames shown beneath the text.
 *
 * Separated from the {@link About} view so the bio can evolve without
 * touching layout.
 */
export const about = {
  name: "Anubhav (Anu)",
  imageUrl: "/images/me.webp",
  socials: [
    { label: "Substack", url: "https://sigdel29.substack.com" },
    { label: "X / Twitter", url: "https://x.com/sigdel29" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/asigdel/" },
  ],
  content: [
    {
      header: "About Me",
      paragraphs: [
        "hi, i'm anu :D this is my site! I build stuff",
        "I keep updating this site based on whatever I'm fascinated with at the moment, so it's less of a static portfolio and more of a living playground for my experiments.",
        "Lately I've been deep in AI agents — building multiplayer agent tools and an AI-native city sim.",
      ],
    },
    {
      header: "What I'm into",
      paragraphs: [
        " - Anything that would be science fiction years ago.",
        " - Agents that can wow people.",
        " - Multimodal hardware.",
      ],
    },
  ],
  // No supplementary photos beneath the bio; the about-robot frame now lives on
  // the about wall (see aboutFrameImages in DetailT.jsx) and mr-robot is retired.
  photos: [],
};
