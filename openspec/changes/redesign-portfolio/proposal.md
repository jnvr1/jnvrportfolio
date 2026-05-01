# Proposal: redesign-portfolio

## Intent

The current portfolio (Ionic 8 + Angular 19 SPA) carries ~300KB of framework overhead it does not need, ships only 4 of the 9+ real freelance projects available, has orphaned routes, mislabels FEMN as "Vida Saludable", and renders content client-side which hurts SEO for recruiters searching by name and stack. This change WILL replace the current site with a static-first **Astro 5** rebuild that ships under 50KB on the home route, surfaces 9 real projects with sanitized screenshots, treats Fletes México as current employer (NOT a project card), and is dark-first with a dedicated minimalist editorial aesthetic.

The redesign WILL be executed as a **greenfield rewrite on a parallel branch**, with the current Ionic site remaining deployable until cutover. Brand identity (JNVR animated logo, blue accent `#6BA3C3`) is preserved; the design system is rebuilt against Inter + Space Grotesk on a GitHub-dark surface palette. Bilingual (ES/EN) content with ES default. Final deploy WILL move from gh-pages to **Vercel** for native Astro support, free custom-domain TLS, and zero-config preview deploys per PR.

## Decisions

| # | Decision | Choice | Alternatives considered | Rationale |
|---|----------|--------|------------------------|-----------|
| 1 | Stack | **Astro 5 (static output) + vanilla TS islands** | Angular puro; Astro+Angular islands; Next.js | 85% smaller bundle, SSG SEO wins, content-collection model maps 1:1 to project catalog, user already shipped Astro on `centinela_webpage` |
| 2 | Hosting | **Firebase Hosting (existing project `jnvr-portafolio`)** | gh-pages (current); Vercel; Cloudflare Pages | Project already configured at `jnvr-portafolio` with `.firebaserc` and `firebase.json` in place — zero migration cost, same CDN/SSL/free-tier as Vercel. No `--base-href` gymnastics. gh-pages stays as cold fallback during cutover |
| 3 | Custom domain | **Use default `jnvr-portafolio.web.app`** for v1; custom domain deferred | `jnvr.dev`; `jonviramontes.dev`; keep github.io subdomain | Firebase Hosting default URL is immediately available with no DNS work or domain registration cost. Custom domain can be wired later via Firebase console without redeployment |
| 4 | Design direction | **Direction A: Minimalist Editorial (dark-only)** | Direction B Brutalist; Direction C Warm Developer; hybrid | Cleanest recruiter scan, dev-audience reads dark better, lowest production cost (no theme toggle), best signal of seniority |
| 5 | IA | **One-page scroll with anchors + per-project SEO routes** | Pure one-page; pure multi-page | Recruiter UX wants the scroll; Google indexer wants the routes. `/projects/[slug]` is generated from content collection at build time |
| 6 | Project list | **9 projects** — bloom merged INTO bloomotion-tech (not a standalone card) | Show 10; drop bloomotion entirely | bloom is a static landing with 1 image — too thin alone, but its existence enriches the bloomotion-tech narrative |
| 7 | Fletes treatment | **"Currently at Fletes México" badge in hero + featured experience card** — NOT a project card | Project card with sanitized screenshots; omit entirely | No proprietary code/UI is shown; the user's role (Senior Architect, contract dev at scale) is mentioned as bio context; preserves confidentiality |
| 8 | Migration strategy | **Greenfield in `astro/` subdirectory on branch `redesign-astro`, swap at cutover** | In-place gradual replacement | Keeps `main` deployable until cutover; clean diff per phase; no half-migrated state in production |
| 9 | Service worker | **Kill the old SW with a no-op SW that calls `unregister()` then `clients.claim()`** | Migrate to vite-plugin-pwa; ignore | Returning visitors have the Angular SW cached; we MUST broadcast a SW that uninstalls itself or returning users see stale Angular shell forever |
| 10 | i18n | **Bilingual ES/EN with ES default**, language toggle in header | Spanish only; English only | User writes ES; recruiters often EN. Astro `i18n` config + per-locale content collection. ES is default to honor brand voice |
| 11 | Breakpoints | **Mobile-first**, 4 named breakpoints: `sm 480 / md 768 / lg 1024 / xl 1280` | Desktop-first; 3 breakpoints | Mobile traffic dominates recruiter clicks from LinkedIn/WhatsApp |
| 12 | Theme | **Dark only** (no toggle) | Both with toggle; system-preference auto | Dark-first is design direction A; toggle adds 2KB JS + state mgmt + tested combinations doubled. Light theme deferred to future change |
| 13 | Animation | **Subtle: scroll-revealed fade+translate (12px), 200ms ease-out, ONE motion language**, no parallax. `prefers-reduced-motion` honored | Framer-style choreography; static | Performance budget + accessibility. Reveal-on-scroll uses IntersectionObserver, no library |
| 14 | Contact form | **Formspree (free tier, 50 submissions/month)** | Mailto only; EmailJS (current); Resend; self-hosted | No backend constraint = no Resend (needs API route). Formspree is fully static-friendly, no client-side key exposure (uses a form-action endpoint, not an SDK key like EmailJS). Mailto is too friction-y for recruiters on mobile |
| 15 | Component runtime | **Pure Astro components for static UI; vanilla TS `<script>` for islands (form, language toggle, scroll-reveal)** | Alpine.js; Preact island; Vue | Zero framework runtime, fewest deps, easiest maintenance |
| 16 | Image pipeline | **`@astrojs/image` (sharp) + AVIF + WebP fallback** | Static PNGs; Cloudinary | Build-time optimization, no third-party, ~70% size reduction on screenshots |
| 17 | Type safety | **TypeScript strict, content collections typed via Zod schemas** | Loose JS | User is senior; types are non-negotiable for content shape consistency across 9 projects |
| 18 | Testing | **Vitest for unit, Playwright for one smoke E2E (home renders, all 9 cards visible, contact form submits)** — STRICT TDD | Karma (current); none | Strict TDD is enabled per project context. Astro components testable via Vitest's `astro:check` + Playwright |

## Resolved Questions

1. **Deploy target** → **Firebase Hosting** (existing project `jnvr-portafolio`). Zero migration cost — `.firebaserc` and `firebase.json` are already in the repo. Deploy command: `firebase deploy --only hosting` (or via CI with `$FIREBASE_TOKEN`). `firebase.json` must be updated to point `public` at `dist/` instead of `www/`. gh-pages remains pointing at the old Angular build during cutover, then is decommissioned.

2. **Custom domain** → **Use default `jnvr-portafolio.web.app`** for v1. No domain registration required. Custom domain (`jnvr.dev` or equivalent) is deferred — it can be wired later via Firebase console without touching the build or `firebase.json`.

3. **bloom disposition** → **Merge INTO bloomotion-tech as historical context** ("v1 was a static landing — v2 is a Flutter Web corporate site"). bloom does NOT get its own card.

4. **Teotech CRM/CRM_Pedidos confidentiality** → **Include WITH sanitized screenshots**: blur all real client names, replace with placeholder data, show only architecture/feature views (dashboard layout, invoice list with fake CFDI numbers). NO real CFDI, no real client/student names. If sanitization quality cannot be guaranteed, fall back to architecture-diagram-only cards.

5. **Contact form** → **Formspree free tier**. 50 submissions/month is generous for a portfolio. Migrate the existing form fields (name, email, message) to a Formspree endpoint. Add honeypot field + reCAPTCHA-free spam filtering (Formspree provides). EmailJS is killed.

## Final Project List

Order: by recency × narrative weight. All 9 are framed by client (Angel / Teotech / FEMN) but rendered in a single sortable grid.

| # | Slug | Client | Name | Stack | One-liner | Priority | Confidentiality |
|---|------|--------|------|-------|-----------|----------|-----------------|
| 1 | `centinela-app` | Centinela | Centinela — Control de Accesos | Flutter · Firebase · Stripe | App SaaS para fraccionamientos: códigos QR de visitas, chat residentes, push notifications | P0 | Public — has marketing site |
| 2 | `centinela-web` | Centinela | Centinela — Sitio Web | Astro · Tailwind · DecapCMS | Sitio público SSG del producto Centinela con CMS y SEO | P0 | Public |
| 3 | `bloomotion-tech` | Blooomotion | Bloomotion Tech | Flutter Web · Google Fonts | Sitio corporativo con animated counters y reveal-on-scroll. Migrado desde landing estática (bloom v1) | P1 | Public |
| 4 | `pos-la-brocha` | Teotech | POS La Brocha (Multi-Negocio) | React 19 · TS · Vite · FastAPI · Postgres · Docker · Capacitor | POS + CRM multi-tenant con backend FastAPI dockerizado y wrappers móvil/escritorio | P0 | Sanitized screenshots |
| 5 | `teotech-suite` | Teotech | Teotech CRM Suite (CFDI 4.0) | PHP 8 · MySQL · PWA · Composer | Suite completa: facturación CFDI 4.0, repositorio con cuotas, integración SAT timbrado | P0 | Sanitized — NO real CFDI |
| 6 | `brocha-facturacion` | Teotech | Teotech Facturación | PHP 8 · MySQL · PHPMailer · QR · dompdf | Módulo de facturación CFDI con cotizaciones y notificaciones WhatsApp | P1 | Sanitized |
| 7 | `crm-pedidos` | Teotech | CRM Villa Educare — Pedidos | PHP 8 · MySQL · Vanilla JS | Gestión de pedidos y facturas para instituto educativo con dashboard por roles | P1 | Sanitized — NO real student data |
| 8 | `tita` | FEMN | Tita — Gestión Escolar | Flutter · Firebase · Riverpod · go_router | App móvil para padres/profesores con seguimiento de objetivos y materiales | P0 | Sanitized |
| 9 | `femn` | FEMN | FEMN — Encuestas Socioeconómicas | Flutter · Firebase · PDF gen · offline-first | Herramienta para evaluadores de campo de la fundación: encuestas offline + sync + PDF | P0 | Sanitized — NO real respondent data |

**Fletes México**: NOT in this list. Surfaces in hero badge + featured experience card.

## Information Architecture

```
/                          (one-page scroll, ES default)
├── #hero                  Name + role + "Currently at Fletes México" + 2 CTAs
├── #projects              Filterable grid of 9 cards (filter chips: Flutter | React | PHP | Astro)
├── #experience            Timeline: Fletes (featured) → Teotech → Museo La Rodadora → IA-Center → Bloomotion
├── #contact               Email/LinkedIn/GitHub icons + Formspree form
└── footer                 Copyright, language toggle (ES/EN), social

/projects/[slug]           9 SEO-indexable detail pages (Astro getStaticPaths)
/en/                       English mirror — same structure, /en/ prefix
/en/projects/[slug]
/404                       Minimal 404 page
```

Header: sticky, transparent → solid on scroll. Logo (animated SVG, kept) + 4 anchors (Proyectos, Experiencia, Contacto, EN/ES).

## Stack & Tooling

```yaml
node: ">=20.10"
package_manager: pnpm  # smaller than npm, faster than yarn

dependencies:
  astro: "^5.0"
  "@astrojs/image": "^4.0"
  "@astrojs/sitemap": "^3.0"
  "@astrojs/check": "^0.9"
  sharp: "^0.33"
  zod: "^3.23"  # already transitive via Astro
dev_dependencies:
  typescript: "~5.6"
  vitest: "^2.1"
  "@playwright/test": "^1.48"
  prettier: "^3.3"
  "prettier-plugin-astro": "^0.14"
  eslint: "^9"
  "eslint-plugin-astro": "^1.3"

scripts:
  dev: "astro dev"
  build: "astro check && astro build"
  preview: "astro preview"
  test: "vitest run"
  test:e2e: "playwright test"
  lint: "eslint . && prettier --check ."
  format: "prettier --write ."
```

**Astro config sketch**:
```ts
export default defineConfig({
  site: 'https://jnvr-portafolio.web.app',
  output: 'static',
  // No adapter needed — pure static output, deployed via firebase deploy
  i18n: { defaultLocale: 'es', locales: ['es', 'en'], routing: { prefixDefaultLocale: false } },
  integrations: [sitemap(), image()],
  vite: { resolve: { alias: { '@': '/src' } } }
});
```

**Content collections** (`src/content/`):
```
projects/
  es/{slug}.md  ← frontmatter (Zod-validated): title, client, year, stack[], one-liner, screenshots[], links{}, priority, confidentiality
  en/{slug}.md
experience/
  es/{slug}.md
  en/{slug}.md
```

## Migration Strategy

**Greenfield in parallel branch**, NOT in-place.

1. **Phase 0 — Branch setup**: Create `redesign-astro` branch from `main`. Add Astro project under repo root in a sibling layout (current Angular files untouched). New files live in `src/` (after old Angular `src/` is moved to `legacy/` in branch, ONLY in branch, not in main).
2. **Phase 1 — Static shell**: Hero + nav + footer + theme tokens ported from `variables.scss`. Update `firebase.json`: set `public` to `dist`, add `cleanUrls: true`, replace SPA catch-all rewrite with `/404.html` fallback, add immutable cache headers for `/_astro/**`.
3. **Phase 2 — Content collections**: 9 project markdown files with sanitized screenshots in `public/projects/`.
4. **Phase 3 — Sections**: Projects grid, experience timeline, contact form, language switch.
5. **Phase 4 — Per-project pages**: `/projects/[slug]` dynamic routes.
6. **Phase 5 — Service-worker killer**: Ship a SW at `/ngsw-worker.js` (same path Angular used) whose only job is to `unregister()` + `clients.claim()` + clear caches. This forces returning visitors off the old shell.
7. **Phase 6 — Firebase deploy**: Run `firebase hosting:channel:deploy v2-preview` to validate on a preview channel. After smoke test passes, merge to `main` and run `firebase deploy --only hosting` to promote to production at `https://jnvr-portafolio.web.app`. No DNS change required. gh-pages branch frozen but kept for one cycle.
8. **Phase 7 — Cleanup**: Delete `legacy/` Angular tree from branch, merge to `main`, retire gh-pages action.

**Branch strategy**: All work on `redesign-astro` with PRs into it from `feat/redesign-*` sub-branches. Final single PR `redesign-astro → main` after verify phase passes.

## Visual Direction

**Direction A — Minimalist Editorial (dark only)**

**Palette**:
- `--bg`: `#0D1117` (page)
- `--surface`: `#161B22` (cards)
- `--surface-elevated`: `#1C2333` (hover/focus)
- `--border`: `#30363D`
- `--text`: `#F0F6FF`
- `--text-muted`: `#8B949E`
- `--brand`: `#6BA3C3` (kept from current — JNVR brand)
- `--brand-strong`: `#4A8FB0`
- `--accent`: `#8BB8D0`
- `--success`: `#3FB950` (status badges)
- `--danger`: `#F85149` (form errors)

**Typography**:
- Headings: **Space Grotesk** (geometric, technical) — weights 500/600/700
- Body + UI: **Inter** — weights 400/500
- Mono (code chips, stack badges): **JetBrains Mono** — weight 500
- Loaded via `@fontsource-variable/*` for self-hosted, no FOUT

**Type scale** (mobile / desktop):
- H1 hero: 48 / 72px
- H2 section: 32 / 48px
- H3 card: 20 / 24px
- Body: 16 / 18px
- Caption: 13 / 14px

**Motion language**:
- ENTRY: fade (opacity 0→1) + translate-Y (12px → 0), 200ms `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out)
- HOVER: 150ms; lift cards 2px on hover, brand-color glow on focus
- NO parallax, NO sticky-scroll choreography, NO marquees
- `prefers-reduced-motion: reduce` → kill all transforms, keep opacity changes

**Spacing**: 4px base (0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Container max-width 1200px.

**Theme**: dark only. No toggle.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Old Angular SW caches stale shell for returning visitors | High | High | Ship no-op `ngsw-worker.js` that unregisters self + clears caches (Decision 9) |
| Project screenshots not produced/sanitized in time | Med | High | Per-project content collection accepts `placeholder: true` flag; render brand-colored gradient + project initials when no real screenshot. Cards still ship |
| Client confidentiality breach via screenshot | Low | Critical | Mandatory checklist in tasks phase: blur PII, fake data only, user must approve each Teotech/FEMN screenshot before commit |
| Firebase SPA rewrite breaks Astro multi-page routing | High | High | The current `firebase.json` catch-all rewrite (`"source":"**","destination":"/index.html"`) MUST be removed before deploying Astro. Replace with `/404.html` fallback only. Set `cleanUrls:true`. Validate on preview channel before promoting to production |
| Old `firebase.json` `public: "www"` pointing at Angular output | High | High | Update `public` to `dist` in `firebase.json` on `redesign-astro` branch. The Angular `www/` dir will not exist in the new tree. Validated by task 1.X |
| FEMN mislabeling in user's mind ("Vida Saludable") | Med | Med | Spec MUST encode "FEMN — NGO survey tool" as canonical; any reference to "Vida Saludable" is wrong and removed |
| Bilingual content drift (ES updated, EN forgotten) | Med | Low | Zod schema requires both `es` and `en` content files for each project; `astro check` fails build if missing |
| Lighthouse perf regression after image-heavy hero | Low | Med | `@astrojs/image` AVIF + WebP, lazy-load below fold, hero LCP image preloaded with `<link rel="preload">` |
| Formspree free tier exhausted | Low | Low | 50/mo is well above expected. If exceeded: graceful degradation to mailto + GH issue link |
| Astro 5 / adapter breaking change pre-cutover | Low | Med | Pin all Astro packages to exact versions; renovate later, not during build |
| Migration takes longer than estimate | Med | Low | Branch strategy means main remains deployable; no time pressure on cutover |

## Out of Scope

- Blog / writing section (deferred — possible future change `add-blog`)
- CMS for projects (Decap/Sanity/Contentful) — projects edited as markdown files in repo
- Analytics (Plausible/Umami) — privacy-friendly addition deferred to post-launch change
- Light theme + theme toggle — deferred (Decision 12)
- More than ES/EN locales (PT/FR) — deferred
- RSS feed — deferred until blog exists
- Newsletter signup — out of brand
- Backend (auth, DB, API routes) — explicitly NO server code. Formspree is third-party
- Resume PDF generator — keep current static PDF if any; no dynamic rendering
- Animated transitions between routes (Astro view transitions) — deferred; nice-to-have, not core
- Public showcase of Fletes México screenshots / code — confidentiality constraint
- Importing data via API from GitHub (repo stats, contribution graph) — ranges from premature to noisy

## Acceptance Criteria

1. Lighthouse Performance score **≥ 95** on mobile for the home route (Firebase preview channel, slow-4G simulation).
2. Lighthouse Accessibility, Best Practices, SEO scores **≥ 95**.
3. Initial JS payload (gzipped) on home route is **≤ 50KB**.
4. Initial CSS payload (gzipped) is **≤ 25KB**.
5. All **9 project cards render** in `#projects` with title, client, stack chips, one-liner, screenshot (or placeholder).
6. Each of the **9 project slugs has a `/projects/[slug]` page** that returns 200 in both `/` (ES) and `/en/`.
7. **Hero shows "Currently at Fletes México"** badge and JNVR animated SVG logo.
8. **No project card or detail page exists for Fletes** — only experience timeline entry.
9. Contact form submits successfully to Formspree and shows visible success/error states. Honeypot field rejects bots.
10. **Old Angular service worker is removed** for returning visitors within first visit (verified via DevTools Application tab on a machine with the old SW cached).
11. Site is fully bilingual: every project, section heading, CTA, and form label has both ES and EN content. `astro check` passes.
12. `prefers-reduced-motion: reduce` is honored — manual test: animations replaced by static state.
13. Dark theme (only) renders correctly on Chrome, Firefox, Safari (latest 2 versions on macOS, Windows, iOS, Android).
14. Firebase Hosting preview channel URL exists and is reachable before merging into `main` (deployed via `firebase hosting:channel:deploy`).
15. **No reference to "Vida Saludable"** anywhere in the new site (canonical name is FEMN).
16. **No real CFDI numbers, no real client/student/respondent names** in any screenshot (manual sanitization audit signed off in tasks).

## Rollback Plan

The greenfield branch strategy IS the rollback plan.

- **Pre-cutover** (any time before production Firebase deploy): abandon `redesign-astro` branch; production unchanged on `main` + gh-pages.
- **Post-cutover within 48h**: Firebase console → Hosting → Release history → "Rollback" on the previous release. No DNS change needed — rollback is instant (Firebase switches the CDN edge instantly). Alternatively, `firebase hosting:clone jnvr-portafolio:live jnvr-portafolio:live` from a named release. gh-pages branch is still warm as secondary fallback.
- **Post-cutover after gh-pages decommission (Phase 7)**: re-enable gh-pages action, run `npm run deploy` from the `pre-redesign-v1` git tag created at the start of this change. Recovery: ~10 minutes manual.

**Mandatory artifact**: tag `pre-redesign-v1` on `main` BEFORE merging `redesign-astro`. This is the canonical rollback target.

## Files Affected (preview shape — not exhaustive)

**New** (in `redesign-astro` branch):
- `astro.config.ts`
- `tsconfig.json` (Astro-flavored)
- `package.json` (replaced)
- `src/content/config.ts` (Zod schemas)
- `src/content/projects/{es,en}/*.md` (9 × 2 = 18 markdown files)
- `src/content/experience/{es,en}/*.md`
- `src/layouts/BaseLayout.astro`
- `src/components/{Hero,Header,Footer,ProjectCard,ProjectGrid,ExperienceTimeline,ContactForm,LanguageToggle,ScrollReveal}.astro`
- `src/pages/index.astro`, `src/pages/en/index.astro`
- `src/pages/projects/[slug].astro`, `src/pages/en/projects/[slug].astro`
- `src/pages/404.astro`
- `src/styles/{tokens.css,reset.css,global.css}`
- `public/projects/*` (sanitized screenshots, AVIF + WebP + fallback PNG)
- `public/ngsw-worker.js` (no-op SW that unregisters)
- `public/robots.txt`, `public/sitemap.xml` (auto)
- `tests/{unit,e2e}/*` (Vitest + Playwright)

**Modified**:
- `firebase.json` — update `public` from `www` to `dist`, add `cleanUrls: true`, `trailingSlash: false`, replace SPA rewrite with `/404.html` fallback, add cache headers for `/_astro/**`
- `.firebaserc` — no change (already points to `jnvr-portafolio`)

**Removed at cutover** (only on branch, then `main`):
- All of `src/app/**` (Angular)
- `angular.json`, `karma.conf.js`, `ionic.config.json`, `capacitor.config.ts`
- `ngsw-config.json` (replaced by no-op SW in public/)
- `www/` build output

**Preserved**:
- `.gitignore` (extended)
- `README.md` (rewritten in tasks phase)
- `LICENSE` if present
- The JNVR animated SVG logo (ported from Angular component to Astro component verbatim)
- Brand color `#6BA3C3` and Poppins reference (Poppins becomes a fallback only; Inter/Space Grotesk are primary)

## Capabilities

### New Capabilities
- `portfolio-site`: static SSG portfolio site with bilingual home + per-project SEO routes, dark-only minimalist editorial design
- `project-catalog`: type-safe content collection of 9 projects with bilingual frontmatter, sanitized screenshots, and confidentiality flag
- `experience-timeline`: bilingual experience entries with featured-card support for current employer
- `contact-form`: static-friendly Formspree-backed contact form with honeypot and accessible error states
- `i18n-routing`: bilingual ES/EN routing with ES default and language toggle in header
- `service-worker-killer`: no-op service worker shipped at the legacy Angular SW path that unregisters itself and clears caches for returning visitors
- `image-pipeline`: build-time AVIF + WebP + fallback image optimization for all project screenshots
- `firebase-deploy`: Firebase Hosting static deploy (project `jnvr-portafolio`) with preview channels for validation and production deploy via `firebase deploy --only hosting`

### Modified Capabilities
- None (current site has no codified specs; this is a full replacement, all spec-level behavior is captured under New Capabilities)
