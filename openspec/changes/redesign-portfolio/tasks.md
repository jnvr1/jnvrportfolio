# Tasks: redesign-portfolio

> Strict TDD Mode ACTIVE. Every production-code task is preceded by a `[TEST]` task.
> Tags: `[TEST]` `[IMPL]` `[CONFIG]` `[CONTENT]` `[OPS]` `[DOC]` `[CLEANUP]`
> Estimates: S = <30 min · M = <2 h · L = >2 h · XL = needs split
> Spec IDs: REQ-PS, REQ-PC, REQ-ET, REQ-CF, REQ-IR, REQ-TS, REQ-SW, REQ-FH, REQ-IP

---

## Pre-flight Checklist (user must confirm BEFORE Phase 1)

- [ ] **PF-1** Formspree account created + endpoint URL (`https://formspree.io/f/<id>`)
- [ ] **PF-2** Screenshot availability per project — which of the 9 slugs need `placeholder: true` on day 1?
  - Candidates: `pos-la-brocha`, `teotech-suite`, `brocha-facturacion`, `crm-pedidos`, `tita`, `femn`
- [ ] **PF-3** Confirm bilingual EN content can be authored alongside ES (or mark EN as TODO placeholder + unblock build)
- [ ] **PF-4** Locate JNVR animated SVG source in current Angular tree (design risk — may be inline in `.html` component template). Must be found before Phase 4 begins.
- [ ] **PF-5** Confirm `firebase login` is active locally (or `FIREBASE_TOKEN` available for CI). Run `firebase projects:list` to verify access to project `jnvr-portafolio`.

---

## Phase 1 — Infrastructure & Bootstrap

- [x] 1.1 [OPS] Create tag `pre-redesign-v1` on `main` HEAD and push — `git tag pre-redesign-v1 && git push origin pre-redesign-v1` — Spec: REQ-FH-7 — Est: S — Deps: —
- [x] 1.2 [OPS] Create branch `redesign-astro` from `main` and push upstream — Spec: REQ-FH-7 — Est: S — Deps: 1.1
- [x] 1.3 [OPS] Move Angular source tree to `legacy/` on `redesign-astro` branch (keep as reference; deleted in Phase 13) — Spec: REQ-PS-7 — Est: M — Deps: 1.2
- [x] 1.4 [CONFIG] Initialize Astro 5 project at repo root on `redesign-astro` branch — `astro.config.mjs`, `tsconfig.json`, `package.json`, `.nvmrc` (20.10) — Spec: REQ-PS-1 — Est: M — Deps: 1.3
- [x] 1.5 [CONFIG] Install runtime deps: `astro@^5`, `@astrojs/sitemap`, `@astrojs/check`, `sharp`, `@fontsource-variable/inter`, `@fontsource-variable/space-grotesk`, `@fontsource-variable/jetbrains-mono` — Spec: REQ-PS-1, REQ-TS-4 — Est: S — Deps: 1.4
- [x] 1.6 [CONFIG] Install dev deps: `typescript~5.6`, `vitest@^2.1`, `@playwright/test@^1.48`, `prettier`, `prettier-plugin-astro`, `eslint`, `eslint-plugin-astro` — Spec: — Est: S — Deps: 1.4
- [x] 1.7 [CONFIG] Configure `astro.config.mjs`: `output: 'static'` (no adapter), `i18n` (`defaultLocale:'es'`, `locales:['es','en']`, `prefixDefaultLocale:false`), `@astrojs/sitemap`, `site:'https://jnvr-portafolio.web.app'` — Spec: REQ-PS-1, REQ-IR-1, REQ-IR-5, REQ-FH-1 — Est: M — Deps: 1.5
- [x] 1.8 [CONFIG] Update `firebase.json`: set `hosting.public` to `dist`, add `cleanUrls: true`, `trailingSlash: false`, replace SPA catch-all rewrite with `{ "source": "**", "destination": "/404.html" }`, add `/_astro/**` immutable header and `/ngsw-worker.js` no-cache header — `firebase.json` — Spec: REQ-FH-1, REQ-FH-2, REQ-FH-3, REQ-FH-4, REQ-FH-6 — Est: S — Deps: 1.1
- [x] 1.9 [TEST] Write smoke test that validates `firebase.json` structure: `hosting.public === 'dist'`, `cleanUrls === true`, no `"destination": "/index.html"` rewrite present — `tests/unit/firebase-config.test.ts` — Spec: REQ-FH-2, REQ-FH-3, REQ-FH-4 — Est: S — Deps: 1.8
- [x] 1.10 [OPS] Verify Firebase CLI access: `firebase projects:list` must include `jnvr-portafolio`; confirm `firebase login` state — Spec: REQ-FH-1 — Est: S — Deps: PF-5
- [x] 1.11 [CONFIG] Configure `vitest.config.ts` with `happy-dom` environment — `vitest.config.ts` — Est: S — Deps: 1.6
- [x] 1.12 [CONFIG] Configure `playwright.config.ts` with base URL `http://localhost:4321`, Chromium + Firefox + Safari projects — `playwright.config.ts` — Est: S — Deps: 1.6
- [x] 1.13 [CONFIG] Install Playwright browsers: `pnpm exec playwright install --with-deps` — Est: S — Deps: 1.12
- [x] 1.14 [CONFIG] Add `package.json` scripts: `dev`, `build` (`astro check && astro build`), `preview`, `test`, `test:e2e`, `lint`, `format`, `deploy` (`firebase deploy --only hosting`), `deploy:preview` (`firebase hosting:channel:deploy`) — Spec: — Est: S — Deps: 1.4
- [x] 1.15 [CONFIG] Create `.gitignore` (Astro defaults + `dist/`, `.firebase/`, `node_modules/`) — Est: S — Deps: 1.4

---

## Phase 2 — Design Tokens & Styles

- [x] 2.1 [TEST] Write unit test asserting `tokens.css` contains all 11 required CSS custom properties with exact hex values — `tests/unit/tokens.test.ts` — Spec: REQ-TS-1, REQ-TS-2 — Est: S — Deps: 1.8
- [x] 2.2 [IMPL] Create `src/styles/tokens.css` with all 11 color tokens (`--bg:#0D1117` … `--danger:#F85149`), 4px spacing scale, breakpoint custom media — Spec: REQ-TS-1, REQ-TS-2 — Est: S — Deps: 2.1
- [x] 2.3 [IMPL] Create `src/styles/reset.css` (modern CSS reset, box-sizing, no hardcoded colors) — Spec: REQ-TS-7 — Est: S — Deps: 2.2
- [x] 2.4 [IMPL] Create `src/styles/fonts.css` with `@font-face` for Inter, Space Grotesk, JetBrains Mono variable woff2 with `size-adjust` + `ascent-override` fallback metrics, `font-display:swap` — Spec: REQ-TS-4 — Est: M — Deps: 2.2
- [x] 2.5 [IMPL] Create `src/styles/global.css` (base typography scale, container 1200px, utility classes, motion defaults) — Spec: REQ-TS-5, REQ-PS-8 — Est: M — Deps: 2.3, 2.4
- [x] 2.6 [IMPL] Create `src/styles/prose.css` (markdown body styles for project detail pages) — Spec: — Est: S — Deps: 2.5
- [x] 2.7 [TEST] Write E2E test asserting no request to `fonts.googleapis.com` or `fonts.gstatic.com` on home load — `tests/e2e/fonts.spec.ts` — Spec: REQ-TS-4 — Est: S — Deps: 1.9
- [x] 2.8 [TEST] Write E2E test asserting `background-color` of `body` equals `#0D1117` (dark theme only, no light fallback) — `tests/e2e/theme.spec.ts` — Spec: REQ-TS-2, REQ-TS-3 — Est: S — Deps: 1.9

---

## Phase 3 — Content Collections & Schemas

- [x] 3.1 [TEST] Write unit tests for Zod `projects` schema: valid entry passes, missing `title` fails, invalid `client` fails, `placeholder:false` + no cover fails refine — `tests/unit/content-schema.test.ts` — Spec: REQ-PC-1 — Est: M — Deps: 1.8
- [x] 3.2 [TEST] Write unit tests for Zod `experience` schema: valid entry passes, missing `company` fails — `tests/unit/content-schema.test.ts` — Spec: REQ-ET-1 — Est: S — Deps: 3.1
- [x] 3.3 [IMPL] Create `src/content.config.ts` with Zod schemas for `projects` and `experience` collections (including `.refine()` for `placeholder || cover`); raw schemas extracted to `src/content/schemas.ts` for unit testing — Spec: REQ-PC-1, REQ-ET-1 — Est: M — Deps: 3.1, 3.2
- [x] 3.4 [IMPL] Create `src/content/bilingual-parity.ts` bilingual parity helper (`assertBilingualParity`, `checkBilingualParity`) wired to `astro:build:done` in `astro.config.mjs`; `npm run check:parity` script added — `src/content/bilingual-parity.ts`, `astro.config.mjs`, `scripts/check-bilingual-parity.ts` — Spec: REQ-PC-2, REQ-ET-2, REQ-IR-4 — Est: M — Deps: 3.3
- [x] 3.5 [TEST] Write unit test for `assertBilingualParity`: fails when EN slug missing, passes when both present — `tests/unit/bilingual-parity.test.ts` — Spec: REQ-PC-2, REQ-IR-4 — Est: M — Deps: 3.4
- [x] 3.6 [CONTENT] Create `src/content/projects/es/centinela-app.md` — placeholder content, correct frontmatter, `placeholder:true` if no screenshot — Spec: REQ-PC-3 — Est: S — Deps: 3.3
- [x] 3.7 [CONTENT] Create `src/content/projects/en/centinela-app.md` — EN translation of 3.6 — Spec: REQ-PC-2, REQ-PC-3 — Est: S — Deps: 3.6
- [x] 3.8 [CONTENT] Create `src/content/projects/es/centinela-web.md` + EN counterpart — Spec: REQ-PC-3 — Est: S — Deps: 3.3
- [x] 3.9 [CONTENT] Create `src/content/projects/es/bloomotion-tech.md` (include bloom v1 context per REQ-PC-8) + EN counterpart — Spec: REQ-PC-3, REQ-PC-8 — Est: S — Deps: 3.3
- [x] 3.10 [CONTENT] Create `src/content/projects/es/pos-la-brocha.md` + EN counterpart (`placeholder:true` until screenshot approved) — Spec: REQ-PC-3, REQ-PC-5 — Est: S — Deps: 3.3
- [x] 3.11 [CONTENT] Create `src/content/projects/es/teotech-suite.md` + EN counterpart (sanitized — NO real CFDI) — Spec: REQ-PC-3, REQ-PC-5 — Est: M — Deps: 3.3
- [x] 3.12 [CONTENT] Create `src/content/projects/es/brocha-facturacion.md` + EN counterpart — Spec: REQ-PC-3 — Est: S — Deps: 3.3
- [x] 3.13 [CONTENT] Create `src/content/projects/es/crm-pedidos.md` + EN counterpart (sanitized — NO real student data) — Spec: REQ-PC-3, REQ-PC-5 — Est: S — Deps: 3.3
- [x] 3.14 [CONTENT] Create `src/content/projects/es/tita.md` + EN counterpart — Spec: REQ-PC-3 — Est: S — Deps: 3.3
- [x] 3.15 [CONTENT] Create `src/content/projects/es/femn.md` + EN counterpart — title MUST contain "FEMN", NO "Vida Saludable" anywhere — Spec: REQ-PC-3, REQ-PC-4, REQ-IR-6 — Est: S — Deps: 3.3
- [x] 3.16 [CONTENT] Create `src/content/experience/es/fletes-mexico.md` (`current:true`, `featured:true`) + EN counterpart — Spec: REQ-ET-1, REQ-ET-2, REQ-ET-3, REQ-ET-4 — Est: S — Deps: 3.3
- [x] 3.17 [CONTENT] Create experience ES + EN files: `teotech.md`, `museo-rodadora.md`, `ia-center.md`, `bloomotion.md` — Spec: REQ-ET-2 — Est: M — Deps: 3.3
- [x] 3.18 [IMPL] Create `src/i18n/es.ts`, `src/i18n/en.ts`, `src/i18n/index.ts` (`t(locale, key)` helper) for all UI strings (nav, CTAs, form labels, status messages) — `src/i18n/` — Spec: REQ-CF-9, REQ-IR-4 — Est: M — Deps: 1.4
- [x] 3.19 [IMPL] Create `src/utils/sortProjects.ts` and `src/utils/formatters.ts` — Spec: — Est: S — Deps: 1.4
- [x] 3.20 [TEST] Write unit tests for `sortProjects` and `formatters` — `tests/unit/sortProjects.test.ts`, `tests/unit/formatters.test.ts` — Spec: — Est: S — Deps: 3.19

---

## Phase 4 — Layouts & Core Components

- [x] 4.1 [TEST] Write E2E test: `/` renders `<html lang="es">`, has `<main>`, has skip-to-content link — `tests/e2e/a11y.spec.ts` — Spec: REQ-PS-2, REQ-PS-9 — Est: S — Deps: 1.9
- [x] 4.2 [IMPL] Create `src/layouts/BaseLayout.astro` (HTML shell, `<head>` with meta/og/hreflang/font preload/tokens, skip link, `<main>`, header + slot + footer, `NoOpServiceWorkerScript`) — Spec: REQ-PS-2, REQ-IR-2 — Est: L — Deps: 2.2, 3.18, 4.1
- [x] 4.3 [IMPL] Create `src/components/SEO.astro` (meta, og, twitter, hreflang `es`/`en`/`x-default`) — Spec: REQ-IR-2 — Est: M — Deps: 4.2
- [x] 4.4 [TEST] Write E2E test: `/projects/centinela-app` `<head>` contains `hreflang="es"` and `hreflang="en"` links — `tests/e2e/hreflang.spec.ts` — Spec: REQ-IR-2 — Est: S — Deps: 4.3 — NOTE: tests written and skipped pending Phase 5 routes
- [x] 4.5 [IMPL] Locate JNVR animated SVG in Angular tree (`legacy/`) and port verbatim to `src/components/Logo.astro` (`role="img"`, `aria-label="JNVR"`, CSS keyframes, `prefers-reduced-motion` respected) — Spec: REQ-PS-6, REQ-PS-5 — Est: M — Deps: 1.3, PF-6
- [x] 4.6 [TEST] Write E2E test: Logo.astro renders `role="img"` SVG element in `#hero`, no transform animation fires with `prefers-reduced-motion:reduce` — `tests/e2e/components.spec.ts` (Logo section) — Spec: REQ-PS-5, REQ-PS-6 — Est: M — Deps: 4.5
- [x] 4.7 [IMPL] Create `src/components/Header.astro` (sticky nav, `<nav aria-label="Primary">`, Logo, 4 anchor links, LocaleSwitcher, scroll transparent→solid via inline script using `requestAnimationFrame`) — Spec: REQ-PS-3 — Est: M — Deps: 4.5, 4.10
- [x] 4.8 [TEST] Write E2E test: header background changes from transparent to solid on scroll past 1px — `tests/e2e/components.spec.ts` (Header section) — Spec: REQ-PS-3 — Est: M — Deps: 4.7
- [x] 4.9 [IMPL] Create `src/components/Footer.astro` — Spec: REQ-PS-2 — Est: S — Deps: 2.5
- [x] 4.10 [IMPL] Create `src/components/LocaleSwitcher.astro` (two `<a>` tags, `aria-current="page"` on active, `lang` attr on each link) — Spec: REQ-PS-3, REQ-IR-3 — Est: S — Deps: 3.18
- [x] 4.11 [TEST] Write E2E test: on `/projects/tita`, clicking locale switcher navigates to `/en/projects/tita` and content is in English — `tests/e2e/locale-switcher.spec.ts` — Spec: REQ-IR-3 — Est: M — Deps: 4.10 — NOTE: locale-switcher navigation test requires Phase 5 routes; written in components.spec.ts against dev preview
- [x] 4.12 [IMPL] Create `src/components/ScrollReveal.astro` (IntersectionObserver, fade+translateY 12px, 200ms cubic-bezier(0.16,1,0.3,1), skips animation when `prefers-reduced-motion:reduce`) — `src/components/ScrollReveal.astro`, `src/scripts/scroll-reveal.ts` — Spec: REQ-PS-8, REQ-PS-5 — Est: M — Deps: 2.5
- [x] 4.13 [TEST] Write E2E test: element wrapped in ScrollReveal applies `opacity:0 translateY(12px)` initially, then becomes visible after entering viewport — `tests/e2e/components.spec.ts` (ScrollReveal section) — Spec: REQ-PS-8 — Est: M — Deps: 4.12
- [x] 4.14 [IMPL] Create `src/components/FletesBadge.astro` ("Actualmente en Fletes México" / "Currently at Fletes México", `<span>`, no link) — Spec: REQ-ET-5 — Est: S — Deps: 3.18
- [x] 4.15 [IMPL] Create `src/components/StackChip.astro` (monospace JetBrains Mono, `aria-label="Stack: ..."`) — Spec: REQ-TS-4 — Est: S — Deps: 2.5
- [x] 4.16 [IMPL] Create `src/layouts/ProjectLayout.astro` (`<article>` landmark, cover, prose body via `<Content />`, links, related strip) — Spec: REQ-PC-6 — Est: M — Deps: 4.2

---

## Phase 5 — Project Catalog Components & Routes

- [x] 5.1 [TEST] Write E2E test: `/#projects` renders exactly 9 project cards; no card has "Fletes" in title — `tests/e2e/projects.spec.ts` — Spec: REQ-PC-7, REQ-ET-6, REQ-PC-3 — Est: M — Deps: Phase 3 content — NOTE: also required index.astro (Phase 7 home) which was created here
- [x] 5.2 [IMPL] Create `src/components/ProjectCard.astro` (`<article>`, link is full title, stack chips, placeholder gradient when `placeholder:true`, no broken `<img>`) — Spec: REQ-PC-5, REQ-IP-6 — Est: M — Deps: 4.15, 5.1 — NOTE: implemented in Phase 4
- [x] 5.3 [IMPL] Create `src/components/ProjectFilter.astro` (chip strip: Flutter | React | PHP | Astro, `role="group" aria-label`, chips are `<button aria-pressed>`, live region announces count) — Spec: — Est: M — Deps: 4.15 — NOTE: filter logic embedded in ProjectGrid.astro (no separate file); meets all requirements
- [x] 5.4 [IMPL] Create `src/components/ProjectGrid.astro` (grid container, renders 9 `ProjectCard`s, wires filter with inline client script) — Spec: REQ-PC-7 — Est: M — Deps: 5.2, 5.3 — NOTE: implemented in Phase 4
- [x] 5.5 [TEST] Write E2E test: `/projects/centinela-app` returns HTTP 200 and `<title>` contains project name — `tests/e2e/project-routes.spec.ts` — Spec: REQ-PC-6 — Est: M — Deps: 4.16
- [x] 5.6 [IMPL] Create `src/pages/projects/[slug].astro` (`getStaticPaths` filtering `locale==='es'`, renders ProjectLayout) — Spec: REQ-PC-6, REQ-IR-1 — Est: M — Deps: 4.16, 5.5 — NOTE: fixed Astro 5 entry.id includes .md extension; use .replace(/\.mdx?$/, '')
- [x] 5.7 [IMPL] Create `src/pages/en/projects/[slug].astro` (mirrors 5.6, filtering `locale==='en'`) — Spec: REQ-PC-6, REQ-IR-1 — Est: M — Deps: 5.6
- [x] 5.8 [TEST] Write E2E test: `/en/projects/centinela-app` returns 200 with English content; `/en/` serves content in English — `tests/e2e/project-routes.spec.ts` — Spec: REQ-IR-1 — Est: S — Deps: 5.7

---

## Phase 6 — Experience Timeline Components

- [ ] 6.1 [TEST] Write E2E test: scrolling to `#experience` shows visually distinct Fletes México card before other entries; card shows role, period, highlight — `tests/e2e/experience.spec.ts` — Spec: REQ-ET-3, REQ-ET-4 — Est: M — Deps: Phase 3 content
- [ ] 6.2 [IMPL] Create `src/components/ExperienceCard.astro` (`<li>`, date as `<time datetime>`, featured styling for `current:true`) — Spec: REQ-ET-3 — Est: M — Deps: 6.1
- [ ] 6.3 [IMPL] Create `src/components/ExperienceTimeline.astro` (`<ol>`, wraps ExperienceCard, Fletes rendered featured first) — Spec: REQ-ET-3, REQ-ET-4 — Est: M — Deps: 6.2

---

## Phase 7 — Home & EN Home Pages

- [ ] 7.1 [TEST] Write E2E test: `/` renders without JS (JS disabled via Playwright), all 4 anchor sections visible with text content, no blank sections — `tests/e2e/home.spec.ts` — Spec: REQ-PS-2 — Est: M — Deps: Phase 4, 5, 6
- [ ] 7.2 [IMPL] Create `src/components/Hero.astro` (`<h1>` name+role, FletesBadge, 2 CTAs to `#projects` + `#contact`, Logo) — Spec: REQ-PS-2, REQ-ET-5, REQ-PS-6 — Est: M — Deps: 4.5, 4.14, 7.1
- [ ] 7.3 [IMPL] Create `src/pages/index.astro` (assembles Hero + ProjectGrid + ExperienceTimeline + ContactForm + Footer via BaseLayout, `lang="es"`) — Spec: REQ-PS-2, REQ-IR-1 — Est: M — Deps: 7.2, 5.4, 6.3
- [ ] 7.4 [IMPL] Create `src/pages/en/index.astro` (mirrors index.astro, `lang="en"`, EN i18n strings) — Spec: REQ-IR-1 — Est: M — Deps: 7.3
- [ ] 7.5 [TEST] Write E2E test: `/` returns HTTP 200 with `<html lang="es">`, no redirect to `/es/`; `/en/` returns 200 with `<html lang="en">` — `tests/e2e/home.spec.ts` — Spec: REQ-IR-1 — Est: S — Deps: 7.3, 7.4

---

## Phase 8 — 404 Page

- [ ] 8.1 [TEST] Write E2E test: requesting `/unknown-route` returns HTTP 404 and page contains a link to `/` — `tests/e2e/404.spec.ts` — Spec: REQ-PS-4 — Est: S — Deps: 7.3
- [ ] 8.2 [IMPL] Create `src/pages/404.astro` (minimal layout, `<h1>`, link to `/`) — Spec: REQ-PS-4 — Est: S — Deps: 4.2, 8.1

---

## Phase 9 — Contact Form

- [ ] 9.1 [TEST] Write E2E test: happy-path submission POSTs to Formspree mock, success message appears in DOM and receives focus — `tests/e2e/contact-form.spec.ts` — Spec: REQ-CF-1, REQ-CF-5, REQ-CF-7 — Est: M — Deps: 7.3
- [ ] 9.2 [TEST] Write E2E test: submitting with empty email sets `aria-invalid="true"` on email field and shows inline error — `tests/e2e/contact-form.spec.ts` — Spec: REQ-CF-4 — Est: M — Deps: 9.1
- [ ] 9.3 [TEST] Write E2E test: Formspree network error shows error message with focus; user data remains in fields — `tests/e2e/contact-form.spec.ts` — Spec: REQ-CF-6 — Est: M — Deps: 9.1
- [ ] 9.4 [IMPL] Create `src/scripts/contact-form.ts` (fetch-based submit, validation, `aria-invalid`, `aria-busy` on submit, focus management, success/error state) — Spec: REQ-CF-1, REQ-CF-3–7 — Est: L — Deps: 9.1
- [ ] 9.5 [IMPL] Create `src/components/ContactForm.astro` (fields: name/email/message + honeypot, each with `<label for>`, `aria-describedby` error, `role="status"` live region, bilingual labels via i18n, endpoint from `PUBLIC_FORMSPREE_ENDPOINT`) — Spec: REQ-CF-2, REQ-CF-3, REQ-CF-8, REQ-CF-9 — Est: M — Deps: 9.4, 3.18
- [ ] 9.6 [TEST] Write E2E test: on `/en/`, contact form labels render in English — `tests/e2e/contact-form.spec.ts` — Spec: REQ-CF-9 — Est: S — Deps: 9.5

---

## Phase 10 — Image Pipeline

- [ ] 10.1 [OPS] Add placeholder PNG (`cover.png`, 1200×630, brand-gradient) to `public/projects/` for each slug with `placeholder:true` — `public/projects/*/cover.png` — Spec: REQ-PC-5 — Est: M — Deps: PF-4
- [ ] 10.2 [OPS] Add real sanitized screenshots to `public/projects/*/cover.png` for approved slugs (manual audit: no real CFDI, client, student data) — Spec: REQ-PC-5, REQ-IP-1 — Est: L — Deps: PF-4
- [ ] 10.3 [IMPL] Wire `astro:assets` `<Image>` component in `ProjectCard.astro` with `widths=[400,800,1200]`, `formats=['avif','webp']`, `loading="lazy"`, explicit `width`/`height`/`alt` — `src/components/ProjectCard.astro` — Spec: REQ-IP-2, REQ-IP-3, REQ-IP-5 — Est: M — Deps: 10.1, 5.2
- [ ] 10.4 [IMPL] Add hero LCP `<link rel="preload" as="image">` in `BaseLayout.astro` head for home route — `src/layouts/BaseLayout.astro` — Spec: REQ-IP-4, REQ-PS-9 — Est: S — Deps: 4.2
- [ ] 10.5 [TEST] Write E2E test: project card image `<picture>` contains `<source type="image/avif">` as first source; `loading="lazy"` on below-fold cards — `tests/e2e/images.spec.ts` — Spec: REQ-IP-2, REQ-PC-9 — Est: M — Deps: 10.3
- [ ] 10.6 [TEST] Write E2E test: project with `placeholder:true` renders no `<img>` element, renders CSS gradient div — `tests/e2e/images.spec.ts` — Spec: REQ-IP-6, REQ-PC-5 — Est: S — Deps: 10.3

---

## Phase 11 — Service Worker Eviction

- [ ] 11.1 [IMPL] Create `public/ngsw-worker.js` (no-op SW: `install`→`skipWaiting`, `activate`→`clients.claim` + delete all caches + `self.registration.unregister`, pass-through `fetch`) — Spec: REQ-SW-1–4 — Est: S — Deps: 1.4
- [ ] 11.2 [IMPL] Create `src/scripts/noop-sw-register.ts` (register `/ngsw-worker.js` with `updateViaCache:'none'`, `controllerchange` listener triggers one-time reload) — Spec: REQ-SW-2, REQ-SW-6 — Est: S — Deps: 11.1
- [ ] 11.3 [IMPL] Create `src/components/NoOpServiceWorkerScript.astro` (inline `<script>` importing `noop-sw-register.ts`) and add to `BaseLayout.astro` `<head>` — Spec: REQ-SW-1 — Est: S — Deps: 11.2, 4.2
- [ ] 11.4 [TEST] Write E2E test: simulate returning visitor with registered SW; after page load, SW unregisters (DevTools Application panel shows no active SW) — `tests/e2e/sw-eviction.spec.ts` — Spec: REQ-SW-2, REQ-SW-3, REQ-SW-6 — Est: L — Deps: 11.3
- [ ] 11.5 [TEST] Write E2E test: `ngsw-config.json` absent from `dist/`; `ngsw-worker.js` present at `dist/` root — `tests/e2e/sw-eviction.spec.ts` — Spec: REQ-SW-1, REQ-SW-5 — Est: S — Deps: 11.1

---

## Phase 12 — Performance & A11y Validation

- [ ] 12.1 [TEST] Write bundle-size check script: `scripts/check-bundle-size.mjs` that reads `dist/` after build, fails if home JS > 20KB gzip or CSS > 25KB gzip — `scripts/check-bundle-size.mjs` — Spec: REQ-PS-9 — Est: M — Deps: 7.3
- [ ] 12.2 [CONFIG] Add `check-bundle-size` to `package.json` `build` script (runs after `astro build`) — Spec: REQ-PS-9 — Est: S — Deps: 12.1
- [ ] 12.3 [TEST] Write E2E a11y sweep using `@axe-core/playwright` on `/`, `/projects/centinela-app`, `/en/` — `tests/e2e/a11y.spec.ts` — Spec: REQ-PS-10 — Est: M — Deps: 7.3, 5.6
- [ ] 12.4 [TEST] Write E2E test: `prefers-reduced-motion:reduce` emulated — no `translateY` transform executes on section entry, elements render in final visible state — `tests/e2e/reduced-motion.spec.ts` — Spec: REQ-PS-5, REQ-TS-6 — Est: M — Deps: 4.12, 7.3
- [ ] 12.5 [TEST] Write E2E test: search all `src/components/**/*.astro` and `src/styles/**/*.css` for hex literals `#[0-9A-Fa-f]{3,6}` — must return zero matches (all colors via CSS custom properties) — `tests/unit/no-hardcoded-hex.test.ts` — Spec: REQ-TS-7 — Est: S — Deps: Phase 4, 5, 6

---

## Phase 13 — Migration & Cutover

- [ ] 13.1 [OPS] Deploy to Firebase preview channel for smoke test: `firebase hosting:channel:deploy v2-preview` — produces `https://jnvr-portafolio--v2-preview-<hash>.web.app` — Spec: REQ-FH-5 — Est: S — Deps: All phases
- [ ] 13.2 [OPS] Validate preview URL on mobile + desktop (Lighthouse mobile score ≥ 95, Playwright E2E suite, manual visual review) — Spec: REQ-FH-5 — Est: M — Deps: 13.1
- [ ] 13.3 [CLEANUP] Delete `legacy/` Angular tree from `redesign-astro` before final merge PR — Spec: REQ-PS-7 — Est: S — Deps: 13.2
- [ ] 13.4 [CLEANUP] Verify `ngsw-config.json` absent from `dist/` (covered by 11.5); verify no `@angular/*`, `@ionic/*`, `@capacitor/*`, `@emailjs/*` in `package.json` — Spec: REQ-PS-7, REQ-CF-8 — Est: S — Deps: 13.3
- [ ] 13.5 [OPS] Merge `redesign-astro -> main` — Est: S — Deps: 13.3, 13.4
- [ ] 13.6 [OPS] Promote to production: `firebase deploy --only hosting` — Spec: REQ-FH-1 — Est: S — Deps: 13.5
- [ ] 13.7 [OPS] Verify `https://jnvr-portafolio.web.app` loads new Astro site; check deep-link `/projects/centinela-app` returns correct project page (not home's index.html) — Spec: REQ-FH-4 — Est: S — Deps: 13.6
- [ ] 13.8 [OPS] Monitor site for 48h post-deploy; verify Firebase Hosting release history shows new release; gh-pages branch remains warm as cold fallback — Spec: REQ-FH-8 — Est: — Deps: 13.7
- [ ] 13.9 [OPS] After 48h validation: disable gh-pages workflow in `.github/workflows/` (DO NOT delete `gh-pages` branch) — Spec: REQ-FH-9 — Est: S — Deps: 13.8
- [ ] 13.10 [OPS] After 60 days post-cutover: remove `public/ngsw-worker.js` (returns 404, browser drops SW automatically) — Spec: REQ-SW — Est: S — Deps: 13.8

---

## Phase 14 — Documentation

- [ ] 14.1 [DOC] Rewrite `README.md` — new stack, `pnpm` scripts, Vercel deploy, content collection authoring guide, bilingual parity requirement — `README.md` — Spec: — Est: M — Deps: Phase 13
- [ ] 14.2 [DOC] Create `docs/adr/ADR-1-astro-static.md` through `ADR-6-dark-only-theme.md` (copy from design.md Section 12) — `docs/adr/` — Spec: — Est: M — Deps: 14.1

---

## Acceptance Criteria → Task Coverage

| REQ-ID | Covering Tasks | Gap? |
|--------|---------------|------|
| REQ-PS-1 | 1.4, 1.7 | — |
| REQ-PS-2 | 7.1, 7.2, 7.3, 8.2 | — |
| REQ-PS-3 | 4.7, 4.8 | — |
| REQ-PS-4 | 8.1, 8.2 | — |
| REQ-PS-5 | 2.4, 4.6, 4.12, 4.13, 12.4 | — |
| REQ-PS-6 | 4.5, 4.6 | — |
| REQ-PS-7 | 13.7, 13.8 | — |
| REQ-PS-8 | 4.12, 4.13 | — |
| REQ-PS-9 | 10.4, 12.1, 12.2 | — |
| REQ-PS-10 | 12.3 | Lighthouse CI automated run: **NOTE** — automated Lighthouse CI in GitHub Actions not tasked (Vercel provides Lighthouse via Vercel Speed Insights; manual run on preview is task 13.1). Add to backlog if strict CI gate needed. |
| REQ-PC-1 | 3.1, 3.3 | — |
| REQ-PC-2 | 3.4, 3.5 | — |
| REQ-PC-3 | 3.6–3.15 | — |
| REQ-PC-4 | 3.15 | — |
| REQ-PC-5 | 3.10–3.15, 10.1, 10.2 | Manual sanitization audit is in PF-4 + 10.2; tasks do not enforce automated PII scan (intentional — manual audit required per spec) |
| REQ-PC-6 | 5.5, 5.6, 5.7, 5.8 | — |
| REQ-PC-7 | 5.1, 5.4 | — |
| REQ-PC-8 | 3.9 | — |
| REQ-PC-9 | 10.3, 10.5 | — |
| REQ-ET-1 | 3.2, 3.3 | — |
| REQ-ET-2 | 3.16, 3.17 | — |
| REQ-ET-3 | 6.1, 6.2, 6.3 | — |
| REQ-ET-4 | 3.16, 6.1 | — |
| REQ-ET-5 | 4.14, 7.2 | — |
| REQ-ET-6 | 5.1, 6.3 | — |
| REQ-CF-1 | 9.1, 9.4, 9.5 | — |
| REQ-CF-2 | 9.5 | — |
| REQ-CF-3 | 9.5 | — |
| REQ-CF-4 | 9.2, 9.4 | — |
| REQ-CF-5 | 9.1, 9.4 | — |
| REQ-CF-6 | 9.3, 9.4 | — |
| REQ-CF-7 | 9.1, 9.4 | — |
| REQ-CF-8 | 13.8 | — |
| REQ-CF-9 | 3.18, 9.5, 9.6 | — |
| REQ-IR-1 | 1.7, 7.3, 7.4, 7.5 | — |
| REQ-IR-2 | 4.2, 4.3, 4.4 | — |
| REQ-IR-3 | 4.10, 4.11 | — |
| REQ-IR-4 | 3.4, 3.5, 3.18 | — |
| REQ-IR-5 | 1.7 | — |
| REQ-IR-6 | 3.15 | — |
| REQ-TS-1 | 2.1, 2.2 | — |
| REQ-TS-2 | 2.1, 2.2, 2.8 | — |
| REQ-TS-3 | 2.8 | — |
| REQ-TS-4 | 1.5, 2.4, 2.7 | — |
| REQ-TS-5 | 2.5 | — |
| REQ-TS-6 | 4.12, 12.4 | — |
| REQ-TS-7 | 12.5 | — |
| REQ-SW-1 | 11.1, 11.3, 11.5 | — |
| REQ-SW-2 | 11.1, 11.2, 11.4 | — |
| REQ-SW-3 | 11.1, 11.4 | — |
| REQ-SW-4 | 11.1 | — |
| REQ-SW-5 | 11.5 | — |
| REQ-SW-6 | 11.2, 11.4 | — |
| REQ-FH-1 | 1.7, 1.8, 13.6 | — |
| REQ-FH-2 | 1.8, 1.9 | — |
| REQ-FH-3 | 1.8, 1.9 | — |
| REQ-FH-4 | 1.8, 1.9, 13.7 | — |
| REQ-FH-5 | 13.1, 13.2 | — |
| REQ-FH-6 | 1.8 | — |
| REQ-FH-7 | 1.1, 13.5 | — |
| REQ-FH-8 | 13.8 | — |
| REQ-FH-9 | 13.9 | — |
| REQ-IP-1 | 1.5 (sharp installed), 1.7 (astro:assets via astro.config.mjs) | — |
| REQ-IP-2 | 10.3 | — |
| REQ-IP-3 | 10.3 | — |
| REQ-IP-4 | 10.4 | — |
| REQ-IP-5 | 10.3 | — |
| REQ-IP-6 | 5.2, 10.6 | — |

### Known Gaps (to monitor)

- **REQ-PS-10 (Lighthouse CI)**: No automated Lighthouse gate in GitHub Actions is tasked. Manual run on Firebase preview channel (task 13.2) covers the AC. Add a Lighthouse CI job if a strict automated gate is required post-launch.
- **REQ-PC-5 (PII audit)**: Automated PII scanner not tasked — spec requires manual review. Pre-flight PF-2 and task 10.2 encode the manual gate.

---

## Total Estimate

| Phase | Tasks | S | M | L | Subtotal |
|-------|-------|---|---|---|----------|
| 1 Infrastructure | 15 | 11 | 4 | 0 | ~7.25 h |
| 2 Tokens & Styles | 8 | 4 | 3 | 0 | ~5 h |
| 3 Content Collections | 20 | 12 | 8 | 0 | ~11 h |
| 4 Layouts & Core | 16 | 5 | 10 | 1 | ~14.25 h |
| 5 Project Catalog | 8 | 2 | 6 | 0 | ~7 h |
| 6 Experience | 3 | 0 | 3 | 0 | ~3 h |
| 7 Home Pages | 5 | 1 | 4 | 0 | ~4.25 h |
| 8 404 | 2 | 1 | 0 | 0 | ~1.25 h |
| 9 Contact Form | 6 | 1 | 3 | 1 | ~6.25 h |
| 10 Image Pipeline | 6 | 2 | 3 | 1 | ~6.25 h |
| 11 Service Worker | 5 | 2 | 0 | 1 | ~3.75 h |
| 12 Perf & A11y | 5 | 2 | 3 | 0 | ~3.5 h |
| 13 Migration | 10 | 7 | 2 | 0 | ~4.75 h |
| 14 Documentation | 2 | 0 | 2 | 0 | ~2 h |
| **TOTAL** | **111** | | | | **~79.5 h (~10 person-days)** |

> Assumes S=15 min, M=1 h, L=3 h. Does not include PF pre-flight time (user actions) or the 48h monitoring window (passive).
> Removed: 2 Vercel/DNS tasks (PF-1 Vercel account, PF-2 jnvr.dev domain, 13.2 DNS TTL, 13.4 DNS switch). Added: 3 Firebase config tasks (1.8 firebase.json update, 1.9 firebase.json smoke test, 1.10 firebase CLI verify). Net: -1 task vs original, slightly lower estimate (no M-cost DNS tasks).
