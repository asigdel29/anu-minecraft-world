import "./UserManual.scss";
import { parseText } from "../../utils/parseText";
import { userManual } from "../../data/userManual";

const UserManual = () => {
  return (
    <div className="data-container">
      <p className="section-paragraph manual-intro">
        {parseText(userManual.intro)}
      </p>
      {userManual.content.map((section, index) => (
        <div key={index} className="data-section">
          <h2 className="manual-section-header">{section.header}</h2>
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

export default UserManual;
