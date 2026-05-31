import { useState } from "react";

import "./Bookshelf.scss";
import { playSound } from "../../utils/audioSystem";

// TODO(anu): replace with your real "currently reading" list + 1-line summaries.
// Optional: add `coverImg: "/images/books/xyz.webp"` to any book to use real art
// instead of the generated pixel cover. `spine` is the flat block color.
const books = [
  {
    title: "The Beginning of Infinity",
    author: "David Deutsch",
    summary:
      "Why explanatory knowledge has unlimited reach — a case for optimism grounded in good explanations.",
    spine: "#3aa86f",
  },
  {
    title: "Gödel, Escher, Bach",
    author: "Douglas Hofstadter",
    summary:
      "Strange loops and self-reference across math, art, and music — how minds emerge from formal systems.",
    spine: "#c8642f",
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    summary:
      "The two systems that drive how we think — and the biases that come baked into both.",
    spine: "#2f6fc8",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    summary:
      "Ecology, prophecy, and power on a desert world — the sci-fi epic that started it all.",
    spine: "#b58a2e",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    summary:
      "Focused, distraction-free work is a superpower — here's how to cultivate it.",
    spine: "#7a4fb5",
  },
  {
    title: "Snow Crash",
    author: "Neal Stephenson",
    summary:
      "The cyberpunk classic that coined the Metaverse — language, viruses, and pizza delivery.",
    spine: "#2f9ec8",
  },
];

const Bookshelf = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleClick = (index) => {
    playSound("buttonClick");
    setActiveIndex((current) => (current === index ? null : index));
  };

  const active = activeIndex === null ? null : books[activeIndex];

  return (
    <div className="bookshelf-modal">
      <p className="bookshelf-intro">
        a peek at what&apos;s on my shelf — click a book to pull it out 📚
      </p>

      <div className="shelf">
        <div className="shelf-row">
          {books.map((book, index) => (
            <div
              key={book.title}
              className={`book ${activeIndex === index ? "active" : ""}`}
              style={{ "--spine-color": book.spine }}
              onClick={() => handleClick(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(index);
                }
              }}
            >
              <div className="spine">
                <span className="spine-title">{book.title}</span>
              </div>
              <div className="cover">
                {book.coverImg ? (
                  <img
                    className="cover-img"
                    src={book.coverImg}
                    alt={book.title}
                  />
                ) : (
                  <div className="cover-pixel">
                    <span className="cover-title">{book.title}</span>
                    <span className="cover-author">{book.author}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="shelf-board" />
      </div>

      <div className="summary-panel">
        {active ? (
          <>
            <h2 className="summary-title">{active.title}</h2>
            <p className="summary-author">by {active.author}</p>
            <p className="summary-text">{active.summary}</p>
          </>
        ) : (
          <p className="summary-hint">
            Click any spine to flip it open and read why it&apos;s on the shelf.
          </p>
        )}
      </div>
    </div>
  );
};

export default Bookshelf;
