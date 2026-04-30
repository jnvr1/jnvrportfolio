/**
 * Unit tests for src/utils/formatters.ts
 * Tests: formatYear, formatStack, truncate, slugify
 *
 * TDD: Written RED before implementation exists.
 */
import { describe, it, expect } from 'vitest';
import { formatYear, formatStack, truncate, slugify } from '../../src/utils/formatters';

// ---------------------------------------------------------------------------
// formatYear
// ---------------------------------------------------------------------------
describe('formatYear', () => {
  it('returns the year as string when no range given', () => {
    expect(formatYear(2024)).toBe('2024');
  });

  it('returns year–range string when range is provided', () => {
    expect(formatYear(2023, '2024')).toBe('2023–2024');
  });

  it('uses en-dash (U+2013) as separator, not hyphen', () => {
    const result = formatYear(2022, '2023');
    expect(result).toContain('–'); // en-dash
    expect(result).not.toContain('-'); // NOT hyphen-minus
  });

  it('handles range equal to year (single year span expressed as range)', () => {
    expect(formatYear(2024, '2024')).toBe('2024–2024');
  });

  it('converts numeric year to string without commas', () => {
    // 2024 must not become "2,024"
    expect(formatYear(2024)).toBe('2024');
  });
});

// ---------------------------------------------------------------------------
// formatStack
// ---------------------------------------------------------------------------
describe('formatStack', () => {
  it('joins items with " · " separator', () => {
    expect(formatStack(['React', 'TypeScript', 'Tailwind'])).toBe('React · TypeScript · Tailwind');
  });

  it('returns single item with no separator', () => {
    expect(formatStack(['Flutter'])).toBe('Flutter');
  });

  it('returns empty string for empty array', () => {
    expect(formatStack([])).toBe('');
  });

  it('uses middle dot (U+00B7) as separator character', () => {
    const result = formatStack(['A', 'B']);
    expect(result).toContain('·'); // · middle dot
  });

  it('preserves casing of each item', () => {
    expect(formatStack(['FastAPI', 'PostgreSQL', 'Redis'])).toBe('FastAPI · PostgreSQL · Redis');
  });
});

// ---------------------------------------------------------------------------
// truncate
// ---------------------------------------------------------------------------
describe('truncate', () => {
  it('does not truncate strings shorter than max', () => {
    expect(truncate('Hello world', 20)).toBe('Hello world');
  });

  it('does not truncate strings exactly at max', () => {
    expect(truncate('Hello world', 11)).toBe('Hello world');
  });

  it('truncates and adds ellipsis for strings over max', () => {
    const result = truncate('Hello world, this is a long string', 20);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(20 + 1); // allow for ellipsis char
  });

  it('does not break mid-word', () => {
    // "Hello world" — truncating at 8 chars should give "Hello…" not "Hello wo…"
    // "Hello wo" is 8 chars; walking back to last space gives "Hello"
    const result = truncate('Hello world', 8);
    // The result must NOT contain a partial word (partial = a word fragment followed by ellipsis)
    // "Hello…" is valid (complete word); "Hello wo…" is NOT valid (partial word "wo")
    expect(result).toBe('Hello…');
  });

  it('returns ellipsis-terminated string that fits within max + 1 char (for the …)', () => {
    const result = truncate('The quick brown fox jumps over the lazy dog', 15);
    // actual text portion must be <= max chars
    const text = result.endsWith('…') ? result.slice(0, -1) : result;
    expect(text.length).toBeLessThanOrEqual(15);
  });

  it('handles max larger than string length — no change', () => {
    expect(truncate('Hi', 100)).toBe('Hi');
  });

  it('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// slugify
// ---------------------------------------------------------------------------
describe('slugify', () => {
  it('lowercases the input', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz');
  });

  it('handles accented characters (é → e)', () => {
    expect(slugify('Café')).toBe('cafe');
  });

  it('handles accented characters (á, é, í, ó, ú → a, e, i, o, u)', () => {
    expect(slugify('Árbol Ámbar')).toBe('arbol-ambar');
  });

  it('handles ñ → n', () => {
    expect(slugify('España')).toBe('espana');
  });

  it('removes non-alphanumeric characters', () => {
    expect(slugify('Hello, World!')).toBe('hello-world');
  });

  it('collapses multiple consecutive separators', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('collapses separators created from multiple spaces', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('handles already-lowercase slug input', () => {
    expect(slugify('centinela-app')).toBe('centinela-app');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles mixed content: numbers preserved', () => {
    expect(slugify('React 19 App')).toBe('react-19-app');
  });

  it('handles dots and underscores as separators', () => {
    expect(slugify('my.project_name')).toBe('my-project-name');
  });
});
