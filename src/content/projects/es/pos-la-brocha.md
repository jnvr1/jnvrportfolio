---
title: "POS Multi-Negocio — Sistema La Brocha"
client: Teotech
year: 2026
yearRange: "2025–2026"
stack: ["React", "FastAPI", "PostgreSQL", "Docker", "Capacitor"]
summary: "POS + CRM multi-tenant con RBAC granular, React 19 y FastAPI para ferretería, con wrappers Android/iOS y escritorio vía Capacitor."
role: "Full-stack Lead Developer"
cover: ../../../assets/projects/pos-la-brocha.webp
placeholder: false
confidential: false
locale: es
order: 4
---

## El problema

La Brocha, una ferretería con varios puntos de venta, operaba con ventas e inventario desconectados. Necesitaba un POS que corriera en web y en tablets Android, soportara múltiples negocios sobre una misma instalación, controlara con precisión qué puede ver y hacer cada rol, y siguiera siendo usable cuando la red o el servidor fallan.

## La solución

Un backend FastAPI + PostgreSQL orquestado con Docker Compose (multi-tenant por schema: `labrocha`, `negocio2`…), y un frontend React 19 + Vite + TypeScript organizado con Feature-Sliced Design: capas `app`, `entities`, `features`, `pages`, `processes`, `shared` y `widgets`, cada una con una responsabilidad clara. TailwindCSS y una base de componentes (Ant Design + HeroUI) para la UI; wrappers Capacitor para Android e iOS y una envoltura Electron para escritorio.

El estado global vive en stores de Zustand (sesión, carrito y una cache de consultas propia y ligera). Los formularios usan react-hook-form + Zod, espejando las validaciones Pydantic del backend. La capa de datos es un cliente HTTP tipado sobre `fetch` (`apiFetch`), con módulos por entidad, manejo central de errores y emisión de eventos de conexión/servidor.

Sobre esa base construí el RBAC: CRUD de roles y permisos, tokens `rp:modulo:accion`, guardas de ruta `RequirePermission`, un guard de peticiones a la API (`canAccessApiRequest`) y filtrado del menú lateral según los permisos del usuario. Un `ErrorBoundary` global más pantallas dedicadas de error de conexión, error de servidor y error inesperado evitan que un fallo puntual tumbe toda la aplicación.

## Mi rol

Arquitecto y desarrollador principal. Definí el modelo multi-tenant en PostgreSQL, los endpoints FastAPI y los módulos de frontend (POS, inventario, productos, clientes, facturación CFDI y dashboard de métricas). Diseñé e implementé el RBAC de punta a punta —roles/permisos, guardas de ruta y de API, filtrado de menú— y la capa de resiliencia (ErrorBoundary + páginas de error). Configuré Docker Compose para desarrollo y producción.

## Resultado

Una sola plataforma centraliza ventas, inventario, clientes y facturación. Los vendedores usan tablets Android como terminales POS vía Capacitor, sin app nativa. El RBAC deja a cada rol exactamente lo que le corresponde —a nivel de ruta, de API y de menú—, y el dashboard de métricas expone KPIs de ventas, inventario y márgenes que antes tomaban horas de armar a mano.

## Aprendizaje notable

El aprendizaje real de este proyecto no fue una librería de data-fetching, sino la disciplina de arquitectura. Sin TanStack Query ni Suspense para datos, el estado asíncrono se resuelve con un cliente `fetch` tipado por entidad y stores de Zustand para el estado global (sesión, carrito y una cache de consultas propia y ligera). Feature-Sliced Design mantiene cada capa —`entities`, `features`, `pages`, `processes`, `shared`, `widgets`— con una responsabilidad única, y eso fue justo lo que permitió enchufar después el RBAC y la capa de resiliencia sin reescribir features. Fronteras bien puestas pesan más que sumar una dependencia.
