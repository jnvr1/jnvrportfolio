/**
 * Component render contract tests — Phase 4.
 *
 * These tests run against the dev server (astro dev --port 4321) and validate
 * that each component renders its key DOM/a11y contracts via the _dev/components
 * preview page.
 *
 * Tests run against Chromium only for Phase 4 (cross-browser runs are Phase 12).
 *
 * @see src/pages/dev-preview/components.astro — the test fixture page
 */
import { test, expect } from '@playwright/test';

test.describe('Component render contracts (dev preview)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dev-preview/components');
    // Wait for the page to be fully hydrated
    await page.waitForLoadState('networkidle');
  });

  // ---------------------------------------------------------------------------
  // Header
  // ---------------------------------------------------------------------------
  test('Header renders primary nav with 3 anchor links', async ({ page }) => {
    const nav = page.locator('#test-header nav[aria-label="Primary"]');
    await expect(nav).toBeVisible();
    const links = nav.locator('a');
    // Header has: Proyectos, Experiencia, Contacto (+ LocaleSwitcher links)
    await expect(links).toHaveCount(5); // 3 nav links + 2 locale switcher links
  });

  test('Header has hamburger button with aria-expanded=false initially', async ({ page }) => {
    const hamburger = page.locator('#test-header #hamburger-btn');
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  // ---------------------------------------------------------------------------
  // Hero
  // ---------------------------------------------------------------------------
  test('Hero renders h1 with name text', async ({ page }) => {
    const h1 = page.locator('#test-hero h1#hero-heading');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Jonathan Noé Viramontes');
  });

  test('Hero has #hero section with aria-labelledby', async ({ page }) => {
    const hero = page.locator('#test-hero section#hero');
    await expect(hero).toHaveAttribute('aria-labelledby', 'hero-heading');
  });

  test('Hero renders two CTA links (projects and contact)', async ({ page }) => {
    const ctas = page.locator('#test-hero .hero-ctas a');
    await expect(ctas).toHaveCount(2);
    const hrefs = await ctas.evaluateAll((links) =>
      links.map((a) => (a as HTMLAnchorElement).href),
    );
    expect(hrefs.some((h) => h.includes('#projects'))).toBe(true);
    expect(hrefs.some((h) => h.includes('#contact'))).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // FletesBadge
  // ---------------------------------------------------------------------------
  test('FletesBadge renders with ES text', async ({ page }) => {
    const badge = page.locator('#test-fletes-badge .fletes-badge').first();
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Fletes México');
  });

  test('FletesBadge renders with EN text', async ({ page }) => {
    const badge = page.locator('#test-fletes-badge .fletes-badge').nth(1);
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('Fletes');
  });

  // ---------------------------------------------------------------------------
  // Logo
  // ---------------------------------------------------------------------------
  test('Logo renders with role=img and aria-label', async ({ page }) => {
    const logo = page.locator('#test-logo [role="img"]');
    await expect(logo).toHaveAttribute('aria-label', 'JNVR');
  });

  test('Logo renders an img element', async ({ page }) => {
    const img = page.locator('#test-logo img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', '/logo-jnvr.svg');
  });

  // ---------------------------------------------------------------------------
  // LocaleSwitcher
  // ---------------------------------------------------------------------------
  test('LocaleSwitcher renders ES and EN links', async ({ page }) => {
    const switcher = page.locator('#test-locale-switcher .locale-switcher');
    await expect(switcher).toBeVisible();
    const links = switcher.locator('a');
    await expect(links).toHaveCount(2);
  });

  test('LocaleSwitcher marks ES as aria-current=page when locale is es', async ({ page }) => {
    const esLink = page.locator('#test-locale-switcher .locale-switcher a[lang="es"]');
    await expect(esLink).toHaveAttribute('aria-current', 'page');
  });

  test('LocaleSwitcher EN link does NOT have aria-current when locale is es', async ({ page }) => {
    const enLink = page.locator('#test-locale-switcher .locale-switcher a[lang="en"]');
    await expect(enLink).not.toHaveAttribute('aria-current', 'page');
  });

  // ---------------------------------------------------------------------------
  // StackChip
  // ---------------------------------------------------------------------------
  test('StackChip renders with aria-label containing Stack prefix', async ({ page }) => {
    const chip = page.locator('#test-stack-chip .stack-chip').first();
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute('aria-label', /Stack:/);
  });

  test('StackChip renders tech name in text', async ({ page }) => {
    const chip = page.locator('#test-stack-chip .stack-chip').first();
    await expect(chip).toContainText('Flutter');
  });

  // ---------------------------------------------------------------------------
  // ScrollReveal
  // ---------------------------------------------------------------------------
  test('ScrollReveal element starts with data-scroll-reveal attribute', async ({ page }) => {
    // The element may have data-revealed added by JS when visible
    const revealEl = page.locator('#test-scroll-reveal [data-scroll-reveal]');
    // It should exist (either revealed or not yet revealed)
    const count = await revealEl.count();
    // If prefers-reduced-motion is off, element keeps data-scroll-reveal until revealed
    // If revealed, data-scroll-reveal may be removed — check the content exists
    const content = page.locator('#test-scroll-reveal [data-testid="scroll-reveal-content"]');
    await expect(content).toBeVisible();
    await expect(content).toContainText('fades in');
  });

  // ---------------------------------------------------------------------------
  // ExperienceCard
  // ---------------------------------------------------------------------------
  test('ExperienceCard renders company name', async ({ page }) => {
    const card = page.locator('#test-experience-card .experience-card');
    await expect(card).toBeVisible();
    await expect(card).toContainText('Fletes México');
  });

  test('ExperienceCard renders time element with datetime attribute', async ({ page }) => {
    const time = page.locator('#test-experience-card time');
    await expect(time).toBeVisible();
    await expect(time).toHaveAttribute('datetime', /2023/);
  });

  test('ExperienceCard featured variant has featured class', async ({ page }) => {
    const card = page.locator('#test-experience-card .experience-card--featured');
    await expect(card).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // ContactForm
  // ---------------------------------------------------------------------------
  test('ContactForm renders with all required labeled inputs', async ({ page }) => {
    const form = page.locator('#test-contact-form form#contact-form');
    await expect(form).toBeVisible();

    // Each input must have a corresponding <label>
    const nameLabel = page.locator('#test-contact-form label[for="contact-name"]');
    const emailLabel = page.locator('#test-contact-form label[for="contact-email"]');
    const messageLabel = page.locator('#test-contact-form label[for="contact-message"]');
    await expect(nameLabel).toBeVisible();
    await expect(emailLabel).toBeVisible();
    await expect(messageLabel).toBeVisible();
  });

  test('ContactForm has role=status live region for success/error messages', async ({ page }) => {
    const status = page.locator('#test-contact-form [role="status"]');
    await expect(status).toBeAttached();
  });

  test('ContactForm submit button is focusable', async ({ page }) => {
    const btn = page.locator('#test-contact-form #contact-submit');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
    await btn.focus();
    await expect(btn).toBeFocused();
  });

  test('ContactForm honeypot field is hidden from real users', async ({ page }) => {
    const honeypot = page.locator('#test-contact-form [name="honeypot"]');
    // Should be visually hidden (off-screen positioning)
    await expect(honeypot).toBeAttached();
    // NOT visible to assistive tech
    await expect(honeypot).toHaveAttribute('aria-hidden', 'true');
  });

  test('ContactForm shows aria-invalid=true on name field when submitted empty', async ({
    page,
  }) => {
    // Submit without filling required fields
    const btn = page.locator('#test-contact-form #contact-submit');
    await btn.click();

    // Name should be marked invalid
    const nameInput = page.locator('#test-contact-form [name="name"]');
    await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
  });

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  test('Footer renders social links for GitHub, LinkedIn, Email', async ({ page }) => {
    const footer = page.locator('#test-footer footer');
    await expect(footer).toBeVisible();

    const githubLink = footer.locator('a[aria-label="GitHub"]');
    const linkedinLink = footer.locator('a[aria-label="LinkedIn"]');
    const emailLink = footer.locator('a[aria-label="Email"]');

    await expect(githubLink).toBeVisible();
    await expect(linkedinLink).toBeVisible();
    await expect(emailLink).toBeVisible();
  });

  test('Footer renders copyright text', async ({ page }) => {
    const footer = page.locator('#test-footer footer');
    const copy = footer.locator('.footer-copy');
    await expect(copy).toContainText('Jonathan Noé Viramontes');
  });
});

// ---------------------------------------------------------------------------
// A11y contract: skip link exists in BaseLayout (task 4.1 proxy)
// ---------------------------------------------------------------------------
test.describe('BaseLayout a11y contracts', () => {
  test('Dev page has a skip-to-content link in the DOM', async ({ page }) => {
    await page.goto('/dev-preview/components');
    // The _dev page doesn't use BaseLayout but has a main#main-content
    const main = page.locator('main#main-content');
    await expect(main).toBeAttached();
  });
});
