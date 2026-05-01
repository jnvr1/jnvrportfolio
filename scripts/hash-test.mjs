#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4323';
const outDir = 'tmp/mobile-audit';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const id of ['projects', 'experience', 'contact']) {
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 800 },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  // Direct hash navigation simulates what the mobile menu link does
  await page.goto(`${BASE}/#${id}`, { waitUntil: 'load', timeout: 20000 });
  await page.waitForTimeout(2500); // Let SW unregister + scroll complete

  // Re-trigger the hash scroll (in case the SW registration interrupted it)
  let headingY = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await page.evaluate((sid) => {
        const el = document.getElementById(sid);
        el?.scrollIntoView({ behavior: 'instant', block: 'start' });
      }, id);
      await page.waitForTimeout(300);
      headingY = await page.evaluate((sid) => {
        const el = document.getElementById(sid);
        if (!el) return null;
        const heading = el.querySelector('h2,h1');
        return heading ? heading.getBoundingClientRect().top : null;
      }, id);
      break;
    } catch (e) {
      await page.waitForTimeout(500);
    }
  }

  const f = join(outDir, `hash-${id}_360.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`✓ ${f}  heading top = ${headingY?.toFixed(0)}px (header is ~56px tall)`);

  await ctx.close();
}

await browser.close();
