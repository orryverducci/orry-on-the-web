import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: "https://orryverducci.co.uk",
    output: "server",
    adapter: cloudflare({
      mode: "directory"
    }),
    experimental: {
      prerender: true
    },
    vite: {
        build: {
          sourcemap: true,
        }
    }
});
