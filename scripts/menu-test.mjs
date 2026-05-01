#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4324';
const outDir = 'tmp/menu-redesign';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

for (const v of [
  { label: '360', w: 360, h: 800 },
  { label: '390', w: 390, h: 844 },
]) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
    hasTouch: true,
    isMobile: true,
    serviceWorkers: 'block',
  });
  const page = await ctx.newPage();
  // Block the noop SW registration so it doesn't fight with the test
  await page.route('**/ngsw-worker.js', (r) => r.abort());
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(1500);

  // 1. Closed state (top of page, hamburger visible)
  let f = join(outDir, `${v.label}_closed.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`✓ ${f}`);

  // 2. Mid-open (capture the slide animation) — re-query after the wait
  await page.waitForSelector('#hamburger-btn', { timeout: 5000 });
  await page.click('#hamburger-btn');
  await page.waitForTimeout(160); // ~half of 320ms slide
  f = join(outDir, `${v.label}_opening.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`✓ ${f}`);

  // 3. Fully open (after stagger completes)
  await page.waitForTimeout(700);
  f = join(outDir, `${v.label}_open.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`✓ ${f}`);

  // 4. Verify is-open class is on the menu
  const hasIsOpen = await page.evaluate(() => {
    const m = document.getElementById('mobile-menu');
    return m?.classList.contains('is-open');
  });
  console.log(`  is-open class present: ${hasIsOpen}`);

  // 5. Close + screenshot mid-close
  if (await page.$('#mobile-close-btn')) {
    await page.click('#mobile-close-btn');
    await page.waitForTimeout(140);
    f = join(outDir, `${v.label}_closing.png`);
    await page.screenshot({ path: f, fullPage: false });
    console.log(`✓ ${f}`);

    await page.waitForTimeout(400);
    f = join(outDir, `${v.label}_closed-after.png`);
    await page.screenshot({ path: f, fullPage: false });
    console.log(`✓ ${f}`);

    const stillOpen = await page.evaluate(() => {
      return document.getElementById('mobile-menu')?.classList.contains('is-open');
    });
    console.log(`  is-open after close: ${stillOpen} (should be false)`);
  }

  await ctx.close();
}

await browser.close();
