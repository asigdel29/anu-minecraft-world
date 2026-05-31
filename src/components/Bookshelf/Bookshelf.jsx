import { useState } from "react";

import "./Bookshelf.scss";
import { playSound } from "../../utils/audioSystem";
import { books } from "../../data/books";

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
