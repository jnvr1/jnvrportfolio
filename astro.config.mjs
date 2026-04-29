import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { getCollection } from 'astro:content';
import { assertBilingualParity } from './src/content/bilingual-parity.ts';

/**
 * Build-time bilingual parity check.
 * Runs after the build completes and throws if any slug is missing its EN or ES counterpart.
 */
const bilingualCheck = {
  name: 'bilingual-parity',
  hooks: {
    'astro:build:done': async () => {
      const all = await getCollection('projects');
      const entries = all.map((p) => ({ slug: p.data.slug, locale: p.data.locale }));
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
