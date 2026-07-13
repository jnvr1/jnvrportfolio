/**
 * Spanish (ES) UI strings — default locale.
 * Keys mirror en.ts exactly (TypeScript enforces parity via the shared Strings type).
 */
export const esStrings = {
  nav: {
    home: 'Inicio',
    projects: 'Proyectos',
    experience: 'Experiencia',
    contact: 'Contacto',
  },
  cta: {
    projects: 'Ver proyectos',
    contact: 'Contáctame',
    viewProject: 'Ver proyecto',
    viewCode: 'Ver código',
    backToProjects: 'Volver a proyectos',
  },
  badge: {
    current: 'Actualmente en Fletes México',
  },
  hero: {
    role: 'Desarrollador Full-Stack',
    tagline: 'Construyo software que funciona.',
  },
  form: {
    name: 'Nombre',
    email: 'Correo electrónico',
    message: 'Mensaje',
    submit: 'Enviar mensaje',
    submitting: 'Enviando…',
    success: '¡Mensaje enviado! Te responderé pronto.',
    error: 'Ocurrió un error. Por favor intenta de nuevo.',
    namePlaceholder: 'Tu nombre',
    emailPlaceholder: 'tu@correo.com',
    messagePlaceholder: '¿En qué puedo ayudarte?',
    nameRequired: 'El nombre es obligatorio',
    emailRequired: 'El correo electrónico es obligatorio',
    emailInvalid: 'Ingresa un correo electrónico válido',
    messageRequired: 'El mensaje es obligatorio',
  },
  projects: {
    title: 'Proyectos',
    intro: 'Algunos sistemas que diseñé, construí y llevé a producción.',
    filterLabel: 'Filtrar por tecnología',
    filterAll: 'Todos',
    confidential: 'Confidencial',
    showingCount: (n: number) => `Mostrando ${n} proyecto${n === 1 ? '' : 's'}`,
    placeholderAlt: 'Captura no disponible',
    stackLabel: 'Stack',
  },
  experience: {
    title: 'Experiencia',
    present: 'Presente',
    intro:
      'Roles, responsabilidades e impacto que muestran cómo fui creciendo entre producto, backend, soporte y liderazgo técnico.',
    currentRole: 'Rol actual',
    location: 'Ubicación',
    rangeConnector: 'a',
  },
  contact: {
    title: 'Contacto',
    subtitle: '¿Tienes un proyecto en mente? Escríbeme.',
  },
  footer: {
    rights: 'Todos los derechos reservados',
    archiveLabel: 'Versiones anteriores',
  },
  a11y: {
    skipToContent: 'Ir al contenido principal',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    logoLabel: 'JNVR — inicio',
    localeSwitcherLabel: 'Cambiar idioma',
    breadcrumbLabel: 'ruta de navegación',
  },
  meta: {
    siteTitle: 'JNVR — Desarrollador Full-Stack',
    siteDescription:
      'Portafolio de Jonathan Noé Viramontes — desarrollador full-stack especializado en Flutter, React y backend moderno.',
    projectsTitle: 'Proyectos',
    experienceTitle: 'Experiencia',
    contactTitle: 'Contacto',
  },
};

export type Strings = typeof esStrings;
