// Turns *asterisk-wrapped* substrings into highlighted yellow spans.
// Shared by Info and UserManual modals.
export const parseText = (text) => {
  const parts = text.split(/(\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("*") && part.endsWith("*")) {
      const content = part.slice(1, -1);
      return (
        <span key={index} className="yellow-text">
          {content}
        </span>
      );
    }
    return part;
  });
};
