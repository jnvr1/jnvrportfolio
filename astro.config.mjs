import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Bilingual parity is validated by `npm run check:parity` (scripts/check-bilingual-parity.ts).
// The previous astro:build:done hook duplicated that logic and broke under Astro 5
// because the Vite module runner closes before the hook can dynamically import astro:content.

// https://astro.build/config
export default defineConfig({
  site: 'https://jnvr-portafolio.web.app',
  output: 'static',

  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es',
          en: 'en',
        },
      },
    }),
  ],
});
