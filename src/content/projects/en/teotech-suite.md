---
title: "Teotech — CRM, CFDI 4.0 Invoicing and Document Suite"
client: Teotech
year: 2026
yearRange: "2025–2026"
stack: ["PHP 8", "MySQL", "JavaScript", "CFDI 4.0 / SAT", "PHPMailer", "dompdf", "PWA"]
summary: "Multi-tenant PHP 8 suite: CFDI 4.0 invoicing, a timbrado job queue, AV/DLP file repository, and observability."
role: "Backend Developer & Systems Architect"
placeholder: true
confidential: true
locale: en
order: 5
---

## The problem

Teotech ran its tax, commercial, and document operations spread across spreadsheets, shared folders, and manual SAT filings. It lacked a multi-tenant platform that could issue CFDI 4.0 invoices reliably, control per-file access and quotas, and provide end-to-end traceability over invoicing, collections, and certificate expiration. Synchronous timbrado against the PAC was fragile: every request was at the mercy of the external service's latency and outages.

## The solution

I built a PHP 8 suite on MySQL that progressively migrated toward a layered, DDD-style architecture. Domain logic lives in a PSR-4 `src/` layer (`Teotech\Domain` for Files, Clients, and Invoicing; `Teotech\Http` for request/response), while `php/` and `api/` expose the REST endpoints and controllers that still hold legacy rules and gradually drain them into the domain.

The tax core covers the CFDI 4.0 document types —standard, global, payment complement, and cancellation— backed by the SAT catalogs (tax regime, CFDI use, payment methods, product and unit keys). Timbrado was decoupled into a job queue with retries, backoff, and metrics, processed by a worker outside the request cycle. Around it, real modules grew: client management with their certificates, collections, support tickets, and certificate-expiration tracking with email alerts (PHPMailer) and scheduled tasks.

The document repository is multi-tenant, with role-based quotas and per-user structure. Uploads run through a security pipeline: extension/MIME allow-listing, policy-driven AV/DLP scanning, and file versioning. A separate indexing worker keeps its own queue to catalog content, and an observability middleware propagates a correlation ID per request and exports structured authentication and operation events. The dashboard lazy-loads its modules dynamically based on the permissions and modules enabled per company, and a PWA manifest lets it install as a desktop application.

## My role

I was the developer and architect of the platform. I designed the database schema and versioned migrations, extracted the domain into the PSR-4 layer, implemented the timbrado and indexing queues with their workers, the upload pipeline with AV/DLP and versioning, the observability middleware, and the per-company role, quota, and module system. I integrated PHPMailer for alerts and delivered migration, seed, and backup scripts via Composer.

## Outcome

Teotech now runs on a single internal portal that centralizes invoicing, clients, collections, support, and documents. Asynchronous timbrado absorbs PAC outages without blocking the user and leaves metrics to diagnose failures. The repository replaced shared folders with controlled, scanned, versioned storage, and observability provides per-request traceability across the whole operation.

## Notable learning

Decoupling timbrado into a queue with retries was the highest-impact change: turning an unstable external dependency into an asynchronous process with backoff and metrics transformed how reliable the system felt. I also learned to migrate a legacy base toward DDD incrementally —domain in `src/` coexisting with legacy endpoints in `php/`— without halting operations.

## Confidentiality note

This project is for a private client. Business names, SAT configuration, credentials, and operational data are not disclosed in this portfolio. This entry focuses on the technical architecture and scope of work.
