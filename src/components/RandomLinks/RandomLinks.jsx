import "./RandomLinks.scss";
import { playSound } from "../../utils/audioSystem";
import { randomLinks as links } from "../../data/randomLinks";

const RandomLinks = () => {
  return (
    <div className="data-container">
      <p className="section-paragraph random-links-intro">
        a few things i&apos;ve been reading & thinking about lately ✨
      </p>
      <ul className="random-links-list">
        {links.map((link) => (
          <li key={link.url} className="random-links-item">
            <a
              className="random-link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("buttonClick")}
            >
              <span className="random-link-arrow">▸</span>
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RandomLinks;
