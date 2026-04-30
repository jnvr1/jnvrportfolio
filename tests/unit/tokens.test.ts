import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const TOKENS_PATH = resolve(process.cwd(), 'src/styles/tokens.css');
const FONTS_PATH = resolve(process.cwd(), 'src/styles/fonts.css');

// ── Helper ───────────────────────────────────────────────────────────────────

function extractCustomProperties(css: string): Map<string, string> {
  const map = new Map<string, string>();
  // Matches --name: value; (value can contain spaces, #, parens)
  const re = /(--[\w-]+)\s*:\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    map.set(m[1].trim(), m[2].trim());
  }
  return map;
}

// ── tokens.css ───────────────────────────────────────────────────────────────

describe('tokens.css — required color custom properties', () => {
  let css: string;
  let props: Map<string, string>;

  beforeAll(() => {
    css = readFileSync(TOKENS_PATH, 'utf-8');
    props = extractCustomProperties(css);
  });

  const REQUIRED_TOKENS: Record<string, string> = {
    '--bg': '#0A1929',
    '--surface': '#0F293F',
    '--surface-elevated': '#1A3A5C',
    '--border': '#1F4060',
    '--text': '#FFFFFF',
    '--text-muted': '#A7A6A8',
    '--brand': '#73A0BE',
    '--brand-strong': '#4A7A98',
    '--accent': '#A8C9DD',
    '--success': '#3FB950',
    '--danger': '#F85149',
  };

  it('defines exactly 11 required color tokens', () => {
    const colorTokens = [...props.keys()].filter((k) => REQUIRED_TOKENS[k]);
    expect(colorTokens).toHaveLength(11);
  });

  for (const [token, value] of Object.entries(REQUIRED_TOKENS)) {
    it(`${token} equals ${value}`, () => {
      expect(props.get(token)).toBe(value);
    });
  }

  it('does not contain prefers-color-scheme media query (dark-only)', () => {
    expect(css).not.toMatch(/prefers-color-scheme/);
  });
});

describe('tokens.css — spacing scale', () => {
  let props: Map<string, string>;

  beforeAll(() => {
    const css = readFileSync(TOKENS_PATH, 'utf-8');
    props = extractCustomProperties(css);
  });

  it('has at least 8 spacing steps', () => {
    const steps = [...props.keys()].filter((k) => k.startsWith('--space-'));
    expect(steps.length).toBeGreaterThanOrEqual(8);
  });

  it('--space-1 is 4px (base unit)', () => {
    expect(props.get('--space-1')).toBe('4px');
  });
});

describe('tokens.css — typography tokens', () => {
  let props: Map<string, string>;

  beforeAll(() => {
    const css = readFileSync(TOKENS_PATH, 'utf-8');
    props = extractCustomProperties(css);
  });

  it('defines --font-heading', () => {
    expect(props.has('--font-heading')).toBe(true);
  });

  it('defines --font-body', () => {
    expect(props.has('--font-body')).toBe(true);
  });

  it('defines --font-mono', () => {
    expect(props.has('--font-mono')).toBe(true);
  });
});

// ── fonts.css ────────────────────────────────────────────────────────────────

describe('fonts.css — CLS regression guards', () => {
  let css: string;

  beforeAll(() => {
    css = readFileSync(FONTS_PATH, 'utf-8');
  });

  it('includes size-adjust on at least one @font-face', () => {
    expect(css).toMatch(/size-adjust/);
  });

  it('includes ascent-override on at least one @font-face', () => {
    expect(css).toMatch(/ascent-override/);
  });

  it('includes descent-override on at least one @font-face', () => {
    expect(css).toMatch(/descent-override/);
  });

  it('uses font-display: swap', () => {
    expect(css).toMatch(/font-display\s*:\s*swap/);
  });

  it('does not reference fonts.googleapis.com or fonts.gstatic.com', () => {
    expect(css).not.toMatch(/fonts\.googleapis\.com/);
    expect(css).not.toMatch(/fonts\.gstatic\.com/);
  });

  it('declares @font-face for Inter', () => {
    expect(css).toMatch(/Inter/);
  });

  it('declares @font-face for Bricolage Grotesque', () => {
    expect(css).toMatch(/Bricolage Grotesque/);
  });

  it('declares @font-face for JetBrains Mono', () => {
    expect(css).toMatch(/JetBrains Mono/);
  });
});
