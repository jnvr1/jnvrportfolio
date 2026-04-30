import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { assertBilingualParity } from './src/content/bilingual-parity.ts';

/**
 * Build-time bilingual parity check.
 * Runs after the build completes and throws if any slug is missing its EN or ES counterpart.
 * Dynamic import of getCollection so astro:content is NOT loaded at config parse time
 * (it's only available inside the Astro build pipeline, not when the config is evaluated).
 */
const bilingualCheck = {
  name: 'bilingual-parity',
  hooks: {
    'astro:build:done': async () => {
      const { getCollection } = await import('astro:content');
      const all = await getCollection('projects');
      // In Astro 5, slug is stripped from entry.data and used as entry.id
      const entries = all.map((p) => ({ slug: p.id, locale: p.data.locale }));
      assertBilingualParity(entries);
    },
  },
};

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
    bilingualCheck,
  ],
});
