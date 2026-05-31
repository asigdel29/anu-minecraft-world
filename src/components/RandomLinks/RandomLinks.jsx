import "./RandomLinks.scss";
import { playSound } from "../../utils/audioSystem";

// NOTE(anu): a few URLs are best-guess matches from a web search — verify the
// ones marked "(verify)" point to the exact piece you meant.
const links = [
  {
    title: "21 Lessons for the 21st Century",
    url: "https://www.ynharari.com/book/21-lessons-book/",
  },
  {
    title: "Effective Altruism in the Garden of Ends",
    url: "https://www.lesswrong.com/posts/YDHRa5cmKQCLGrCWj/effective-altruism-in-the-garden-of-ends",
  },
  {
    title: "The New War on Asian American Excellence",
    url: "https://garryslist.org/posts/the-new-war-on-asian-american-excellence",
  },
  {
    // (verify) — LessWrong "Cognitive Security as an AI Safety Cause Area"
    title: "Cognitive Security",
    url: "https://www.lesswrong.com/posts/KGcE7eAdfxHchk25X/cognitive-security-as-an-ai-safety-cause-area",
  },
  {
    title: "Rightness Is a Prison",
    url: "https://usefulfictions.substack.com/p/rightness-is-a-prison",
  },
  {
    // (verify) — FTC "5 Ways to Help Protect Your Identity"
    title: "FTC: Protect Your Identity",
    url: "https://www.ftc.gov/media/5-ways-help-protect-your-identity",
  },
  {
    title: "How to Be More Agentic",
    url: "https://usefulfictions.substack.com/p/how-to-be-more-agentic",
  },
  {
    // (verify) — Scott Barker, The Wake Up Call
    title: "How to Prepare for the Next Decade",
    url: "https://thewakeupcallnewsletter.substack.com/p/how-to-prepare-for-the-next-decade",
  },
];

const RandomLinks = () => {
  return (
    <div className="data-container">
      <p className="section-paragraph random-links-intro">
        a few things i&apos;ve been reading & thinking about lately ✨
      </p>
      <ul className="random-links-list">
        {links.map((link) => (
          <li key={link.url} className="random-links-item">
            <a
              className="random-link"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playSound("buttonClick")}
            >
              <span className="random-link-arrow">▸</span>
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RandomLinks;
