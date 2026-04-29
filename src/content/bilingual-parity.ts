/**
 * Bilingual parity helper.
 * Checks that every project slug has both an ES and EN counterpart.
 * Used as a build-time guard (invoked from astro.config.mjs via astro:build:done hook)
 * and testable in unit context (no astro:content import — receives raw entries).
 */

export interface ParityEntry {
  slug: string;
  locale: 'es' | 'en';
}

export interface ParityResult {
  ok: boolean;
  missingEn: string[];
  missingEs: string[];
}

/**
 * Pure function: given a list of { slug, locale } entries, returns which slugs
 * are missing their EN or ES counterpart.
 */
export function checkBilingualParity(entries: ParityEntry[]): ParityResult {
  const es = new Set(entries.filter((e) => e.locale === 'es').map((e) => e.slug));
  const en = new Set(entries.filter((e) => e.locale === 'en').map((e) => e.slug));

  const missingEn = [...es].filter((s) => !en.has(s));
  const missingEs = [...en].filter((s) => !es.has(s));

  return {
    ok: missingEn.length === 0 && missingEs.length === 0,
    missingEn,
    missingEs,
  };
}

/**
 * Throws if parity is broken.
 * Call this from the astro:build:done hook (where getCollection is available).
 */
export function assertBilingualParity(entries: ParityEntry[]): void {
  const result = checkBilingualParity(entries);
  if (!result.ok) {
    throw new Error(
      `Bilingual parity broken.\n` +
        `  Missing EN: [${result.missingEn.join(', ')}]\n` +
        `  Missing ES: [${result.missingEs.join(', ')}]`,
    );
  }
}
