---
title: "Multi-Business POS — La Brocha System"
client: Teotech
year: 2026
yearRange: "2025–2026"
stack: ["React", "FastAPI", "PostgreSQL", "Docker", "Capacitor"]
summary: "Multi-tenant POS + CRM with granular RBAC, React 19 and FastAPI for a hardware store, with Android/iOS and desktop wrappers via Capacitor."
role: "Full-stack Lead Developer"
cover: ../../../assets/projects/pos-la-brocha.webp
placeholder: false
confidential: false
locale: en
order: 4
---

## The problem

La Brocha, a hardware store with multiple sales points, operated with disconnected sales and inventory. It needed a POS that ran on both web and Android tablets, supported multiple business units under a single installation, tightly controlled what each role can see and do, and stayed usable when the network or the server fails.

## The solution

A FastAPI + PostgreSQL backend orchestrated via Docker Compose (multi-tenant by schema: `labrocha`, `negocio2`…), and a React 19 + Vite + TypeScript frontend organized with Feature-Sliced Design: `app`, `entities`, `features`, `pages`, `processes`, `shared`, and `widgets` layers, each with a clear responsibility. TailwindCSS and a component base (Ant Design + HeroUI) for the UI; Capacitor wrappers for Android and iOS plus an Electron wrapper for desktop.

Global state lives in Zustand stores (session, cart, and a small home-grown query cache). Forms use react-hook-form + Zod, mirroring the backend's Pydantic validation. The data layer is a typed HTTP client over `fetch` (`apiFetch`), with per-entity modules, centralized error handling, and connection/server error events.

On that base I built the RBAC system: role and permission CRUD, `rp:module:action` tokens, `RequirePermission` route guards, an API request guard (`canAccessApiRequest`), and sidebar menu filtering driven by the user's permissions. An app-wide `ErrorBoundary` plus dedicated connection-error, server-error, and unexpected-error screens keep a single failure from taking down the whole app.

## My role

Architect and lead developer. I defined the multi-tenant model in PostgreSQL, the FastAPI endpoints, and the frontend modules (POS, inventory, products, customers, CFDI invoicing, and the metrics dashboard). I designed and implemented the RBAC end to end —roles/permissions, route and API guards, menu filtering— and the resilience layer (ErrorBoundary + error pages). I configured Docker Compose for both development and production.

## Outcome

A single platform centralizes sales, inventory, customers, and invoicing. Sales staff use Android tablets as POS terminals via Capacitor, with no native app. RBAC gives each role exactly what it should have —at the route, API, and menu level— and the metrics dashboard exposes sales, inventory, and margin KPIs that used to take hours to compile by hand.

## Notable learning

The real lesson here wasn't a data-fetching library but architectural discipline. Without TanStack Query or Suspense for data, async state is handled with a typed per-entity `fetch` client and Zustand stores for global state (session, cart, and a small home-grown query cache). Feature-Sliced Design keeps every layer —`entities`, `features`, `pages`, `processes`, `shared`, `widgets`— with a single responsibility, and that is exactly what let RBAC and the resilience layer be plugged in later without rewriting features. Well-placed boundaries beat adding another dependency.
