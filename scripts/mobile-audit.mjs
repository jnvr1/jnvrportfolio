#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const outDir = 'tmp/mobile-audit';
await mkdir(outDir, { recursive: true });

const widths = [
  { label: '360', w: 360, h: 800 },
  { label: '390', w: 390, h: 844 },
  { label: '768', w: 768, h: 1024 },
];

const pages = [
  { name: 'home-es', url: `${BASE}/` },
  { name: 'home-en', url: `${BASE}/en/` },
  { name: 'project-es', url: `${BASE}/projects/centinela-app/` },
];

const browser = await chromium.launch();

async function autoScrollAll(page) {
  // Scroll through the entire page in viewport-sized steps so IntersectionObservers fire,
  // then return to top.
  await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight;
    const step = window.innerHeight * 0.8;
    for (let y = 0; y <= total; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 200));
  });
}

for (const p of pages) {
  for (const v of widths) {
    const ctx = await browser.newContext({
      viewport: { width: v.w, height: v.h },
      deviceScaleFactor: 2,
      hasTouch: true,
      isMobile: v.w <= 480,
    });
    const page = await ctx.newPage();
    try {
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 });
    } catch {
      await page.goto(p.url, { waitUntil: 'load', timeout: 15000 });
    }
    await page.waitForTimeout(1200);
    try {
      await autoScrollAll(page);
    } catch (e) {
      // Sometimes the noop SW unregister triggers a brief reload — retry
      console.warn(`  ⚠ scroll retry for ${p.name}@${v.label}: ${e.message}`);
      await page.waitForTimeout(800);
      try { await autoScrollAll(page); } catch {}
    }

    // Fold screenshots: top, projects, experience, contact, footer
    const sections = ['hero', 'projects', 'experience', 'contact'];
    const docMetrics = await page.evaluate(() => ({
      docW: document.documentElement.scrollWidth,
      viewW: window.innerWidth,
    }));
    const overflow = docMetrics.docW > docMetrics.viewW + 1
      ? `H-OVERFLOW doc=${docMetrics.docW} view=${docMetrics.viewW}`
      : 'no-overflow';

    // Capture top fold
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    let file = join(outDir, `${p.name}_${v.label}_top.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log(`✓ ${file} ${overflow}`);

    if (p.name.startsWith('home')) {
      for (const id of sections) {
        const exists = await page.evaluate((sid) => !!document.getElementById(sid), id);
        if (!exists) continue;
        await page.evaluate((sid) => {
          const el = document.getElementById(sid);
          el?.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, id);
        await page.waitForTimeout(400);
        const ff = join(outDir, `${p.name}_${v.label}_${id}.png`);
        await page.screenshot({ path: ff, fullPage: false });
        console.log(`  ${id} → ${ff}`);
      }

      // Open mobile menu (only at narrow widths)
      if (v.w <= 480) {
        const hb = await page.$('#hamburger-btn');
        if (hb) {
          await hb.click();
          await page.waitForTimeout(300);
          const ff = join(outDir, `${p.name}_${v.label}_menu.png`);
          await page.screenshot({ path: ff, fullPage: false });
          console.log(`  menu → ${ff}`);
        }
      }
    }

    await ctx.close();
  }
}

await browser.close();
