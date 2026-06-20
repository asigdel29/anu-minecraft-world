import "./TourControls.scss";
import { useTourStore } from "../../Experience/stores/tourStore";
import { FLOOR_KEYS, FLOOR_LABELS } from "../../Experience/controls/tour";
import { playSound } from "../../utils/audioSystem";

/**
 * HUD for the stepped guided tour. Shown only while the tour is active, it
 * labels the floor currently framed and lets the visitor step between floors or
 * conclude the tour. Previous is disabled on the ground floor and Next on the
 * top floor.
 */
export default function TourControls() {
  const isTourActive = useTourStore((s) => s.isTourActive);
  const currentFloor = useTourStore((s) => s.currentFloor);
  const nextFloor = useTourStore((s) => s.nextFloor);
  const prevFloor = useTourStore((s) => s.prevFloor);
  const endTour = useTourStore((s) => s.endTour);

  if (!isTourActive) return null;

  const isFirst = currentFloor === 0;
  const isLast = currentFloor === FLOOR_KEYS.length - 1;

  const step = (action) => () => {
    playSound("buttonClick");
    action();
  };

  return (
    <div className="tour-controls">
      <div className="tour-controls-label">{FLOOR_LABELS[currentFloor]}</div>
      <div className="tour-controls-hint">Press E to interact with a poster</div>
      <div className="tour-controls-buttons">
        <button
          type="button"
          className="tour-btn"
          onClick={step(prevFloor)}
          disabled={isFirst}
        >
          Previous
        </button>
        <button
          type="button"
          className="tour-btn"
          onClick={step(nextFloor)}
          disabled={isLast}
        >
          Next
        </button>
        <button
          type="button"
          className="tour-btn tour-btn--end"
          onClick={step(endTour)}
        >
          Conclude
        </button>
      </div>
    </div>
  );
}
