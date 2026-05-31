import "./About.scss";
import Button from "../Button/Button";
import { about } from "../../data/about";

const About = () => {
  return (
    <div className="data-container">
      <div className="image-wrapper">
        <img src={about.imageUrl} alt={about.name} className="data-image" />
      </div>

      {about.socials.map((social) => (
        <Button key={social.url} href={social.url} type={"link"}>
          {social.label}
        </Button>
      ))}

      {about.content.map((section, index) => (
        <div key={index} className="data-section">
          <h2 className="about-section-header">{section.header}</h2>
          {section.paragraphs.map((paragraph, pIndex) => (
            <p key={`${index}-${pIndex}`} className="section-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      ))}

      {about.photos.map((photo) => (
        <div key={photo.src}>
          <div className="image-wrapper-two">
            <img src={photo.src} alt={photo.caption} className="data-image-two" />
          </div>
          <p className="section-paragraph">{photo.caption}</p>
        </div>
      ))}
    </div>
  );
};

export default About;
