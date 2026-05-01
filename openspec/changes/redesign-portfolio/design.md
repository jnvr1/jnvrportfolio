# Design: redesign-portfolio

> Companion artifact to `proposal.md`. Translates intent into an executable architecture. The tasks phase will break this into a checklist.

---

## 1. Architecture Overview

### Directory Strategy

The redesign lives **at repo root on branch `redesign-astro`**, NOT in a subdirectory. Rationale:

- The proposal commits to a **greenfield rewrite on a parallel branch** (Decision 8). The Angular tree on `main` stays deployable until cutover.
- Putting Astro in a subfolder (e.g., `astro-site/`) leaks framework awareness into permanent paths and complicates Vercel root detection (Vercel uses repo root by default).
- `pre-redesign-v1` git tag on `main` HEAD is the canonical rollback artifact (proposal Rollback Plan).

Sequence on the branch:
1. Tag `pre-redesign-v1` on `main`.
2. Branch `redesign-astro` from `main`.
3. On the branch: move all Angular sources under `legacy/` (kept on the branch only as a reference during rebuild; deleted before final merge to `main`).
4. New Astro project initialized at root.
5. Final PR `redesign-astro -> main` REPLACES the Angular tree entirely.

### Top-Level Dependency Graph

```
[content collections (markdown + zod)]
              |
              v
[astro build] --reads--> [src/pages/*.astro] --uses--> [src/components/*.astro]
              |                                                   |
              |                                                   v
              |                                       [src/styles/*.css tokens]
              v
       [dist/]  (static HTML + _astro/* hashed JS+CSS chunks)
              |
              v
       [Firebase Hosting deploy — firebase deploy --only hosting]
```

### Rendering Model

| Route | Mode | Reason |
|-------|------|--------|
| `/` | Static (SSG) | Home is content, no dynamic data |
| `/projects/[slug]` | Static (SSG via `getStaticPaths`) | 9 slugs known at build time |
| `/en/` and `/en/projects/[slug]` | Static (SSG) | Mirror locale |
| `/404.html` | Static | Astro emits as static fallback |

`astro.config.mjs` MUST set `output: 'static'`. NO SSR, NO server endpoints. Formspree is a third-party form action (no API route required).

### Build Pipeline

```
pnpm install
  -> astro check              # Zod content validation + tsc on .astro files
  -> astro build              # produces dist/
  -> firebase deploy --only hosting  # uploads dist/ to Firebase CDN
```

Firebase Hosting reads the `public` dir from `firebase.json` (set to `dist/`). No framework-specific adapter is needed — Astro static output is plain HTML/CSS/JS.

---

## 2. Information Architecture & Routes

| Path | Source File | Data Source | Locale |
|------|-------------|-------------|--------|
| `/` | `src/pages/index.astro` | `getCollection('projects', e => e.data.locale === 'es')` + `experience` | es |
| `/en/` | `src/pages/en/index.astro` | `getCollection('projects', e => e.data.locale === 'en')` + `experience` | en |
| `/projects/[slug]` | `src/pages/projects/[slug].astro` | `getEntry('projects', es-{slug})` | es |
| `/en/projects/[slug]` | `src/pages/en/projects/[slug].astro` | `getEntry('projects', en-{slug})` | en |
| `/404` | `src/pages/404.astro` | static text | both (single page, language-neutral) |
| `/sitemap-index.xml` | auto via `@astrojs/sitemap` | derived from routes | both |
| `/robots.txt` | `public/robots.txt` | static | both |

### Locale Strategy

Use Astro's native i18n config (proposal sketch). `defaultLocale: 'es'` with `prefixDefaultLocale: false` means:
- ES URLs: bare paths (`/`, `/projects/centinela-app`)
- EN URLs: `/en/` prefix (`/en/`, `/en/projects/centinela-app`)

No 3rd-party i18n library. Translation strings for UI chrome (nav labels, CTAs, form labels) live in `src/i18n/{es,en}.ts` as plain TS objects, imported per page.

`<link rel="alternate" hreflang="...">` injected by `BaseLayout.astro` for both ES and EN counterparts of each page (SEO requirement).

---

## 3. Content Collections (Zod schemas)

`src/content.config.ts` (Astro 5 path — NOT `src/content/config.ts`):

```ts
import { z, defineCollection } from 'astro:content';

const CLIENTS = ['Angel', 'Teotech', 'FEMN', 'Personal'] as const;
const LOCALES = ['es', 'en'] as const;

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string().min(3).max(80),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    client: z.enum(CLIENTS),
    year: z.number().int().min(2018).max(2030),
    yearRange: z.string().optional(), // e.g., "2022-2024"
    stack: z.array(z.string()).min(1).max(8),
    summary: z.string().max(160), // appears in card + meta description
    role: z.string().max(120),
    cover: image().optional(),
    placeholder: z.boolean().default(false),
    confidential: z.boolean().default(false),
    priority: z.enum(['P0', 'P1']).default('P1'),
    links: z.object({
      live: z.string().url().optional(),
      repo: z.string().url().optional(),
    }).optional(),
    locale: z.enum(LOCALES),
    publishedAt: z.date().optional(),
    order: z.number().int().optional(), // manual sort tiebreaker
  }),
});

const experience = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    role: z.string(),
    startYear: z.number().int(),
    endYear: z.number().int().optional(), // omit for current
    current: z.boolean().default(false),
    featured: z.boolean().default(false), // Fletes -> true
    location: z.string().optional(),
    summary: z.string().max(280),
    highlights: z.array(z.string().max(160)).max(5).optional(),
    stack: z.array(z.string()).optional(),
    locale: z.enum(LOCALES),
    order: z.number().int(), // manual ordering for timeline
  }),
});

export const collections = { projects, experience };
```

### Bilingual Parity Enforcement

Astro Zod schemas validate per-entry, NOT cross-entry parity. So we add a build-time sanity check in `src/content/_lint.ts` invoked from `astro.config.mjs` `vite.plugins`:

```ts
// src/content/_lint.ts (runs in astro:build:start hook)
import { getCollection } from 'astro:content';

export async function assertBilingualParity() {
  const all = await getCollection('projects');
  const es = new Set(all.filter(p => p.data.locale === 'es').map(p => p.data.slug));
  const en = new Set(all.filter(p => p.data.locale === 'en').map(p => p.data.slug));
  const missingEn = [...es].filter(s => !en.has(s));
  const missingEs = [...en].filter(s => !es.has(s));
  if (missingEn.length || missingEs.length) {
    throw new Error(
      `Bilingual parity broken. Missing EN: [${missingEn.join(', ')}]. Missing ES: [${missingEs.join(', ')}].`
    );
  }
}
```

Wired via integration in `astro.config.mjs`:

```ts
const bilingualCheck = {
  name: 'bilingual-parity',
  hooks: {
    'astro:build:done': async () => { await assertBilingualParity(); },
  },
};
```

> DESIGN-DECISION: parity check runs on `astro:build:done` instead of in a Zod refinement because Zod schemas are per-record and cannot see siblings.

---

## 4. File Tree (target end-state)

```
jnvrportfolio/
|-- astro.config.mjs
|-- tsconfig.json
|-- package.json
|-- pnpm-lock.yaml
|-- .gitignore
|-- .nvmrc                          # 20.10
|-- README.md                       # rewritten
|-- firebase.json                   # updated: public:dist, cleanUrls, no SPA rewrite, cache headers
|-- .firebaserc                     # unchanged: project jnvr-portafolio
|-- public/
|   |-- favicon.svg
|   |-- favicon-32.png
|   |-- og-default.png              # 1200x630 OG card
|   |-- robots.txt
|   |-- ngsw-worker.js              # NO-OP SW (Decision 9)
|   |-- fonts/                      # self-hosted variable fonts
|   |   |-- inter/Inter[wght].woff2
|   |   |-- space-grotesk/SpaceGrotesk[wght].woff2
|   |   |-- jetbrains-mono/JetBrainsMono[wght].woff2
|   `-- projects/                   # sanitized screenshots (input to astro:assets)
|       |-- centinela-app/cover.png
|       |-- centinela-web/cover.png
|       |-- bloomotion-tech/cover.png
|       |-- pos-la-brocha/cover.png
|       |-- teotech-suite/cover.png
|       |-- brocha-facturacion/cover.png
|       |-- crm-pedidos/cover.png
|       |-- tita/cover.png
|       `-- femn/cover.png
|-- src/
|   |-- env.d.ts
|   |-- content/
|   |-- content.config.ts           # Zod schemas (Astro 5 root-level path)
|   |   |-- _lint.ts                # bilingual parity check
|   |   |-- projects/
|   |   |   |-- es/
|   |   |   |   |-- centinela-app.md
|   |   |   |   |-- centinela-web.md
|   |   |   |   |-- bloomotion-tech.md
|   |   |   |   |-- pos-la-brocha.md
|   |   |   |   |-- teotech-suite.md
|   |   |   |   |-- brocha-facturacion.md
|   |   |   |   |-- crm-pedidos.md
|   |   |   |   |-- tita.md
|   |   |   |   `-- femn.md
|   |   |   `-- en/
|   |   |       |-- centinela-app.md
|   |   |       |-- centinela-web.md
|   |   |       |-- bloomotion-tech.md
|   |   |       |-- pos-la-brocha.md
|   |   |       |-- teotech-suite.md
|   |   |       |-- brocha-facturacion.md
|   |   |       |-- crm-pedidos.md
|   |   |       |-- tita.md
|   |   |       `-- femn.md
|   |   `-- experience/
|   |       |-- es/
|   |       |   |-- fletes-mexico.md
|   |       |   |-- teotech.md
|   |       |   |-- museo-rodadora.md
|   |       |   |-- ia-center.md
|   |       |   `-- bloomotion.md
|   |       `-- en/  (mirror)
|   |-- i18n/
|   |   |-- es.ts                   # UI strings
|   |   |-- en.ts
|   |   `-- index.ts                # t(locale, key)
|   |-- layouts/
|   |   |-- BaseLayout.astro
|   |   `-- ProjectLayout.astro
|   |-- components/
|   |   |-- Header.astro
|   |   |-- Footer.astro
|   |   |-- Hero.astro
|   |   |-- FletesBadge.astro
|   |   |-- ProjectGrid.astro
|   |   |-- ProjectCard.astro
|   |   |-- ProjectFilter.astro     # filter chips (client-side)
|   |   |-- ExperienceTimeline.astro
|   |   |-- ExperienceCard.astro
|   |   |-- ContactForm.astro
|   |   |-- LocaleSwitcher.astro
|   |   |-- ScrollReveal.astro      # IntersectionObserver wrapper
|   |   |-- StackChip.astro
|   |   |-- Logo.astro              # JNVR animated SVG (ported)
|   |   |-- ThemeStyles.astro       # token injection wrapper
|   |   |-- NoOpServiceWorkerScript.astro
|   |   `-- SEO.astro               # meta + og + hreflang
|   |-- pages/
|   |   |-- index.astro
|   |   |-- 404.astro
|   |   |-- projects/
|   |   |   `-- [slug].astro
|   |   `-- en/
|   |       |-- index.astro
|   |       `-- projects/
|   |           `-- [slug].astro
|   |-- scripts/                    # client-side TS islands
|   |   |-- contact-form.ts
|   |   |-- project-filter.ts
|   |   |-- scroll-reveal.ts
|   |   `-- noop-sw-register.ts
|   |-- styles/
|   |   |-- reset.css
|   |   |-- tokens.css              # CSS custom properties (dark only)
|   |   |-- fonts.css               # @font-face for self-hosted variable fonts
|   |   |-- global.css              # base typography, layout, utilities
|   |   `-- prose.css               # markdown body styles for project pages
|   `-- utils/
|       |-- sortProjects.ts
|       `-- formatters.ts
|-- tests/
|   |-- unit/
|   |   |-- content-schema.test.ts  # Zod schema correctness
|   |   |-- formatters.test.ts
|   |   |-- sortProjects.test.ts
|   |   `-- bilingual-parity.test.ts
|   `-- e2e/
|       `-- smoke.spec.ts           # home renders, 9 cards, contact submit, locale toggle
|-- playwright.config.ts
`-- vitest.config.ts
```

### `package.json` deltas (vs current Angular `package.json`)

REMOVED: all `@angular/*`, `@ionic/*`, `@capacitor/*`, `@emailjs/*`, `karma*`, `jasmine*`, `protractor*`, `ng-packagr`, `tslib`, `zone.js`.

ADDED:
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "lint": "eslint . && prettier --check .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@astrojs/check": "^0.9.4",
    "sharp": "^0.33.5",
    "@fontsource-variable/inter": "^5.1.0",
    "@fontsource-variable/space-grotesk": "^5.1.0",
    "@fontsource-variable/jetbrains-mono": "^5.1.0"
  },
  "devDependencies": {
    "typescript": "~5.6.0",
    "vitest": "^2.1.0",
    "@playwright/test": "^1.48.0",
    "prettier": "^3.3.0",
    "prettier-plugin-astro": "^0.14.0",
    "eslint": "^9.0.0",
    "eslint-plugin-astro": "^1.3.0"
  }
}
```

> DESIGN-DECISION: Drop `@astrojs/image` from proposal — Astro 5 ships `astro:assets` natively. The `image()` helper in Zod schemas + `<Image>` from `astro:assets` covers AVIF/WebP. `sharp` is still required at build time.

---

## 5. Component Architecture

All components are `.astro` (zero runtime by default). Client behavior loaded via TS scripts in `src/scripts/` and attached with `<script>` tags inside the component (Astro bundles them as ESM).

### `BaseLayout.astro`
- **Purpose**: HTML shell, `<head>` (meta, og, hreflang, fonts preload, tokens.css), `<body>` with header + slot + footer.
- **Props**: `{ title: string; description: string; locale: 'es'|'en'; ogImage?: ImageMetadata; canonical: string; alternates: { es: string; en: string } }`
- **Slots**: default
- **Client**: none
- **A11y**: `<html lang>`, skip-to-content link, `<main>` landmark.

### `ProjectLayout.astro`
- **Purpose**: Wrapper for `/projects/[slug]` pages. Renders cover, meta, prose body, links, related-projects strip.
- **Props**: `{ entry: CollectionEntry<'projects'> }`
- **Slots**: default (the markdown body via `<Content />`)
- **Client**: none
- **A11y**: `<article>` landmark, headings hierarchy, alt text required on cover.

### `Header.astro`
- **Purpose**: Sticky nav with logo, anchor links, locale switcher.
- **Props**: `{ locale: 'es'|'en' }`
- **Client**: tiny script for transparent->solid transition on scroll (no IO needed; just `window.scrollY` listener with `requestAnimationFrame` throttle).
- **A11y**: `<nav aria-label="Primary">`, focus rings respected, ESC closes mobile menu.

### `Hero.astro`
- **Purpose**: Above-the-fold name + role + Fletes badge + 2 CTAs + animated logo.
- **Props**: `{ locale: 'es'|'en' }`
- **Slots**: none (text from i18n strings)
- **Client**: none (logo animation is pure CSS keyframes; no JS).
- **A11y**: `<h1>` carries name + role; CTA buttons are real `<a>` to `#projects` and `#contact`.

### `FletesBadge.astro`
- **Purpose**: Pill component "Currently at Fletes Mexico" / "Actualmente en Fletes Mexico".
- **Props**: `{ locale: 'es'|'en' }`
- **Client**: none
- **A11y**: `<span>` with descriptive text; not a link.

### `Logo.astro`
- **Purpose**: JNVR animated SVG. Ported verbatim from current Angular component (proposal: "preserved").
- **Props**: `{ size?: number; ariaLabel?: string }`
- **Client**: none (CSS animation only, respects `prefers-reduced-motion`).
- **A11y**: `role="img" aria-label="JNVR"`.

### `ProjectGrid.astro`
- **Purpose**: Grid container for `ProjectCard`s with optional filter chip strip.
- **Props**: `{ projects: CollectionEntry<'projects'>[]; locale: 'es'|'en' }`
- **Slots**: none
- **Client**: `client:visible` -> `project-filter.ts` (toggles `data-stack` filtering when chips clicked).
- **A11y**: chips use `role="group" aria-label="Filtrar por tecnologia"`; chip = `<button aria-pressed>`.

### `ProjectCard.astro`
- **Purpose**: Single project tile.
- **Props**: `{ entry: CollectionEntry<'projects'>; locale: 'es'|'en' }`
- **Client**: none (link is `<a>`).
- **A11y**: card itself is `<article>`; full title is the link; stack chips have `aria-label="Stack: ..."`; placeholder cards (`placeholder: true`) use a CSS gradient + project initials and DO NOT use a broken `<img>`.

### `ProjectFilter.astro`
- **Purpose**: Chip strip for filtering grid (Flutter / React / PHP / Astro).
- **Props**: `{ locale: 'es'|'en'; counts: Record<string, number> }`
- **Client**: `<script>` block that toggles a class on the parent `ProjectGrid` and hides cards via `[data-stack]` mismatch.
- **A11y**: live region announces "showing N projects" on filter change.

### `ExperienceList.astro` + `ExperienceCard.astro` (V2 — Faceted Stack)
> **Note**: V1 implemented a timeline spine (vertical rail + alternating left/right cards). Rejected by user. V2 replaces it with the Faceted Stack layout — see Section 14 + ADR-8 for full design.
- **Purpose**: Vertical stack of full-width horizontal bands, each band = `[year-mono-display][content]`. Featured Fletes band gets a 2px brand top edge + accent company color + inline 3-polygon facet cluster, no pulse/glow/scale.
- **Props (Card)**: `{ entry: CollectionEntry<'experience'>; locale: 'es'|'en' }`
- **Client**: none; entrance via CSS scroll-driven `animation-timeline: view()`.
- **A11y**: `<ol>` with `<li>` per band; year range as `<time datetime>`; featured carries `aria-current="true"`.

### `ContactForm.astro`
- **Purpose**: Formspree-backed contact form with honeypot + a11y errors.
- **Props**: `{ locale: 'es'|'en'; endpoint: string }` (endpoint comes from `import.meta.env.PUBLIC_FORMSPREE_ENDPOINT`)
- **Client**: `client:load` (form must be interactive immediately) -> `contact-form.ts` handles submit via `fetch(endpoint, { method: 'POST', body: FormData })`.
- **A11y**:
  - Each input has visible label (no placeholder-as-label).
  - `aria-describedby` for error messages, `aria-invalid` on validation fail.
  - Honeypot: `<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" style="position:absolute;left:-10000px">` (Formspree convention).
  - Success state: `role="status"` live region announces "Mensaje enviado".
  - Submit button enters `aria-busy` during in-flight submission.

### `LocaleSwitcher.astro`
- **Purpose**: Toggle between ES and EN.
- **Props**: `{ currentLocale: 'es'|'en'; alternates: { es: string; en: string } }`
- **Client**: none (just two `<a>` tags pointing at the alternate URL — Astro hydration not required).
- **A11y**: `aria-current="page"` on active locale; `lang` attribute on each link.

### `ScrollReveal.astro`
- **Purpose**: Wraps any child to fade+translate-in via IntersectionObserver.
- **Props**: `{ delay?: number; once?: boolean }`
- **Slots**: default
- **Client**: tiny inline `<script>` registers a single shared IntersectionObserver across all instances; respects `prefers-reduced-motion: reduce` (skips animation entirely, applies final state immediately).

### `NoOpServiceWorkerScript.astro`
- **Purpose**: Inline `<script>` that registers `/ngsw-worker.js` on first visit. The SW unregisters itself + clears Angular caches. See section 8.
- **Props**: none
- **Client**: inline `<script>` in `BaseLayout.astro` `<head>`.

### `SEO.astro`
- **Purpose**: All meta/og/twitter/hreflang tags. Used inside `BaseLayout`.
- **Props**: `{ title; description; locale; canonical; alternates; ogImage? }`

---

## 6. Data Flow & Build-Time Contracts

### Where data comes from

| Data | Source | When |
|------|--------|------|
| Project entries (9 x 2 locales) | `src/content/projects/{es,en}/*.md` | Build time, via `getCollection('projects')` |
| Experience entries | `src/content/experience/{es,en}/*.md` | Build time |
| UI strings (nav, CTAs, labels) | `src/i18n/{es,en}.ts` | Build time, plain TS imports |
| Cover images | `public/projects/{slug}/cover.png` referenced via `src/assets/...` import OR `image()` helper in Zod schema | Build time, optimized by `astro:assets` |
| Formspree endpoint | `import.meta.env.PUBLIC_FORMSPREE_ENDPOINT` | Build time inlined; safe to expose (it's a form-action URL, not a secret) |
| Site URL | `astro.config.mjs site: 'https://jnvr-portafolio.web.app'` | Build time |

### Image Optimization

Use `astro:assets`:

```astro
---
import { Image } from 'astro:assets';
import cover from '/public/projects/centinela-app/cover.png';
---
<Image
  src={cover}
  alt="Centinela app dashboard"
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, 33vw"
  formats={['avif', 'webp']}
  loading="lazy"
  decoding="async"
/>
```

`sharp` produces AVIF + WebP at build, falls back to original PNG. Hero LCP image gets `loading="eager"` + `<link rel="preload">` injected by `BaseLayout` when route is `/`.

For projects flagged `placeholder: true`, render a CSS-only tile (no image at all):

```astro
{entry.data.placeholder ? (
  <div class="cover-placeholder" data-initials={initials(entry.data.title)} />
) : (
  <Image src={entry.data.cover} ... />
)}
```

---

## 7. Performance Budget

Concrete targets per route (gzipped, on slow 4G simulation):

| Asset | Home (`/`) | Project (`/projects/[slug]`) | Hard limit |
|-------|------------|------------------------------|------------|
| HTML | <= 25 KB | <= 30 KB | 40 KB |
| CSS (critical, inlined) | <= 8 KB | <= 8 KB | 12 KB |
| CSS (deferred bundle) | <= 15 KB | <= 15 KB | 25 KB |
| JS total | <= 12 KB | <= 8 KB | **20 KB on home (not 50 — the proposal's 50KB ceiling INCLUDES future buffer)** |
| Hero LCP image | <= 80 KB AVIF | n/a | 120 KB |
| Self-hosted fonts (subset) | <= 35 KB woff2 (3 families, latin subset) | same | 50 KB |
| **Total transfer (initial)** | **<= 160 KB gzip** | <= 180 KB gzip | 200 KB |

> DESIGN-DECISION: Set the JS budget tighter than the proposal AC. Proposal says <= 50 KB; design targets <= 20 KB on home. The remaining 30 KB is reserve.

### Web Vitals targets (mobile, slow-4G)

- LCP <= 1.8s (proposal: implied by Lighthouse perf >= 95)
- INP <= 100ms (mostly static; main interactivity is contact form submit)
- CLS <= 0.05
- TTFB <= 400ms (Firebase Hosting CDN edge)

### Font loading strategy

Self-host variable fonts via `@fontsource-variable/*`. Subset to latin-ext only (Spanish accents covered). Preload only Inter (UI font); Space Grotesk (display) and JetBrains Mono (chips) are font-display: swap.

```html
<link rel="preload" as="font" type="font/woff2"
      href="/_astro/inter-latin-wght.[hash].woff2" crossorigin>
```

---

## 8. Service Worker Eviction Strategy

The Angular site's `@angular/service-worker` registered `/ngsw-worker.js`. Returning visitors have it cached and will hit it before our new HTML. We MUST ship a SW at the SAME PATH that uninstalls itself.

### Sequence

1. Visitor hits `https://jnvr.dev/`. The cached Angular SW intercepts and may serve stale shell.
2. The new HTML's `<head>` contains a registration script that calls `navigator.serviceWorker.register('/ngsw-worker.js')` with `updateViaCache: 'none'`.
3. The browser checks `/ngsw-worker.js` -> finds our NEW no-op SW (different bytes) -> installs it.
4. New SW's `install` handler: `skipWaiting()`.
5. New SW's `activate` handler:
   - `clients.claim()`
   - Iterate `caches.keys()` and delete every Angular namespace (`ngsw:*`, `assets:*`, `app:*`, etc.).
   - Call `self.registration.unregister()` (so future visits don't even register a SW).
6. Page reloads ONCE on first visit (controlled by `controllerchange` listener) so the user sees the new shell, not the cached Angular shell.
7. After 60 days post-cutover: monitor analytics for stragglers, then remove `/ngsw-worker.js` from `public/` (returns 404 -> browser drops the SW automatically).

### `public/ngsw-worker.js` source

```js
// public/ngsw-worker.js
// No-op service worker that evicts the legacy Angular @angular/service-worker.
// Same path (/ngsw-worker.js) so returning visitors auto-pick this up.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      // Clear ALL caches (Angular SW namespaces are unpredictable: ngsw:*, assets:*, etc.)
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (e) {
      // Best-effort. Even if deletion fails, unregister still wins.
    }

    // Take over any open tabs immediately so they stop using the old SW.
    if (self.clients && typeof self.clients.claim === 'function') {
      await self.clients.claim();
    }

    // Self-destruct: future page loads will not re-register.
    if (self.registration && typeof self.registration.unregister === 'function') {
      await self.registration.unregister();
    }
  })());
});

// Pass-through fetch (do NOT serve from the dead Angular caches).
self.addEventListener('fetch', () => {});
```

### `src/scripts/noop-sw-register.ts`

```ts
// Registered from BaseLayout.astro <head> via inline import.
// Forces a one-time reload so users see the new HTML, not the cached Angular shell.

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/ngsw-worker.js', { updateViaCache: 'none' })
    .then((reg) => {
      // If a brand-new SW just took control, reload once.
      if (reg.active && !navigator.serviceWorker.controller) {
        // No prior controller -> first install on this client. Nothing to reload.
        return;
      }
    })
    .catch(() => { /* ignore */ });

  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloaded) {
      reloaded = true;
      window.location.reload();
    }
  });
}
```

> DESIGN-DECISION: register the no-op SW BEFORE letting the page render fully would hurt LCP. Register on `window.load` (idle) instead, accepting one stale render for the first returning visit in exchange for a faster first paint.

---

## 9. Deployment Pipeline

### Firebase Hosting Setup

- Firebase project: `jnvr-portafolio` (already configured in `.firebaserc`)
- Build command: `pnpm build` (= `astro check && astro build`)
- Output dir: `dist/`
- Deploy command (local): `firebase deploy --only hosting`
- Deploy command (CI): `firebase deploy --only hosting --token $FIREBASE_TOKEN`
- Preview channel: `firebase hosting:channel:deploy <branch-slug>` → URL: `https://jnvr-portafolio--<branch>-<hash>.web.app`
- Production URL: `https://jnvr-portafolio.web.app`
- Env vars:
  - `PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/<id>` (client-safe; inlined at build time by Astro)
  - `PUBLIC_SITE_URL=https://jnvr-portafolio.web.app`
  - `FIREBASE_TOKEN` (CI only — obtained via `firebase login:ci`)

### Updated `firebase.json`

The existing `firebase.json` serves `www/` with a catch-all SPA rewrite — both must change for Astro:

```json
{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "trailingSlash": false,
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/404.html" }],
    "headers": [
      {
        "source": "/_astro/**",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**/*.@(js|css|svg|png|jpg|jpeg|webp|avif|woff2)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=86400" }]
      },
      {
        "source": "/ngsw-worker.js",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" },
          { "key": "Service-Worker-Allowed", "value": "/" }
        ]
      }
    ]
  }
}
```

> DESIGN-DECISION: The catch-all SPA rewrite (`"source":"**","destination":"/index.html"`) used by the Angular app MUST be replaced with `/404.html` as fallback. Keeping the SPA rewrite would cause every direct deep-link (e.g. `/projects/centinela-app`) to serve home's `index.html` instead of the actual Astro-generated page. `cleanUrls: true` enables extension-free URLs (`/projects/centinela-app` resolves to `dist/projects/centinela-app.html`).

> DESIGN-DECISION: `/_astro/**` paths carry Astro's content-hash in the filename — they are safely set to `immutable` (1 year). Generic assets without a content-hash get 24 hours only, to allow updates.

### Rollback

- `pre-redesign-v1` git tag captures `main` HEAD before merging `redesign-astro`.
- If rollback needed (any time): Firebase console → Hosting → Release history → "Rollback" on any prior release. Instant — no DNS change.
- Alternatively: `firebase hosting:clone` from a named channel or previous release.
- If rollback after gh-pages decommission (>90 days): re-tag from `pre-redesign-v1`, redeploy via re-enabled gh-pages action. Manual recovery, ~10 minutes.

---

## 10. Migration Strategy (concrete branches/tags)

| Step | Action |
|------|--------|
| 1 | On `main`: `git tag pre-redesign-v1 && git push origin pre-redesign-v1` |
| 2 | `git checkout -b redesign-astro` |
| 3 | Move Angular tree to `legacy/` on the branch; commit. |
| 4 | On the branch: update `firebase.json` to the new config (see Section 9). Commit as a discrete step so the diff is reviewable in isolation. |
| 5 | Initialize Astro project at root (`pnpm create astro@latest .` with manual integration since dir is non-empty). |
| 6 | Implement design (tasks phase drives this). |
| 7 | Open sub-PRs `feat/redesign-shell -> redesign-astro`, `feat/redesign-content -> redesign-astro`, etc. |
| 8 | When all phases pass verify: delete `legacy/` from `redesign-astro` (final commit). |
| 9 | Deploy to Firebase preview channel: `firebase hosting:channel:deploy v2-preview`. Validate on mobile + desktop. |
| 10 | Open PR `redesign-astro -> main`. Merge. |
| 11 | Promote to production: `firebase deploy --only hosting`. Verify `https://jnvr-portafolio.web.app` loads new site. |
| 12 | Monitor for 48h. gh-pages branch stays warm as secondary fallback. |
| 13 | After 48h: disable gh-pages workflow in `.github/workflows/`. |

The `gh-pages` BRANCH is left dormant for 90 days. After that, deletable.

> NOTE: No DNS cutover is required. Firebase Hosting serves the new site immediately at `https://jnvr-portafolio.web.app` on first deploy. Custom domain wiring is deferred and does not block launch.

---

## 11. Background Atmosphere (logo-echo design language)

> **Status**: Updated 2026-04-29 in response to user feedback ("el background está muy plano comparado al logo"). The previous body background — solid `#0A1929` with a 0.8% diagonal pattern — reads flat against the JNVR logo's faceted, multi-layer color depth.

### 11.1 Gap analysis (why current bg reads flat)

The JNVR logo (`public/logo-jnvr.svg`) has 5 distinct color planes (`st0` brand blue `#73A0BE`, `st1` deep navy `#0F293F` as shadow, `st2` white, `st3` warm gray `#A7A6A8`, `st4` charcoal `#1B1B1B`) and uses **layered faceted shadows** to give the JNVR letterforms 3D weight. Specifically: the `st1` paths are navy silhouettes positioned BEHIND the `st0` brand-blue letters, creating a hand-cut paper-craft depth effect. The current background:

| Gap | Evidence |
|-----|----------|
| **No color depth** — single flat `#0A1929` | Logo uses 3+ stacked color planes |
| **Pattern invisible** — `0.008` opacity (0.8%) | At normal viewing distance the 135° lines effectively disappear; reads as a pure flat color |
| **No geometric vocabulary** — only thin parallel lines | Logo uses chunky faceted polygons with diagonal cuts, not lines |
| **No focal atmosphere** — no gradient, glow, or volume | Logo has clear lit edges + shadowed interiors → built-in luminance hierarchy |
| **Hero pattern at 2% is also invisible** + the only "depth" is a single drop-shadow on the logo | Hero feels like the logo floating on a flat painted wall |

The result: the **logo brings energy that the page does not return**. Visitors register the disconnect subconsciously as "amateur" or "unfinished".

### 11.2 Four background treatment options (ranged by intensity)

#### Option 1 — "Navy Topography" (subtle, static, cheap)

- **Mood**: A deep navy room lit by two soft off-canvas spotlights. Quiet, professional.
- **Technique**: Multi-stop layered radial gradients on `body`. Two large soft-edged "spotlights" — one brand-blue at 6% opacity top-left, one warmer accent at 4% opacity bottom-right — over the `--bg` base. No animation, no SVG, no JS. Pure CSS gradient stack.
- **Layer breakdown**:
  - `body`: base `--bg` + 2 radial gradients
  - `hero`: same body gradients + a narrow conic gradient behind the logo (echoes the faceted radial energy of the letters)
  - `projects` / `experience` / `contact`: inherit body; small section-tinted vignette on alternating sections
- **Logo-echo**: brand-blue + accent spotlights mirror the `st0`/`st3` color pair from the logo. No facets but the spotlight pools mimic the logo's "lit faces vs shadowed faces" duality.
- **Sketch**:
  ```css
  body {
    background-color: var(--bg);
    background-image:
      radial-gradient(1100px 700px at 12% 8%, rgba(115,160,190,0.10), transparent 60%),
      radial-gradient(900px 600px at 88% 92%, rgba(168,201,221,0.06), transparent 60%);
    background-attachment: fixed;
  }
  ```
- **Performance**: zero JS, zero extra paint cost (1 paint of the gradient pyramid at scroll-fixed). LCP unaffected.
- **Bundle**: +0 KB JS, ~+150 B CSS.
- **A11y**: Contrast against `--text` (`#FFFFFF`) on darkest gradient stop = 16.8:1; lightest stop = 14.9:1. Both >> WCAG AA 4.5:1. No animation → reduced-motion irrelevant. No CLS.
- **Tradeoffs**: Still no faceted geometry. Improvement is "I can see depth now" not "this echoes the logo's craft". Lowest risk, lowest payoff.

#### Option 2 — "Faceted Backdrop" (geometric, logo-echoing, static)

- **Mood**: The page sits on top of a faceted stone backdrop. The logo and the page share visual DNA.
- **Technique**: Single SVG (`public/backdrop-facets.svg`, ~3 KB) with 6-10 large overlapping polygons echoing the logo's diagonal-cut letterforms. Polygons fill with three stops of navy: `#0F293F` (logo `st1`), `#0A1929` (`--bg`), and `#1A3A5C` (`--surface-elevated`). Opacity 0.45-0.7 so the layered facets read as low-contrast subterranean shapes. Set as `background-image` on `body` with `background-size: cover; background-attachment: fixed`. Static.
- **Layer breakdown**:
  - `body`: SVG facets + base `--bg`
  - `hero`: extra inline SVG facet cluster behind the logo (slightly larger, slightly more contrast — the logo is the focal jewel)
  - `projects`: small grid pattern of mini-facets at section edges
  - `experience` / `contact`: rely on body backdrop only (avoid visual fatigue)
- **Logo-echo**: DIRECT — same color values (`st0`, `st1`), same polygon-cut vocabulary, same layered-shadow technique. The page reads as a continuation of the logo.
- **Sketch** (SVG simplified):
  ```html
  <!-- public/backdrop-facets.svg, fixed bg -->
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice"
       xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="1440" height="900" fill="#0A1929"/>
    <polygon points="0,180 380,80 540,260 220,360" fill="#0F293F" opacity="0.55"/>
    <polygon points="900,0 1440,140 1440,420 1080,300" fill="#1A3A5C" opacity="0.35"/>
    <polygon points="200,640 620,720 540,900 80,900" fill="#0F293F" opacity="0.45"/>
    <polygon points="980,580 1440,520 1440,900 880,900" fill="#1A3A5C" opacity="0.30"/>
    <polygon points="600,320 880,260 980,500 700,560" fill="#0F293F" opacity="0.40"/>
  </svg>
  ```
  ```css
  body { background: var(--bg) url('/backdrop-facets.svg') center/cover fixed; }
  ```
- **Performance**: 1 raster paint at load. SVG is GPU-composited when set as bg-image. No scroll cost (`background-attachment: fixed` is fine on desktop; on mobile, fallback to `scroll` to avoid jank).
- **Bundle**: +3 KB SVG (out-of-band, not counted toward JS budget). +0 KB JS.
- **A11y**: SVG is decorative (`aria-hidden="true"` and never referenced). All polygons sit between `#0A1929` and `#1A3A5C` — text contrast against the lightest visible region: white-on-`#1A3A5C` = 11.6:1, well above AA. No animation → reduced-motion N/A. No CLS (SVG is bg, not inline).
- **Tradeoffs**: Static. Won't "wow" — but it makes the page feel hand-crafted, which matches the logo's character. Mobile fixed-bg can stutter on iOS — handled by media query fallback.

#### Option 3 — "Atmospheric Depth" (rich, animated, mid-cost)

- **Mood**: The page is alive — softly breathing navy atmosphere with brand-color glow drifting across the space.
- **Technique**: Combination layer cake on `body`:
  1. Base `--bg` color
  2. Two large blurred CSS "orbs" (`::before` and `::after` on `body`) — `120vw`-wide radial gradients of brand color at 8-12% opacity, blurred via `filter: blur(80px)`. Animated via slow `transform: translate()` keyframes (40-60s cycles, GPU-accelerated).
  3. Subtle SVG noise/grain overlay (`grain.svg`, ~1 KB tile) at 3% opacity → kills banding and adds tactile texture (CSS gradients on dark colors band visibly without it).
- **Layer breakdown**:
  - `body`: base + 2 animated orbs + grain
  - `hero`: orbs are most concentrated here (higher opacity)
  - `projects`: grain only (orbs fade out so cards stand crisply)
  - `experience` / `contact`: lighter atmosphere returns
- **Logo-echo**: Color (orbs use brand `#73A0BE`, accent `#A8C9DD`). Layered depth (4 visual planes: bg, orb-1, orb-2, grain). Lacks faceted geometry but compensates with luminance volume.
- **Sketch**:
  ```css
  body {
    position: relative;
    background-color: var(--bg);
    overflow-x: hidden;
  }
  body::before, body::after {
    content: '';
    position: fixed;
    inset: -20vh;
    pointer-events: none;
    z-index: -1;
    border-radius: 50%;
    filter: blur(90px);
    will-change: transform;
  }
  body::before {
    background: radial-gradient(closest-side, rgba(115,160,190,0.18), transparent 70%);
    width: 80vw; height: 80vw;
    animation: orb-drift-a 50s ease-in-out infinite alternate;
  }
  body::after {
    background: radial-gradient(closest-side, rgba(168,201,221,0.12), transparent 70%);
    width: 90vw; height: 90vw;
    animation: orb-drift-b 65s ease-in-out infinite alternate;
  }
  @keyframes orb-drift-a {
    from { transform: translate(-30vw, -20vh); }
    to   { transform: translate(20vw, 30vh); }
  }
  @keyframes orb-drift-b {
    from { transform: translate(40vw, 60vh); }
    to   { transform: translate(-10vw, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    body::before, body::after { animation: none; }
  }
  ```
- **Performance**: Two large blurred elements with `filter: blur(90px)` are paint-expensive but only paint ONCE per orb (GPU-composited, transform-only animation = no relayout). Measured cost: ~3-5ms paint at first frame; 0ms during animation (transform on composited layer). LCP unaffected because orbs are `z-index: -1` and not the LCP element.
- **Bundle**: +0 KB JS, ~+800 B CSS, +1 KB SVG (grain).
- **A11y**: All orb opacities are ≤12%; resulting text contrast remains ≥14:1. `prefers-reduced-motion: reduce` disables animation. No CLS (orbs are fixed-position).
- **Tradeoffs**: On low-end mobile (sub-2GB RAM Android), 90px blur on 80vw orbs can drop FPS ≈8-12. Mitigation: media-query disable blur below 480px (`filter: none; opacity: 0.3` instead). Costs visual fidelity but saves the device.

#### Option 4 — "Full Composition" (immersive, bold, per-section identity)

- **Mood**: Each section is its own room. The hero is a curated stage.
- **Technique**: Hero gets a hand-composed inline SVG (`HeroBackdrop.astro`, ~6 KB) of large faceted polygons mirroring the logo's letter geometry — same 5-color palette, same diagonal cuts. Subtle scroll-linked parallax (`transform: translateY()` driven by `IntersectionObserver` + scroll position). Each subsequent section gets its own thematic backdrop:
  - `#projects`: faint grid of 12 small facets (mini-logo crystals)
  - `#experience`: vertical accent rule + 2 anchor facets at top/bottom
  - `#contact`: focused single-orb gradient (echoes Option 3 mood, scoped)
- **Layer breakdown**: each `<section>` is responsible for its own backdrop component. `body` stays minimal (`--bg` + Option-1 spotlights as continuity baseline).
- **Logo-echo**: STRONGEST. Hero composition explicitly references the logo's `st0`/`st1`/`st3` color stack and faceted cut geometry — the hero feels like the logo's environment, not just a backdrop.
- **Sketch** (hero only):
  ```astro
  <!-- src/components/HeroBackdrop.astro -->
  <svg class="hero-backdrop" viewBox="0 0 1440 900" aria-hidden="true">
    <defs>
      <linearGradient id="facet-a" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0F293F"/>
        <stop offset="1" stop-color="#1A3A5C"/>
      </linearGradient>
    </defs>
    <polygon points="0,140 460,40 620,300 200,400" fill="url(#facet-a)" opacity="0.7"/>
    <polygon points="980,0 1440,180 1440,460 1080,340" fill="#0F293F" opacity="0.55"/>
    <polygon points="640,420 920,360 1020,600 740,660" fill="#73A0BE" opacity="0.10"/>
    <!-- 4-6 more polygons forming a JNVR-tonal composition -->
  </svg>
  <style>
    .hero-backdrop {
      position: absolute; inset: 0; width: 100%; height: 100%;
      z-index: -1; pointer-events: none;
    }
  </style>
  ```
- **Performance**: Hero SVG is +6 KB (out-of-band, gzipped ~2.5 KB). Per-section components add +1.5-2 KB each. Parallax requires ~1 KB JS (`scroll-reveal.ts` already exists; extend with a parallax handler). Total budget impact: +3 KB JS (well under the 20 KB budget) + ~12 KB inline SVG. LCP risk: hero SVG renders BEHIND the H1 — H1 is still LCP candidate, unaffected. CLS risk: zero if all backdrops use absolute positioning + `aspect-ratio`.
- **Bundle**: +12 KB inline SVG (HTML, ~5 KB gzipped), +3 KB JS (parallax handler).
- **A11y**: All inline SVGs `aria-hidden="true"`. Parallax respects `prefers-reduced-motion: reduce` (handler bails out). Hero text against the densest facet stop (`#1A3A5C`) = 11.6:1.
- **Tradeoffs**: Highest design-debt: each new section needs a backdrop variant. Tasks phase grows ~2-3 tasks. Mobile considerations: the hero composition needs a simplified mobile variant (3-4 polygons, not 8) to avoid visual noise on small screens. Risk of looking "designed-for-the-portfolio" rather than "the work IS the design".

### 11.3 Implemented option: **Option 4 — "Full Composition" (built atop Option 2+3 base layer)**

> **Status**: Updated 2026-04-29. Originally Option 2+3 was accepted and implemented (global faceted SVG backdrop + animated orbs). Option 4 is now ADDITIVE on top — the base layers are preserved unchanged.

**What was built (additive, does not remove Option 2+3)**:

- **Global atmosphere (Option 2+3 base — unchanged)**:
  - `public/backdrop-facets.svg` — fixed-position faceted SVG on `body` background
  - `body::before/::after` — two animated blurred radial-gradient orbs (brand + accent) at low opacity

- **Per-section identity layer (Option 4 additions)**:
  - `src/components/HeroBackdrop.astro` — 6-polygon inline SVG facet cluster local to the hero, denser than the global backdrop. Colors sourced directly from logo SVG class fills (st0=#73A0BE, st1=#0F293F, st3=#A7A6A8). Hero section gets `position: relative; overflow: hidden` to contain it.
  - `src/components/SectionBackdrop.astro` — shared backdrop component with `variant` prop:
    - `variant="projects"` → 10 scattered small diamond facets distributed across the grid's column rhythm
    - `variant="experience"` → vertical accent strips on left/right edges + diagonal facets leaning leftward (reinforces top-to-bottom timeline read)
    - `variant="contact"` → 4 convergent corner shards + thin radiating wedges pointing toward the center form
  - CSS scroll-driven parallax in `src/styles/global.css` (`@supports (animation-timeline: view())`): backdrops translate -30px as their section scrolls through view. Graceful degradation: no parallax where unsupported. `prefers-reduced-motion: reduce` disables animation entirely. 0 KB JS added.

**Bundle impact**: ~3.2 KB total inline SVG across 4 components (hero + 3 section variants), ~350 B CSS for parallax, 0 KB JS.

**A11y**: All inline SVGs `aria-hidden="true"`. Worst-case polygon fill is `#1A3A5C` (surface-elevated); white text contrast against that = 11.6:1, well above WCAG AA. `prefers-reduced-motion: reduce` disables all parallax animation.

### 11.4 ADR-7: Background treatment — Full Composition (Option 4 atop Option 2+3 base)

- **Status**: Updated — Option 4 implemented atop previously accepted Option 2+3
- **Context**: Option 2 (Faceted Backdrop) + Option 3 (Atmospheric Orbs) were built and committed. User requested Option 4 ("Full Composition") as an ADDITIVE upgrade — each section gets its own thematic backdrop identity while the global layers remain.
- **Decision**: Adopt **Option 4 — Full Composition** as a layer ON TOP of Option 2+3. The global `backdrop-facets.svg` + orbs are the atmosphere floor. Per-section components (`HeroBackdrop.astro`, `SectionBackdrop.astro`) add identity layers positioned absolutely inside each section. Parallax via CSS scroll-driven animations only (`@supports`), zero JS, graceful degradation.
- **Consequences**:
  - **Files added**: `src/components/HeroBackdrop.astro`, `src/components/SectionBackdrop.astro`
  - **Files modified**: `src/components/Hero.astro` (import + render HeroBackdrop, add `position: relative; overflow: hidden`), `src/components/ProjectGrid.astro` (import + render SectionBackdrop variant="projects"), `src/components/ExperienceList.astro` (import + render SectionBackdrop variant="experience"), `src/components/ContactForm.astro` (import + render SectionBackdrop variant="contact"), `src/styles/global.css` (parallax `@supports` block)
  - **No changes** to `public/backdrop-facets.svg`, `src/styles/tokens.css`, any page file, any test
  - **Bundle delta**: ~3.2 KB inline SVG (HTML), ~350 B CSS, 0 KB JS
  - **A11y**: SVGs `aria-hidden`; all text contrast ≥11.6:1; reduced-motion respected
  - **Performance**: Parallax uses `transform` only → GPU composited, no reflow. Mobile: SVG opacity reduced at ≤480px. Parallax has no JS scroll listener — CSS-only, no continuous event handlers
- **Alternatives considered**: Option 4 with JS IntersectionObserver parallax — rejected (CSS scroll-driven achieves same with 0 KB JS; non-supporting browsers get static backdrop, which is still better than nothing). Client-tinted backdrops for project detail pages — deferred (scope creep; home sections deliver the visual identity upgrade; project pages continue using the global atmosphere).
- **Forward path**: Project detail pages (`/projects/[slug]`) can receive `SectionBackdrop` with a `client` prop tint in a future pass. The system is already built; it's a prop + CSS variable addition.

### 11.5 Non-obvious technique discovered

CSS `background-image` accepts a stack of layered images, but a **single SVG with multiple polygons** outperforms a stack of CSS gradients of equivalent visual complexity: the browser rasterizes the SVG once and composites it as a single texture, while a multi-stop gradient stack re-evaluates every paint. For the Faceted Backdrop, this means: prefer ONE `backdrop-facets.svg` over 6 stacked `radial-gradient()` layers. Saves paint cost AND reads identical.

---

## 12. Open Questions / Risks (post-design)

> **NEW RISK (Firebase hosting change)**: The current `firebase.json` has `"public": "www"` with a catch-all SPA rewrite (`"source": "**", "destination": "/index.html"`). Both MUST be updated on the `redesign-astro` branch BEFORE the first `firebase deploy`. If the SPA rewrite is not removed, direct navigation to `/projects/[slug]` will serve the home `index.html` instead of the Astro-generated project page — Astro static builds use file-based routing and DO NOT rely on a JS router to resolve deep links.


1. **JNVR animated logo SVG source not found in repo at design time** (only ionicon SVGs returned by glob). The Logo.astro component port is contingent on locating the SVG in the current Angular codebase (likely inline in a component template). Tasks phase MUST locate and port it.

2. **Stack chip vocabulary**: 9 projects have ~25 distinct stack tokens (Flutter, Firebase, React 19, FastAPI, Postgres, etc.). The filter chips need a curated reduction (e.g., the proposal's 4 chips: Flutter | React | PHP | Astro). DESIGN-DECISION: chips show the 4 main filters; full stack list is in card body but NOT clickable.

3. **Zod schema does not enforce that `cover` exists when `placeholder: false`**. Add a Zod `.refine()`:
   ```ts
   .refine(d => d.placeholder || d.cover, { message: 'cover required when placeholder=false' })
   ```

4. **Self-hosted variable fonts CLS risk**: variable woff2 with `font-display: swap` flashes between system fallback and Inter. Add `size-adjust` + `ascent-override` in `@font-face` to match metrics. Tasks phase will tune.

5. **Vitest cannot directly test `.astro` files** (Astro components are server-rendered; no JSX runtime). Unit tests target `src/utils/` and `src/i18n/` only. Astro page rendering covered via Playwright E2E. DESIGN-DECISION accepted by proposal Decision 18.

6. **`getStaticPaths` in `src/pages/projects/[slug].astro` MUST filter by locale** to avoid generating duplicate paths from EN entries:
   ```ts
   const projects = await getCollection('projects', e => e.data.locale === 'es');
   return projects.map(p => ({ params: { slug: p.data.slug }, props: { entry: p } }));
   ```
   The EN counterpart in `src/pages/en/projects/[slug].astro` filters by `locale === 'en'`.

---

## 13. Architecture Decision Records

### ADR-1: Astro 5 static + vanilla TS islands (vs Angular puro, vs Astro+Angular islands)
- **Status**: Accepted
- **Context**: Current site is Ionic+Angular shipping ~300 KB JS. Proposal AC requires Lighthouse Perf >= 95 and JS <= 50 KB on home.
- **Decision**: Astro 5 with `output: 'static'`, components in `.astro`, interactive bits as small TS scripts.
- **Consequences**: Bundle drops ~85%. Lose Angular dependency injection / RxJS — fine, this is a content site. Team already shipped Astro on `centinela_webpage`.
- **Alternatives considered**: Angular puro (~150 KB, still too heavy for an SSG portfolio); Astro + Angular islands (adds Angular runtime back for islands, defeats the win); Next.js (React, not in user's stack).

### ADR-2: Bilingual via Astro i18n + dir-keyed Zod schemas (vs i18n library)
- **Status**: Accepted
- **Context**: Need ES default + EN, must avoid drift between locales.
- **Decision**: Astro native `i18n` config (`defaultLocale: 'es'`, `prefixDefaultLocale: false`). Content is split by `locale` field on each entry; build-time parity check fails the build if locales diverge. UI strings in `src/i18n/{es,en}.ts` plain objects with TS-checked keys.
- **Consequences**: Zero runtime translation cost. Type-safe key access. Adding a third locale is trivial (`pt.ts` + `pt/` content + add to `LOCALES` enum).
- **Alternatives considered**: i18next (adds runtime, overkill for static); Astro Starlight i18n (heavier, doc-site flavor); single-file with all locales (untyped, error-prone).

### ADR-3: Service worker eviction via no-op SW at same path (vs broadcast unregister vs leave-it)
- **Status**: Accepted
- **Context**: Returning visitors have `@angular/service-worker` cached. If we ship a new site without addressing this, those visitors see the stale Angular shell forever (or until they manually clear site data).
- **Decision**: Ship `public/ngsw-worker.js` containing a SW whose only job is to `caches.delete()` everything, `clients.claim()`, and `self.registration.unregister()`. Register it on `window.load` from the new shell.
- **Consequences**: First return visit: one extra reload (controllerchange listener). All subsequent visits: clean. After 60-90 days, the SW file can be deleted from `public/`.
- **Alternatives considered**:
  - Broadcast unregister via `navigator.serviceWorker.getRegistrations()` from the page (works ONLY if the page loads at all — but the cached SW may serve stale HTML that doesn't have this code).
  - Leave it (unacceptable: confirmed Decision 9 risk in proposal).
  - Migrate to vite-plugin-pwa (adds offline complexity we don't need).

### ADR-4: Content collections + Zod (vs MDX-only, vs headless CMS)
- **Status**: Accepted
- **Context**: 9 projects with structured metadata across 2 locales = 18 markdown files with consistent shape.
- **Decision**: Astro Content Collections with Zod schemas in `src/content/config.ts`. Markdown body + typed frontmatter. `getCollection` returns typed entries. `image()` helper for cover.
- **Consequences**: Build fails when frontmatter is wrong (e.g., missing `client`, invalid `year`, broken `cover` ref). Adding a project = drop two markdown files + cover image. Editor experience: any markdown editor.
- **Alternatives considered**:
  - MDX-only (no schema validation, freeform — drift risk).
  - Headless CMS (Decap/Sanity) — out of scope per proposal "Out of Scope".
  - JSON file (no markdown body for project case studies — pages would be code-heavy).

### ADR-5: Firebase Hosting (vs Vercel, vs gh-pages, vs Cloudflare Pages)
- **Status**: Accepted (proposal Decision 2 — updated from Vercel to Firebase Hosting)
- **Context**: Firebase project `jnvr-portafolio` is already configured with `.firebaserc` and `firebase.json` in the repo. Switching to Vercel would have added a new account, adapter dependency (`@astrojs/vercel`), and zero concrete benefit over Firebase for a purely static site.
- **Decision**: Firebase Hosting (existing project). No adapter added to Astro — pure `output: 'static'`. Deploy via `firebase deploy --only hosting`. Preview validation via `firebase hosting:channel:deploy`. Production URL: `https://jnvr-portafolio.web.app`.
- **Consequences**: No migration cost. Same CDN/SSL/free-tier as Vercel. Preview channels provide URL-per-deploy without a third-party CI integration. `firebase.json` must be updated (Section 9) — particularly the `public` dir and removal of the SPA rewrite. Custom domain deferred to post-launch.
- **Alternatives considered**:
  - Vercel: marginal DX gain (native Astro adapter, preview-per-PR) did NOT justify migration cost when Firebase was already configured. Astro static output works on any CDN without an adapter.
  - Keep gh-pages: no preview deploys, `--base-href` gymnastics required, no CDN-level cache headers.
  - Cloudflare Pages: also good CDN; no advantage when Firebase is already in place.

### ADR-6: Dark-only theme, no toggle (proposal Decision 12 ratified at design level)
- **Status**: Accepted
- **Context**: Theme toggle adds JS state, doubles CSS test surface, doubles design QA. Proposal selected dark-only minimalist editorial.
- **Decision**: Single `tokens.css` with dark palette. No `prefers-color-scheme` media query. No toggle UI.
- **Consequences**: Light theme is a future change (`add-light-theme`). Saves ~2 KB JS + ~3 KB CSS + zero state mgmt. Recruiter audience is dev-skewed, dark reads better.
- **Alternatives considered**:
  - Both with toggle (proposal rejected).
  - Auto via `prefers-color-scheme` (still doubles CSS, no toggle UI but every component must be tested in both).

---

## 14. Experience Section Redesign — V2 (replaces Timeline Spine)

> **Status**: Proposed 2026-04-30. The currently implemented "Timeline Spine" (vertical rail + alternating left/right cards + diamond nodes + featured pulse — see `src/components/ExperienceList.astro`) was rejected by user feedback ("no me gusta"). This section proposes 3 radically different layouts and recommends one.

### 14.1 Diagnostic — why the Timeline Spine likely fell flat

Treat as caution signs for the new direction, not a post-mortem:

| Caution | Evidence |
|---------|----------|
| Reads as "infographic", not editorial | The faceted backdrop, ProjectCard clip-path corner cuts, and Hero composition speak the language of a printed art-book. The spine + nodes look like a project-management tool. |
| High-contrast solid brand-blue spine fights with the global animated orbs | The body has 2 brand-color orbs at 12% drifting behind everything; an opaque-ish brand-blue rail in front of them creates visual noise the rest of the portfolio carefully avoids. |
| Alternating left/right cards break reading rhythm | Every other portfolio section flows top-to-bottom in a single column. The zig-zag forces the eye to track a non-linear path that the rest of the page never asks of it. |
| Featured pulse competes with the orb breathing | Two slow-pulsing brand-color elements on screen at once = ambient chaos. |
| Linear timeline doesn't *add* information beyond the year ranges already in the cards | The visual cost (rail + nodes + connectors + 3-column grid) buys nothing the typography already conveys. |
| Generic — every dev portfolio has a timeline | Visitors have seen this before. The portfolio's faceted/atmospheric voice never feels generic anywhere else. |

The new direction must: (1) flow top-to-bottom in a single visual axis, (2) keep all decorative elements at the same low opacity range as the rest of the portfolio (0.10-0.30), (3) use faceted polygon vocabulary not lines+nodes, (4) treat "featured" as a quiet weight increase, never a pulsing element, (5) feel inseparable from `ProjectCard` and `HeroBackdrop`.

### 14.2 Three new directions

#### Option A — "Faceted Stack" (editorial bands)

- **Essence**: Each role is a full-width horizontal band, stacked vertically like sections of a printed magazine article. Year is a giant display number on the left; content fills the right. The featured role gets a denser inline facet cluster behind it.
- **Layout sketch**:
  ```
  ┌────────────────────────────────────────────────────┐
  │ 2023─                                              │
  │ pres   FLETES MÉXICO   ·   Ciudad Juárez (remoto)  │
  │  ▼     Software Developer                          │
  │        FastAPI · PostgreSQL · Docker · Power BI    │
  │        Microservicios, dashboards BI...            │
  │        [hairline diagonal divider ───────╲────]    │
  ├────────────────────────────────────────────────────┤
  │ 2025─  TEOTECH         ·   México (remoto)         │
  │ 2026   Full-stack Freelance                        │
  │        React · FastAPI · PHP · MySQL · Docker      │
  │        ...                                         │
  ├────────────────────────────────────────────────────┤
  │ 2021─  MUSEO RODADORA  ·   Ciudad Juárez           │
  │ 2023   Coordinador de Sistemas                     │
  │        ...                                         │
  └────────────────────────────────────────────────────┘
  ```
- **Featured treatment**: same band, same height, +1 inline 3-polygon SVG cluster behind text (faint navy facets at 0.22 opacity), a 2px brand-color top edge replacing the divider, and the company name in `--accent` (warm light blue). NO pulse, NO glow, NO scale change. Visual weight comes from density, not loudness.
- **Geometry vocabulary**: each band ends in a thin diagonal divider (echoes the V/N letter cuts) — a single SVG polyline at 0.20 opacity. The featured band's facet cluster reuses HeroBackdrop's polygon points at smaller scale.
- **Motion**: scroll-driven entrance only — each band fades up + the year number wipes in from the left as the band enters view. Hover: row gains `border-left: 2px var(--brand)` + slight `padding-left` shift (8px). No idle motion, no pulses.
- **Typography hierarchy**: year = `--font-mono` clamp(2rem, 4vw, 3rem) tabular numerals; company = Bricolage Grotesque 600 caps with letter-spacing 0.06em; role = Inter 500; summary/highlights = Inter 400 muted; stack = mono caption.
- **Concrete CSS sketch**:
  ```css
  .xp-band {
    display: grid;
    grid-template-columns: clamp(7rem, 14vw, 11rem) 1fr;
    gap: var(--space-6);
    padding-block: var(--space-8);
    border-block-end: 1px solid var(--border);
    position: relative;
  }
  .xp-band:last-child { border-block-end: none; }
  .xp-band__year {
    font-family: var(--font-mono);
    font-size: clamp(2rem, 4vw, 3rem);
    font-variant-numeric: tabular-nums;
    color: var(--text-muted);
    line-height: 1;
    letter-spacing: -0.01em;
  }
  .xp-band--featured {
    border-block-start: 2px solid var(--brand);
    background:
      linear-gradient(180deg,
        color-mix(in srgb, var(--surface) 22%, transparent),
        transparent 80%);
  }
  .xp-band--featured .xp-band__company { color: var(--accent); }
  /* Diagonal divider at the END of the band (not full-width line) */
  .xp-band::after {
    content: ''; position: absolute;
    right: 0; bottom: -1px;
    width: clamp(120px, 18vw, 220px); height: 1px;
    background: linear-gradient(90deg, transparent, var(--brand) 40%, transparent);
    opacity: 0.20; transform: skewX(-22deg);
  }
  @supports (animation-timeline: view()) {
    .xp-band { animation: xp-band-rise linear both;
               animation-timeline: view();
               animation-range: entry 10% cover 35%; }
    @keyframes xp-band-rise {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: none; }
    }
  }
  ```
- **Tradeoffs**: less "spectacular" than B/C — a confident reader, not a showpiece. Sacrifices simultaneous visibility (one role at a time fills the eye) for clarity and editorial calm. Skim-friendly because the year column scans like a contents list.
- **Performance**: 0 KB JS. ~700 B CSS, 0 KB SVG (the featured facet cluster reuses tokens; ~500 B inline SVG only on the featured band). Single composite layer per band. Zero idle paint cost.

#### Option B — "Constellation Grid" (orbital polygons)

- **Essence**: Roles render as faceted polygon "shards" arranged in a loose 12-column constellation grid. The featured Fletes shard is the largest, anchored center; past roles are smaller polygons orbiting it at varied positions and angles. Each shard's body is text on a `clip-path` polygon (not a rectangle).
- **Layout sketch**:
  ```
                    ╱──────────╲
                   ╱  TEOTECH   ╲
                   ╲  2025-2026 ╱
        ╱─────╲     ──────────╱       ╱─────╲
        │ IA  │                       │BLOOM │
        │ '21 │      ╱──────────╲    │'19-'21│
        ╲─────╱     ╱   FLETES    ╲   ╲─────╱
                   │   Software    │
                   │    Dev        │
                    ╲             ╱
                     ╲───────────╱
                  ╱──────────────╲
                  ╲ MUSEO RODADORA╱
                   ╲   '21-'23   ╱
                    ─────────────
  ```
- **Featured treatment**: the Fletes shard is centered, ~1.5x scale of others, has the densest fill (`--surface-elevated`), a 2px brand border, and is the only shard with a stack chip row visible by default. Other shards show year + company + role only; hovering or tabbing onto them reveals the stack and summary inline (CSS-only via `:hover`/`:focus-within` with smooth transition — content rendered, just visually compressed).
- **Geometry vocabulary**: each card is `clip-path: polygon(...)` with the same V-cut top-right corner already used in `ProjectCard.astro` (`clip-path: polygon(0 0, calc(100% - var(--clip-facet)) 0, 100% var(--clip-facet), 100% 100%, 0 100%)`), but with a *second* angular cut on the bottom-left for asymmetry. Each card gets a slightly different rotation angle (-2deg, +1.5deg, -1deg…) baked in CSS for each `:nth-child` so the constellation feels hand-placed not generated.
- **Motion**: scroll-driven entrance — shards fade in with a small rotation-snap (each from its own random offset toward 0deg). Hover: shard rotation snaps to 0, border 1px → 2px brand, translateY(-2px), and reveals the hidden stack/summary block. No idle motion.
- **Typography hierarchy**: company = Bricolage Grotesque 600 small caps; year = mono caption top-right inside the polygon; role = Inter 500 with reduced size.
- **Concrete CSS sketch**:
  ```css
  .xp-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space-4) var(--space-3);
    align-items: start;
  }
  .xp-shard {
    --tilt: -1deg;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: var(--space-4) var(--space-5);
    /* dual-cut polygon: top-right + bottom-left */
    clip-path: polygon(
      0 0, calc(100% - 18px) 0, 100% 18px,
      100% 100%, 18px 100%, 0 calc(100% - 18px)
    );
    transform: rotate(var(--tilt));
    transition: transform var(--duration-base) var(--ease-out-expo),
                border-color var(--duration-base);
  }
  .xp-shard:nth-child(2n)   { --tilt: 1.2deg;  }
  .xp-shard:nth-child(3n+1) { --tilt: -1.6deg; }
  .xp-shard:hover, .xp-shard:focus-within {
    transform: rotate(0) translateY(-2px);
    border-color: var(--brand); border-width: 2px;
  }
  /* Featured anchor */
  .xp-shard--featured {
    grid-column: 4 / span 6; grid-row: 2;
    --tilt: 0deg;
    border-color: var(--brand); border-width: 2px;
    background: linear-gradient(180deg,
      color-mix(in srgb, var(--surface) 80%, var(--accent) 20%),
      var(--surface));
  }
  /* Smaller shards distributed around it */
  .xp-shard:nth-child(1) { grid-column: 1 / span 4; grid-row: 1; }
  .xp-shard:nth-child(3) { grid-column: 8 / span 5; grid-row: 1; }
  .xp-shard:nth-child(4) { grid-column: 1 / span 4; grid-row: 3; }
  .xp-shard:nth-child(5) { grid-column: 9 / span 4; grid-row: 3; }
  .xp-shard:nth-child(6) { grid-column: 4 / span 6; grid-row: 4; }
  /* Mobile collapses to single column, tilts removed */
  @media (max-width: 768px) {
    .xp-grid { display: flex; flex-direction: column; }
    .xp-shard { --tilt: 0deg !important; grid-column: 1 / -1 !important; }
  }
  ```
- **Tradeoffs**: highest aesthetic payoff but highest risk — "designed-for-the-portfolio" smell if not restrained. Hidden content on hover hurts mobile (collapse strategy: mobile shows everything, desktop hides until hover). Rotation must be subtle (≤2deg) or it tips into kitsch. Tilt + clip-path may interact awkwardly with browser focus rings — solved by drawing focus ring on inner content wrapper, not the clipped element.
- **Performance**: 0 KB JS. ~1.1 KB CSS, 0 KB extra SVG. Each shard is a single composite layer with one transform. Low cost. Mobile performance: tilt + clip-path are cheap; CSS-only hover-reveal.

#### Option C — "Layered Document" (paper stack)

- **Essence**: Roles render as overlapping translucent panels — like flipping through papers on a desk. Featured Fletes is the top paper (front, slightly larger, fully visible); past roles peek behind in a diagonal cascade. Hovering or scrolling brings each underlying paper forward in a soft fan-out. Strong sense of "history" without a literal timeline.
- **Layout sketch**:
  ```
  ┌──────────────── FLETES ─────────────────┐  ← featured, top paper
  │ Software Developer · 2023─pres          │
  │ FastAPI · PostgreSQL · Docker · Power BI │
  │ Microservicios, dashboards BI...         │ ┐
  └──────────────────────────────────────────┘ │ TEOTECH 2025-2026 ←
       └─────────────────────────────────────┘ │ │ MUSEO 2021-23 ←
            └────────────────────────────────┘ │ │ │ IA CENTER 2021 ←
                 └──────────────────────────┘  │ │ │ │ BLOOM 2019-21
                                                ┘ ┘ ┘ ┘
  (each paper offset 12px right + 8px down — a corner of each visible)
  ```
- **Featured treatment**: top paper is the only one fully readable by default. It carries the full header, summary, highlights, and stack chips. Past papers show ONLY their tab (year + company + role) sticking out from under the front paper. Tabs are clickable / hoverable / focusable: hover or focus pulls that paper forward via a CSS `transform` (translateX(0) + z-index swap), revealing its content. Reading mode = stable; exploration mode = quiet animation.
- **Geometry vocabulary**: each paper has the established ProjectCard corner-cut clip-path (top-right notched). Paper "tabs" are the visible exposed edges — each ~120px wide containing year + company in mono caption, with a thin brand-color top-edge accent (1px, 0.30 opacity). Stack of papers offsets 12px x / 8px y per layer.
- **Motion**: scroll-driven entrance: papers fade in with a small `translateX` shuffle (each from its own offset toward final stacked position). Hover/focus on a tab: paper slides forward + becomes fully readable; previous front paper shrinks back into stack. CSS transitions only.
- **Typography hierarchy**: top paper carries full hierarchy (Bricolage company, Inter role, Inter body, mono year, mono stack). Tabs use mono caption ONLY (year + company), no role.
- **Concrete CSS sketch**:
  ```css
  .xp-stack {
    position: relative;
    min-height: clamp(420px, 60vh, 560px);
    padding-inline-end: clamp(140px, 20vw, 220px); /* room for tabs */
  }
  .xp-paper {
    position: absolute; inset: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    padding: var(--space-6);
    clip-path: polygon(0 0,
      calc(100% - var(--clip-facet)) 0,
      100% var(--clip-facet),
      100% 100%, 0 100%);
    transition: transform var(--duration-slow) var(--ease-out-expo),
                opacity var(--duration-base);
  }
  /* Each paper offset further right + down. Highest data-order = deepest. */
  .xp-paper[data-depth="0"] { transform: translate(0,    0);   z-index: 6; }
  .xp-paper[data-depth="1"] { transform: translate(48px, 16px); z-index: 5; opacity: 0.96; }
  .xp-paper[data-depth="2"] { transform: translate(96px, 32px); z-index: 4; opacity: 0.92; }
  .xp-paper[data-depth="3"] { transform: translate(144px,48px); z-index: 3; opacity: 0.88; }
  .xp-paper[data-depth="4"] { transform: translate(192px,64px); z-index: 2; opacity: 0.84; }
  .xp-paper[data-depth="5"] { transform: translate(240px,80px); z-index: 1; opacity: 0.80; }
  /* Tab — visible-only portion of underlying papers */
  .xp-paper:not([data-depth="0"]) .xp-paper__body { visibility: hidden; }
  .xp-paper__tab {
    position: absolute; top: 0; right: 0;
    padding: var(--space-2) var(--space-3);
    border-block-start: 1px solid color-mix(in srgb, var(--brand) 30%, transparent);
    font-family: var(--font-mono);
    font-size: var(--text-caption);
    color: var(--text-muted);
    /* Tab slides into view on hover/focus pulling paper forward */
    cursor: pointer;
  }
  .xp-paper:has(.xp-paper__tab:hover),
  .xp-paper:has(.xp-paper__tab:focus-visible) {
    transform: translate(0, 0); z-index: 10; opacity: 1;
  }
  .xp-paper:has(.xp-paper__tab:hover) .xp-paper__body,
  .xp-paper:has(.xp-paper__tab:focus-visible) .xp-paper__body { visibility: visible; }
  /* Featured (front) gets brand top-edge */
  .xp-paper--featured { border-block-start: 2px solid var(--brand); }
  ```
- **Tradeoffs**: most original / highest "wow"; also highest risk — relies on CSS `:has()` (Safari 15.4+, Chrome 105+, Firefox 121+) for the hover-pull-forward effect. Fallback for unsupporting browsers: use `:focus-within` only, or just show all papers inline in a stack column. Mobile constraint: stack collapses to vertical list (no 3D illusion). Accessibility: each tab is a real `<button>` in source, focusable order = featured → most recent → oldest, so keyboard users get a linear narrative.
- **Performance**: 0 KB JS. ~900 B CSS, 0 KB SVG. Each paper is a composite layer (transform + opacity only). Hover transition runs once per interaction. Idle = zero paint cost.

### 14.3 Recommendation: **Option A — Faceted Stack**

Pick A. Here's why:

1. **Editorial coherence wins**. The portfolio's character is "magazine spread, faceted, atmospheric, restrained". Option A IS that vocabulary applied to experience: a printed-article rhythm of bands separated by hairline diagonal dividers — dividers that echo the same V/N angular cuts the logo and HeroBackdrop already use. B is more spectacular but fights the restraint elsewhere on the page. C is most original but introduces interaction cost (`:has()` + reveal pattern) for content that should be skim-friendly.
2. **Featured = density, not loudness**. The user's prior signals (rejecting the pulsing spine) reveal a sensibility that prefers quiet weight over animated emphasis. A's featured treatment is purely structural — a brand-color top edge + a single inline facet cluster — no pulse, no glow, no scale. That's exactly the language ProjectCard already speaks (border-color shift on hover, no animation).
3. **Scannability by year**. The big mono year column on the left is itself a visual index — recruiters skim experience by date first. A turns that scan into the visual hierarchy. B/C bury the year inside polygon labels; A makes it the entry point.
4. **Ships in one component**. A is the lowest-risk implementation: the existing `ExperienceCard.astro` becomes the band body content, `ExperienceList.astro` becomes a flat `<ol>` of bands. No new SVG asset, no `:has()` polyfill question, no tilted clip-path focus-ring edge cases. Bundle delta is ~700 B CSS, 0 JS, 0 new files.
5. **Originality without spectacle**. The diagonal divider line, the giant tabular mono year, and the inline facet cluster on the featured band give A a fingerprint that "100 other portfolios" don't share — without resorting to gimmicks. The novelty is in restraint and typographic confidence.

### 14.4 Implementation outline (if A is accepted)

| File | Action | Description |
|------|--------|-------------|
| `src/components/ExperienceList.astro` | Rewrite | Drop 3-column timeline grid + spine pseudo-element + connector SVGs + node SVGs. Replace with simple `<ol class="xp-stack">` of bands. Keep sorting logic; keep `SectionBackdrop variant="experience"`. |
| `src/components/ExperienceCard.astro` | Modify | Strip card chrome (border, clip-path, padding, body wrapper). Render flat: year column + content column. Featured variant adds brand top-edge + accent company color + inline facet cluster div. |
| `src/styles/global.css` | Modify | Delete the timeline-spine + node-bloom + connector-draw + featured-pulse CSS blocks (lines ~903-972). Add new `xp-band-rise` keyframes (~30 lines). Keep reduced-motion fallbacks. |
| `src/components/SectionBackdrop.astro` | (No change required) | The `experience` variant currently leans toward a left-rail composition; reconsider in a follow-up if it now feels redundant. Out of scope for this design. |

Bundle delta: NET REDUCTION (~600 B CSS removed for spine/nodes/connectors/pulse, ~700 B added for bands = ~+100 B). Zero new JS. Zero new SVG assets.

A11y notes: bands stay as semantic `<ol><li>` with `<time datetime>` for the year range, headings hierarchy preserved. Featured carries `aria-current="true"`. No reliance on `:has()` or other progressive selectors.

### 14.5 ADR-8: Experience Section Layout V3 — Faceted Stack (replaces Layered Document)

- **Status**: Accepted — Option A implemented (supersedes Option C / Layered Document)
- **Context**: V2 implemented Option C (Layered Document): overlapping translucent glass panels cascaded diagonally with `:has()` recede on hover/focus. User found it too bold ("atrevida") and requested a switch to Option A. The Faceted Stack aligns better with the portfolio's editorial restraint — same vocabulary as ProjectCard and HeroBackdrop, without the interaction-dependent reveal pattern.
- **Decision**: Adopt **Option A — Faceted Stack**: each role is a full-width editorial band with a two-column grid (large mono year anchor LEFT, content RIGHT). Bands are separated by diagonal hairline dividers (skewed -2° to echo the V/N letter cuts). Featured band (Fletes) gets a 2px brand top edge + 3-polygon facet cluster SVG positioned top-right of the content area. All highlights and summaries visible by default for all bands — no truncation, no hover gate. CSS-only, 0 KB JS.
- **Consequences**:
  - **Files modified**: `src/components/ExperienceList.astro` (rewrite: `<ol class="xp-bands">` of `<li class="xp-band">` items, band-level chrome scoped here), `src/components/ExperienceCard.astro` (rewrite: two-column grid inner content, year column + content column, featured facet cluster SVG), `src/styles/global.css` (delete Layered Document block: xp-card transforms, nth-child offsets, :has() recede, reduced-motion xp-card guards; add minimal comment noting bands are component-scoped), `src/pages/dev-preview/components.astro` (update preview wrapper to match band-in-list structure)
  - **Files unchanged**: `src/components/SectionBackdrop.astro`, all content markdown, all i18n strings, all schemas, all tests
  - **Bundle delta**: NET REDUCTION (~800 B CSS removed for glass/clip-path/transforms/recede, ~900 B added for band grid/divider/rise = ~+100 B). Zero new JS. ~500 B inline SVG on featured band only.
  - **A11y**: `<ol><li><article>` semantics; featured carries `aria-current="true"`; `<time datetime>` in sr-only for accessible date range; no `:has()` or progressive selector dependency; all content visible without interaction
  - **Performance**: each band = 1 composite layer (scroll-driven `animation-timeline: view()` for entrance only); zero idle paint cost; no JS scroll listeners; `@supports` guards the scroll-driven animation (graceful degradation to static)
- **Alternatives considered**:
  - **Option C — Layered Document**: implemented as V2 but found too bold ("atrevida") by user; replaced by this decision
  - **Option B — Constellation Grid**: too "designed", tilt + dual clip-path interacts awkwardly with focus rings; mobile collapse loses the entire concept
  - **Keep Timeline Spine V1**: rejected by user; diagnostic confirms it diverges from the established voice
- **Forward path**: The glass panel vocabulary (rgba surface + backdrop-filter + clip-path facets) established here could be applied to ProjectCard for a unified language. Out of scope for this change.

---
