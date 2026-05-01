/**
 * Unit tests for src/utils/sortProjects.ts
 * Tests: year-desc, client, featured-first strategies, stable sort
 *
 * TDD: Written RED before implementation exists.
 *
 * ProjectEntry type comes from src/content/schemas.ts (mock-friendly, no astro:content import).
 * The sort function accepts a minimal subset of the fields it needs — no need for full entries.
 */
import { describe, it, expect } from 'vitest';
import { sortProjects } from '../../src/utils/sortProjects';
import type { SortableProject } from '../../src/utils/sortProjects';

// ---------------------------------------------------------------------------
// Helpers to build minimal test fixtures
// ---------------------------------------------------------------------------
function makeProject(
  overrides: Partial<SortableProject> & { slug: string }
): SortableProject {
  return {
    slug: overrides.slug,
    title: overrides.title ?? `Project ${overrides.slug}`,
    client: overrides.client ?? 'Personal',
    year: overrides.year ?? 2023,
    featured: overrides.featured ?? false,
    order: overrides.order,
    placeholder: overrides.placeholder ?? true,
  };
}

// ---------------------------------------------------------------------------
// Strategy: year-desc
// ---------------------------------------------------------------------------
describe('sortProjects — year-desc', () => {
  it('orders projects by year descending', () => {
    const input = [
      makeProject({ slug: 'a', year: 2021 }),
      makeProject({ slug: 'b', year: 2024 }),
      makeProject({ slug: 'c', year: 2019 }),
    ];
    const result = sortProjects(input, 'year-desc');
    expect(result.map((p) => p.year)).toEqual([2024, 2021, 2019]);
  });

  it('is stable — equal-year items keep input order', () => {
    const input = [
      makeProject({ slug: 'x', year: 2022 }),
      makeProject({ slug: 'y', year: 2022 }),
      makeProject({ slug: 'z', year: 2022 }),
    ];
    const result = sortProjects(input, 'year-desc');
    expect(result.map((p) => p.slug)).toEqual(['x', 'y', 'z']);
  });

  it('places newest single project first', () => {
    const input = [
      makeProject({ slug: 'old', year: 2018 }),
      makeProject({ slug: 'new', year: 2025 }),
    ];
    const result = sortProjects(input, 'year-desc');
    expect(result[0].slug).toBe('new');
    expect(result[1].slug).toBe('old');
  });

  it('handles single-item array', () => {
    const input = [makeProject({ slug: 'solo', year: 2023 })];
    const result = sortProjects(input, 'year-desc');
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('solo');
  });

  it('handles empty array', () => {
    expect(sortProjects([], 'year-desc')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Strategy: client
// The canonical client order from design.md CLIENTS enum: Bloomotion, Centinela, Teotech, FEMN, Personal
// ---------------------------------------------------------------------------
describe('sortProjects — client', () => {
  it('groups by client in canonical order: Bloomotion, Centinela, Teotech, FEMN, Personal', () => {
    const input = [
      makeProject({ slug: 'personal-1', client: 'Personal' }),
      makeProject({ slug: 'femn-1', client: 'FEMN' }),
      makeProject({ slug: 'bloomotion-1', client: 'Bloomotion' }),
      makeProject({ slug: 'centinela-1', client: 'Centinela' }),
      makeProject({ slug: 'teotech-1', client: 'Teotech' }),
    ];
    const result = sortProjects(input, 'client');
    expect(result.map((p) => p.client)).toEqual(['Bloomotion', 'Centinela', 'Teotech', 'FEMN', 'Personal']);
  });

  it('groups multiple projects of same client together', () => {
    const input = [
      makeProject({ slug: 'p1', client: 'Personal' }),
      makeProject({ slug: 'a1', client: 'Bloomotion' }),
      makeProject({ slug: 'p2', client: 'Personal' }),
      makeProject({ slug: 'a2', client: 'Bloomotion' }),
    ];
    const result = sortProjects(input, 'client');
    const clients = result.map((p) => p.client);
    // Bloomotion group comes first, then Personal
    expect(clients.slice(0, 2)).toEqual(['Bloomotion', 'Bloomotion']);
    expect(clients.slice(2, 4)).toEqual(['Personal', 'Personal']);
  });

  it('is stable within each client group — preserves input order', () => {
    const input = [
      makeProject({ slug: 'a1', client: 'Bloomotion' }),
      makeProject({ slug: 'a2', client: 'Bloomotion' }),
    ];
    const result = sortProjects(input, 'client');
    expect(result.map((p) => p.slug)).toEqual(['a1', 'a2']);
  });

  it('handles empty array', () => {
    expect(sortProjects([], 'client')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Strategy: featured-first (default)
// featured:true projects come first; within each tier, order is year-desc
// ---------------------------------------------------------------------------
describe('sortProjects — featured-first', () => {
  it('puts featured projects before non-featured', () => {
    const input = [
      makeProject({ slug: 'regular', year: 2024, featured: false }),
      makeProject({ slug: 'star', year: 2020, featured: true }),
    ];
    const result = sortProjects(input, 'featured-first');
    expect(result[0].slug).toBe('star');
    expect(result[1].slug).toBe('regular');
  });

  it('within featured tier: orders by year desc', () => {
    const input = [
      makeProject({ slug: 'f-old', year: 2019, featured: true }),
      makeProject({ slug: 'f-new', year: 2023, featured: true }),
    ];
    const result = sortProjects(input, 'featured-first');
    expect(result[0].slug).toBe('f-new');
    expect(result[1].slug).toBe('f-old');
  });

  it('within non-featured tier: orders by year desc', () => {
    const input = [
      makeProject({ slug: 'nf-old', year: 2018, featured: false }),
      makeProject({ slug: 'nf-new', year: 2022, featured: false }),
    ];
    const result = sortProjects(input, 'featured-first');
    expect(result[0].slug).toBe('nf-new');
    expect(result[1].slug).toBe('nf-old');
  });

  it('stable: equal-year non-featured items keep input order', () => {
    const input = [
      makeProject({ slug: 'nf-x', year: 2022, featured: false }),
      makeProject({ slug: 'nf-y', year: 2022, featured: false }),
    ];
    const result = sortProjects(input, 'featured-first');
    expect(result.map((p) => p.slug)).toEqual(['nf-x', 'nf-y']);
  });

  it('mixed: featured+non-featured, multiple years', () => {
    const input = [
      makeProject({ slug: 'nf1', year: 2024, featured: false }),
      makeProject({ slug: 'f1', year: 2021, featured: true }),
      makeProject({ slug: 'nf2', year: 2022, featured: false }),
      makeProject({ slug: 'f2', year: 2023, featured: true }),
    ];
    const result = sortProjects(input, 'featured-first');
    // Featured first (year-desc within tier): f2(2023), f1(2021)
    // Non-featured next (year-desc within tier): nf1(2024), nf2(2022)
    expect(result.map((p) => p.slug)).toEqual(['f2', 'f1', 'nf1', 'nf2']);
  });

  it('handles all featured projects', () => {
    const input = [
      makeProject({ slug: 'a', year: 2020, featured: true }),
      makeProject({ slug: 'b', year: 2024, featured: true }),
    ];
    const result = sortProjects(input, 'featured-first');
    expect(result[0].slug).toBe('b');
    expect(result[1].slug).toBe('a');
  });

  it('handles empty array', () => {
    expect(sortProjects([], 'featured-first')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Immutability — original array must not be mutated
// ---------------------------------------------------------------------------
describe('sortProjects — immutability', () => {
  it('does not mutate the input array', () => {
    const input = [
      makeProject({ slug: 'a', year: 2024 }),
      makeProject({ slug: 'b', year: 2020 }),
    ];
    const originalOrder = input.map((p) => p.slug);
    sortProjects(input, 'year-desc');
    expect(input.map((p) => p.slug)).toEqual(originalOrder);
  });
});
