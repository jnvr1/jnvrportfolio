#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4328';
const outDir = 'tmp/footer-archive';
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const v of [
  { label: '360', w: 360, h: 800, mobile: true },
  { label: '1200', w: 1200, h: 900, mobile: false },
]) {
  const ctx = await browser.newContext({
    viewport: { width: v.w, height: v.h },
    deviceScaleFactor: 2,
    isMobile: v.mobile,
    serviceWorkers: 'block',
  });
  const page = await ctx.newPage();
  await page.route('**/ngsw-worker.js', (r) => r.abort());
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 25000 });
  await page.waitForTimeout(2000);

  // Scroll to bottom so the footer is visible and centered
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  const f = join(outDir, `${v.label}.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`✓ ${f}`);
  await ctx.close();
}
await browser.close();
