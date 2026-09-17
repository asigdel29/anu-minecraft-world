import AttractionPageShell from "./AttractionPageShell";
import AttractionSections from "./AttractionSections";
import { factoryAttraction } from "../../data/parkContent/factory";

const FactoryPage = ({ onBack }) => (
  <AttractionPageShell
    title={factoryAttraction.title}
    tagline={factoryAttraction.tagline}
    onBack={onBack}
  >
    <AttractionSections sections={factoryAttraction.aboutSections} />
    <AttractionSections sections={factoryAttraction.siteCreditSections} />
  </AttractionPageShell>
);

export default FactoryPage;
