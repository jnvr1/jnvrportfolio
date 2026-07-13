---
title: "Centinela — Sitio Web de Marketing"
client: Centinela
year: 2026
yearRange: "2025–2026"
stack: ["Astro", "Tailwind CSS", "DecapCMS", "Firebase Hosting", "MDX", "TypeScript", "Partytown"]
summary: "Sitio SSG para el SaaS de control de accesos Centinela: SEO, sitemap, OG tags, blog MDX y CMS headless."
role: "Frontend Developer & DevOps"
cover: ../../../assets/projects/centinela-web.webp
placeholder: false
confidential: false
locale: es
links:
  live: "https://centinela.netlify.app"
order: 2
---

## El problema

El producto Centinela necesitaba presencia web pública para atraer a administradores de fraccionamientos: explicar el producto, dirigir consultas y posicionarse en búsquedas locales. La solución debía cargar rápido, ser editable sin tocar código y poder desplegarse en cualquier hosting sin quedar atada a un proveedor.

## La solución

Construí el sitio sobre la plantilla AstroWind (Astro 5 + Tailwind CSS) y la personalicé por completo: paleta, copywriting y las páginas del sitio — home, servicios, nosotros, contacto y blog. El blog usa MDX con categorías, tags y RSS automático.

DecapCMS se configuró sobre el repositorio Git para que el cliente edite contenido desde una interfaz visual sin abrir un editor de código. Al ser un sitio estático (SSG), el HTML se sirve prerenderizado; los scripts de terceros se aíslan con Partytown para no bloquear el hilo principal. El sitemap, los OG tags por página y el feed RSS se generan de forma automática.

## Mi rol

Adapté la plantilla al brief del cliente, escribí el contenido de las páginas, configuré DecapCMS con documentación de uso y dejé el despliegue listo para varios destinos: Firebase Hosting (el activo), además de Netlify, Vercel y una imagen Docker con docker-compose para entornos self-hosted.

## Resultado

El sitio es el punto de entrada de ventas de la suscripción Centinela. Al ser SSG sirve páginas prerenderizadas con carga rápida, y el cliente actualiza el blog y las páginas sin intervención técnica. La configuración multi-destino evita el vendor lock-in.

## Aprendizaje notable

AstroWind es un excelente punto de partida pero su estructura de componentes es opinionada. Aprendí a separar las personalizaciones del template base usando slots y overrides en lugar de modificar los archivos del template directamente — lo que facilita futuras actualizaciones de la plantilla.
