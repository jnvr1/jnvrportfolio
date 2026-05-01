---
title: "POS Multi-Negocio — Sistema La Brocha"
client: Teotech
year: 2025
stack: ["React", "FastAPI", "PostgreSQL", "Docker", "Capacitor"]
summary: "POS + CRM multi-tenant con React 19, FastAPI y Docker Compose para ferretería con wrappers Android e iOS."
role: "Full-stack Lead Developer"
cover: ../../../assets/projects/pos-la-brocha.webp
placeholder: false
confidential: false
locale: es
order: 4
---

## El problema

La Brocha, una ferretería con múltiples puntos de venta, operaba con procesos de venta y gestión de inventario desconectados. El cliente necesitaba un sistema POS que funcionara tanto en web como en dispositivos móviles Android, soportara múltiples negocios bajo la misma instalación y tuviera dashboards de métricas para decisiones operativas diarias.

## La solución

Diseñé un sistema POS + CRM con arquitectura multi-tenant: un backend FastAPI con PostgreSQL orquestado vía Docker Compose, un frontend React 19 con Vite y TailwindCSS, y wrappers móviles con Capacitor para Android e iOS. Se añadió una envuelta Electron para uso en escritorio.

El stack de formularios usa react-hook-form + Zod para validación tipada en el cliente, que espeja las validaciones Pydantic en el backend. Zustand maneja el estado global del carrito y sesión. El dashboard de métricas (documentado en `DASHBOARD_METRICAS.md`) expone KPIs de ventas, inventario y márgenes en tiempo real.

## Mi rol

Fui el arquitecto y desarrollador principal. Definí el schema de la base de datos (multi-tenant con aislamiento por `negocio_id`), implementé los endpoints FastAPI, construí los módulos de frontend principales (POS, inventario, clientes, reportes), y configuré el Docker Compose para desarrollo y producción.

## Resultado

El sistema centraliza las operaciones de La Brocha: ventas, inventario y clientes en una sola plataforma. El wrapper Capacitor permite a los vendedores usar tablets Android como terminales POS sin aplicación nativa. El dashboard de métricas reduce el tiempo de generación de reportes de horas a segundos.

## Aprendizaje notable

React 19 con el modo concurrente y Suspense requiere un cambio de mentalidad en la gestión de estado asíncrono. El patrón más limpio que encontré fue combinar Server Components (donde el backend es Next.js) o, en este caso con Vite, usar `useSuspenseQuery` de TanStack Query para cargar datos de forma declarativa — el componente "suspende" mientras carga, sin lógica de loading manual.
