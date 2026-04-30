/**
 * hreflang E2E tests — Phase 4 (task 4.4), enabled by Phase 5 routes.
 *
 * Tests that project pages include hreflang alternate links in <head>.
 * Route /projects/centinela-app is generated in Phase 5 via getStaticPaths.
 */
import { test, expect } from '@playwright/test';

test.describe('hreflang SEO tags', () => {
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
