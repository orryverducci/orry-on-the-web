import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
    site: "https://orryverducci.co.uk",
    output: "hybrid",
    adapter: cloudflare({
      mode: "directory"
    }),
    vite: {
        build: {
          sourcemap: true,
        }
    }
});
