#!/usr/bin/env node
/**
 * scripts/screenshot-project.mjs
 *
 * Take desktop + mobile screenshots of a running project URL via Playwright.
 * Saves PNG + WebP to public/projects/<slug>.{webp,-mobile.webp}
 *
 * Usage:
 *   node scripts/screenshot-project.mjs <url> <slug>
 *
 * Example:
 *   node scripts/screenshot-project.mjs http://localhost/Brocha/ brocha-facturacion
 */
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const [, , url, slug] = process.argv;

if (!url || !slug) {
  console.error('Usage: node screenshot-project.mjs <url> <slug>');
  process.exit(1);
}

const outDir = 'public/projects';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();

async function snap({ name, viewport }) {
  const ctx = await browser.newContext({
    viewport,
    deviceScaleFactor: 2, // retina-ish quality
    ignoreHTTPSErrors: true,
  });
  const page = await ctx.newPage();
  console.log(`  → ${name} (${viewport.width}×${viewport.height})`);
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 25000 });
  } catch (err) {
    console.warn(`    ⚠ networkidle timeout, falling back to load: ${err.message}`);
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
  }
  // Detect Flutter app and wait for the engine to mount + paint
  const isFlutter = await page.evaluate(() => {
    return Boolean(
      document.querySelector('flt-glass-pane') ||
        document.querySelector('flutter-view') ||
        document.querySelector('script[src*="flutter"]') ||
        document.querySelector('script[src*="main.dart.js"]')
    );
  });
  if (isFlutter) {
    console.log('    detected Flutter — waiting for engine to render');
    try {
      await page.waitForSelector('flt-glass-pane, flutter-view', { timeout: 20000 });
    } catch {
      /* fall through to fixed wait */
    }
    // Flutter splash → app transition can take a few seconds even after the
    // glass-pane is in the DOM. Wait until pixels settle (no rAF for ~1s).
    await page.waitForTimeout(6000);
  } else {
    await page.waitForTimeout(1500);
  }
  const pngPath = join(outDir, `${slug}${name === 'mobile' ? '-mobile' : ''}.png`);
  await page.screenshot({ path: pngPath, fullPage: false });
  // Optimize to WebP
  const webpPath = pngPath.replace(/\.png$/, '.webp');
  await sharp(pngPath).webp({ quality: 82, effort: 5 }).toFile(webpPath);
  await unlink(pngPath); // remove the PNG, keep only WebP
  console.log(`    ✓ ${webpPath}`);
  await ctx.close();
}

console.log(`Screenshotting ${url} as "${slug}"`);
try {
  await snap({ name: 'desktop', viewport: { width: 1440, height: 900 } });
  await snap({ name: 'mobile',  viewport: { width: 390, height: 844 } });
  console.log('✓ Done');
} catch (err) {
  console.error(`✗ Failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser.close();
}
