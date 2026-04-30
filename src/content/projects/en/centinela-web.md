---
title: "Centinela — Marketing Website"
client: Angel
year: 2025
yearRange: "2024–2025"
stack: ["Astro", "Tailwind CSS", "DecapCMS"]
summary: "Static marketing site for the Centinela access control SaaS: SEO-first, automatic sitemap, OG tags, headless CMS."
role: "Frontend Developer & DevOps"
placeholder: true
confidential: false
locale: en
links:
  live: "https://centinela.netlify.app"
order: 2
---

## The problem

The Centinela product needed a public web presence to attract residential community administrators: explain the product, show pricing, capture leads, and rank in local searches. The solution needed to load fast, be easy to update without touching code, and be immediately deployable.

## The solution

I built the site using the AstroWind template as a base (Astro 5 + Tailwind CSS) and customized it completely: color palette, copywriting, service pages, pricing, contact forms, and landing pages specific to different community types.

DecapCMS was configured on top of the Git repository so the client could edit content from a visual interface without opening a code editor. The result is an SSG site with sub-second load times, automatic sitemap generation, per-page OG tags, and an RSS feed.

## My role

I adapted the template to the client's brief, wrote the main page content, set up the Netlify deployment pipeline with deploy previews per pull request, and delivered the CMS configured with client-facing documentation.

## Outcome

The site serves as the sales entry point for Centinela subscriptions. Lighthouse Performance score of 98 on mobile. The client can update blog content and page copy without technical intervention.

## Notable learning

AstroWind is a solid starting point but its component structure is opinionated. The right approach is to use slots and overrides rather than modifying template files directly — which makes future template upgrades tractable instead of merge-conflict nightmares.
