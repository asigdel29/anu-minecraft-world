// The interactive "terminal / guestbook" modal opened from the top-floor screen.
// Decorative shell session — edit the lines to change what it says.
const LINES = [
  "$ whoami",
  "anu — builder of things on the internet",
  "",
  "$ cat guestbook.txt",
  "thanks for climbing all the way up here :)",
  "hope you liked the house.",
  "",
  "$ contact --say-hi",
  "anu@getlora.com",
  "$ _",
];

export default function Terminal() {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, Menlo, Consolas, monospace",
        background: "#0b0f0b",
        color: "#5dff7a",
        padding: "1.25rem",
        borderRadius: 8,
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        boxShadow: "inset 0 0 40px rgba(93,255,122,0.08)",
      }}
    >
      {LINES.map((line, i) => (
        <div key={i}>{line || " "}</div>
      ))}
    </div>
  );
}
