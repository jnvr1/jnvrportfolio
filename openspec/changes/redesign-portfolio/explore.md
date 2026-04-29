# Exploration: redesign-portfolio

## Executive Summary

The current portfolio is a fully functional Ionic 8 + Angular 19 SPA with a well-crafted design system (Poppins, blue palette, geometric motifs), but it carries ~300KB+ of Ionic framework overhead that is unnecessary for a static personal site. The project catalog reveals 9 concrete freelance/contract projects across Flutter, PHP, Python/FastAPI, React, and Astro — enough to build a compelling, honest portfolio with real screenshots and descriptions. The recommended path is to migrate to **Astro (static-first, zero-JS islands by default)** while preserving the existing JNVR brand identity and design tokens, then inject the real project catalog as content. This migration cuts bundle size by ~85%, enables SSG for SEO, and takes roughly 2–3 weeks of focused work.

---

## Current Portfolio Audit

### Pages and Purpose

| Page | Route | What It Does |
|------|-------|--------------|
| Home (`home.page`) | `/home` | One-page shell: hero (animated SVG logo, subtitle), then embeds `<app-projects>`, `<app-experience>`, `<app-contact>` as inline sections |
| Projects | Used as component embedded in Home | Master/detail split-panel; list of 4 hardcoded projects on left, expandable detail on right; query param `?project=id` drives selection |
| Experience | Used as component embedded in Home | 6 `<app-geometric-card>` entries; Fletes, Teotech, Museo La Rodadora (×2), IA-Center, Bloomotion — all hardcoded in template |
| Contact | Used as component embedded in Home | Glass-card with email/LinkedIn/GitHub CTAs + EmailJS form + animated SVG background |
| Not Found | `**` | Catch-all 404 |

**Key observation**: The routing has dedicated routes (`/projects`, `/experience`, `/contact`) registered via lazy `loadComponent()`, but the header navigation links to `routerLink="/home" fragment="projects"` — those separate routes are orphaned and unreachable via UI. This is the broken navigation referenced in prior notes.

### Visual Identity

- **Font**: Poppins (bold/geometric) via `font-family` in `body`
- **Primary palette**: `#6BA3C3` (blue), `#4A8FB0` (secondary), `#8BB8D0` (accent)
- **Surfaces**: Near-white light mode (`#f6f9fc` bg), near-black dark mode (`#0f141a` bg)
- **Design motifs**: Geometric corner clips (`clip-path`), glassmorphism (`.glass-effect`), connection lines/nodes (`.conn-line`, `.conn-node`), 8px spacing system
- **Animation**: `fadeInUp`, `300ms cubic-bezier(0.4,0,0.2,1)` transitions, `prefers-reduced-motion` support
- **Dark mode**: Both `@media (prefers-color-scheme: dark)` and `.dark` class on `<body>`

### Current Project Data (hardcoded in `projects.page.ts`)

Only **4 projects** are shown:
1. Vida Saludable — Ionic/Angular/Firebase health tracker
2. Centinela Accesos — Flutter/Stripe access-control SaaS
3. Fletes México — FastAPI/Ionic/BI logistics suite (current employer)
4. Teotech — PHP/JS/SQL CRM (umbrella entry for all Teotech work)

Missing from catalog: Bloomotion landing page (centinela_webpage), POS system (Teotech-pos-system), CRM Pedidos, Tita (school management), FEMN (NGO field surveys) — these are the richest freelance stories.

### Bundle Size Issues (Ionic on a portfolio)

Ionic 8 bundles include:
- Web Components polyfill runtime
- Full Ionic component library (tree-shaken but still ~120–180KB gzip for basic components)
- Angular platform + router + animations: ~80–100KB gzip
- Capacitor stubs (unused on web): marginal but present

Estimated total gzip: **~250–350KB** for initial JS. A comparable Astro site serves **~15–40KB** for equivalent UI.

### UX Issues

1. **Orphaned routes**: `/projects`, `/experience`, `/contact` exist in router but are not linked from the nav — all nav links go to `/home#fragment`. Visiting `/projects` directly renders the component as a full page without the header wrapper, creating a broken layout.
2. **4 projects only**: The showcase panel expects 9+ but only 4 are defined.
3. **No "About" section**: No personal bio, just "Ingeniero de Software — Microservicios FastAPI • Ionic • Power BI" as subtitle.
4. **No real screenshots**: Most `assets/proyectos/` images are placeholder filenames (centinela.png, fletes-mexico.png) — actual content TBD.
5. **Service Worker configured** (`@angular/service-worker: 19.2.1`) — a migration would need to handle or drop this.

---

## External Project Catalog

### Angel Client Projects

#### 1. access_control (`D:/Angel/access_control/`)
- **Project name**: Centinela — Sistema de Control de Accesos
- **Stack**: Flutter 3.x + Firebase (Auth, Firestore, Realtime DB, Messaging, Storage, Functions, App Check)
- **Type**: Mobile app (Android/iOS) — residential access control SaaS
- **Description**: App para fraccionamientos con control de visitantes, chat entre residentes, notificaciones push, y planes de suscripción (Stripe/MercadoPago)
- **Notable features**:
  - Visitor code generation and QR sharing
  - Real-time chat with moderation
  - Push notifications via FCM (visitor entry alerts, chat messages)
- **Status**: Active — last commit includes feature work (`feat: add unit tests`, `feat: Implement visitor code generation`)
- **Visual assets**: `assets/centinela.png`, `assets/icon/icon.png`, `assets/logo_home.png`
- **Year**: 2022–2024 (inferred from Firebase SDK versions `^4.x`)
- **Architecture**: Clean — `presentation/`, `domain/`, `application/`, `data/`, `screens/`, `services/`, `widgets/`

#### 2. bloom (`D:/Angel/bloom/`)
- **Project name**: Bloomotion — Marketing Landing Page
- **Stack**: Static HTML — single `index.html` + `img/` folder
- **Type**: Landing page (static)
- **Description**: Promotional landing page for the Bloomotion logistics platform
- **Notable features**: Simple brochure-style site, no framework
- **Status**: Archived (no git, minimal content)
- **Visual assets**: `img/bloomotion_logo.png`, `img/bloomotion_teams.png`
- **Year**: ~2022–2023 (inferred from Bloomotion work period in experience)

#### 3. bloomotion_tech (`D:/Angel/bloomotion_tech/`)
- **Project name**: Bloomotion Tech — Corporate Website (Flutter Web)
- **Stack**: Flutter 3.x (Web target) + Google Fonts
- **Type**: Corporate/marketing website built with Flutter Web
- **Description**: Rich marketing site with animated sections: hero, capabilities, metrics, integrations, projects, testimonials, FAQ, contact
- **Notable features**:
  - Animated counters, reveal-on-scroll, breathing animations
  - Sections: about, benefits, capabilities, solutions, how-it-works, results, integrations
  - `assets/logo.png`, `assets/monitoring_bg.png`
- **Status**: Active (last commit `feat: hosting`)
- **Visual assets**: `assets/logo.png`, `assets/monitoring_bg.png`
- **Year**: 2023–2024

#### 4. centinela_webpage (`D:/Angel/centinela_webpage/`)
- **Project name**: Centinela — Marketing / Landing Page Website
- **Stack**: Astro 5.0 + Tailwind CSS (AstroWind template) — note: this is the AstroWind open-source template used as base
- **Type**: Marketing/landing page (Astro SSG)
- **Description**: Public-facing landing page for the Centinela access-control SaaS product, deployed to Netlify/Vercel (both configs present)
- **Notable features**:
  - Production-ready Astro SSG with sitemap, OG tags, RSS
  - Astro pages: index, about, contact, services, pricing, landing/
  - DecapCMS configured for content editing
- **Status**: Active (last commit `feat: add info on index`)
- **Visual assets**: `public/centinela.png`, `public/icon/`, `public/login.png`, `public/logo_home.png`
- **Year**: 2024–2025

---

### Teotech Client Projects

#### 5. Teotech-pos-system (`D:/Hilario/Teotech-pos-system/`)
- **Project name**: POS Multi-Negocio — Sistema La Brocha
- **Stack**: React 19 + Vite + TypeScript + TailwindCSS + HeroUI (frontend) / FastAPI + PostgreSQL + Docker (backend) / Capacitor (mobile wrapper)
- **Type**: Point of Sale + CRM system (web + mobile)
- **Description**: Scalable multi-business POS/CRM with Docker-compose orchestration, FastAPI backend, React frontend, targeting hardware store (La Brocha / ferretería)
- **Notable features**:
  - Multi-tenant architecture (multi-negocio)
  - React 19 + zustand + react-hook-form + zod
  - Capacitor for Android/iOS + Electron wrapper
  - Metrics dashboard (DASHBOARD_METRICAS.md present)
- **Status**: Active — recent commits include Docker config fixes and frontend feature work (2025-11)
- **Visual assets**: None detected in public dir
- **Year**: 2025

#### 6. Brocha (`D:/XAMPP/htdocs/Brocha/`)
- **Project name**: Teotech CRM — Facturación y Archivos (Brocha/Facturación)
- **Stack**: PHP 8.0 + MySQL + Composer (PHPMailer, QR-code, PDF parser)
- **Type**: CRM + invoicing system (CFDI 4.0)
- **Description**: Herramientas de facturación y CRM para Teotech — billing, quotations, file repository with permissions and quotas
- **Notable features**:
  - CFDI 4.0 invoicing (normal, global, payment complement, cancellation)
  - File repository per user with quotas and expiration alerts
  - PHPMailer + WhatsApp integration
- **Status**: Active (last commit `fix: set default values for PostgreSQL environment variables`)
- **Visual assets**: None detected
- **Year**: 2023–2025

#### 7. CRM_Pedidos (`D:/XAMPP/htdocs/CRM_Pedidos/`)
- **Project name**: CRM Instituto Villa Educare — Pedidos
- **Stack**: PHP 8+ + MySQL + Vanilla JS + Font Awesome
- **Type**: School CRM — order/invoice management for educational institution
- **Description**: Sistema de gestión de pedidos y facturas para instituto educativo, con roles de usuario y dashboard
- **Notable features**:
  - Session-based PHP auth
  - Order management with quantity adjustments and ticket processing
  - Dashboard with user-level views
- **Status**: Active (last commit `feat: Update styles and functionality across various components`)
- **Visual assets**: `assets/img/Log_img.jpg` (login background)
- **Year**: 2023–2025

#### 8. Teotech (`D:/XAMPP/htdocs/Teotech/`)
- **Project name**: Teotech CRM — Suite Completa (Facturación CFDI 4.0 + Repositorio)
- **Stack**: PHP 8.0 + MySQL + Composer (PHPMailer, QR, PDF parser, dompdf) + Vanilla JS/HTML + Service Worker (PWA)
- **Type**: Full CRM + invoicing suite (CFDI 4.0), production-grade
- **Description**: Suite de CRM, facturación CFDI 4.0, cotizaciones, y repositorio de archivos con control de permisos, cuotas y alertas de vigencia. Pensado para XAMPP/Apache con MySQL.
- **Notable features**:
  - Modular PHP API architecture (`php/`, `api/` dirs)
  - Service worker (manifest.webmanifest) — PWA capability
  - Integration with SAT timbrado, WordPress optional DB
  - Comprehensive DB migrations + backup scripts
- **Status**: Active (last commit `feat: Implementar filtros en el gestor de facturas`)
- **Visual assets**: None detected in root
- **Year**: 2022–2025

---

### FEMN Client Projects

#### 9. tita (`D:/Amorcito/tita/`)
- **Project name**: Tita — Sistema de Gestión Escolar
- **Stack**: Flutter 3.x + Firebase (Auth, Firestore, Storage, Messaging) + Riverpod + go_router
- **Type**: Mobile app — school management system
- **Description**: App para gestión escolar con roles (padre, profesor, auth), seguimiento de objetivos, práctica diaria, materiales, comunicación y horario semanal
- **Notable features**:
  - Multi-role (parent, teacher, admin)
  - Daily practice tracking, materials, objectives, plans
  - Firebase push notifications
- **Status**: Active — recent commits include dashboard widgets and PDF generation
- **Year**: 2024–2025

#### 10. FEMN / vida_saludable (`D:/Amorcito/FEMN/`)
- **Project name**: FEMN — Encuestas Socioeconómicas (Fundación para la Educación de Mujeres y Niños)
- **Stack**: Flutter 3.x (sdk ^3.6.1) + Firebase (Firestore, Auth, Storage, Messaging) + Riverpod + go_router + PDF generation
- **Type**: Mobile/Web app — NGO field survey tool
- **Description**: App para evaluadores de campo que registran encuestas socioeconómicas de adultos y fichas de inscripción de infantes, con soporte offline y sincronización Firebase. Genera PDFs de fichas. Targets Android, iOS, Web.
- **Notable features**:
  - Offline-first with Firebase sync
  - PDF generation (inscripción ficha, estudio socioeconómico)
  - Multi-language support (flutter_localizations)
- **Status**: Active (recent commits include PDF generation refactors and plugin updates)
- **Visual assets**: `assets/femn.png`, `assets/nogalera.png`, `assets/fechac.png`, `assets/login.png`
- **Year**: 2024–2025

---

### Project Summary Table

| # | Project | Client | Stack | Type | Status | Year |
|---|---------|--------|-------|------|--------|------|
| 1 | Centinela Access Control | Angel | Flutter + Firebase | Mobile SaaS | Active | 2022–2024 |
| 2 | Bloomotion Landing | Angel | Static HTML | Landing page | Archived | 2022 |
| 3 | Bloomotion Tech Website | Angel | Flutter Web | Corporate site | Active | 2023–2024 |
| 4 | Centinela Webpage | Angel | Astro + Tailwind | Marketing SSG | Active | 2024–2025 |
| 5 | POS La Brocha | Hilario/Teotech | React + FastAPI + Docker | POS + CRM | Active | 2025 |
| 6 | Teotech Facturación (Brocha) | Teotech | PHP + MySQL | CRM + CFDI | Active | 2023–2025 |
| 7 | CRM Pedidos (Villa Educare) | Teotech | PHP + MySQL | School CRM | Active | 2023–2025 |
| 8 | Teotech CRM Suite | Teotech | PHP + MySQL PWA | CRM + CFDI suite | Active | 2022–2025 |
| 9 | Tita School Management | FEMN | Flutter + Firebase | Mobile school app | Active | 2024–2025 |
| 10 | FEMN Field Surveys | FEMN | Flutter + Firebase | NGO survey tool | Active | 2024–2025 |

**Note on FEMN (vida_saludable)**: The package name `vida_saludable` but the CLAUDE.md and assets clearly indicate this is the FEMN NGO app — not a personal health app. The current portfolio shows "Vida Saludable" as a health tracker but that appears to be a misidentification or earlier iteration. The actual FEMN project should be presented as the NGO field survey tool.

---

## Stack Decision Analysis

| Stack | Pros | Cons | Bundle (gzip) | Verdict for portfolio |
|-------|------|------|---------------|-----------------------|
| **Ionic 8 + Angular 19 (current)** | Already built; existing design system; dark/light mode works; Angular expertise | Mobile-app overhead for a website; ~300KB initial JS; Capacitor deps unused on web; poor SEO (SPA, no SSR by default); slow LCP on cold load | ~300–350KB | NOT recommended for new build |
| **Angular 19 puro (no Ionic)** | Keeps Angular knowledge; drops Ionic overhead; can use Angular SSR (v17+) | Still ~150–200KB for Angular runtime; SSR config adds complexity; overkill for mostly static content | ~150–200KB | Acceptable fallback if Astro rejected |
| **Astro + Angular islands** | Static shell with Angular components only where needed; best of both worlds | More complex build pipeline; Angular island hydration is newer territory; learning curve for Astro | ~30–60KB shell + islands on demand | Good hybrid option — moderate complexity |
| **Astro puro (vanilla + light JS)** | Best performance (<20KB); SSG first-class; excellent SEO; Lighthouse 100; simple content model; MDX for project pages; CSS custom properties map directly from existing SCSS tokens | Lose Angular component knowledge for this project; some interactivity needs custom JS | ~15–25KB | STRONGLY RECOMMENDED |
| **Next.js / Nuxt** | SSR + SSG hybrid; large ecosystem | React/Vue instead of Angular; overkill for a portfolio; adds server infra if SSR used | ~80–150KB | Not recommended — adds complexity without benefit over Astro |

### Recommendation: Astro (static-first, vanilla CSS + light Alpine.js or Astro's built-in view transitions)

**Why Astro wins for this specific portfolio:**

1. **Content model fits perfectly** — 10 projects with metadata (title, stack, description, screenshots, links) map exactly to Astro content collections (`.md` or `.yaml` front matter). Adding/editing a project is a content change, not a code change.
2. **SEO is primary** — recruiters search for names and technologies. Astro renders full HTML at build time. Angular SPA requires JavaScript to render any content, which hurts both crawlability and LCP.
3. **Existing design tokens transfer directly** — `variables.scss` is pure CSS custom properties. They paste into Astro's global CSS with zero changes.
4. **User already knows Astro conceptually** — centinela_webpage (`D:/Angel/centinela_webpage/`) already uses Astro 5 + Tailwind. The team has real Astro experience.
5. **gh-pages deployment** — Astro's `output: 'static'` with `@astrojs/adapter-static` generates a `dist/` folder that deploys identically to the current `www/` → `gh-pages` flow.
6. **Service worker** — Astro has `@astrojs/service-worker` or can use `vite-plugin-pwa`. This is solvable.

**What Astro costs:**
- Rewrite of Angular components as Astro components (mostly HTML + CSS, ~2–3 days)
- EmailJS contact form needs a small `<script>` or a minimal Alpine.js island (~2 hours)
- Animations (scroll reveal, hero entry) need vanilla JS or Alpine (~1 day)

**Estimated migration effort**: 8–12 focused hours for an experienced developer.

---

## Design Direction Proposals

### Direction A: "Minimalist Editorial" (Recommended for recruiters)

**Mood**: Clean, confident, typographic-first — inspired by design agency portfolios (e.g., linear.app, rauno.me)

**Layout**:
- Single-page scroll with full-viewport sections
- Hero: large name + role text, no decorative clutter — just the JNVR SVG logo + 2-line description + scroll cue
- Projects: horizontal scroll card row OR masonry grid (3 cols desktop, 1 col mobile) — each card: project image, title, stack chips, 1-line description
- Project detail: slide-out panel or modal on click (no route change)
- Experience: vertical timeline with dates and company logos
- Contact: minimal card with email + LinkedIn + GitHub icons

**Color palette**:
- `#0D1117` dark bg (GitHub-inspired dark, professional)
- `#6BA3C3` brand blue (kept from existing)
- `#F0F6FF` text on dark
- `#1C2333` card surfaces
- `#30363D` borders

Dark-only (no light/dark toggle — reduces complexity, and dark reads better for devs)

**Typography pair**:
- Heading: `Inter` or `Space Grotesk` (geometric, technical)
- Body: `Inter` (system-like, readable)

**Hero pattern (3-second read)**:
```
[JNVR animated SVG logo]
Jonathan Viramontes
Software Engineer · FastAPI · Flutter · Angular
[Fletes México — Currently] [↓ See my work]
```

**Project card pattern**: 3-column grid, each card: full-bleed image top, title + stack chips overlay at bottom. Click expands inline detail row.

---

### Direction B: "Brutalist Tech" (For standing out)

**Mood**: Bold, asymmetric, unpolished-on-purpose — high contrast, visible structure

**Layout**:
- Multi-page (Astro file-based routing)
- Hero: full-viewport with giant monospace "JNVR" text, colored accent lines crossing the screen, role in small caps below
- Projects: numbered list (`01`, `02`, `03`...) with large typographic treatment — no images on list, click opens full project page
- Experience: table-style with horizontal rules and bold years in margin

**Color palette**:
- `#F5F5F0` off-white bg
- `#0D0D0D` near-black text
- `#6BA3C3` blue accent (brand)
- `#FF4500` alert/highlight (optional — use sparingly)
- `#E8E8E0` secondary surface

Light mode only (brutalist reads better on white)

**Typography pair**:
- Heading: `Space Mono` or `JetBrains Mono` (monospace — dev identity)
- Body: `Inter` or `Manrope`

**Hero pattern**: Giant `JNVR` in Space Mono, underlined with brand blue rule, role text in small all-caps

**Project card pattern**: Numbered list items — `01 · Centinela · Flutter · Firebase · 2024` — click expands to full case study page

---

### Direction C: "Warm Developer" (Approachable and personal)

**Mood**: Friendly, colorful accents, shows personality — not just skills

**Layout**:
- One-page scroll (same as current)
- Hero: photo or illustration-style abstract avatar + warm greeting text + animated text cycling through roles
- Projects: bento-grid layout (mixed card sizes — 1 featured large + smaller grid)
- Experience: card-based with subtle gradients and company color accents
- Contact: friendly form with emoji-accented section headers

**Color palette**:
- `#FAFAF8` warm white bg
- `#6BA3C3` blue (brand)
- `#F4A261` warm orange accent
- `#2D3A3A` text (slightly warm dark)
- `#E8F4F8` blue tint surface

Light + dark (toggle preserved)

**Typography pair**:
- Heading: `Poppins` (kept from current — already loaded)
- Body: `Inter` or `DM Sans`

**Hero pattern**: Personal greeting — "Hi, I'm Jonathan" + role chips cycling through "Software Engineer", "FastAPI Developer", "Flutter Dev"

**Project card pattern**: Bento grid — 1 featured project card (2×2) + 6–8 smaller cards in masonry

---

## Information Architecture Recommendation

### Navigation Structure

**Recommended: One-page scroll with anchors + project detail pages**

```
/ (home)
├── #hero          → Name, role, CTA
├── #projects      → Project grid (9 cards)
│   └── /projects/[slug]  → Individual project page (Astro dynamic route)
├── #experience    → Timeline of employers
├── #contact       → Email/LinkedIn/GitHub + form
└── /404           → Not found page
```

Rationale: Keep the one-page feel (good for recruiters who scroll), but give each project its own SEO-indexable URL. A project card click navigates to `/projects/centinela`, `/projects/femn`, etc. This enables Google to index "Jonathan Viramontes Flutter Firebase" with project context.

### Project Grouping

**Recommended: By client (narrative grouping), within a single grid sorted by recency**

| Group | Projects | Narrative |
|-------|----------|-----------|
| Angel (4) | Centinela App, Centinela Web, Bloomotion Site, Bloomotion Web | "Full-stack product work — from mobile app to landing page" |
| Teotech (4) | POS La Brocha, Teotech CRM Suite, CRM Pedidos, Teotech Facturación | "CRM and business systems for SMBs" |
| FEMN (2) | Tita School App, FEMN Field Surveys | "Social impact — apps for NGO and education" |

On the grid itself, show all 9 cards without client grouping (filter chips let users filter by stack or type). The grouping is used for the narrative on individual project pages.

### How to Handle Fletes México

**Recommended: Dedicated "Currently At" hero badge + experience timeline entry — NOT a project card**

Rationale: Fletes is the current employer with no public repo. Showing it as a project card would invite questions about code access. Instead:
- Hero subtitle: "Currently at Fletes México · Software Engineer"
- Experience section: Featured card (already implemented as `variant="featured"`) with metrics ("Tiempos de conciliación -65%", "BI dashboards for daily ops")
- No project page — link to `fletes-mexico.com` for legitimacy

### Home Page Content

**Above the fold (hero section)**:
- JNVR SVG logo (animated, already exists)
- Name + current role + "Currently at Fletes México"
- 2 CTAs: "See my work" (scroll to #projects) + "Contact me" (scroll to #contact)

**Below the fold**:
- Projects grid (9 cards, filterable by stack)
- Experience timeline (Fletes, Teotech, Museo La Rodadora, IA-Center, Bloomotion)
- Contact section

### 404 / Contact / About

- **404**: Simple page — "Lost? Let me help." + link to home + link to GitHub
- **Contact**: Keep EmailJS form + email/LinkedIn/GitHub CTAs. Works well in current form.
- **About**: Not needed as a separate page — the hero section carries enough personal context. If desired, a short 3-sentence bio in the hero or a collapsible "About" below the hero is sufficient.

---

## Risks & Open Questions

### Risks

1. **Service Worker migration**: Current site has `@angular/service-worker`. A rewrite to Astro must either configure `vite-plugin-pwa` or explicitly drop offline support. If not handled, old cached Angular SW may interfere with the new site for returning visitors.

2. **Project screenshot gap**: Most `assets/proyectos/` images exist by name but visual quality is unknown. For the redesign to look credible, real screenshots or screen recordings are needed for all 9 projects. This is a content production risk, not a technical one.

3. **FEMN/vida_saludable confusion**: The current portfolio lists "Vida Saludable" as a personal health app. The actual `D:/Amorcito/FEMN` project is clearly the FEMN NGO survey app. Presenting this correctly (as NGO social-impact work) is more compelling and accurate — but needs confirmation from user.

4. **Client confidentiality**: Some projects (CRM Pedidos, Teotech CRM) are for private clients. Project pages should be careful not to expose client data, internal URLs, or DB schemas. Screenshots need to be sanitized.

5. **Domain / deploy target**: Current deploy is `gh-pages` via `npm run deploy`. Astro's `output: 'static'` is compatible, but the `base` path in `astro.config.ts` must be set correctly for GitHub Pages subpath hosting (e.g., `base: '/jnvrportfolio'` if not using a custom domain).

6. **Bloomotion landing (bloom)**: Static HTML-only page with no screenshots beyond a logo and team image. Very thin portfolio entry — should be merged with the Bloomotion Tech website entry or omitted.

### Open Questions for Proposal Phase

1. **Deploy target confirmed?** Keep GitHub Pages (`jnvr1.github.io/jnvrportfolio`) or move to Vercel (free tier, better SSG support, custom domain easier)? Vercel is simpler for Astro.

2. **Custom domain?** `jnvr.dev` or `jonviramontes.dev` etc. — this changes the Astro `base` config significantly.

3. **Which 9 projects to show?** Proposal should confirm the final list — the Bloomotion static landing (bloom) is very thin and may be better merged with bloomotion_tech or dropped.

4. **Client permission for screenshots?** Specifically for Teotech CRM and CRM Pedidos — these are private business systems.

5. **English vs Spanish?** Current portfolio uses Spanish labels ("Proyectos", "Contáctame") but English for nav items. Proposal should pick one language consistently for professionalism (English recommended for international recruiter reach).

6. **Contact form — keep EmailJS?** EmailJS works but requires client-side key exposure. Proposal should decide: keep EmailJS, switch to Resend/Formspree, or link to mailto only.

---

## Next Phase Inputs

- **Recommended stack**: Astro 5 (static output) + vanilla CSS (migrate existing SCSS tokens) + Alpine.js for contact form interactivity + `@astrojs/image` for optimized project screenshots
- **Recommended IA**: One-page scroll (`/`) with anchors (`#projects`, `#experience`, `#contact`) + dynamic project detail pages (`/projects/[slug]`) for SEO
- **Recommended design direction**: Direction A ("Minimalist Editorial") — cleanest recruiter experience, dark-first, Inter + Space Grotesk, 3-col project grid
- **Project content to inject**: See catalog above — 10 entries (9 freelance + Fletes as employer). Final selection should confirm: merge bloom+bloomotion_tech, drop bloom standalone
- **Fletes treatment**: "Currently at" hero badge + featured experience card — NOT a project card
- **Deploy recommendation**: Migrate from gh-pages to Vercel (free, zero config for Astro, custom domain ready)
