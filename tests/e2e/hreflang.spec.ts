/**
 * hreflang E2E tests — Phase 4 (task 4.4).
 *
 * NOTE: These tests require Phase 5 routes (/projects/[slug]) to exist.
 * They are written here (RED) and will pass after Phase 5 is implemented.
 *
 * Until then, the tests are marked with test.skip() to document the intent
 * without blocking the test suite.
 */
import { test, expect } from '@playwright/test';

test.describe('hreflang SEO tags', () => {
  test.skip(
    true,
    'Phase 5 required: /projects/[slug] routes must exist for this test to pass',
  );

  test('Project page has hreflang="es" link in <head>', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const esLink = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(esLink).toBeAttached();
  });

  test('Project page has hreflang="en" link in <head>', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const enLink = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(enLink).toBeAttached();
  });

  test('Project page has hreflang="x-default" pointing to ES URL', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const defaultLink = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(defaultLink).toBeAttached();
    const href = await defaultLink.getAttribute('href');
    expect(href).toMatch(/\/projects\/centinela-app/);
    expect(href).not.toMatch(/\/en\//);
  });
});
