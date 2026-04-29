import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const FIREBASE_JSON_PATH = resolve(process.cwd(), 'firebase.json');

describe('firebase.json structure', () => {
  let config: Record<string, unknown>;

  beforeEach(() => {
    const raw = readFileSync(FIREBASE_JSON_PATH, 'utf-8');
    config = JSON.parse(raw) as Record<string, unknown>;
  });

  it('hosting.public is "dist"', () => {
    const hosting = config.hosting as Record<string, unknown>;
    expect(hosting.public).toBe('dist');
  });

  it('cleanUrls is true', () => {
    const hosting = config.hosting as Record<string, unknown>;
    expect(hosting.cleanUrls).toBe(true);
  });

  it('no SPA rewrite pointing to /index.html', () => {
    const hosting = config.hosting as Record<string, unknown>;
    const rewrites = hosting.rewrites as Array<{ source: string; destination: string }>;
    const spaRewrite = rewrites.find(
      (r) => r.source === '**' && r.destination === '/index.html',
    );
    expect(spaRewrite).toBeUndefined();
  });

  it('404 fallback rewrite points to /404.html', () => {
    const hosting = config.hosting as Record<string, unknown>;
    const rewrites = hosting.rewrites as Array<{ source: string; destination: string }>;
    const fallback = rewrites.find(
      (r) => r.source === '**' && r.destination === '/404.html',
    );
    expect(fallback).toBeDefined();
  });

  it('/_astro/** has immutable Cache-Control header', () => {
    const hosting = config.hosting as Record<string, unknown>;
    const headers = hosting.headers as Array<{
      source: string;
      headers: Array<{ key: string; value: string }>;
    }>;
    const astroHeader = headers.find((h) => h.source === '/_astro/**');
    expect(astroHeader).toBeDefined();
    const cc = astroHeader?.headers.find((h) => h.key === 'Cache-Control');
    expect(cc?.value).toContain('immutable');
  });
});
