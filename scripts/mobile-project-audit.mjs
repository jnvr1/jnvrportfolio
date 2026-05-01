#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4322';
const outDir = 'tmp/mobile-audit';
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
  });
  const page = await ctx.newPage();
  try {
    await page.goto(`${BASE}/projects/centinela-app/`, { waitUntil: 'load', timeout: 25000 });
  } catch {}
  await page.waitForTimeout(1500);

  // Top
  let f = join(outDir, `project-detail_${v.label}_top.png`);
  await page.screenshot({ path: f, fullPage: false });
  console.log(`✓ ${f}`);

  // Full
  f = join(outDir, `project-detail_${v.label}_full.png`);
  await page.screenshot({ path: f, fullPage: true });
  console.log(`✓ ${f}`);

  await ctx.close();
}

await browser.close();
