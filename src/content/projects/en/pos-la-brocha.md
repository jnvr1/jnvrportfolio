---
title: "Multi-Business POS — La Brocha System"
client: Teotech
year: 2025
stack: ["React", "FastAPI", "PostgreSQL", "Docker", "Capacitor"]
summary: "Multi-tenant POS + CRM with React 19, FastAPI and Docker Compose, with Android and iOS wrappers via Capacitor."
role: "Full-stack Lead Developer"
cover: ../../../assets/projects/pos-la-brocha.webp
placeholder: false
confidential: false
locale: en
order: 4
---

## The problem

La Brocha, a hardware store with multiple sales points, operated with disconnected inventory and sales processes. The client needed a POS system that worked on both web and mobile devices, supported multiple business units under the same installation, and provided real-time metrics dashboards for day-to-day operational decisions.

## The solution

I designed a multi-tenant POS + CRM system: a FastAPI backend with PostgreSQL orchestrated via Docker Compose, a React 19 + Vite + TailwindCSS frontend, and Capacitor wrappers for Android and iOS. An Electron wrapper was added for desktop use.

The form layer uses react-hook-form + Zod for typed client-side validation that mirrors the Pydantic validation on the backend. Zustand manages global cart and session state. The metrics dashboard exposes sales, inventory, and margin KPIs in real time.

## My role

I was the architect and lead developer. I defined the database schema (multi-tenant with `negocio_id` isolation), implemented the FastAPI endpoints, built the main frontend modules (POS, inventory, customers, reports), and configured Docker Compose for both development and production environments.

## Outcome

The system centralizes La Brocha's operations: sales, inventory, and customer management in a single platform. The Capacitor wrapper allows sales staff to use Android tablets as POS terminals without a native app. The metrics dashboard reduces report generation from hours to seconds.

## Notable learning

React 19 with concurrent mode and Suspense requires a shift in thinking about async state. The cleanest pattern I found was using `useSuspenseQuery` from TanStack Query — the component declaratively "suspends" while data loads, eliminating manual loading state management and making the component logic simpler and more predictable.
