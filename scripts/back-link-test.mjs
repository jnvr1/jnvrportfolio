#!/usr/bin/env node
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:4325';
const browser = await chromium.launch();

let failures = 0;

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
  await page.route('**/ngsw-worker.js', (r) => r.abort());
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(1500);

  await page.evaluate(() => {
    const items = document.querySelectorAll('.project-grid-item');
    const target = items[2];
    target?.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await page.waitForTimeout(300);

  const scrollBefore = await page.evaluate(() => window.scrollY);
  console.log(`[${v.label}] scrollY before card click = ${scrollBefore}`);

  const cardHref = await page.evaluate(() => {
    const items = document.querySelectorAll('.project-grid-item');
    const a = items[2]?.querySelector('.card-title a');
    return a?.href ?? null;
  });
  console.log(`[${v.label}] navigating to ${cardHref}`);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }),
    page.evaluate(() => {
      const items = document.querySelectorAll('.project-grid-item');
      items[2]?.querySelector('.card-title a')?.click();
    }),
  ]);
  await page.waitForTimeout(800);

  const onDetailUrl = page.url();
  console.log(`[${v.label}] now at ${onDetailUrl}`);

  await page.waitForSelector('[data-back-link]', { timeout: 5000 });
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load', timeout: 15000 }),
    page.click('[data-back-link]'),
  ]);
  await page.waitForTimeout(1200);

  const scrollAfter = await page.evaluate(() => window.scrollY);
  const backUrl = page.url();
  const drift = Math.abs(scrollAfter - scrollBefore);
  const ok = drift < 50;
  console.log(`[${v.label}] back at ${backUrl} — scrollY = ${scrollAfter} (was ${scrollBefore}, drift = ${drift}px) ${ok ? '✓' : '✗ FAIL'}`);
  if (!ok) failures++;

  await ctx.close();
}

await browser.close();
process.exit(failures > 0 ? 1 : 0);
