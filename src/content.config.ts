import { defineCollection, z } from 'astro:content';

const CLIENTS = ['Angel', 'Teotech', 'FEMN', 'Personal'] as const;
const LOCALES = ['es', 'en'] as const;

const projects = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(3).max(80),
        slug: z.string().regex(/^[a-z0-9-]+$/),
        client: z.enum(CLIENTS),
        year: z.number().int().min(2018).max(2030),
        yearRange: z.string().optional(),
        stack: z.array(z.string()).min(1).max(8),
        summary: z.string().max(160),
        role: z.string().max(120),
        cover: image().optional(),
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
      }),
});

const experience = defineCollection({
  type: 'content',
  schema: z.object({
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
  }),
});

export const collections = { projects, experience };
