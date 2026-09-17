import AttractionPageShell from "./AttractionPageShell";
import { fortuneAttraction } from "../../data/parkContent/fortune";

const FortunePage = ({ onBack }) => (
  <AttractionPageShell title={fortuneAttraction.title} onBack={onBack}>
    <p className="attraction-section-paragraph">{fortuneAttraction.message}</p>
    <p className="attraction-section-paragraph">{fortuneAttraction.tagline}</p>
  </AttractionPageShell>
);

export default FortunePage;
