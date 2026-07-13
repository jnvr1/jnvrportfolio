---
title: "Bloomotion Tech — Sitio Corporativo"
client: Bloomotion
year: 2025
stack: ["Flutter Web", "Dart", "Firebase Hosting", "Google Fonts", "Material Design"]
summary: "SPA corporativa en Flutter Web para plataforma logística: navegación con scroll suave, métricas animadas y CTA fijo en móvil."
role: "Flutter Web Developer"
cover: ../../../assets/projects/bloomotion-tech.webp
placeholder: false
confidential: false
locale: es
order: 3
---

## El problema

Bloomotion, una plataforma logística en crecimiento, necesitaba un sitio corporativo que comunicara su propuesta de valor a prospectos B2B: capacidades de integración, resultados medibles y confiabilidad. El sitio debía tener la presencia visual de un producto maduro y no leerse como una landing genérica del sector.

## La solución

Construí una SPA de una sola página con Flutter Web y Material Design. No es un sitio de siete secciones: es un recorrido largo con hero, métricas, resultados, servicios, soluciones, proyectos, cómo funciona, integraciones, beneficios, nosotros, FAQ, un bloque CTA y contacto, más el footer. La navegación usa scroll suave con `easeInOutCubic` y duración proporcional a la distancia hacia cada sección (servicios, soluciones, plataforma, nosotros, contacto). En móvil aparece un CTA fijo "Agenda una demo" que se muestra tras pasar el hero y se oculta al llegar a contacto. Las animaciones (contadores progresivos, reveal on load, gradientes animados, tarjetas con hover) están encapsuladas en widgets reutilizables.

**Evolución desde la v1**: la primera versión (`bloom`) fue una landing estática en HTML. Esta versión en Flutter Web la reemplazó y expandió, integrando su contenido y narrativa dentro de la SPA.

## Mi rol

Diseñé la arquitectura de widgets por sección, implementé la lógica de scroll (offset calculado con el viewport, CTA fijo dependiente del scroll y de la visibilidad de contacto), los contadores progresivos y las animaciones de entrada. Configuré el despliegue en Firebase Hosting, verificado en el repo.

## Resultado

El sitio corporativo funciona como herramienta de ventas para las reuniones comerciales de Bloomotion, en lugar de una presentación estática. Las métricas animadas dan puntos de conversación concretos con prospectos, y la navegación con scroll suave mantiene el recorrido en una sola página.

## Aprendizaje notable

Flutter Web para sitios de marketing tiene un trade-off claro: la fidelidad visual y el control de las animaciones son altos, pero el bundle inicial es mayor que un sitio Astro equivalente. Para una audiencia B2B en desktop con conexión estable, el trade-off es aceptable. Para un portafolio personal con audiencia mixta no lo sería — de ahí la elección de Astro para este sitio.
