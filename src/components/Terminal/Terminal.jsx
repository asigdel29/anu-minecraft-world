import { useEffect, useRef } from "react";

import { useMultiplayerStore } from "../../Experience/stores/useMultiplayer";

// The interactive "terminal / world log" modal opened from the top-floor CRT.
// Shows a live feed of multiplayer events: joins, leaves, and chat messages.
// Falls back to a static guestbook when no events have occurred yet.

const STATIC_LINES = [
  "$ whoami",
  "anu — builder of things on the internet",
  "",
  "$ cat guestbook.txt",
  "thanks for climbing all the way up here :)",
  "hope you liked the house.",
  "",
  "$ contact --say-hi",
  "anu@getlora.com",
];

function formatTs(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Terminal() {
  const activityLog = useMultiplayerStore((s) => s.activityLog);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activityLog]);

  const hasEvents = activityLog.length > 0;

  return (
    <div
      ref={scrollRef}
      style={{
        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
        background: "#0b0f0b",
        color: "#5dff7a",
        padding: "1.25rem",
        borderRadius: 8,
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        boxShadow: "inset 0 0 40px rgba(93,255,122,0.08)",
        maxHeight: "50vh",
        overflowY: "auto",
      }}
    >
      {/* Static guestbook header */}
      {STATIC_LINES.map((line, i) => (
        <div key={`s-${i}`}>{line || " "}</div>
      ))}

      {/* Live activity log */}
      {hasEvents && (
        <>
          <div style={{ marginTop: "0.75rem", borderTop: "1px solid #2a3a2a", paddingTop: "0.75rem" }}>
            {"$ tail -f /var/log/world.log"}
          </div>
          {activityLog.slice(-20).map((entry, i) => (
            <div
              key={`e-${i}`}
              style={{
                color:
                  entry.type === "join"
                    ? "#5dff7a"
                    : entry.type === "leave"
                      ? "#ff6f6f"
                      : "#c8c8c8",
              }}
            >
              [{formatTs(entry.ts)}] {entry.text}
            </div>
          ))}
        </>
      )}

      <div>$ _</div>
    </div>
  );
}
