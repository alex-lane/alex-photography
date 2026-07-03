// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// TODO: replace with your production domain (used for canonical URLs, OG tags, sitemap).
const SITE = "https://example.com";

export default defineConfig({
  site: SITE,
  output: "static",
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Cap the responsive widths Sharp generates so galleries stay fast and builds stay lean.
    responsiveStyles: true,
    layout: "constrained",
  },
});
