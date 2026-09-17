import AttractionPageShell from "./AttractionPageShell";
import { graveyardAttraction } from "../../data/parkContent/graveyard";

const GraveyardPage = ({ onBack }) => (
  <AttractionPageShell
    title={graveyardAttraction.title}
    tagline={graveyardAttraction.tagline}
    onBack={onBack}
  >
    <ul className="attraction-list">
      {graveyardAttraction.links.map((link) => (
        <li key={link.url}>
          <a className="attraction-link" href={link.url}>
            {link.title}
          </a>
          {link.verifyNote ? (
            <span className="attraction-verify-note">{link.verifyNote}</span>
          ) : null}
        </li>
      ))}
    </ul>
  </AttractionPageShell>
);

export default GraveyardPage;
