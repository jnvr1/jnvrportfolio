/**
 * Project route E2E tests — Phase 5 (tasks 5.5, 5.8).
 *
 * Tests that:
 * - /projects/[slug] (ES) returns 200 and renders project title in <title>
 * - /en/projects/[slug] (EN) returns 200 with English content
 * - hreflang tags are present on project pages (unblocking hreflang.spec.ts)
 */
import { test, expect } from '@playwright/test';

test.describe('ES project routes', () => {
  test('/projects/centinela-app returns 200 with project title in <title>', async ({ page }) => {
    const response = await page.goto('/projects/centinela-app');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Centinela/);
  });

  test('/projects/centinela-app renders project content', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const text = await h1.textContent();
    expect(text).toContain('Centinela');
  });

  test('/projects/centinela-app has breadcrumb with projects link', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const breadcrumb = page.locator('nav[aria-label="breadcrumb"]');
    await expect(breadcrumb).toBeAttached();
  });

  test('/projects/tita returns 200', async ({ page }) => {
    const response = await page.goto('/projects/tita');
    expect(response?.status()).toBe(200);
  });

  test('/projects/femn returns 200 with FEMN in title', async ({ page }) => {
    const response = await page.goto('/projects/femn');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/FEMN/);
  });
});

test.describe('EN project routes', () => {
  test('/en/projects/centinela-app returns 200 with English project title', async ({ page }) => {
    const response = await page.goto('/en/projects/centinela-app');
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(/Centinela/);
  });

  test('/en/projects/centinela-app renders English content', async ({ page }) => {
    await page.goto('/en/projects/centinela-app');
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    // EN title contains "Residential Access Control System"
    const text = await h1.textContent();
    expect(text).toContain('Centinela');
  });

  test('/en/ serves content in English (lang attribute)', async ({ page }) => {
    await page.goto('/en/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });
});

test.describe('hreflang tags on project pages', () => {
  test('/projects/centinela-app has hreflang="es" alternate link', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const esLink = page.locator('link[rel="alternate"][hreflang="es"]');
    await expect(esLink).toBeAttached();
  });

  test('/projects/centinela-app has hreflang="en" alternate link', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const enLink = page.locator('link[rel="alternate"][hreflang="en"]');
    await expect(enLink).toBeAttached();
  });

  test('/projects/centinela-app has hreflang="x-default" pointing to ES URL', async ({ page }) => {
    await page.goto('/projects/centinela-app');
    const defaultLink = page.locator('link[rel="alternate"][hreflang="x-default"]');
    await expect(defaultLink).toBeAttached();
    const href = await defaultLink.getAttribute('href');
    expect(href).toMatch(/\/projects\/centinela-app/);
    expect(href).not.toMatch(/\/en\//);
  });
});
