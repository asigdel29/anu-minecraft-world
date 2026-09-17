import { useParkNav } from "../../Experience/park/parkStore";
import { getAttraction } from "../../Experience/park/attractions";
import { getAttraction as getPageEntry } from "../../components/AttractionPage/registry";

// The DOM overlay shown in page mode: the attraction's readable page,
// resolved from the real attraction-pages registry (keyed by the manifest's
// `content` id), rendered over the parked 3D scene. The page's shell owns the
// chrome — title, tagline, back control, Escape — so this overlay only
// resolves the right page and hands it the router's exit as `onBack` (the
// contract the shell documents). The URL sync lives in App so the address
// bar has a single writer.
export default function ParkPageOverlay() {
  const attractionId = useParkNav((state) => state.attractionId);
  const exit = useParkNav((state) => state.exit);
  const attraction = getAttraction(attractionId);
  if (!attraction) return null;
  const pageEntry = getPageEntry(attraction.content);
  const Page = pageEntry?.component;
  if (!Page) return null;

  return (
    <div
      className="park-page"
      role="dialog"
      aria-modal="true"
      aria-label={attraction.name}
    >
      <Page onBack={exit} />
    </div>
  );
}
