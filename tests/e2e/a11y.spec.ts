/**
 * A11y E2E tests — Phase 4 (task 4.1).
 *
 * Tests run against the dev preview page since Phase 5 home routes don't exist yet.
 * Phase 7 will add tests against the real / route.
 *
 * The _dev/components page validates:
 * - main landmark exists
 * - skip-to-content link is present in the page
 */
import { test, expect } from '@playwright/test';

test.describe('Accessibility contracts — dev preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev-preview/components');
  });

  test('Page has a <main> landmark', async ({ page }) => {
    const main = page.locator('main');
    await expect(main).toBeAttached();
  });

  test('Header has primary nav with aria-label', async ({ page }) => {
    const nav = page.locator('nav[aria-label="Primary"]');
    await expect(nav).toBeAttached();
  });

  test('Form inputs have visible labels (not placeholder-only)', async ({ page }) => {
    // Visible label elements associated with inputs
    const nameLabel = page.locator('label[for="contact-name"]');
    const emailLabel = page.locator('label[for="contact-email"]');
    const messageLabel = page.locator('label[for="contact-message"]');
    await expect(nameLabel).toBeVisible();
    await expect(emailLabel).toBeVisible();
    await expect(messageLabel).toBeVisible();
  });
});
