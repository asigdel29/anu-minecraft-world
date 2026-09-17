import { parseText } from "../../utils/parseText";

/**
 * Renders the { header, paragraphs[] } section shape shared by the about,
 * info, and userManual data — with *asterisk-wrapped* spans highlighted.
 */
const AttractionSections = ({ sections }) => (
  <>
    {sections.map((section, index) => (
      <section key={index} className="attraction-section">
        <h2 className="attraction-section-header">{section.header}</h2>
        {section.paragraphs.map((paragraph, pIndex) => (
          <p
            key={`${index}-${pIndex}`}
            className="attraction-section-paragraph"
          >
            {parseText(paragraph)}
          </p>
        ))}
      </section>
    ))}
  </>
);

export default AttractionSections;
