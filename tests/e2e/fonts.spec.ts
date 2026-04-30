import { test, expect } from '@playwright/test';

/**
 * E2E test: No requests to Google Fonts CDN during page load.
 *
 * Spec: REQ-TS-4 — fonts MUST be self-hosted via @fontsource-variable/*.
 *       No request to fonts.googleapis.com or fonts.gstatic.com at runtime.
 *
 * Task: 2.7
 */
test.describe('Font loading — self-hosted only', () => {
  test('no request to fonts.googleapis.com on home load', async ({ page }) => {
    const googleFontsRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        googleFontsRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(
      googleFontsRequests,
      `Expected zero Google Fonts CDN requests but got: ${googleFontsRequests.join(', ')}`,
    ).toHaveLength(0);
  });

  test('no request to fonts.gstatic.com on home load', async ({ page }) => {
    const gstaticRequests: string[] = [];

    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('fonts.gstatic.com')) {
        gstaticRequests.push(url);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(
      gstaticRequests,
      `Expected zero fonts.gstatic.com requests but got: ${gstaticRequests.join(', ')}`,
    ).toHaveLength(0);
  });
});
