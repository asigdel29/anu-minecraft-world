/**
 * Content for the "About me" modal: profile photo, social links, prose
 * sections, and the supplementary photo frames shown beneath the text.
 *
 * Separated from the {@link About} view so the bio can evolve without
 * touching layout.
 */
export const about = {
  name: "anubhav (anu)",
  imageUrl: "/images/me.webp",
  socials: [
    { label: "substack", url: "https://sigdel29.substack.com" },
    { label: "x / twitter", url: "https://x.com/sigdel29" },
    { label: "linkedin", url: "https://www.linkedin.com/in/asigdel/" },
  ],
  content: [
    {
      header: "about me",
      paragraphs: [
        "hi, i'm anu :d this is my site! i build stuff",
        "i keep updating this site based on whatever i'm fascinated with at the moment, so it's less of a static portfolio and more of a living playground for my experiments.",
        "lately i've been deep in ai agents — building multiplayer agent tools and an ai-native city sim.",
      ],
    },
    {
      header: "what i'm into",
      paragraphs: [
        " - anything that would be science fiction years ago.",
        " - agents that can wow people.",
        " - multimodal hardware.",
      ],
    },
  ],
  // No supplementary photos beneath the bio; the about-robot frame now lives on
  // the about wall (see aboutFrameImages in DetailT.jsx) and mr-robot is retired.
  photos: [],
};
