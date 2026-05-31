/**
 * Content for the "Information" modal opened from the info button.
 *
 * Paragraphs may contain *asterisk-wrapped* spans that {@link parseText}
 * renders as highlighted text.
 */
export const info = {
  content: [
    {
      header: "💭 'Bout this site",
      paragraphs: [
        "hi, i'm anu :D this is my personal playground — I keep updating it based on whatever I'm fascinated with at the moment.",
        "This immersive Minecraft world is built on the wonderful open-source folio template by *Andrew Woan* — full credit to him for the 3D world!",
      ],
    },
    {
      header: "🤖 Tools, Technologies, & More",
      paragraphs: [
        " - Entire project was spanned over two months, some days I spent 12 hours and some days I spent like 30 minutes, so I don't even remember how long it took me (at least 100 hours), but it was really fun!!!",
        " - *Blender* was used for all 3D stuff (driver animations, baking, modeling, rigging etc.). Notable plugins include MCprep, SimpleBake, and UVPackMaster 3.",
        " - *Audacity* was used to convert mp3 files into ogg files for smaller file sizes and retaining quality.",
        " - *Figma* was used to edit baked textures and create custom SVGs.",
        " - *Poly Haven* was used for the HDRI.",
        " - Global state management stores were handled with *zustand*.",
        " - Vite's default *React template* was used.",
        " - *SCSS* was the choice for the website styles.",
        " - *Vercel* was used for deployment and *SquareSpace* for the domain name. Vercel was free which is amazing. Domain name cost 14 USD for one year.",
        " - React three fiber and lot's of react three drei helpers were used to speed up the 3D web development process.",
        " - Notable command line tools like *gltf-transform* and *gltfjsx* were used to optimize models for the web and code.",
        " - All meshes utilized *KTX textures* and were created using KTX Software on GitHub.",
        " - *Transfonter* was used to convert fonts from otf to woff files.",
        " - *Favicon generator* was used to convert PNG image to well set up favicons for different devices and browsers.",
        " - Read a lot of documentation. A lot. I really appreciate all of those who spent so much time on the documentation for their tools it really helps out a ton. The react three drei docs are incredible.",
        " - *Squoosh* by Google was used for quick image compression and conversion to webp image format.",
        " - Online viewers like *sandbox.babylonjs.com*, *gltf-viewer.donmccurdy.com*, and *gltf-report.com* were incredibly helpful for quickly reviewing model animations and textures, saving a lot of time.",
        " - Want to say hi or see what I'm building next? Find me on *Substack (sigdel29.substack.com)*, *X (@sigdel29)*, and *LinkedIn (in/asigdel)*. Stay tuned! ✨",
      ],
    },
  ],
};
