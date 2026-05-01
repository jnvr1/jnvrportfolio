---
title: "Centinela — Sitio Web de Marketing"
client: Centinela
year: 2025
yearRange: "2024–2025"
stack: ["Astro", "Tailwind CSS", "DecapCMS"]
summary: "Landing page SSG para el SaaS de control de accesos Centinela: SEO, sitemap, OG tags y CMS headless."
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

El producto Centinela necesitaba presencia web pública para atraer a administradores de fraccionamientos: explicar el producto, mostrar precios, recibir consultas y posicionarse en búsquedas locales. La solución debía ser rápida de cargar, fácil de actualizar sin tocar código y desplegable de inmediato.

## La solución

Desarrollé el sitio usando la plantilla AstroWind como base (Astro 5 + Tailwind CSS) y la personalicé completamente: paleta de color, copywriting, páginas de servicios, precios, contacto y landing pages específicas por tipo de fraccionamiento.

DecapCMS se configuró sobre el repositorio Git para que el cliente pudiera editar contenido desde una interfaz visual sin necesidad de abrir un editor de código. El resultado es un sitio SSG con tiempo de carga sub-segundo, sitemap automático, OG tags por página y RSS.

## Mi rol

Adapté la plantilla al brief del cliente, escribí el contenido de las páginas principales, configuré el pipeline de despliegue en Netlify con deploy previews por pull request, y entregué el CMS configurado con instrucciones para el cliente.

## Resultado

El sitio sirve como punto de entrada para ventas de la suscripción Centinela. Lighthouse Performance score de 98 en mobile. El cliente puede actualizar el contenido del blog y las páginas sin intervención técnica.

## Aprendizaje notable

AstroWind es un excelente punto de partida pero su estructura de componentes es opinionada. Aprendí a separar las personalizaciones del template base usando slots y overrides en lugar de modificar los archivos del template directamente — lo que facilitará futuras actualizaciones de la plantilla.
