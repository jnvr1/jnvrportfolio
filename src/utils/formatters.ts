/**
 * Formatting utilities for the JNVR portfolio.
 *
 * - formatYear(year, range?) — "2024" or "2023–2024"
 * - formatStack(stack[])    — "React · TypeScript · Tailwind"
 * - truncate(text, max)     — word-boundary truncation with ellipsis
 * - slugify(input)          — URL-safe slug from arbitrary strings
 */

// ---------------------------------------------------------------------------
// formatYear
// Returns the year as a plain string, or "startYear–endYear" when a range is given.
// Uses en-dash (U+2013) as the range separator, per design convention.
// ---------------------------------------------------------------------------
export function formatYear(year: number, range?: string): string {
  if (range !== undefined) {
    return `${year}–${range}`; // en-dash
  }
  return String(year);
}

// ---------------------------------------------------------------------------
// formatStack
// Joins a stack array with " · " (space + middle dot U+00B7 + space).
// Returns empty string for empty arrays.
// ---------------------------------------------------------------------------
const STACK_SEPARATOR = ' · '; // " · "

export function formatStack(stack: string[]): string {
  return stack.join(STACK_SEPARATOR);
}

// ---------------------------------------------------------------------------
// truncate
// Truncates text to at most `max` characters without breaking mid-word.
// Appends "…" (U+2026 HORIZONTAL ELLIPSIS) when truncation occurs.
// If the text is already within max characters, it is returned unchanged.
// ---------------------------------------------------------------------------
export function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }

  // Slice at max, then walk back to the last word boundary (space or start)
  let sliced = text.slice(0, max);

  // Find the last space within the sliced portion
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > 0) {
    sliced = sliced.slice(0, lastSpace);
  }

  return sliced.trimEnd() + '…'; // …
}

// ---------------------------------------------------------------------------
// slugify
// Generates URL-safe slugs from arbitrary strings.
// Steps:
//   1. Unicode normalise (NFD) to decompose accented chars
//   2. Strip combining diacritical marks (0x0300-0x036f)
//   3. Lowercase
//   4. Replace dots, underscores, and non-alphanumeric chars with hyphens
//   5. Collapse repeated hyphens
//   6. Trim leading/trailing hyphens
// ---------------------------------------------------------------------------
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    // Remove combining diacritical marks (strips accents, tildes, etc.)
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    // Replace any non-alphanumeric character (including dots, underscores, spaces) with hyphen
    .replace(/[^a-z0-9]+/g, '-')
    // Collapse multiple consecutive hyphens
    .replace(/-{2,}/g, '-')
    // Trim leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}
