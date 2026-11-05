// @ts-check
import { defineConfig } from "astro/config";

// Where GitHub Pages serves the site today. When turblend.us is pointed at GitHub
// Pages, set `site` to "https://turblend.us" and `base` to "/".
// (The public address used in canonical links, link previews and structured data
// is SITE_URL in src/site.ts.)
export default defineConfig({
  site: "https://maksimds.github.io",
  base: "/turblend-landing",

  // Lossless whitespace removal. Astro 7's default ("jsx") also drops the line
  // breaks between elements, and the hero's label and headline (both inline) are
  // spaced apart by one.
  compressHTML: true,

  vite: {
    build: {
      // The CSS minifier rewrites anything these browsers understand into newer,
      // shorter syntax. Its default target lets it turn "(max-width: 1023px)" into
      // "(width <= 1023px)", which Safari before 16.4 ignores, losing the whole
      // responsive layout on older iPhones. This keeps the CSS as written.
      cssTarget: ["chrome100", "edge100", "firefox100", "safari15", "ios15"],
    },
  },
});
