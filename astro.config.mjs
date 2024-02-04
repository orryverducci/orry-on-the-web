import { defineConfig } from "astro/config";

import cloudflare from "@astrojs/cloudflare";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
    site: "https://orryverducci.co.uk",
    output: "hybrid",
    adapter: cloudflare({
      mode: "directory"
    }),
    integrations: [icon()],
    image: {
      service: {
        entrypoint: 'astro/assets/services/noop'
      }
    },
    vite: {
        build: {
          sourcemap: true,
        }
    }
});
