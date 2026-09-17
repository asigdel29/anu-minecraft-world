import AttractionPageShell from "./AttractionPageShell";
import { arcadeAttraction } from "../../data/parkContent/arcade";

const AgentArcadePage = ({ onBack }) => (
  <AttractionPageShell
    title={arcadeAttraction.title}
    tagline={arcadeAttraction.tagline}
    onBack={onBack}
  >
    {arcadeAttraction.projects.map((project) => (
      <section key={project.name} className="attraction-section">
        <h2 className="attraction-section-header">{project.name}</h2>
        {project.content.map((section, sIndex) =>
          section.paragraphs.map((paragraph, pIndex) => (
            <p
              key={`${sIndex}-${pIndex}`}
              className="attraction-section-paragraph"
            >
              {paragraph}
            </p>
          ))
        )}
        <a className="attraction-link" href={project.externalLink}>
          open ↗
        </a>
        <img
          className="attraction-image"
          src={project.imageUrl}
          alt={project.name}
          loading="lazy"
        />
      </section>
    ))}
  </AttractionPageShell>
);

export default AgentArcadePage;
