// Pure helpers for the multiplayer wire protocol. They hold no socket or React
// state so the connection rules can be unit-tested in isolation; useMultiplayer
// composes them around a live WebSocket.

// The single shared room every visitor joins, and the broadcast cadence: state
// is sent at most once per SEND_INTERVAL ms (10 Hz) to keep traffic light.
export const ROOM = "world";
export const SEND_INTERVAL = 100;

/**
 * Build the PartyKit room URL for a host. A bare `localhost[:port]` host uses
 * the insecure `ws` scheme (PartyKit's dev server is plain ws); every deployed
 * host uses `wss`. Returns null for an empty host so the caller can run solo.
 */
export const roomUrl = (host) => {
  if (!host) return null;
  const protocol = host.startsWith("localhost") ? "ws" : "wss";
  return `${protocol}://${host}/party/${ROOM}`;
};

/**
 * Parse an inbound socket frame into an object, returning null for anything that
 * is not valid JSON. Peer frames are untrusted, so a malformed payload must
 * never throw out of the message handler.
 */
export const parseMessage = (raw) => {
  try {
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  }
};

/**
 * Throttle gate for outbound state: true when at least `interval` ms have passed
 * since `lastSent`. Kept pure (clock passed in) so it can be tested directly.
 */
export const shouldSend = (now, lastSent, interval = SEND_INTERVAL) =>
  now - lastSent >= interval;
