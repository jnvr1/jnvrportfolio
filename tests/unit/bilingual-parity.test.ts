/**
 * Unit tests for assertBilingualParity helper.
 * Strict TDD: written BEFORE implementation.
 * The helper receives the collection entries directly (no astro:content import needed).
 */
import { describe, it, expect } from 'vitest';
import { checkBilingualParity, type ParityEntry } from '../../src/content/bilingual-parity';

function makeEntries(esSlug: string[], enSlug: string[]): ParityEntry[] {
  const es: ParityEntry[] = esSlug.map((slug) => ({ slug, locale: 'es' as const }));
  const en: ParityEntry[] = enSlug.map((slug) => ({ slug, locale: 'en' as const }));
  return [...es, ...en];
}

describe('checkBilingualParity', () => {
  it('returns success when all ES slugs have an EN counterpart', () => {
    const entries = makeEntries(['centinela-app', 'femn'], ['centinela-app', 'femn']);
    const result = checkBilingualParity(entries);
    expect(result.ok).toBe(true);
    expect(result.missingEn).toHaveLength(0);
    expect(result.missingEs).toHaveLength(0);
  });

  it('detects when an ES project lacks an EN counterpart', () => {
    const entries = makeEntries(['centinela-app', 'femn'], ['centinela-app']);
    const result = checkBilingualParity(entries);
    expect(result.ok).toBe(false);
    expect(result.missingEn).toContain('femn');
    expect(result.missingEs).toHaveLength(0);
  });

  it('detects when an EN project lacks an ES counterpart', () => {
    const entries = makeEntries(['centinela-app'], ['centinela-app', 'tita']);
    const result = checkBilingualParity(entries);
    expect(result.ok).toBe(false);
    expect(result.missingEs).toContain('tita');
    expect(result.missingEn).toHaveLength(0);
  });

  it('detects multiple gaps in both directions simultaneously', () => {
    const entries = makeEntries(
      ['centinela-app', 'femn', 'tita'],
      ['centinela-app', 'pos-la-brocha'],
    );
    const result = checkBilingualParity(entries);
    expect(result.ok).toBe(false);
    expect(result.missingEn).toContain('femn');
    expect(result.missingEn).toContain('tita');
    expect(result.missingEs).toContain('pos-la-brocha');
  });

  it('returns success for an empty collection (edge case)', () => {
    const result = checkBilingualParity([]);
    expect(result.ok).toBe(true);
  });
});
