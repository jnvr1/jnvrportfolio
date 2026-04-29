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

### `ExperienceTimeline.astro` + `ExperienceCard.astro`
- **Purpose**: Vertical timeline of experience entries; Fletes is rendered with `featured: true` styling.
- **Props (Card)**: `{ entry: CollectionEntry<'experience'> }`
- **Client**: none; reveal-on-scroll handled by `ScrollReveal.astro` wrapper.
- **A11y**: `<ol>` or `<ul>` with `<li>` per entry; date as `<time datetime>`.

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

## 11. Open Questions / Risks (post-design)

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

## 12. Architecture Decision Records

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
