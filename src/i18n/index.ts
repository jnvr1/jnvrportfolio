/**
 * i18n helpers for the JNVR portfolio.
 *
 * - LOCALES / Locale / DEFAULT_LOCALE — locale primitives
 * - getLocaleFromUrl(url) — extracts locale from a URL object
 * - getRelativeLocaleUrl(locale, path) — builds a locale-prefixed path
 * - getAlternateLocaleUrl(currentLocale, currentPath) — returns the same page in the other locale
 * - t(locale, key) — returns a UI string by dot-separated key; falls back to the key itself
 *
 * Design decision: ES is the default locale (`prefixDefaultLocale: false`), meaning ES
 * routes have no prefix (/projects/foo) and EN routes have /en/ prefix (/en/projects/foo).
 */
import { esStrings } from './es';
import { enStrings } from './en';

// ---------------------------------------------------------------------------
// Locale primitives
// ---------------------------------------------------------------------------
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

// ---------------------------------------------------------------------------
// Dictionary map
// ---------------------------------------------------------------------------
const dicts = {
  es: esStrings,
  en: enStrings,
} as const;

// ---------------------------------------------------------------------------
// getLocaleFromUrl
// Extracts 'en' from /en/... paths; defaults to 'es' for everything else.
// ---------------------------------------------------------------------------
export function getLocaleFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  if ((LOCALES as readonly string[]).includes(first) && first !== DEFAULT_LOCALE) {
    return first as Locale;
  }
  return DEFAULT_LOCALE;
}

// ---------------------------------------------------------------------------
// getRelativeLocaleUrl
// Builds /en/projects/foo for en, /projects/foo for es.
// ---------------------------------------------------------------------------
export function getRelativeLocaleUrl(locale: Locale, path: string): string {
  // Normalize: strip leading slash from path
  const normalised = path.startsWith('/') ? path.slice(1) : path;

  if (locale === DEFAULT_LOCALE) {
    return normalised ? `/${normalised}` : '/';
  }

  return normalised ? `/${locale}/${normalised}` : `/${locale}/`;
}

// ---------------------------------------------------------------------------
// getAlternateLocaleUrl
// Given the CURRENT locale and CURRENT path, returns the URL for the OTHER locale.
// currentPath is expected to be a relative URL string, e.g., '/projects/tita' or '/en/projects/tita'.
// ---------------------------------------------------------------------------
export function getAlternateLocaleUrl(currentLocale: Locale, currentPath: string): string {
  const otherLocale: Locale = currentLocale === 'es' ? 'en' : 'es';

  if (currentLocale === DEFAULT_LOCALE) {
    // Current: /projects/tita  →  other: /en/projects/tita
    // Strip leading slash to get the bare path
    const bare = currentPath.startsWith('/') ? currentPath.slice(1) : currentPath;
    return getRelativeLocaleUrl(otherLocale, bare);
  } else {
    // Current: /en/projects/tita  →  other (es): /projects/tita
    // Strip the /{locale}/ prefix
    const prefix = `/${currentLocale}`;
    const withoutPrefix = currentPath.startsWith(prefix)
      ? currentPath.slice(prefix.length)
      : currentPath;
    // withoutPrefix may start with / already
    const bare = withoutPrefix.startsWith('/') ? withoutPrefix.slice(1) : withoutPrefix;
    return getRelativeLocaleUrl(otherLocale, bare);
  }
}

// ---------------------------------------------------------------------------
// t() — flat dot-key lookup into nested string dictionaries
// Falls back to the key itself when not found (never throws).
// ---------------------------------------------------------------------------

// Build a flat key → value map at module init time for O(1) lookup
type FlatDict = Record<string, string>;

function flatten(obj: object, prefix = ''): FlatDict {
  const result: FlatDict = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      result[key] = v;
    } else if (typeof v === 'function') {
      // Skip function values (e.g., showingCount) — they are not looked up via t()
    } else if (typeof v === 'object' && v !== null) {
      Object.assign(result, flatten(v as object, key));
    }
  }
  return result;
}

const flatDicts: Record<Locale, FlatDict> = {
  es: flatten(esStrings),
  en: flatten(enStrings),
};

// Derive the union of valid keys from the ES dict (canonical shape)
type DeepKeys<T> = T extends object
  ? { [K in keyof T]: K extends string ? `${K}` | `${K}.${DeepKeys<T[K]>}` : never }[keyof T]
  : never;

// Filter to string-valued leaves only
type StringLeafKeys<T> = {
  [K in DeepKeys<T>]: K extends string
    ? // Resolve the value type by walking the path (best-effort — TS won't deep-infer perfectly)
      string extends string
      ? K
      : never
    : never;
}[DeepKeys<T>];

// For type safety on callers: accept any string (not just known keys) so it degrades gracefully
export function t(locale: Locale, key: string): string {
  return flatDicts[locale][key] ?? key;
}
