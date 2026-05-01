/**
 * Raw Zod schemas for content collections.
 * Exported separately from content.config.ts so unit tests can import them
 * without pulling in astro:content (which is unavailable in Vitest context).
 */
import { z } from 'zod';

export const CLIENTS = ['Bloomotion','Centinela', 'Teotech', 'FEMN', 'Personal'] as const;
export const LOCALES = ['es', 'en'] as const;

/**
 * Schema for a single project entry (validated per file in the collection).
 * Does NOT use the astro image() helper — that wrapping happens in content.config.ts.
 * The `cover` field here is typed as a string path; the real schema in content.config.ts
 * wraps with image() for build-time asset optimization.
 */
export const projectsSchema = z
  .object({
    title: z.string().min(3).max(80),
    // NOTE: Astro 5 strips 'slug' from frontmatter before Zod validation for type:'content'
    // collections (it uses the slug value as the entry id instead). Mark as optional here
    // so the schema doesn't fail when Astro omits it. Use entry.id in components.
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
    client: z.enum(CLIENTS),
    year: z.number().int().min(2018).max(2030),
    yearRange: z.string().optional(),
    stack: z.array(z.string()).min(1).max(8),
    summary: z.string().max(160),
    role: z.string().max(120),
    cover: z.string().optional(), // string path for unit tests; image() in astro context
    placeholder: z.boolean().default(false),
    confidential: z.boolean().default(false),
    priority: z.enum(['P0', 'P1']).default('P1'),
    links: z
      .object({
        live: z.string().url().optional(),
        repo: z.string().url().optional(),
      })
      .optional(),
    locale: z.enum(LOCALES),
    publishedAt: z.date().optional(),
    order: z.number().int().optional(),
  })
  .refine((d) => d.placeholder || d.cover, {
    message: 'cover is required when placeholder is false',
  });

export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startYear: z.number().int(),
  endYear: z.number().int().optional(),
  current: z.boolean().default(false),
  featured: z.boolean().default(false),
  location: z.string().optional(),
  summary: z.string().max(280),
  highlights: z.array(z.string().max(160)).max(5).optional(),
  stack: z.array(z.string()).optional(),
  locale: z.enum(LOCALES),
  order: z.number().int(),
});

export type ProjectEntry = z.infer<typeof projectsSchema>;
export type ExperienceEntry = z.infer<typeof experienceSchema>;
