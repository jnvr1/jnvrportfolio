import { test, expect } from '@playwright/test';

/**
 * E2E test: Dark theme — body background is #0D1117 (the --bg token).
 *
 * Spec: REQ-TS-2 (--bg token value), REQ-TS-3 (dark-only, no light fallback).
 *
 * Task: 2.8
 */
test.describe('Dark theme — body background color', () => {
  test('body background-color equals #0D1117 (--bg token)', async ({ page }) => {
    await page.goto('/');

    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // The browser returns computed color as rgb(...) — convert #0D1117 to rgb(13, 17, 23)
    // rgb(13, 17, 23) corresponds to #0D1117
    expect(bgColor).toBe('rgb(13, 17, 23)');
  });

  test('no prefers-color-scheme media query switches to a light background', async ({ page }) => {
    // Emulate light mode preference
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');

    const bgColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Even in light mode preference, background MUST remain #0D1117
    // because we have a dark-only theme (no prefers-color-scheme swap)
    expect(bgColor).toBe('rgb(13, 17, 23)');
  });
});
