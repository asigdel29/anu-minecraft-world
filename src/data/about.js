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
        "hi, i'm anu :D this is my site! I'm a creator and tinkerer who loves building things at the intersection of art and tech.",
        "I keep updating this site based on whatever I'm fascinated with at the moment, so it's less of a static portfolio and more of a living playground for my experiments.",
        "Lately I've been deep in AI agents — building multiplayer agent tools and an AI-native city sim. Poke around, and stay tuned for more! ✨",
      ],
    },
    {
      header: "What I'm into",
      paragraphs: [
        " - Building multiplayer tools for running cloud AI agents on an infinite canvas.",
        " - An AI-native city sim where the citizens are agents.",
        " - Tinkering with agent harnesses and shipping whatever I'm curious about.",
      ],
    },
  ],
  photos: [
    { src: "/images/about-robot.webp", caption: "- - always building something - -" },
    { src: "/images/about-mrrobot.webp", caption: "- - late-night hacker mode - -" },
  ],
};
