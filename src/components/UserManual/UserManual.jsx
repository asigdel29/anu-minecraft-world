import "./UserManual.scss";
import { parseText } from "../../utils/parseText";

const userManualData = {
  content: [
    {
      header: "🪪 The Six-Bullet Bio",
      paragraphs: [
        " - Founding team at *Lora*.",
        " - Lifelong techno-optimist. Previously a hedonist, more stoic now.",
        " - Previously worked in IT consultancy, then VR / metaverse, then AI B2B SaaS.",
        " - Immigrant from *Nepal*. Moved to the USA in 2019 for higher education.",
        " - Background in cognitive science, computer science, and biomedical health informatics.",
        " - Engineer, film buff, wannabe philosopher.",
      ],
    },
    {
      header: "🧭 Principles",
      paragraphs: [
        ' - *"If you\'re not aiming to be the best at what you do, you\'re ngmi."*',
        " - Be okay with being wrong.",
        " - Never hold back.",
      ],
    },
    {
      header: "📖 My Story",
      paragraphs: ["Still writing this. ✍️"],
    },
  ],
};

const UserManual = () => {
  return (
    <div className="data-container">
      <p className="section-paragraph manual-intro">
        {parseText("welcome to what i like to call my *personal user manual* :D")}
      </p>
      {userManualData.content.map((section, index) => (
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
