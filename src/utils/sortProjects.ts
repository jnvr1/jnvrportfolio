/**
 * sortProjects — sort utility for project collections.
 *
 * Accepts a minimal SortableProject interface so the function can be unit-tested
 * without importing astro:content (which is unavailable in Vitest context).
 *
 * Usage with real Astro collection entries:
 *   const sorted = sortProjects(projects.map(p => p.data), 'featured-first');
 *
 * Strategies:
 *   'year-desc'      — newest first (stable: equal-year items keep input order)
 *   'client'         — grouped by client in canonical order: Centinela, Teotech, FEMN, Personal
 *   'featured-first' — featured:true entries first, then year-desc within each tier (default)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Canonical client sort order per design.md CLIENTS enum. */
const CLIENT_ORDER = ['Bloomotion','Centinela', 'Teotech', 'FEMN', 'Personal'] as const;
type Client = (typeof CLIENT_ORDER)[number];

/** Minimal shape required for sorting — a subset of ProjectEntry from schemas.ts. */
export interface SortableProject {
  slug: string;
  title?: string;
  client: Client;
  year: number;
  featured: boolean;
  order?: number;
  placeholder?: boolean;
}

export type SortStrategy = 'year-desc' | 'client' | 'featured-first';

// ---------------------------------------------------------------------------
// sortProjects
// ---------------------------------------------------------------------------

/**
 * Returns a new sorted array. Does NOT mutate the input.
 *
 * @param projects — array of sortable project objects
 * @param strategy — one of 'year-desc' | 'client' | 'featured-first'
 */
export function sortProjects<T extends SortableProject>(
  projects: T[],
  strategy: SortStrategy = 'featured-first'
): T[] {
  // Always work on a shallow copy to preserve input array order (immutability)
  const copy = [...projects];

  switch (strategy) {
    case 'year-desc':
      return stableSort(copy, compareYearDesc);

    case 'client':
      return stableSort(copy, compareClient);

    case 'featured-first':
      return stableSort(copy, compareFeaturedFirst);

    default:
      return copy;
  }
}

// ---------------------------------------------------------------------------
// Comparators
// ---------------------------------------------------------------------------

/** Newest year first; ties resolve to 0 (stable sort preserves input order). */
function compareYearDesc<T extends SortableProject>(a: T, b: T): number {
  return b.year - a.year;
}

/** Canonical client group order. Within a group, preserve input order (return 0). */
function compareClient<T extends SortableProject>(a: T, b: T): number {
  const ia = CLIENT_ORDER.indexOf(a.client as Client);
  const ib = CLIENT_ORDER.indexOf(b.client as Client);
  // Unknown clients (not in enum) sort last
  const normA = ia === -1 ? CLIENT_ORDER.length : ia;
  const normB = ib === -1 ? CLIENT_ORDER.length : ib;
  return normA - normB;
}

/**
 * Featured projects first (featured:true before featured:false).
 * Within each tier, sort by year descending.
 * Ties within same tier+year resolve to 0 → stable sort preserves input order.
 */
function compareFeaturedFirst<T extends SortableProject>(a: T, b: T): number {
  // Tier comparison: featured=1 (higher priority → lower index → negative diff means a goes first)
  const tierA = a.featured ? 0 : 1;
  const tierB = b.featured ? 0 : 1;

  if (tierA !== tierB) {
    return tierA - tierB;
  }

  // Same tier: newest first
  return b.year - a.year;
}

// ---------------------------------------------------------------------------
// Stable sort implementation
// ---------------------------------------------------------------------------

/**
 * A stable sort that preserves input order for equal elements.
 * Array.prototype.sort() is guaranteed stable in V8 since Node 11 and all
 * modern browsers, but we annotate explicitly for clarity.
 */
function stableSort<T>(arr: T[], compareFn: (a: T, b: T) => number): T[] {
  // Tag each element with its original index for tie-breaking
  return arr
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const cmp = compareFn(a.item, b.item);
      return cmp !== 0 ? cmp : a.index - b.index;
    })
    .map(({ item }) => item);
}
