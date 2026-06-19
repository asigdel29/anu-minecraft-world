// Pure helpers for the multiplayer wire protocol. They hold no socket or React
// state so the connection rules can be unit-tested in isolation; useMultiplayer
// composes them around a live WebSocket.

// The single shared room every visitor joins, and the broadcast cadence: state
// is sent at most once per SEND_INTERVAL ms (10 Hz) to keep traffic light.
export const ROOM = "world";
export const SEND_INTERVAL = 100;

// Longest chat message kept, and how many activity-log entries to retain.
export const MAX_CHAT_LENGTH = 120;
export const ACTIVITY_LOG_CAP = 50;

/**
 * Build the relay room URL for a host. A bare `localhost[:port]` host uses the
 * insecure `ws` scheme (the local `wrangler dev` server is plain ws); every
 * deployed host uses `wss`. Returns null for an empty host so the caller can
 * run solo.
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

/**
 * Cap a chat string to MAX_CHAT_LENGTH. Peer text is untrusted, so an overlong
 * (or non-string) payload must never reach the log or a speech bubble unbounded.
 * Rendering still escapes it — this only bounds length.
 */
export const clampChat = (text, max = MAX_CHAT_LENGTH) =>
  typeof text === "string" ? text.slice(0, max) : "";

/** Build a chat envelope with the text already length-capped. */
export const chatEnvelope = (username, text) => ({
  type: "chat",
  username,
  text: clampChat(text),
});

/**
 * Append an entry to the activity log, retaining only the most recent `cap`
 * entries so the log can never grow without bound.
 */
export const appendLog = (log, entry, cap = ACTIVITY_LOG_CAP) =>
  [...log, entry].slice(-cap);
