import AttractionPageShell from "./AttractionPageShell";
import { launchesAttraction } from "../../data/parkContent/launches";

const LaunchesPage = ({ onBack }) => (
  <AttractionPageShell
    title={launchesAttraction.title}
    tagline={launchesAttraction.tagline}
    onBack={onBack}
  >
    <ul className="attraction-list">
      {launchesAttraction.socials.map((social) => (
        <li key={social.url}>
          <a className="attraction-link" href={social.url}>
            {social.label}
          </a>
        </li>
      ))}
    </ul>
  </AttractionPageShell>
);

export default LaunchesPage;
