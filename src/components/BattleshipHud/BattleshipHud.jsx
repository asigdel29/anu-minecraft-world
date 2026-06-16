// File: src/components/BattleshipHud/BattleshipHud.jsx
//
// Sentience world — DOM HUD for the in-world Battleship game.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Add Battleship HUD (mode select, status, rematch).
//
// A lightweight overlay shown while the in-world Battleship game is engaged. It
// handles the choices that read better as DOM than as 3D: pick a mode, see the
// turn/result status, rotate during placement, rematch, and exit. The 3D board
// itself lives in the scene (BattleshipBoard). State comes from the battleship
// store.

import "./BattleshipHud.scss";
import { useBattleshipStore, FLEET, placedCount } from "../../Experience/battleship/battleshipStore";

export default function BattleshipHud() {
  const active = useBattleshipStore((s) => s.active);
  const view = useBattleshipStore((s) => s.view);
  const busy = useBattleshipStore((s) => s.busy);
  const error = useBattleshipStore((s) => s.error);
  const lastResult = useBattleshipStore((s) => s.lastResult);
  const orientation = useBattleshipStore((s) => s.orientation);
  const newGame = useBattleshipStore((s) => s.newGame);
  const autoPlace = useBattleshipStore((s) => s.autoPlace);
  const toggleOrientation = useBattleshipStore((s) => s.toggleOrientation);
  const rematch = useBattleshipStore((s) => s.rematch);
  const close = useBattleshipStore((s) => s.close);

  if (!active) return null;

  // Mode select when no game is in progress.
  if (!view) {
    return (
      <div className="bs-hud">
        <div className="bs-panel">
          <h2>Battleship</h2>
          {error && <p className="bs-error">{error}</p>}
          <div className="bs-buttons">
            <button disabled={busy} onClick={() => newGame("ai")}>
              Play vs AI
            </button>
            <button disabled={busy} onClick={() => newGame("human")}>
              Play vs Human
            </button>
          </div>
          <button className="bs-ghost" onClick={close}>
            Leave
          </button>
        </div>
      </div>
    );
  }

  const placing = view.status === "placing";
  const finished = view.status === "finished";
  const next = placing ? placedCount(view) : -1;
  const allPlaced = next >= FLEET.length;

  let status = "";
  if (placing) {
    status = allPlaced ? "Fleet ready — waiting for opponent…" : `Place your ${FLEET[next].ship}`;
  } else if (finished) {
    status = view.winner === view.seat ? "You win! 🎉" : "You lose.";
  } else {
    status = view.yourTurn ? "Your turn — click enemy waters" : "Waiting for opponent…";
  }

  const inviteUrl =
    view.mode === "human" && placing ? `${window.location.origin}/?bsjoin=${view.gameId}` : null;

  return (
    <div className="bs-hud bs-hud--bar">
      <div className="bs-bar">
        <span className="bs-status">{status}</span>
        {lastResult && <span className="bs-result">{lastResult}</span>}
        {error && <span className="bs-error">{error}</span>}
        <span className="bs-spacer" />
        {placing && !allPlaced && (
          <>
            <button onClick={toggleOrientation}>Rotate: {orientation}</button>
            <button disabled={busy} onClick={autoPlace}>
              Auto-place
            </button>
          </>
        )}
        {finished && (
          <button disabled={busy} onClick={rematch}>
            Rematch
          </button>
        )}
        <button className="bs-ghost" onClick={close}>
          Exit
        </button>
      </div>
      {inviteUrl && (
        <div className="bs-invite">
          Invite a friend:&nbsp;
          <input readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} />
          <button onClick={() => void navigator.clipboard?.writeText(inviteUrl)}>Copy</button>
        </div>
      )}
    </div>
  );
}
