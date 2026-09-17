import { describe, it, expect, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";

import { attractions } from "./registry";
import FortunePage from "./FortunePage";

// React 18 needs the flag to treat jsdom renders inside act() as production-
// like component work.
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const PAGE_IDS = [
  "arcade",
  "factory",
  "graveyard",
  "library",
  "hardware",
  "launches",
  "fortune",
];

const normalize = (text) => text.replace(/\s+/g, " ").trim().toLowerCase();

const renderPage = (component) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(createElement(component, { onBack: () => {} }));
  });
  const text = normalize(container.textContent);
  const hrefs = [...container.querySelectorAll("a[href]")].map((anchor) =>
    anchor.getAttribute("href")
  );
  const imageSrcs = [...container.querySelectorAll("img[src]")].map((img) =>
    img.getAttribute("src")
  );
  act(() => {
    root.unmount();
  });
  container.remove();
  return { text, hrefs, imageSrcs };
};

let renderedPages = null;
const allPages = () => {
  if (!renderedPages) {
    renderedPages = PAGE_IDS.map((id) => ({
      id,
      ...renderPage(attractions[id].component),
    }));
  }
  return renderedPages;
};

const expectOnExactlyOnePage = (needle, getPageValue, description) => {
  const matches = allPages().filter((page) =>
    getPageValue(page).includes(needle)
  );
  expect(
    matches.map((page) => page.id),
    `expected ${description} on exactly one attraction page`
  ).toHaveLength(1);
  return matches[0].id;
};

const expectTextOnExactlyOnePage = (needle) =>
  expectOnExactlyOnePage(normalize(needle), (page) => page.text, `"${needle}"`);

const expectHrefOnExactlyOnePage = (href) =>
  expectOnExactlyOnePage(href, (page) => page.hrefs, `link ${href}`);

const expectImageOnExactlyOnePage = (src) =>
  expectOnExactlyOnePage(src, (page) => page.imageSrcs, `image ${src}`);

// Recon §8 inventory, verbatim from src/data at develop HEAD 55c6e69.
const INVENTORY_TEXT = [
  // Agent Arcade — the four projects.
  "multiplayer ai agent canvas",
  "a multiplayer, infinite-canvas platform for running cloud ai agents, built on tldraw.",
  "spin up agents on a shared canvas and watch them work together in real time.",
  "matrixportfolio",
  "a clean, reusable portfolio template for developers — fork it and make it your own.",
  "coding-monkey",
  "an ai agent platform built in rust — fast, lean, and built for tinkering on agent workflows.",
  "ai native sims city",
  "an ai-native simcity — a living city simulation where the inhabitants are ai agents.",
  "watch the town come to life and see what the agents get up to.",
  // The Factory — about intro, "what i'm into", and the site/template credit.
  "hi, i'm anu :d this is my site! i build stuff",
  "so it's less of a static portfolio and more of a living playground for my experiments.",
  "lately i've been deep in ai agents — building multiplayer agent tools and an ai-native city sim.",
  "anything that would be science fiction years ago.",
  "agents that can wow people.",
  "multimodal hardware.",
  "folio template by andrew woan — full credit to him for the 3d world!",
  // Idea Graveyard — all eight links, with the three (verify) flags verbatim.
  "21 lessons for the 21st century",
  "effective altruism in the garden of ends",
  "the new war on asian american excellence",
  "cognitive security",
  "rightness is a prison",
  "ftc: protect your identity",
  "how to be more agentic",
  "how to prepare for the next decade",
  '(verify) — lesswrong "cognitive security as an ai safety cause area"',
  '(verify) — ftc "5 ways to help protect your identity"',
  "(verify) — scott barker, the wake up call",
  // The Library — the six placeholder books (title + author).
  "the beginning of infinity",
  "david deutsch",
  "gödel, escher, bach",
  "douglas hofstadter",
  "thinking, fast and slow",
  "daniel kahneman",
  "dune",
  "frank herbert",
  "deep work",
  "cal newport",
  "snow crash",
  "neal stephenson",
  // Hardware Workshop — the user manual.
  "welcome to what i like to call my personal user manual :d",
  "founding team at lora.",
  "lifelong techno-optimist. previously a hedonist, more stoic now.",
  "previously worked in it consultancy, then vr / metaverse, then ai b2b saas.",
  "immigrant from nepal. moved to the usa in 2019 for higher education.",
  "background in cognitive science, computer science, and biomedical health informatics.",
  "engineer, film buff, wannabe philosopher.",
  "aiming to be the best at what you do, you're ngmi.",
  "be okay with being wrong.",
  "never hold back.",
  "still writing this. ✍️",
  // Launch Tower — the three socials (labels; hrefs asserted separately).
  "substack",
  "x / twitter",
  "linkedin",
  // Fortune Booth — the new placeholder.
  "my story: still writing ✍️",
  "hi, i'm anu :d this is my site, i like to build cool sh*t",
];

const INVENTORY_HREFS = [
  "https://agents.sigdel.world/",
  "https://github.com/asigdel29/matrixportfolio",
  "https://github.com/asigdel29/coding-monkey",
  "https://aiworld.sigdel.world/",
  "https://www.ynharari.com/book/21-lessons-book/",
  "https://www.lesswrong.com/posts/YDHRa5cmKQCLGrCWj/effective-altruism-in-the-garden-of-ends",
  "https://garryslist.org/posts/the-new-war-on-asian-american-excellence",
  "https://www.lesswrong.com/posts/KGcE7eAdfxHchk25X/cognitive-security-as-an-ai-safety-cause-area",
  "https://usefulfictions.substack.com/p/rightness-is-a-prison",
  "https://www.ftc.gov/media/5-ways-help-protect-your-identity",
  "https://usefulfictions.substack.com/p/how-to-be-more-agentic",
  "https://thewakeupcallnewsletter.substack.com/p/how-to-prepare-for-the-next-decade",
  "https://sigdel29.substack.com",
  "https://x.com/sigdel29",
  "https://www.linkedin.com/in/asigdel/",
];

const INVENTORY_IMAGES = [
  "/images/agent-canvas.webp",
  "/images/matrixportfolio.webp",
  "/images/coding-monkey.webp",
  "/images/ai-native-city.webp",
];

describe("attraction content parity (recon §8)", () => {
  it("renders all seven attraction pages with content", () => {
    expect(allPages()).toHaveLength(7);
    for (const page of allPages()) {
      expect(page.text.length).toBeGreaterThan(0);
    }
  });

  it("renders every inventory item on exactly one attraction page", () => {
    for (const item of INVENTORY_TEXT) expectTextOnExactlyOnePage(item);
    for (const href of INVENTORY_HREFS) expectHrefOnExactlyOnePage(href);
    for (const src of INVENTORY_IMAGES) expectImageOnExactlyOnePage(src);
  });
});

describe("attraction page shell", () => {
  it("returns to the park via the back control and ESC, then stops listening on unmount", () => {
    const onBack = vi.fn();
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(createElement(FortunePage, { onBack }));
    });

    const backButton = container.querySelector("button.attraction-page-back");
    expect(backButton?.textContent).toContain("back to the park");
    act(() => {
      backButton.click();
    });
    expect(onBack).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onBack).toHaveBeenCalledTimes(2);

    act(() => {
      root.unmount();
    });
    container.remove();
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it("moves focus to the page heading on mount for keyboard visitors", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(createElement(FortunePage, { onBack: () => {} }));
    });
    expect(document.activeElement).toBe(
      container.querySelector("h1.attraction-page-title")
    );
    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
