// File: src/Experience/battleship/client.js
//
// Sentience world — Battleship API client (ported for in-world play).
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Port the Battleship REST/WS client into the world.
//
// A small client for the existing Battleship backend, used by the in-world game.
// It is a JS port of the deployed game's client (sentience/web/src/api/client.ts)
// kept dependency-free so it runs in this app's React 18 / r3f v8 stack. Auth is
// a bearer token only (no cookies), so requests work from this world's origin
// once the backend allows it (CORS). Defaults to the production backend; override
// with VITE_BATTLESHIP_API.

const BASE_URL = import.meta.env.VITE_BATTLESHIP_API || "https://battleship-api-production.up.railway.app";

const TOKEN_KEY = "bs.token";
const GAME_KEY = "bs.gameId";

/** savedToken returns the stored session token, or null. */
export const savedToken = () => localStorage.getItem(TOKEN_KEY);
/** savedGameId returns the stored game id, or null. */
export const savedGameId = () => localStorage.getItem(GAME_KEY);

/** saveSession persists the session for refresh rehydration. */
export const saveSession = (gameId, token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(GAME_KEY, gameId);
};

/** clearSession forgets the persisted session. */
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(GAME_KEY);
};

async function request(path, init) {
  const token = savedToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `request failed: ${res.status}`);
  }
  return res.json();
}

/** createGame starts a new game in the given mode and persists the session. */
export async function createGame(mode) {
  const res = await request("/api/games", { method: "POST", body: JSON.stringify({ mode }) });
  saveSession(res.gameId, res.token);
  return res;
}

/** joinGame claims seat 1 of a human game via the game id, persisting it. */
export async function joinGame(gameId) {
  const res = await request(`/api/games/${gameId}/join`, { method: "POST" });
  saveSession(res.gameId, res.token);
  return res;
}

/** placeShip places one ship on the caller's own board. */
export function placeShip(gameId, ship, x, y, orientation) {
  return request(`/api/games/${gameId}/place`, {
    method: "POST",
    body: JSON.stringify({ ship, x, y, orientation }),
  });
}

/** fire fires at a coordinate on the opponent's board. */
export function fire(gameId, x, y) {
  return request(`/api/games/${gameId}/fire`, {
    method: "POST",
    body: JSON.stringify({ x, y }),
  });
}

/** getGame fetches the caller's authoritative view (refresh rehydration). */
export function getGame(gameId) {
  return request(`/api/games/${gameId}`);
}

/** openSocket streams live game state; returns the WebSocket. */
export function openSocket(gameId, onState) {
  const token = savedToken() || "";
  const wsBase = BASE_URL.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/api/games/${gameId}/ws?token=${encodeURIComponent(token)}`);
  ws.onmessage = (ev) => {
    try {
      const msg = JSON.parse(ev.data);
      if (msg.type === "state" && msg.view) onState(msg.view);
    } catch {
      // ignore malformed frames
    }
  };
  return ws;
}
