# Product

## Register

brand

## Users

**Primary: technical recruiters and hiring managers.** They arrive from a LinkedIn message, a WhatsApp link, or a name-plus-stack Google search. They are scanning, not reading — usually on a phone, usually with three other tabs open, usually deciding in under 30 seconds whether Jonathan is worth a reply. Their job-to-be-done: verify that this person actually ships real software, then find the contact affordance without friction.

**Secondary: engineering leads and peers** doing a deeper due-diligence pass — reading a specific project's detail page, checking the stack, judging whether the work is senior-level. They want depth on demand and will follow `/projects/[slug]` routes.

The site must satisfy the 30-second scan and the 10-minute deep read without compromising either.

## Product Purpose

A personal portfolio for **Jonathan Noé Viramontes (JNVR)** — a full-stack developer working across Flutter, React, PHP, and modern static/backends, currently at Fletes México. It exists to convert a cold recruiter click into a warm contact, and to be the canonical, SEO-indexable source of truth for his work when someone searches his name.

It surfaces nine real, production-shipped freelance projects (Centinela, Teotech suite, FEMN, Tita, Bloomotion), an honest experience timeline, and a low-friction contact path — bilingual ES/EN with ES as the default voice.

**Success looks like:** a recruiter who lands, believes within seconds that the work is real and senior, and either sends the contact form or saves the profile. Speed, credibility, and clarity are the whole game.

## Brand Personality

**Confident · technical · direct.** The voice of a senior engineer who ships — no fluff, no hedging, no "passionate about clean code" boilerplate. Copy is terse and declarative ("I build software that works", "Selected systems I designed, built, and shipped to production"). Seniority is signaled by what's left out as much as by what's said.

The visual identity carries the same stance: a committed dark navy world with faceted geometry derived from the JNVR logo — precise, structural, unmistakably the same hand across every surface. It should feel engineered, not decorated.

## Anti-references

This should NOT look like any of these — they are the drift-toward-slop failure modes to catch in every future pass:

- **The generic dev-portfolio template.** No "Hi, I'm X 👋" hero, no skill-bar grid of tech logos with percentages, no endless identical project cards. If it looks like a bootcamp capstone or a `create-portfolio` starter, it has failed.
- **The loud gradient SaaS landing.** No gradient-text headlines, no glassmorphism as decoration, no badge soup, no "trusted by" logo walls, no big-number hero-metric template.
- **Over-animated / scroll-jacked — when the motion is *generic*.** Motion IS part of this brand's voice: it extends the faceted logo geometry so the page reads as engineered and alive, not flat. What's banned is *reflexive* motion — the same generic fade-up wrapped around every section by default, marquees, any effect not derived from the faceted logo system, and any motion that janks on a mid-range phone or gates content behind JS. The test for every animation: (a) does it express the faceted identity, and (b) does it stay smooth and never hide content if the script fails? If both yes, it's voice. If it's a library default or it drops frames, it's slop. Always honored against `prefers-reduced-motion`.
- **Corporate agency stock-photo.** No stocky teamwork photos, no buzzword copy ("synergy", "solutions", "innovative"), nothing faceless or interchangeable. Imagery is real project screenshots only.

## Design Principles

1. **Show the work, not the resume.** Real shipped systems and honest screenshots carry the message. Adjectives and self-description are the weakest possible proof; cut them in favor of evidence.
2. **Confidence through concision.** Terse, declarative copy. The senior signal is restraint — say less, mean more. Every sentence earns its place or gets deleted.
3. **Scannable in 30 seconds, deep on demand.** The one-page scroll answers the recruiter's snap judgment; the per-project SEO routes reward the deep-dive. Neither audience is made to work for the other's benefit.
4. **The logo is the design system — including its motion.** The faceted navy geometry is not decoration, it's the identity, and its movement is part of it: animation should read as the facets coming to life, not as a generic animation library dropped on top. Every surface should feel like the same hand made it. Preserve and extend this identity — geometry AND motion — but never let it jank or hide content; identity motion that drops frames undercuts the "engineered" signal harder than no motion would.
5. **Fast is the pitch.** A developer's portfolio that loads instantly and scores 95+ on Lighthouse is itself a proof of competence. Performance is a credibility argument, not just an engineering nicety.
6. **Bilingual with no second-class locale.** ES is the default voice; EN is a full mirror, never an afterthought. Content parity is enforced, not aspirational.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**. Concretely:

- All text meets AA contrast against its background — including muted secondary text and form placeholders, not just body copy.
- Full keyboard navigation with visible, on-brand focus states.
- `prefers-reduced-motion: reduce` is honored: transforms drop, opacity/instant states remain (already implemented).
- Semantic landmarks, skip-to-content link, and accurate alt text treated as part of the voice — descriptive, not "screenshot".
- Bilingual content carries correct `lang` attributes per locale.
