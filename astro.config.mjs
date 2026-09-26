import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import icon from "@dallay/astro-icon";

// https://astro.build/config
export default defineConfig({
    site: "https://orryverducci.co.uk",
    adapter: cloudflare({
      mode: "directory"
    }),
    integrations: [icon()],
    fonts: [
      {
        provider: fontProviders.fontsource(),
        name: "Figtree",
        cssVariable: "--font-figtree",
        weights: ["400 600"]
      },
      {
        provider: fontProviders.local(),
        name: "VCROSDMono",
        cssVariable: "--font-vcrosd",
        fallbacks: ["monospace"],
        options: {
          variants: [{
            src: ['./src/fonts/VCROSDMono.woff2', './src/fonts/VCROSDMono.woff'],
            weight: 'normal',
            style: 'normal'
          }]
        }
      },
      {
        provider: fontProviders.local(),
        name: "ModeSeven",
        cssVariable: "--font-modeseven",
        fallbacks: ["monospace"],
        options: {
          variants: [{
            src: ['./src/fonts/ModeSeven.woff2', './src/fonts/ModeSeven.woff'],
            weight: 'normal',
            style: 'normal'
          }]
        }
      }
    ],
    image: {
      service: {
        entrypoint: 'astro/assets/services/noop'
      }
    },
    build: {
      inlineStylesheets: 'never'
    },
    vite: {
        build: {
          sourcemap: true,
        }
    }
});
