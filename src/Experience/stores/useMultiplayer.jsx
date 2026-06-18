import { useEffect, useRef, useCallback } from "react";
import { create } from "zustand";

// Module-level WebSocket reference so both the hook (inside R3F canvas) and
// DOM-level components (ChatOverlay) can send messages through the same socket.
let _ws = null;

// ─── Multiplayer Zustand store ───────────────────────────────────────────────
// Keeps the map of remote players and the activity log readable by the terminal.
export const useMultiplayerStore = create((set, get) => ({
  remotePlayers: {}, // { [id]: { pos, yaw, action, character, lastSeen } }
  activityLog: [], // [{ type, id, text, ts }]

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
      activityLog: [...s.activityLog.slice(-49), { ...entry, ts: Date.now() }],
    })),

  // Send a chat message through the shared WebSocket.
  sendChat: (username, text) => {
    if (_ws && _ws.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify({ type: "chat", username, text }));
    }
    // Push to local log immediately for instant feedback.
    get().pushLog({
      type: "chat",
      id: "local",
      text: `${username || "you"}: ${text}`,
    });
  },
}));

// ─── Hook: manages the WebSocket lifecycle ───────────────────────────────────
const SEND_INTERVAL = 100; // 10 Hz state broadcasts
const ROOM = "world";

export function useMultiplayer() {
  const lastSent = useRef(0);
  const { updateRemote, removeRemote, pushLog } = useMultiplayerStore.getState();

  useEffect(() => {
    const host =
      import.meta.env.VITE_PARTYKIT_HOST || "anu-minecraft-world.partykit.dev";
    const protocol = host.startsWith("localhost") ? "ws" : "wss";
    const url = `${protocol}://${host}/party/${ROOM}`;

    let ws;
    try {
      ws = new WebSocket(url);
    } catch {
      console.warn("[multiplayer] WebSocket connection failed; running solo.");
      return;
    }

    ws.onopen = () => {
      console.log("[multiplayer] connected");
    };

    ws.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (data.type) {
        case "join":
          pushLog({
            type: "join",
            id: data.id,
            text: `player joined the world`,
          });
          break;

        case "leave":
          removeRemote(data.id);
          pushLog({
            type: "leave",
            id: data.id,
            text: `player left the world`,
          });
          break;

        case "state":
          updateRemote(data.id, {
            pos: data.pos,
            yaw: data.yaw,
            action: data.action,
            character: data.character,
          });
          break;

        case "chat": {
          const name = data.username || data.id?.slice(0, 6) || "???";
          pushLog({
            type: "chat",
            id: data.id,
            text: `${name}: ${data.text}`,
          });
          // Attach the chat bubble to the remote player entry.
          updateRemote(data.id, {
            chatBubble: data.text,
            chatBubbleTs: Date.now(),
          });
          break;
        }

        case "peers":
          // Initial list of peers already in the room — no-op, their state
          // updates will arrive shortly.
          break;

        default:
          break;
      }
    };

    ws.onclose = () => {
      console.log("[multiplayer] disconnected");
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
    if (now - lastSent.current < SEND_INTERVAL) return;
    lastSent.current = now;
    if (_ws && _ws.readyState === WebSocket.OPEN) {
      _ws.send(JSON.stringify({ type: "state", ...payload }));
    }
  }, []);

  return { sendState };
}

