import "./Info.scss";
import { parseText } from "../../utils/parseText";
import { info } from "../../data/info";

const Info = () => {
  return (
    <div className="data-container">
      {info.content.map((section, index) => (
        <div key={index} className="data-section">
          <h2 className="info-section-header">{section.header}</h2>
          {section.paragraphs.map((paragraph, pIndex) => (
            <p key={`${index}-${pIndex}`} className="section-paragraph">
              {parseText(paragraph)}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Info;
