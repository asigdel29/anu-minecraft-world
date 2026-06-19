import { useCallback, useEffect, useRef } from "react";
import { create } from "zustand";

import {
  parseMessage,
  roomUrl,
  shouldSend,
} from "./multiplayerProtocol";

// Module-level WebSocket so both the in-canvas hook and (later) DOM overlays can
// send through the one socket without prop-drilling it across the React tree.
let _ws = null;

// ─── Presence store ──────────────────────────────────────────────────────────
// The map of remote players the renderer draws. Each entry is updated in place
// as state frames arrive and dropped when the peer leaves.
export const useMultiplayerStore = create((set) => ({
  remotePlayers: {}, // { [id]: { pos, yaw, action, character, lastSeen } }

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
}));

// ─── Hook: owns the WebSocket lifecycle ──────────────────────────────────────
// Connects to the PartyKit room, mirrors inbound peer state into the store, and
// returns a throttled `sendState` the Player controller calls each frame. When
// VITE_PARTYKIT_HOST is unset or the socket cannot open, the world runs solo.
export function useMultiplayer() {
  const lastSent = useRef(0);
  const { updateRemote, removeRemote } = useMultiplayerStore.getState();

  useEffect(() => {
    const url = roomUrl(import.meta.env.VITE_PARTYKIT_HOST);
    if (!url) {
      console.warn("[multiplayer] VITE_PARTYKIT_HOST unset; running solo.");
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
        case "leave":
          removeRemote(data.id);
          break;
        case "state":
          updateRemote(data.id, {
            pos: data.pos,
            yaw: data.yaw,
            action: data.action,
            character: data.character,
          });
          break;
        // "join" and "peers" need no work here: a peer becomes visible as soon
        // as its first state frame arrives, and leaves on "leave".
        default:
          break;
      }
    };

    _ws = ws;
    return () => {
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
