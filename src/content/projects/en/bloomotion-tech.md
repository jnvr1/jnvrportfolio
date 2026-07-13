---
title: "Bloomotion Tech — Corporate Website"
client: Bloomotion
year: 2025
stack: ["Flutter Web", "Dart", "Firebase Hosting", "Google Fonts", "Material Design"]
summary: "Flutter Web corporate SPA for a logistics platform: smooth-scroll nav, animated metrics, and a mobile sticky demo CTA."
role: "Flutter Web Developer"
cover: ../../../assets/projects/bloomotion-tech.webp
placeholder: false
confidential: false
locale: en
order: 3
---

## The problem

Bloomotion, a growing logistics platform, needed a corporate website that communicated its value proposition to B2B prospects: integration capabilities, measurable results, and reliability. The site had to project the visual maturity of an established product and not read like a generic industry landing page.

## The solution

I built a single-page SPA with Flutter Web and Material Design. It isn't a seven-section site: it's a long narrative with hero, metrics, results, services, solutions, projects, how-it-works, integrations, benefits, about, FAQ, a CTA block, and contact, plus the footer. Navigation uses smooth scroll with `easeInOutCubic` and a duration proportional to the distance to each section (services, solutions, platform, about, contact). On mobile a sticky "Agenda una demo" CTA appears after the hero scrolls past and hides once contact is in view. The animations (progressive counters, reveal on load, animated gradients, hover cards) live in reusable widgets.

**Evolution from v1**: the first version (`bloom`) was a static HTML landing page. This Flutter Web version replaced and expanded it, folding its content and narrative into the SPA.

## My role

I designed the widget-per-section architecture, implemented the scroll logic (viewport-based offset calculation, a sticky CTA gated on scroll position and contact visibility), the progressive counters, and the entry animations. I set up Firebase Hosting for deployment, verified in the repo.

## Outcome

The corporate site works as a sales tool in Bloomotion's commercial meetings rather than a static deck. The animated metrics give concrete conversation starters with prospects, and the smooth-scroll navigation keeps the whole journey on one page.

## Notable learning

Flutter Web for marketing sites involves a clear trade-off: visual fidelity and animation control are high, but the initial bundle is larger than an equivalent Astro site. For a B2B desktop audience on stable connections that's acceptable. For a personal portfolio with a mixed audience it wouldn't be — hence the choice of Astro for this site.
