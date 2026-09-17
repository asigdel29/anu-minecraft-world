import AttractionPageShell from "./AttractionPageShell";
import { libraryAttraction } from "../../data/parkContent/library";

const LibraryPage = ({ onBack }) => (
  <AttractionPageShell
    title={libraryAttraction.title}
    tagline={libraryAttraction.tagline}
    onBack={onBack}
  >
    <ul className="attraction-list">
      {libraryAttraction.books.map((book) => (
        <li key={book.title} className="attraction-section">
          <h2 className="attraction-section-header">{book.title}</h2>
          <p className="attraction-book-author">{book.author}</p>
          <p className="attraction-section-paragraph">{book.summary}</p>
        </li>
      ))}
    </ul>
  </AttractionPageShell>
);

export default LibraryPage;
