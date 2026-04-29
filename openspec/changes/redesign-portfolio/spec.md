# Spec: redesign-portfolio

All capabilities listed here are NEW (no existing specs exist — this is a greenfield rewrite).
Requirements use RFC 2119 keywords: MUST, SHALL, SHOULD, MAY, MUST NOT.
REQ-IDs are prefixed per capability.

---

## Capability: portfolio-site

### Purpose
Replace the current Ionic/Angular SPA with a static Astro 5 site that serves the home route under 50KB JS (gzipped), renders full HTML at build time for SEO, and implements the dark-only Minimalist Editorial visual direction.

### Functional Requirements

- REQ-PS-1: The site MUST be generated as fully static HTML (`output: 'static'`) via Astro 5. No platform adapter is used — the build produces a plain `dist/` directory deployed via `firebase deploy --only hosting`.
- REQ-PS-2: The home route (`/`) MUST include the following anchor sections in scroll order: `#hero`, `#projects`, `#experience`, `#contact`, and a `<footer>`.
- REQ-PS-3: The header MUST be sticky, transition from transparent to solid background on scroll, and include the JNVR animated SVG logo, four anchor links (Proyectos, Experiencia, Contacto, and the locale switcher), with the locale switcher rendering as EN when locale is ES and vice versa.
- REQ-PS-4: A `/404` page MUST exist and return HTTP 404 with a minimal layout and a link to `/`.
- REQ-PS-5: The site MUST honor `prefers-reduced-motion: reduce` — all transform-based animations MUST be replaced by static state; opacity transitions MAY remain.
- REQ-PS-6: The JNVR animated SVG logo MUST be ported verbatim from the Angular component to an Astro component.
- REQ-PS-7: The site MUST NOT include any Angular, Ionic, Capacitor, or Karma artifacts after cutover.
- REQ-PS-8: Entry animations MUST use: opacity 0→1 + translateY 12px→0, 200ms `cubic-bezier(0.16, 1, 0.3, 1)`, triggered by IntersectionObserver with no animation library.
- REQ-PS-9: Initial JS payload on the home route MUST be ≤ 50KB gzipped. Initial CSS payload MUST be ≤ 25KB gzipped.
- REQ-PS-10: Lighthouse Performance on the home route (mobile, slow-4G) MUST score ≥ 95. Lighthouse Accessibility, Best Practices, and SEO MUST each score ≥ 95.

### Non-Functional Requirements

- Bundle: home route JS ≤ 50KB gzip, CSS ≤ 25KB gzip (enforceable via `astro build --verbose` size report).
- LCP image (hero): MUST have `<link rel="preload">` in `<head>`.
- Breakpoints: mobile-first, 4 named values — sm 480px / md 768px / lg 1024px / xl 1280px.
- Container max-width: 1200px.
- Spacing base: 4px scale (0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128).

### Scenarios

#### Scenario: Home route renders without JavaScript
- GIVEN a browser with JavaScript disabled
- WHEN the user visits `/`
- THEN the page MUST render all four sections (`#hero`, `#projects`, `#experience`, `#contact`) with full text content visible
- AND no blank section or spinner is shown

#### Scenario: Sticky header transition on scroll
- GIVEN the user is at the top of `/`
- WHEN the user scrolls down more than 0px
- THEN the header background MUST change from transparent to the solid `--surface` token color within one animation frame
- AND the header MUST remain visible and fixed at the top of the viewport

#### Scenario: 404 page for unknown route
- GIVEN no page exists at `/unknown-route`
- WHEN a browser or crawler requests that URL
- THEN the server MUST return HTTP 404
- AND the rendered page MUST include a link to `/`

#### Scenario: Reduced motion honored
- GIVEN a device with `prefers-reduced-motion: reduce` set in OS settings
- WHEN the page loads and sections enter the viewport
- THEN no translateY or transform animation MUST execute
- AND elements MUST appear in their final visible state immediately (no motion)

#### Scenario: JS payload budget enforced at build
- GIVEN the project is built with `astro build`
- WHEN the build output is inspected
- THEN the total JS transferred for the home route MUST be ≤ 50KB gzip
- AND the total CSS transferred MUST be ≤ 25KB gzip

### Out of Scope
- Light theme / theme toggle (deferred).
- Animated route transitions (Astro View Transitions API — deferred).
- Blog section, RSS feed, newsletter signup.
- Backend or API routes — site is fully static.

---

## Capability: project-catalog

### Purpose
Expose all 9 freelance projects as Zod-validated bilingual content collections with sanitized screenshots, enabling a filterable grid on the home page and individual SEO-indexable detail routes.

### Functional Requirements

- REQ-PC-1: The system MUST define a `projects` content collection in `src/content/config.ts` with a Zod schema enforcing: `title` (string), `client` (string), `year` (string), `stack` (string[]), `one_liner` (string), `priority` (`P0 | P1`), `confidentiality` (`public | sanitized`), `screenshots` (string[]), `links` (object), and optional `placeholder` (boolean).
- REQ-PC-2: Each project MUST have exactly two markdown files: `src/content/projects/es/{slug}.md` and `src/content/projects/en/{slug}.md`. `astro check` MUST fail the build if either locale file is missing for any slug.
- REQ-PC-3: The 9 canonical slugs are: `centinela-app`, `centinela-web`, `bloomotion-tech`, `pos-la-brocha`, `teotech-suite`, `brocha-facturacion`, `crm-pedidos`, `tita`, `femn`. No slug named `fletes` or `vida-saludable` MUST exist.
- REQ-PC-4: The `femn` slug MUST use the canonical name "FEMN — Encuestas Socioeconómicas". No reference to "Vida Saludable" is permitted in any content file.
- REQ-PC-5: For confidential projects (`confidentiality: sanitized`), screenshots MUST contain no real CFDI numbers, no real client names, no real student or respondent data. The `placeholder: true` flag MAY be set when no screenshot is approved; the UI MUST render a brand-gradient fallback in that case.
- REQ-PC-6: Each project MUST have a generated static route at `/projects/{slug}` (ES) and `/en/projects/{slug}` (EN), returning HTTP 200.
- REQ-PC-7: Fletes México MUST NOT appear as a project entry — it surfaces only in `#hero` and the experience timeline.
- REQ-PC-8: The `bloomotion-tech` entry MUST include context that `bloom` (static landing v1) was merged into it.
- REQ-PC-9: Image files for screenshots MUST be served as AVIF with WebP fallback and PNG as last resort, processed at build time by `@astrojs/image`.

### Non-Functional Requirements

- `astro check` build step MUST validate all content collection schemas before generating routes.
- AVIF + WebP optimized screenshots MUST reduce source PNG size by ≥ 50% (enforceable via build output comparison).

### Scenarios

#### Scenario: All 9 project cards render on home page
- GIVEN the site is built and deployed
- WHEN the user visits `/#projects`
- THEN exactly 9 project cards MUST be visible, each showing title, client, stack chips, one-liner, and a screenshot or placeholder gradient
- AND no card for Fletes México MUST appear

#### Scenario: Per-project detail page returns 200
- GIVEN slugs are defined in content collections
- WHEN a crawler requests `/projects/centinela-app`
- THEN the server MUST return HTTP 200 with the full project detail HTML rendered
- AND the page title MUST include the project name

#### Scenario: Missing EN locale file fails build
- GIVEN a developer adds `src/content/projects/es/new-project.md` but omits the EN counterpart
- WHEN `astro check` or `astro build` runs
- THEN the build MUST fail with a schema/collection validation error referencing the missing EN file

#### Scenario: Placeholder renders when no screenshot approved
- GIVEN a project entry has `placeholder: true`
- WHEN the project card renders
- THEN a brand-colored gradient (using `--brand` token) with the project initials MUST display in place of a photo
- AND no broken image element MUST appear

#### Scenario: Sanitized screenshot contains no real PII
- GIVEN the `teotech-suite` project has screenshots committed
- WHEN a reviewer inspects each image file
- THEN no real CFDI folio, real RFC, real company name, or real person name MUST be visible
- AND fake placeholder data MUST be visually plausible (e.g., "CFDI-0000001", "Empresa Ejemplo S.A.")

#### Scenario: FEMN canonical name enforced
- GIVEN the `femn` content file exists
- WHEN any field in the frontmatter or body is inspected
- THEN the string "Vida Saludable" MUST NOT appear anywhere in the file
- AND the title MUST contain "FEMN"

### Out of Scope
- CMS (Decap/Sanity/Contentful) for editing project content — markdown files only.
- More than 9 project slugs in v1.
- GitHub API integration for repo stats.

---

## Capability: experience-timeline

### Purpose
Present the user's professional history as a bilingual vertical timeline, with Fletes México as a visually distinct featured card (current employer) and no project card for Fletes anywhere on the site.

### Functional Requirements

- REQ-ET-1: The system MUST define an `experience` content collection in `src/content/config.ts` with a Zod schema enforcing: `company` (string), `role` (string), `period` (string), `current` (boolean), `featured` (boolean), `highlights` (string[]).
- REQ-ET-2: Each experience entry MUST have both `src/content/experience/es/{slug}.md` and `src/content/experience/en/{slug}.md`.
- REQ-ET-3: The entry with `current: true` and `featured: true` MUST render as a visually distinct featured card in the `#experience` section, separate from standard timeline entries.
- REQ-ET-4: The Fletes México entry MUST be the only entry with `current: true`. Its card MUST NOT link to any internal project page.
- REQ-ET-5: The `#hero` section MUST display a "Currently at Fletes México" badge (or equivalent text element).
- REQ-ET-6: The experience section MUST NOT display a project card, screenshot, or internal route for Fletes México.

### Scenarios

#### Scenario: Fletes featured card renders in experience section
- GIVEN the site is built
- WHEN the user scrolls to `#experience`
- THEN a visually distinct card for Fletes México MUST appear before other timeline entries
- AND the card MUST show the role, period, and at least one highlight metric

#### Scenario: Hero badge shows current employer
- GIVEN the site is loaded
- WHEN the user views the `#hero` section
- THEN a badge or text element containing "Fletes México" MUST be visible
- AND it MUST NOT link to an internal `/projects/fletes` page

#### Scenario: No Fletes project card in projects grid
- GIVEN the user is on `/#projects`
- WHEN all 9 project cards are rendered
- THEN no card with "Fletes" in the title, client, or slug MUST appear
- AND the total card count MUST be exactly 9

#### Scenario: Missing EN experience file fails build
- GIVEN an experience entry exists only in `es/`
- WHEN `astro build` runs
- THEN the build MUST fail with a validation error referencing the missing EN file

### Out of Scope
- Fletes México project screenshots or code samples — confidentiality constraint.
- Animated route transitions to individual experience detail pages (no per-experience routes in v1).

---

## Capability: contact-form

### Purpose
Provide a static-friendly contact form backed by Formspree that works without a server, includes spam filtering via a honeypot field, and meets WCAG 2.1 AA accessibility requirements for form controls.

### Functional Requirements

- REQ-CF-1: The contact form MUST submit to a Formspree endpoint via standard HTML `action` attribute (no client-side SDK, no exposed API key).
- REQ-CF-2: The form MUST include fields: name (text), email (email), message (textarea), and a honeypot field (hidden from real users via CSS, MUST NOT be labeled or announced to screen readers).
- REQ-CF-3: Every visible form field MUST have an associated `<label>` element linked via `for`/`id`.
- REQ-CF-4: Client-side validation MUST mark invalid fields with `aria-invalid="true"` and display an inline error message adjacent to the field.
- REQ-CF-5: On successful submission, the form MUST display a visible success state (e.g., success message text) without a full page reload.
- REQ-CF-6: On Formspree error (network failure or rate limit), the form MUST display an error state with a message and MUST NOT silently discard the submission.
- REQ-CF-7: After submission (success or error), focus MUST be programmatically moved to the status message element so screen readers announce it.
- REQ-CF-8: EmailJS MUST NOT be present in the codebase after cutover.
- REQ-CF-9: The form MUST have both ES and EN labels, placeholders, and status messages, switching based on the active locale.

### Non-Functional Requirements

- Formspree free tier: 50 submissions/month. If exceeded, the form MUST gracefully degrade to a visible mailto link.
- The form island MUST add ≤ 5KB JS gzipped to the page.

### Scenarios

#### Scenario: Successful form submission
- GIVEN the user fills all required fields with valid data and the honeypot field is empty
- WHEN the user clicks the submit button
- THEN the form MUST POST to the Formspree endpoint
- AND a success message MUST appear in the DOM and receive programmatic focus
- AND the form fields MUST be cleared or disabled

#### Scenario: Bot submission via honeypot
- GIVEN an automated bot fills the honeypot field along with real fields
- WHEN the form is submitted
- THEN Formspree MUST reject the submission (honeypot field triggers server-side spam filter)
- AND no confirmation email is sent

#### Scenario: Client-side validation on empty required field
- GIVEN the user leaves the email field empty
- WHEN the user attempts to submit
- THEN the email field MUST receive `aria-invalid="true"`
- AND an inline error message MUST appear adjacent to the field
- AND focus MUST move to the first invalid field

#### Scenario: Network error on submission
- GIVEN the Formspree endpoint is unreachable (simulated via DevTools offline mode)
- WHEN the user submits the form
- THEN an error message MUST appear explaining the failure
- AND the error message MUST receive programmatic focus
- AND the user's entered data MUST remain in the form fields

#### Scenario: Form labels present in both locales
- GIVEN the site is in EN locale (`/en/`)
- WHEN the user views the contact section
- THEN all form labels MUST render in English
- AND when locale is ES (`/`), all labels MUST render in Spanish

### Out of Scope
- Backend email routing, auth, or database storage.
- reCAPTCHA (Formspree provides captcha-free spam filtering via honeypot).
- More than 50 submissions/month handling (out of free-tier scope).

---

## Capability: i18n-routing

### Purpose
Serve the site in two locales — ES (default, no prefix) and EN (`/en/` prefix) — with proper hreflang tags, a locale switcher in the header, and build-time validation that all content exists in both languages.

### Functional Requirements

- REQ-IR-1: The Astro `i18n` config MUST set `defaultLocale: 'es'`, `locales: ['es', 'en']`, and `routing: { prefixDefaultLocale: false }` so ES routes have no prefix and EN routes use `/en/`.
- REQ-IR-2: Every page MUST include `<link rel="alternate" hreflang="es">` and `<link rel="alternate" hreflang="en">` pointing to the canonical ES and EN URLs respectively, plus `<link rel="alternate" hreflang="x-default">` pointing to the ES URL.
- REQ-IR-3: The header locale switcher MUST render as a toggle between ES and EN. When on any ES route, clicking it MUST navigate to the equivalent EN route, and vice versa, without a full-page reload if avoidable.
- REQ-IR-4: Every section heading, CTA label, navigation anchor, and form label MUST have both ES and EN variants. `astro check` MUST fail if any i18n key is missing.
- REQ-IR-5: The sitemap generated by `@astrojs/sitemap` MUST include both ES and EN URLs for all pages.
- REQ-IR-6: The string "Vida Saludable" MUST NOT appear in any EN or ES content file, component, or template.

### Non-Functional Requirements

- OPEN: Astro 5's built-in `i18n` routing vs. a manual `getRelativeLocaleUrl` approach — the design phase MUST decide and document the pattern before implementation.

### Scenarios

#### Scenario: ES default route serves no prefix
- GIVEN the site is deployed
- WHEN a browser requests `/`
- THEN the server MUST return HTTP 200 with content in Spanish
- AND no redirect to `/es/` MUST occur

#### Scenario: EN route serves translated content
- GIVEN the site is deployed
- WHEN a browser requests `/en/`
- THEN the server MUST return HTTP 200 with content in English
- AND all section headings, CTAs, and form labels MUST be in English

#### Scenario: hreflang tags present on every page
- GIVEN the built site
- WHEN the HTML of `/projects/centinela-app` is inspected
- THEN `<link rel="alternate" hreflang="es">` pointing to `/projects/centinela-app` MUST be in `<head>`
- AND `<link rel="alternate" hreflang="en">` pointing to `/en/projects/centinela-app` MUST be in `<head>`

#### Scenario: Locale switcher navigates to equivalent page
- GIVEN the user is on `/projects/tita`
- WHEN the user clicks the locale switcher (showing "EN")
- THEN the browser MUST navigate to `/en/projects/tita`
- AND the page content MUST render in English

#### Scenario: Missing i18n content fails build
- GIVEN a developer adds an ES project file but omits the EN counterpart
- WHEN `astro build` runs
- THEN the build MUST fail with an error identifying the missing EN content

### Out of Scope
- More than 2 locales (PT, FR deferred).
- Runtime locale detection based on browser `Accept-Language` header (static routing only).

---

## Capability: theme-system

### Purpose
Establish the dark-only design token system (CSS custom properties) that all components consume, preserving the JNVR brand color `#6BA3C3` while using the GitHub-dark surface palette and Inter + Space Grotesk typography.

### Functional Requirements

- REQ-TS-1: All color, typography, and spacing values MUST be defined as CSS custom properties in `src/styles/tokens.css` and MUST be the sole source of truth for visual values.
- REQ-TS-2: The following color tokens MUST be defined exactly: `--bg: #0D1117`, `--surface: #161B22`, `--surface-elevated: #1C2333`, `--border: #30363D`, `--text: #F0F6FF`, `--text-muted: #8B949E`, `--brand: #6BA3C3`, `--brand-strong: #4A8FB0`, `--accent: #8BB8D0`, `--success: #3FB950`, `--danger: #F85149`.
- REQ-TS-3: The site MUST NOT include a theme toggle, dark/light mode switch, or `prefers-color-scheme` media query that changes the color scheme. Dark is the only theme in v1.
- REQ-TS-4: Heading typeface MUST be Space Grotesk (weights 500, 600, 700). Body and UI typeface MUST be Inter (weights 400, 500). Monospace (stack badges, code chips) MUST be JetBrains Mono (weight 500). All fonts MUST be self-hosted via `@fontsource-variable/*` — no Google Fonts CDN calls at runtime.
- REQ-TS-5: The type scale MUST be: H1 hero 48px (mobile) / 72px (desktop), H2 section 32px / 48px, H3 card 20px / 24px, body 16px / 18px, caption 13px / 14px.
- REQ-TS-6: Card hover MUST lift 2px (transform: translateY(-2px)) in 150ms. Focus state MUST show a `--brand` color ring/glow. Both MUST be suppressed when `prefers-reduced-motion: reduce` is active.
- REQ-TS-7: No hardcoded hex values MUST appear in component stylesheets — all values MUST reference CSS custom property tokens.

### Scenarios

#### Scenario: Dark theme renders on all target browsers
- GIVEN the site is deployed
- WHEN viewed in Chrome, Firefox, and Safari (latest 2 versions) on macOS, Windows, iOS, and Android
- THEN the background MUST appear as `#0D1117` and text as `#F0F6FF`
- AND no light-mode fallback background MUST render

#### Scenario: Token values match spec exactly
- GIVEN `src/styles/tokens.css` exists
- WHEN the file is parsed
- THEN the value of `--brand` MUST be `#6BA3C3` and `--bg` MUST be `#0D1117`
- AND all 11 required color tokens MUST be present

#### Scenario: No Google Fonts CDN request at runtime
- GIVEN the site is loaded with network monitoring active (DevTools Network tab)
- WHEN the page fully loads
- THEN no request to `fonts.googleapis.com` or `fonts.gstatic.com` MUST appear in the network log
- AND Space Grotesk, Inter, and JetBrains Mono MUST render correctly from self-hosted assets

#### Scenario: No hardcoded hex in component
- GIVEN any `.astro` or `.css` file in `src/components/`
- WHEN searched for hex color literals (pattern `#[0-9A-Fa-f]{3,6}`)
- THEN no match MUST exist (all values use `var(--token-name)`)

### Out of Scope
- Light theme (deferred to future change).
- Theme toggle UI or state management.
- CSS-in-JS or runtime theming libraries.

---

## Capability: service-worker-killer

### Purpose
Evict the Angular service worker cached in returning visitors' browsers by shipping a no-op service worker at the same path (`/ngsw-worker.js`) that immediately unregisters itself, claims all clients, and clears all caches.

### Functional Requirements

- REQ-SW-1: The file `public/ngsw-worker.js` MUST exist in the built output and be served at exactly the path `/ngsw-worker.js`.
- REQ-SW-2: The service worker script MUST call `self.addEventListener('install', ...)` with `self.skipWaiting()` to activate immediately without waiting for existing clients to close.
- REQ-SW-3: The service worker script MUST call `self.addEventListener('activate', ...)` which MUST: (a) call `clients.claim()`, (b) iterate all cache storage keys and delete every cache, (c) call `self.registration.unregister()`.
- REQ-SW-4: The service worker MUST NOT cache any network requests. Its only purpose is self-termination.
- REQ-SW-5: `ngsw-config.json` MUST NOT exist in the built output — the Angular SW config is replaced entirely.
- REQ-SW-6: After the no-op SW activates on a returning visitor's device, a subsequent page reload MUST serve the new Astro site from the network (no stale Angular shell).

### Non-Functional Requirements

- The no-op SW file MUST be ≤ 2KB uncompressed.

### Scenarios

#### Scenario: No-op SW activates on returning visitor
- GIVEN a browser has the old Angular `ngsw-worker.js` registered
- WHEN the visitor loads the new Astro site
- THEN the browser MUST download the new `ngsw-worker.js`
- AND the service worker MUST install and activate, calling `skipWaiting()` and `clients.claim()`
- AND all Angular caches MUST be deleted from Cache Storage

#### Scenario: SW unregisters itself after activation
- GIVEN the no-op SW has activated and cleared caches
- WHEN the DevTools Application > Service Workers panel is checked
- THEN no active service worker MUST be registered for the origin
- AND the `self.registration.unregister()` call MUST have completed

#### Scenario: Fresh visitor receives no SW registration
- GIVEN a browser with no previously registered service worker for the domain
- WHEN the visitor loads the new Astro site
- THEN no new service worker MUST be registered (the no-op SW unregisters before it can cache anything)

#### Scenario: ngsw-config.json absent from build output
- GIVEN the Astro build completes
- WHEN the `dist/` directory is inspected
- THEN no `ngsw-config.json` file MUST be present
- AND `ngsw-worker.js` MUST be present at the root of `dist/`

### Out of Scope
- Replacing with a functional PWA service worker (deferred — no offline requirement for v1).
- iOS Safari SW behavior differences (SW support on iOS is best-effort; no-op SW is a best-effort fix for returning iOS visitors).

---

## Capability: firebase-deploy

### Purpose
Host the static Astro build on Firebase Hosting (existing project `jnvr-portafolio`) with preview channels for PR-style validation, serving from the default URL `https://jnvr-portafolio.web.app`, and retirement of the GitHub Pages deployment.

### Functional Requirements

- REQ-FH-1: The system MUST deploy via `firebase deploy --only hosting`. The Astro config MUST use `output: 'static'` with no platform adapter (pure static output, no `@astrojs/vercel`). `site` in `astro.config.mjs` MUST be set to `https://jnvr-portafolio.web.app`.
- REQ-FH-2: `firebase.json` `hosting.public` MUST be `dist` (Astro's static output directory). The current value `www` (Angular output) MUST be updated before any Firebase deploy of the new site.
- REQ-FH-3: `firebase.json` MUST set `cleanUrls: true` so routes like `/projects/teotech-pos` resolve without a trailing `.html`.
- REQ-FH-4: The system MUST NOT use a catch-all SPA rewrite (`"source": "**", "destination": "/index.html"`). This breaks Astro multi-page routing. A 404 fallback rewrite to `/404.html` is allowed and MUST be the only rewrite rule.
- REQ-FH-5: The system SHOULD use Firebase preview channels for PR-style validation before promoting to production: `firebase hosting:channel:deploy <branch-slug>`. Preview URLs follow the pattern `https://jnvr-portafolio--<branch>-<hash>.web.app`.
- REQ-FH-6: `firebase.json` MUST set immutable cache headers (`public, max-age=31536000, immutable`) for `/_astro/**` (Astro's hashed asset directory). A 24-hour cache (`public, max-age=86400`) MUST be set for `**/*.@(js|css|svg|png|jpg|jpeg|webp|avif|woff2)`.
- REQ-FH-7: The tag `pre-redesign-v1` MUST be created on the `main` branch BEFORE `redesign-astro` is merged, serving as the canonical rollback target.
- REQ-FH-8: The GitHub Pages gh-pages branch MUST remain deployable and warm during the cutover window (minimum 48 hours after production deploy).
- REQ-FH-9: After successful cutover and 48h validation, the gh-pages deployment workflow MUST be disabled (not deleted — kept for emergency rollback).

### Non-Functional Requirements

- CI deploy requires only `FIREBASE_TOKEN` as a secret env var (obtained via `firebase login:ci`). No Vercel-specific env vars.
- OPEN: Firebase token for CI must be generated and stored as a GitHub Actions secret before automated deploys.

### Scenarios

#### Scenario: Preview channel deploy created for validation
- GIVEN a branch `feat/redesign-shell` is ready for review
- WHEN the developer runs `firebase hosting:channel:deploy feat-redesign-shell`
- THEN a preview URL MUST be generated in the format `https://jnvr-portafolio--feat-redesign-shell-<hash>.web.app`
- AND the preview URL MUST serve the correct Astro build from `dist/`

#### Scenario: Rollback via Firebase console (post-cutover)
- GIVEN the production site has been deployed to Firebase Hosting
- WHEN a critical issue is found
- THEN opening Firebase console → Hosting → Release history → "Rollback" on the previous release MUST restore the prior version immediately
- AND no DNS change is required

#### Scenario: pre-redesign-v1 tag enables cold rollback
- GIVEN the `pre-redesign-v1` git tag exists on `main`
- WHEN gh-pages has been decommissioned and rollback is needed
- THEN checking out the tag and running `npm run deploy` MUST publish the Angular site to gh-pages within 10 minutes

#### Scenario: Build fails safely on schema errors
- GIVEN a content collection file has an invalid frontmatter field
- WHEN `astro check && astro build` runs in the deploy pipeline
- THEN the build MUST fail with a non-zero exit code
- AND the previous production deploy on Firebase MUST remain live (Firebase Hosting keeps the last live release)

#### Scenario: Deep-link to project page resolves correctly
- GIVEN the site is deployed to Firebase Hosting with `cleanUrls: true` and no SPA rewrite
- WHEN a user navigates directly to `https://jnvr-portafolio.web.app/projects/centinela-app`
- THEN the server MUST return HTTP 200 with the project detail page HTML
- AND NOT serve the home page `index.html` (which would happen with the old SPA rewrite)

### Out of Scope
- Firebase Analytics, Crashlytics, or any Firebase service other than Hosting.
- Server-side rendering or Cloud Functions — site is fully static.
- Vercel or Cloudflare Pages as deploy targets.

---

## Capability: image-pipeline

### Purpose
Optimize all project screenshots at build time to AVIF + WebP + PNG fallback using `@astrojs/image` (sharp), reducing transfer size by ≥ 50% relative to source PNGs.

### Functional Requirements

- REQ-IP-1: The Astro config MUST include the `@astrojs/image` integration with `sharp` as the image service.
- REQ-IP-2: All project screenshot images referenced in content collection frontmatter MUST be processed through the Astro `<Image>` component or equivalent, generating AVIF as primary format and WebP as fallback, with the original PNG served as last resort via `<picture>` element.
- REQ-IP-3: Screenshot images MUST include explicit `width`, `height`, and `alt` attributes to prevent layout shift (CLS = 0 for image elements).
- REQ-IP-4: The hero section's LCP image (if any) MUST be preloaded via `<link rel="preload" as="image">` in `<head>`.
- REQ-IP-5: Screenshots below the fold MUST use `loading="lazy"` to defer loading.
- REQ-IP-6: When a project has `placeholder: true`, NO image request MUST be made — a CSS gradient MUST render instead.

### Non-Functional Requirements

- AVIF + WebP optimized file size MUST be ≤ 50% of the source PNG size (enforced via build output comparison before commit).

### Scenarios

#### Scenario: Screenshot served as AVIF to capable browser
- GIVEN a browser that supports AVIF (Chrome 85+, Firefox 93+)
- WHEN a project card image loads
- THEN the browser MUST receive an AVIF file from the server
- AND the `<picture>` element MUST include `<source type="image/avif">` as the first source

#### Scenario: WebP fallback for Safari < 16
- GIVEN a browser that supports WebP but not AVIF
- WHEN a project card image loads
- THEN the browser MUST receive a WebP file
- AND fall through to PNG only if WebP is also unsupported

#### Scenario: Placeholder gradient for unapproved screenshot
- GIVEN `pos-la-brocha` has `placeholder: true` in frontmatter
- WHEN the project card renders
- THEN no `<img>` element MUST request a network image
- AND a CSS gradient using `--brand` token MUST fill the image slot with the project initials overlaid

#### Scenario: No layout shift from images
- GIVEN all screenshot `<Image>` components have explicit width/height
- WHEN Lighthouse CLS audit runs on the home route
- THEN CLS MUST be 0.0 (no layout shift from images)

### Out of Scope
- Video screenshots or animated GIFs.
- Third-party image CDN (Cloudinary, Imgix) — all optimization is build-time.
- Runtime image resizing via Astro's server endpoints (static output only).

---

## Acceptance Criteria Coverage

| Proposal AC | Capability | Scenario(s) |
|---|---|---|
| AC-1: Lighthouse Perf ≥ 95 (mobile, slow-4G) | portfolio-site, image-pipeline | "JS payload budget enforced at build"; "No layout shift from images" |
| AC-2: Lighthouse A11y, Best Practices, SEO ≥ 95 | portfolio-site, contact-form, i18n-routing | "Home route renders without JavaScript"; "Form labels present in both locales"; "hreflang tags present on every page" |
| AC-3: Initial JS ≤ 50KB gzip | portfolio-site | "JS payload budget enforced at build" |
| AC-4: Initial CSS ≤ 25KB gzip | portfolio-site | "JS payload budget enforced at build" |
| AC-5: All 9 project cards render with title, client, stack, one-liner, screenshot/placeholder | project-catalog | "All 9 project cards render on home page" |
| AC-6: Each of 9 slugs has `/projects/[slug]` returning 200 in ES and EN | project-catalog, i18n-routing | "Per-project detail page returns 200"; "EN route serves translated content" |
| AC-7: Hero shows "Currently at Fletes México" badge + JNVR animated SVG logo | experience-timeline, portfolio-site | "Hero badge shows current employer"; "Home route renders without JavaScript" |
| AC-8: No project card or detail page for Fletes | project-catalog, experience-timeline | "No Fletes project card in projects grid"; "All 9 project cards render on home page" |
| AC-9: Contact form submits to Formspree; visible success/error; honeypot rejects bots | contact-form | "Successful form submission"; "Bot submission via honeypot"; "Network error on submission" |
| AC-10: Old Angular SW removed for returning visitors (verified via DevTools) | service-worker-killer | "No-op SW activates on returning visitor"; "SW unregisters itself after activation" |
| AC-11: Site fully bilingual; `astro check` passes | i18n-routing, project-catalog, experience-timeline | "Missing i18n content fails build"; "Missing EN locale file fails build"; "Missing EN experience file fails build" |
| AC-12: `prefers-reduced-motion: reduce` honored | portfolio-site, theme-system | "Reduced motion honored"; "Token values match spec exactly" |
| AC-13: Dark theme renders on Chrome, Firefox, Safari (macOS, Windows, iOS, Android) | theme-system | "Dark theme renders on all target browsers" |
| AC-14: Firebase Hosting preview channel URL exists before merging into `main` | firebase-deploy | "Preview channel deploy created for validation" |
| AC-15: No reference to "Vida Saludable" anywhere | project-catalog, i18n-routing | "FEMN canonical name enforced"; "Vida Saludable" checked in REQ-IR-6 |
| AC-16: No real CFDI/client/student/respondent data in screenshots (manual audit) | project-catalog | "Sanitized screenshot contains no real PII" |
