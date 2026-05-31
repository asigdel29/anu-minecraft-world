import "./Project.scss";

import Button from "../Button/Button";
import { projects } from "../../data/projects";

const Project = ({ projectID }) => {
  const project = projects[projectID];

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
