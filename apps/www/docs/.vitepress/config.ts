import { defineConfig } from "vitepress";

export default defineConfig({
  lang: "en-US",
  title: "Planetsheet",
  description: "A SQL editor designed for developers and content editors.",
  themeConfig: {
    socialLinks: [
      { icon: "github", link: "https://github.com/lawrencecchen/planetsheet" },
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2022-present Lawrence Chen",
    },
  },
});

// export default {
//   lang: "en-US",
//   title: "Planetsheet",
//   titleTemplate: "%s - Planetsheet",
//   description: "A SQL editor designed for developers and content editors.",
// };
// export default {
//   title: "Planetsheet",
//   description: "Just playing around.",
// };
