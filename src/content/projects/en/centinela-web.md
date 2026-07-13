---
title: "Centinela — Marketing Website"
client: Centinela
year: 2026
yearRange: "2025–2026"
stack: ["Astro", "Tailwind CSS", "DecapCMS", "Firebase Hosting", "MDX", "TypeScript", "Partytown"]
summary: "Static site for the Centinela access control SaaS: SEO, sitemap, OG tags, MDX blog, and headless CMS."
role: "Frontend Developer & DevOps"
cover: ../../../assets/projects/centinela-web.webp
placeholder: false
confidential: false
locale: en
links:
  live: "https://centinela.netlify.app"
order: 2
---

## The problem

The Centinela product needed a public web presence to attract residential community administrators: explain the product, route inquiries, and rank in local searches. The solution had to load fast, be editable without touching code, and deploy to any host without locking into a single provider.

## The solution

I built the site on the AstroWind template (Astro 5 + Tailwind CSS) and customized it completely: palette, copywriting, and the site pages — home, services, about, contact, and blog. The blog uses MDX with categories, tags, and an automatic RSS feed.

DecapCMS was configured on top of the Git repository so the client could edit content from a visual interface without opening a code editor. As a static site (SSG), the HTML is served prerendered; third-party scripts are isolated with Partytown so they don't block the main thread. Sitemap, per-page OG tags, and the RSS feed are all generated automatically.

## My role

I adapted the template to the client's brief, wrote the page content, configured DecapCMS with usage documentation, and set up deployment for several targets: Firebase Hosting (the active one), plus Netlify, Vercel, and a Docker image with docker-compose for self-hosted environments.

## Outcome

The site is the sales entry point for the Centinela subscription. Being SSG, it serves prerendered pages that load fast, and the client updates the blog and pages without technical intervention. The multi-target setup avoids vendor lock-in.

## Notable learning

AstroWind is a solid starting point but its component structure is opinionated. The right approach is to use slots and overrides rather than modifying template files directly — which makes future template upgrades tractable instead of merge-conflict nightmares.
