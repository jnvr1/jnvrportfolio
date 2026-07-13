/**
 * English (EN) UI strings.
 * Keys mirror es.ts exactly — TypeScript enforces parity via the Strings type.
 */
import type { Strings } from './es';

export const enStrings: Strings = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    experience: 'Experience',
    contact: 'Contact',
  },
  cta: {
    projects: 'See projects',
    contact: 'Contact me',
    viewProject: 'View project',
    viewCode: 'View code',
    backToProjects: 'Back to projects',
  },
  badge: {
    current: 'Currently at Fletes México',
  },
  hero: {
    role: 'Full-Stack Developer',
    tagline: 'I build software that works.',
  },
  form: {
    name: 'Name',
    email: 'Email',
    message: 'Message',
    submit: 'Send message',
    submitting: 'Sending…',
    success: 'Message sent! I will get back to you soon.',
    error: 'Something went wrong. Please try again.',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@email.com',
    messagePlaceholder: 'How can I help you?',
    nameRequired: 'Name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Enter a valid email address',
    messageRequired: 'Message is required',
  },
  projects: {
    title: 'Projects',
    intro: 'Selected systems I designed, built, and shipped to production.',
    filterLabel: 'Filter by technology',
    filterAll: 'All',
    confidential: 'Confidential',
    showingCount: (n: number) => `Showing ${n} project${n === 1 ? '' : 's'}`,
    placeholderAlt: 'Screenshot not available',
    stackLabel: 'Stack',
  },
  experience: {
    title: 'Experience',
    present: 'Present',
    intro:
      'Roles, responsibilities, and impact that show how my path grew across product, backend, support, and technical leadership.',
    currentRole: 'Current role',
    location: 'Location',
    rangeConnector: 'to',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Have a project in mind? Write to me.',
  },
  footer: {
    rights: 'All rights reserved',
    archiveLabel: 'Past versions',
  },
  a11y: {
    skipToContent: 'Skip to main content',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    logoLabel: 'JNVR — home',
    localeSwitcherLabel: 'Switch language',
    breadcrumbLabel: 'breadcrumb',
  },
  meta: {
    siteTitle: 'JNVR — Full-Stack Developer',
    siteDescription:
      'Portfolio of Jonathan Noé Viramontes — full-stack developer specialized in Flutter, React, and modern backends.',
    projectsTitle: 'Projects',
    experienceTitle: 'Experience',
    contactTitle: 'Contact',
  },
};
