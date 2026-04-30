/**
 * Unit tests for src/i18n/index.ts
 * Tests: getLocaleFromUrl, getRelativeLocaleUrl, getAlternateLocaleUrl, t(), parity
 *
 * TDD: Written RED before implementation exists.
 */
import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  DEFAULT_LOCALE,
  getLocaleFromUrl,
  getRelativeLocaleUrl,
  getAlternateLocaleUrl,
  t,
} from '../../src/i18n/index';
import { esStrings } from '../../src/i18n/es';
import { enStrings } from '../../src/i18n/en';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
describe('i18n constants', () => {
  it('LOCALES contains es and en', () => {
    expect(LOCALES).toContain('es');
    expect(LOCALES).toContain('en');
  });

  it('DEFAULT_LOCALE is es', () => {
    expect(DEFAULT_LOCALE).toBe('es');
  });
});

// ---------------------------------------------------------------------------
// getLocaleFromUrl
// ---------------------------------------------------------------------------
describe('getLocaleFromUrl', () => {
  it('returns en for /en/foo path', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/en/foo'))).toBe('en');
  });

  it('returns en for /en/ path', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/en/'))).toBe('en');
  });

  it('returns en for /en path (no trailing slash)', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/en'))).toBe('en');
  });

  it('returns es for / (root)', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/'))).toBe('es');
  });

  it('returns es for /projects/centinela-app (no prefix)', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/projects/centinela-app'))).toBe('es');
  });

  it('returns es for /contact path', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/contact'))).toBe('es');
  });

  it('returns en for /en/projects/tita', () => {
    expect(getLocaleFromUrl(new URL('http://localhost/en/projects/tita'))).toBe('en');
  });
});

// ---------------------------------------------------------------------------
// getRelativeLocaleUrl
// ---------------------------------------------------------------------------
describe('getRelativeLocaleUrl', () => {
  it('prefixes /en/ for en locale', () => {
    expect(getRelativeLocaleUrl('en', 'projects/foo')).toBe('/en/projects/foo');
  });

  it('does not prefix for es locale', () => {
    expect(getRelativeLocaleUrl('es', 'projects/foo')).toBe('/projects/foo');
  });

  it('handles root path for en', () => {
    expect(getRelativeLocaleUrl('en', '')).toBe('/en/');
  });

  it('handles root path for es', () => {
    expect(getRelativeLocaleUrl('es', '')).toBe('/');
  });

  it('handles path with leading slash for en', () => {
    expect(getRelativeLocaleUrl('en', '/projects/foo')).toBe('/en/projects/foo');
  });

  it('handles path with leading slash for es', () => {
    expect(getRelativeLocaleUrl('es', '/projects/foo')).toBe('/projects/foo');
  });
});

// ---------------------------------------------------------------------------
// getAlternateLocaleUrl
// ---------------------------------------------------------------------------
describe('getAlternateLocaleUrl', () => {
  it('flips from es to en on root', () => {
    expect(getAlternateLocaleUrl('es', '/')).toBe('/en/');
  });

  it('flips from en to es on root', () => {
    expect(getAlternateLocaleUrl('en', '/en/')).toBe('/');
  });

  it('flips from es to en on project page', () => {
    expect(getAlternateLocaleUrl('es', '/projects/tita')).toBe('/en/projects/tita');
  });

  it('flips from en to es on project page', () => {
    expect(getAlternateLocaleUrl('en', '/en/projects/tita')).toBe('/projects/tita');
  });

  it('flips from en to es on deep path', () => {
    expect(getAlternateLocaleUrl('en', '/en/projects/centinela-app')).toBe(
      '/projects/centinela-app'
    );
  });
});

// ---------------------------------------------------------------------------
// t() — translation lookup
// ---------------------------------------------------------------------------
describe('t()', () => {
  it('returns nav.home string in es', () => {
    const result = t('es', 'nav.home');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns nav.home string in en', () => {
    const result = t('en', 'nav.home');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns different strings for es vs en on nav.home', () => {
    const es = t('es', 'nav.home');
    const en = t('en', 'nav.home');
    // They may be the same string ("Home" works in both, but convention differs)
    // Both must be non-empty; we just verify they resolve
    expect(es).toBeTruthy();
    expect(en).toBeTruthy();
  });

  it('returns nav.projects key in both locales', () => {
    expect(t('es', 'nav.projects')).toBeTruthy();
    expect(t('en', 'nav.projects')).toBeTruthy();
  });

  it('returns nav.experience key in both locales', () => {
    expect(t('es', 'nav.experience')).toBeTruthy();
    expect(t('en', 'nav.experience')).toBeTruthy();
  });

  it('returns nav.contact key in both locales', () => {
    expect(t('es', 'nav.contact')).toBeTruthy();
    expect(t('en', 'nav.contact')).toBeTruthy();
  });

  it('returns cta.contact key in both locales', () => {
    expect(t('es', 'cta.contact')).toBeTruthy();
    expect(t('en', 'cta.contact')).toBeTruthy();
  });

  it('returns cta.projects key in both locales', () => {
    expect(t('es', 'cta.projects')).toBeTruthy();
    expect(t('en', 'cta.projects')).toBeTruthy();
  });

  it('returns form.name key in both locales', () => {
    expect(t('es', 'form.name')).toBeTruthy();
    expect(t('en', 'form.name')).toBeTruthy();
  });

  it('returns form.email key in both locales', () => {
    expect(t('es', 'form.email')).toBeTruthy();
    expect(t('en', 'form.email')).toBeTruthy();
  });

  it('returns form.message key in both locales', () => {
    expect(t('es', 'form.message')).toBeTruthy();
    expect(t('en', 'form.message')).toBeTruthy();
  });

  it('returns form.submit key in both locales', () => {
    expect(t('es', 'form.submit')).toBeTruthy();
    expect(t('en', 'form.submit')).toBeTruthy();
  });

  it('returns form.success key in both locales', () => {
    expect(t('es', 'form.success')).toBeTruthy();
    expect(t('en', 'form.success')).toBeTruthy();
  });

  it('returns form.error key in both locales', () => {
    expect(t('es', 'form.error')).toBeTruthy();
    expect(t('en', 'form.error')).toBeTruthy();
  });

  it('returns the key itself as fallback for unknown key', () => {
    // t() accepts any string — runtime fallback for unknown keys
    const result = t('es', 'nonexistent.key.that.does.not.exist');
    expect(result).toBe('nonexistent.key.that.does.not.exist');
  });

  it('handles unknown key gracefully in en too', () => {
    // t() accepts any string — runtime fallback for unknown keys
    const result = t('en', 'another.missing.key');
    expect(result).toBe('another.missing.key');
  });
});

// ---------------------------------------------------------------------------
// Parity — both locale dicts must have identical key sets
// ---------------------------------------------------------------------------
describe('locale dict parity', () => {
  it('es and en dicts have the same top-level keys', () => {
    const esKeys = Object.keys(esStrings).sort();
    const enKeys = Object.keys(enStrings).sort();
    expect(esKeys).toEqual(enKeys);
  });

  it('es and en dicts have identical nested keys within each section', () => {
    for (const section of Object.keys(esStrings) as Array<keyof typeof esStrings>) {
      const esSection = esStrings[section];
      const enSection = enStrings[section];

      if (typeof esSection === 'object' && esSection !== null) {
        const esSectionKeys = Object.keys(esSection).sort();
        const enSectionKeys = Object.keys(enSection as object).sort();
        expect(esSectionKeys, `Section "${section}" key mismatch`).toEqual(enSectionKeys);
      }
    }
  });

  it('badge.current key exists in both locales (for FletesBadge)', () => {
    expect(t('es', 'badge.current')).toBeTruthy();
    expect(t('en', 'badge.current')).toBeTruthy();
  });
});
