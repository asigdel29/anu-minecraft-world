import AttractionPageShell from "./AttractionPageShell";
import AttractionSections from "./AttractionSections";
import { parseText } from "../../utils/parseText";
import { hardwareAttraction } from "../../data/parkContent/hardware";

const HardwarePage = ({ onBack }) => (
  <AttractionPageShell
    title={hardwareAttraction.title}
    tagline={hardwareAttraction.tagline}
    onBack={onBack}
  >
    <p className="attraction-section-paragraph">
      {parseText(hardwareAttraction.manual.intro)}
    </p>
    <AttractionSections sections={hardwareAttraction.manual.content} />
  </AttractionPageShell>
);

export default HardwarePage;
