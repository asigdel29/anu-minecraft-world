import "./About.scss";
import Button from "../Button/Button";

const aboutMeData = {
  one: {
    name: "Anubhav (Anu)",
    imageUrl: "/images/me.webp",
    socials: [
      { label: "Substack", url: "https://sigdel29.substack.com" },
      { label: "X / Twitter", url: "https://x.com/sigdel29" },
      { label: "LinkedIn", url: "https://www.linkedin.com/in/asigdel/" },
    ],
    content: [
      {
        header: "About Me",
        paragraphs: [
          "hi, i'm anu :D this is my site! I'm a creator and tinkerer who loves building things at the intersection of art and tech.",
          "I keep updating this site based on whatever I'm fascinated with at the moment, so it's less of a static portfolio and more of a living playground for my experiments.",
          "Lately I've been really into ASCII art and music generation — so I made something that has both. Check it out, and stay tuned for more! ✨",
        ],
      },
      {
        header: "What I'm into",
        paragraphs: [
          " - Building multiplayer tools for running cloud AI agents on an infinite canvas.",
          " - An AI-native city sim where the citizens are agents.",
          " - Tinkering with agent harnesses and shipping whatever I'm curious about.",
        ],
      },
    ],
  },
};

const About = () => {
  const data = aboutMeData["one"];

  if (!data) {
    return <div>Data not found</div>;
  }

  return (
    <div className="data-container">
      <div className="image-wrapper">
        <img src={data.imageUrl} alt={data.name} className="data-image" />
      </div>

      {data.socials.map((social) => (
        <Button key={social.url} href={social.url} type={"link"}>
          {social.label}
        </Button>
      ))}

      {data.content.map((section, index) => (
        <div key={index} className="data-section">
          <h2 className="about-section-header">{section.header}</h2>
          {section.paragraphs.map((paragraph, pIndex) => (
            <p key={`${index}-${pIndex}`} className="section-paragraph">
              {paragraph}
            </p>
          ))}
        </div>
      ))}

      <div className="image-wrapper-two">
        <img
          src="/images/about-robot.webp"
          alt="Tinkering with robots"
          className="data-image-two"
        />
      </div>
      <p className="section-paragraph">- - always building something - -</p>

      <div className="image-wrapper-two">
        <img
          src="/images/about-mrrobot.webp"
          alt="late-night hacker mode"
          className="data-image-two"
        />
      </div>
      <p className="section-paragraph">- - late-night hacker mode - -</p>
    </div>
  );
};

export default About;
