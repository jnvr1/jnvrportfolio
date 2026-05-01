#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4326';
const outDir = 'tmp/detail-atmosphere';
await mkdir(outDir, { recursive: true });

const widths = [
  { label: '360', w: 360, h: 800, mobile: true },
  { label: '768', w: 768, h: 1024, mobile: false },
  { label: '1200', w: 1200, h: 900, mobile: false },
];

// One slug with a real cover image, one with placeholder
const projects = [
  { name: 'with-cover', slug: 'centinela-app' },
  { name: 'placeholder', slug: 'teotech-suite' },
];

const browser = await chromium.launch();

for (const proj of projects) {
  for (const v of widths) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: v.h },
      deviceScaleFactor: 2,
      hasTouch: v.mobile,
      isMobile: v.mobile,
      serviceWorkers: 'block',
    });
    const page = await ctx.newPage();
    await page.route('**/ngsw-worker.js', (r) => r.abort());
    try {
      await page.goto(`${BASE}/projects/${proj.slug}/`, { waitUntil: 'load', timeout: 25000 });
    } catch {}
    await page.waitForTimeout(2000);

    // Force scroll-reveal to trigger by scrolling once
    await page.evaluate(async () => {
      const total = document.documentElement.scrollHeight;
      for (let y = 0; y <= total; y += window.innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 150));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 300));
    });

    // Top of page (header + cover + project header card)
    let f = join(outDir, `${proj.name}_${v.label}_top.png`);
    await page.screenshot({ path: f, fullPage: false });
    console.log(`✓ ${f}`);

    // Full page
    f = join(outDir, `${proj.name}_${v.label}_full.png`);
    await page.screenshot({ path: f, fullPage: true });
    console.log(`✓ ${f}`);

    await ctx.close();
  }
}

await browser.close();
