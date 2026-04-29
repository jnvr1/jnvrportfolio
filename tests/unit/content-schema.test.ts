/**
 * Unit tests for Zod schemas: projects and experience collections.
 * Strict TDD: written BEFORE implementation. Tests import from src/content/schemas.ts
 * which exports raw Zod schemas (no astro:content dependency in test context).
 */
import { describe, it, expect } from 'vitest';
import { projectsSchema, experienceSchema } from '../../src/content/schemas';

// ---------------------------------------------------------------------------
// projects schema
// ---------------------------------------------------------------------------

describe('projectsSchema', () => {
  const validProject = {
    title: 'Centinela App',
    slug: 'centinela-app',
    client: 'Angel',
    year: 2024,
    stack: ['Flutter', 'Firebase'],
    summary: 'Control de accesos residencial con Flutter y Firebase.',
    role: 'Lead Developer',
    placeholder: true,
    confidential: false,
    locale: 'es',
  };

  it('accepts a valid project entry', () => {
    const result = projectsSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('fails when title is missing', () => {
    const { title: _, ...noTitle } = validProject;
    const result = projectsSchema.safeParse(noTitle);
    expect(result.success).toBe(false);
  });

  it('fails when client is an unknown enum value', () => {
    const result = projectsSchema.safeParse({ ...validProject, client: 'Unknown' });
    expect(result.success).toBe(false);
  });

  it('fails when summary exceeds 160 characters', () => {
    const longSummary = 'A'.repeat(161);
    const result = projectsSchema.safeParse({ ...validProject, summary: longSummary });
    expect(result.success).toBe(false);
  });

  it('fails when locale is an unknown enum value', () => {
    const result = projectsSchema.safeParse({ ...validProject, locale: 'fr' });
    expect(result.success).toBe(false);
  });

  it('fails when stack is empty', () => {
    const result = projectsSchema.safeParse({ ...validProject, stack: [] });
    expect(result.success).toBe(false);
  });

  it('fails when year is below minimum (2018)', () => {
    const result = projectsSchema.safeParse({ ...validProject, year: 2010 });
    expect(result.success).toBe(false);
  });

  it('applies default false for placeholder when omitted', () => {
    const { placeholder: _, ...noPlaceholder } = validProject;
    // Must also provide cover (or placeholder:true) to pass the refine
    const withCover = { ...noPlaceholder, placeholder: undefined };
    // Without placeholder and without cover it should fail the refine
    const result = projectsSchema.safeParse({ ...noPlaceholder });
    // placeholder defaults to false, cover is undefined => refine fails
    expect(result.success).toBe(false);
  });

  it('passes refine when placeholder is true and cover is absent', () => {
    const result = projectsSchema.safeParse({ ...validProject, placeholder: true });
    expect(result.success).toBe(true);
  });

  it('accepts optional links object', () => {
    const withLinks = {
      ...validProject,
      links: { live: 'https://centinela.app', repo: 'https://github.com/jnvr1/centinela' },
    };
    const result = projectsSchema.safeParse(withLinks);
    expect(result.success).toBe(true);
  });

  it('fails when links.live is not a URL', () => {
    const result = projectsSchema.safeParse({
      ...validProject,
      links: { live: 'not-a-url' },
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// experience schema
// ---------------------------------------------------------------------------

describe('experienceSchema', () => {
  const validExperience = {
    company: 'Fletes México',
    role: 'Senior Architect',
    startYear: 2024,
    current: true,
    featured: true,
    summary: 'Arquitectura de microservicios y liderazgo técnico en plataforma de logística.',
    locale: 'es',
    order: 1,
  };

  it('accepts a valid experience entry', () => {
    const result = experienceSchema.safeParse(validExperience);
    expect(result.success).toBe(true);
  });

  it('fails when company is missing', () => {
    const { company: _, ...noCompany } = validExperience;
    const result = experienceSchema.safeParse(noCompany);
    expect(result.success).toBe(false);
  });

  it('fails when role is missing', () => {
    const { role: _, ...noRole } = validExperience;
    const result = experienceSchema.safeParse(noRole);
    expect(result.success).toBe(false);
  });

  it('fails when summary exceeds 280 characters', () => {
    const longSummary = 'B'.repeat(281);
    const result = experienceSchema.safeParse({ ...validExperience, summary: longSummary });
    expect(result.success).toBe(false);
  });

  it('accepts optional endYear for past positions', () => {
    const result = experienceSchema.safeParse({ ...validExperience, endYear: 2025, current: false });
    expect(result.success).toBe(true);
  });

  it('fails when locale is missing', () => {
    const { locale: _, ...noLocale } = validExperience;
    const result = experienceSchema.safeParse(noLocale);
    expect(result.success).toBe(false);
  });

  it('fails when order is missing', () => {
    const { order: _, ...noOrder } = validExperience;
    const result = experienceSchema.safeParse(noOrder);
    expect(result.success).toBe(false);
  });
});
