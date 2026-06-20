import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";

import {
  REMOTE_TTL_MS,
  appendLog,
  chatEnvelope,
  clampChat,
  parseMessage,
  roomUrl,
  shouldSend,
} from "./multiplayerProtocol";

// Module-level WebSocket so both the in-canvas hook and (later) DOM overlays can
// send through the one socket without prop-drilling it across the React tree.
let _ws = null;

// A stable per-browser id, persisted so the relay can remember this player's
// position across reloads. Created lazily on first connect.
const PLAYER_ID_KEY = "mc-player-id";

const loadOrCreatePlayerId = () => {
  try {
    let id = localStorage.getItem(PLAYER_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `p-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(PLAYER_ID_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
};

// ─── Presence store ──────────────────────────────────────────────────────────
// The map of remote players the renderer draws. Each entry is updated in place
// as state frames arrive and dropped when the peer leaves.
export const useMultiplayerStore = create((set, get) => ({
  remotePlayers: {}, // { [id]: { pos, yaw, action, character, lastSeen } }
  activityLog: [], // [{ type, id, text, ts }] — joins, leaves, and chat

  updateRemote: (id, data) =>
    set((s) => ({
      remotePlayers: {
        ...s.remotePlayers,
        [id]: { ...s.remotePlayers[id], ...data, lastSeen: Date.now() },
      },
    })),

  removeRemote: (id) =>
    set((s) => {
      const next = { ...s.remotePlayers };
      delete next[id];
      return { remotePlayers: next };
    }),

  pushLog: (entry) =>
    set((s) => ({
      activityLog: appendLog(s.activityLog, { ...entry, ts: Date.now() }),
    })),

  // Send a chat message through the shared socket and echo it locally so the
  // sender sees it immediately. The text is length-capped before it leaves.
  sendChat: (username, text) => {
    const clean = clampChat(text);
    if (!clean) return;
    if (_ws && _ws.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify(chatEnvelope(username, clean)));
    }
    get().pushLog({
      type: "chat",
      id: "local",
      text: `${username || "you"}: ${clean}`,
    });
  },
}));

// ─── Hook: owns the WebSocket lifecycle ──────────────────────────────────────
// Connects to the relay room, mirrors inbound peer state into the store, and
// returns a throttled `sendState` the Player controller calls each frame. When
// VITE_MULTIPLAYER_HOST is unset or the socket cannot open, the world runs solo.
export function useMultiplayer() {
  const lastSent = useRef(0);
  const { updateRemote, removeRemote, pushLog } =
    useMultiplayerStore.getState();

  useEffect(() => {
    const url = roomUrl(
      import.meta.env.VITE_MULTIPLAYER_HOST,
      loadOrCreatePlayerId()
    );
    if (!url) {
      console.warn("[multiplayer] VITE_MULTIPLAYER_HOST unset; running solo.");
      return undefined;
    }

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      console.warn("[multiplayer] connection failed; running solo.");
      return undefined;
    }

    ws.onmessage = (event) => {
      const data = parseMessage(event.data);
      if (!data) return;
      switch (data.type) {
        case "join":
          pushLog({ type: "join", id: data.id, text: "player joined the world" });
          break;
        case "leave":
          removeRemote(data.id);
          pushLog({ type: "leave", id: data.id, text: "player left the world" });
          break;
        case "state":
          updateRemote(data.id, {
            pos: data.pos,
            yaw: data.yaw,
            action: data.action,
            character: data.character,
          });
          break;
        case "snapshot":
          // The relay's record of recently-seen players, so the world looks
          // populated on arrival instead of only as others move.
          for (const player of data.players || []) {
            if (!player || !player.id) continue;
            updateRemote(player.id, {
              pos: player.pos,
              yaw: player.yaw,
              action: player.action,
              character: player.character,
            });
          }
          break;
        case "chat": {
          const name = data.username || data.id?.slice(0, 6) || "???";
          const text = clampChat(data.text);
          pushLog({ type: "chat", id: data.id, text: `${name}: ${text}` });
          // Surface the message as a transient bubble over the peer's avatar.
          updateRemote(data.id, { chatBubble: text, chatBubbleTs: Date.now() });
          break;
        }
        // "peers" needs no work: a peer becomes visible on its first state frame.
        default:
          break;
      }
    };

    _ws = ws;

    // Drop remote players that have gone quiet (e.g. ghosts seeded from a
    // snapshot whose owner never reconnected), so stale avatars do not linger.
    const prune = setInterval(() => {
      const now = Date.now();
      const store = useMultiplayerStore.getState();
      for (const [id, player] of Object.entries(store.remotePlayers)) {
        if (now - (player.lastSeen || 0) > REMOTE_TTL_MS) store.removeRemote(id);
      }
    }, REMOTE_TTL_MS / 2);

    return () => {
      clearInterval(prune);
      ws.close();
      _ws = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Throttled state broadcast — called every frame by the Player controller.
  const sendState = useCallback((payload) => {
    const now = Date.now();
    if (!shouldSend(now, lastSent.current)) return;
    lastSent.current = now;
    if (_ws && _ws.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify({ type: "state", ...payload }));
    }
  }, []);

  return { sendState };
}
