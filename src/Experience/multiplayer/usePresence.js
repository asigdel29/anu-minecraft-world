// File: src/Experience/multiplayer/usePresence.js
//
// Sentience world — multiplayer presence connection.
//
// Change history:
//   Date        Author      Summary
//   2026-06-16  asigdel29   Connect to the world server and stream poses.
//
// Opens the WebSocket to the world presence server, streams the local Steve's
// pose at a fixed cadence, and applies incoming join/leave/pose events to the
// presence store and remote-pose map. The smoothing/interpolation happens in the
// avatar; here we only transport. Defaults to the deployed server; override with
// VITE_WORLD_SERVER.

import { useEffect } from "react";
import { playerState } from "../controls/playerState";
import { usePresenceStore, remotePoses } from "./presenceStore";

const SERVER = import.meta.env.VITE_WORLD_SERVER || "wss://sentience-world-production.up.railway.app/ws";
const SEND_HZ = 12;

// randomName gives each visitor a friendly distinct label.
function randomName() {
  return `Steve-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** usePresence wires the local client to the world server for its lifetime. */
export function usePresence() {
  useEffect(() => {
    const store = usePresenceStore.getState();
    const name = randomName();
    let ws;
    let sendTimer;
    let closed = false;

    const connect = () => {
      ws = new WebSocket(`${SERVER}?name=${encodeURIComponent(name)}&room=sentience`);

      ws.onmessage = (ev) => {
        let msg;
        try {
          msg = JSON.parse(ev.data);
        } catch {
          return;
        }
        switch (msg.type) {
          case "welcome":
            store.setSelf(msg.id);
            (msg.roster || []).forEach((p) => store.addPlayer(p.id, p.name));
            break;
          case "join":
            store.addPlayer(msg.id, msg.name);
            break;
          case "leave":
            store.removePlayer(msg.id);
            remotePoses.delete(msg.id);
            break;
          case "pose":
            if (!usePresenceStore.getState().players[msg.id]) store.addPlayer(msg.id, msg.name);
            remotePoses.set(msg.id, { x: msg.x, y: msg.y, z: msg.z, yaw: msg.yaw, action: msg.action });
            break;
          default:
            break;
        }
      };

      // Reconnect on drop so a brief network blip does not end the session.
      ws.onclose = () => {
        if (!closed) setTimeout(connect, 1500);
      };
    };

    connect();

    // Stream the local pose at a steady cadence.
    sendTimer = setInterval(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const p = playerState.position;
      ws.send(
        JSON.stringify({
          type: "pose",
          x: p.x,
          y: p.y,
          z: p.z,
          yaw: playerState.yaw,
          action: playerState.action,
        }),
      );
    }, 1000 / SEND_HZ);

    return () => {
      closed = true;
      clearInterval(sendTimer);
      if (ws) ws.close();
      usePresenceStore.getState().reset();
      remotePoses.clear();
    };
  }, []);
}
