import "./Project.scss";

import Button from "../Button/Button";

const projectData = {
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

const Project = ({ projectID }) => {
  const project = projectData[projectID];

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="project-container">
      <div className="project-image-wrapper">
        <img
          src={project.imageUrl}
          alt={project.name}
          className="project-image"
        />
      </div>

      {project.comingSoon ? (
        <span className="coming-soon-pill">Coming soon 🚧</span>
      ) : (
        <Button href={project.externalLink} type={"link"}>
          {project.externalLink.includes("github.com")
            ? "Open on GitHub"
            : "Visit site"}
        </Button>
      )}

      {project.content.map((section, index) => (
        <div key={index} className="project-section">
          <h2 className="project-section-header">{section.header}</h2>
          {section.paragraphs.map((paragraph, pIndex) => (
            <p key={`${index}-${pIndex}`} className="section-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Project;
