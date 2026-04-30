/**
 * Project catalog E2E tests — Phase 5 (tasks 5.1).
 *
 * Tests run against the home route (/) which renders the ProjectGrid
 * with all 9 project cards in the #projects section.
 *
 * NOTE: These tests require index.astro (Phase 7 home pages) to exist.
 * They are written RED here and will pass after home routes are created.
 */
import { test, expect } from '@playwright/test';

test.describe('Project catalog — #projects section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Home renders exactly 9 project cards', async ({ page }) => {
    const cards = page.locator('#projects .project-card');
    await expect(cards).toHaveCount(9);
  });

  test('No project card has "Fletes" in its title', async ({ page }) => {
    const cards = page.locator('#projects .card-title');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      expect(text).not.toMatch(/Fletes/i);
    }
  });

  test('#projects section has accessible section heading', async ({ page }) => {
    const section = page.locator('section#projects');
    await expect(section).toBeAttached();
    const heading = section.locator('h2');
    await expect(heading).toBeVisible();
  });

  test('Filter chips are present and "All" chip is active by default', async ({ page }) => {
    const allChip = page.locator('[data-filter="all"]');
    await expect(allChip).toBeAttached();
    await expect(allChip).toHaveAttribute('aria-pressed', 'true');
  });

  test('Filter chip group has accessible label', async ({ page }) => {
    const group = page.locator('[role="group"]#project-filter-group');
    await expect(group).toBeAttached();
    const label = await group.getAttribute('aria-label');
    expect(label).toBeTruthy();
  });

  test('Filter chip group and all chips are present', async ({ page }) => {
    // Verify filter group structure exists and is interactive
    const group = page.locator('#project-filter-group');
    await expect(group).toBeVisible();
    const chips = group.locator('[data-filter]');
    await expect(chips).toHaveCount(5); // All, Flutter, React, PHP, Astro
    const allChip = group.locator('[data-filter="all"]');
    await expect(allChip).toHaveAttribute('aria-pressed', 'true');
  });
});
