---
title: "Teotech CRM — Invoicing Suite and Document Repository"
client: Teotech
year: 2025
yearRange: "2022–2025"
stack: ["PHP", "MySQL", "JavaScript", "dompdf"]
summary: "Modular PHP CRM with CFDI 4.0 invoicing, quotations, PWA capability, and a permission-based document repository."
role: "Backend Developer & Systems Architect"
placeholder: true
confidential: true
locale: en
order: 5
---

## The problem

A professional services firm needed to unify three critical workflows in a single system: CFDI 4.0 invoice generation compliant with Mexico's SAT regulations, quotation management with status tracking, and a document repository with per-user access control, storage quotas, and automatic expiration alerts for time-sensitive files.

## The solution

I designed and built a modular PHP suite running on XAMPP/Apache with MySQL. The architecture separates concerns into `php/` (domain logic) and `api/` (REST endpoints consumed by the JavaScript frontend). The invoicing module covers all CFDI 4.0 document types: standard invoices, global invoices, payment complements, and cancellations, with SAT timbrado integration.

The document repository handles per-user access permissions, role-based storage quotas, and PHPMailer-driven email alerts when a document approaches its expiration date. A PWA manifest enables installation as a desktop application.

## My role

I was the sole developer and architect. I designed the database schema, built the invoicing and repository modules, integrated PHPMailer for the automated alerting system, wrote the database migration and backup scripts, and delivered technical documentation for the system administrator.

## Outcome

The system centralizes the firm's document and tax operations in an internal portal. CFDI 4.0 invoice generation is SAT-compliant. The document repository replaced unstructured shared folders and provides visibility into the expiration status of critical documents.

## Confidentiality note

This project is for a private client. Business-specific details, client names, and SAT configuration are not disclosed in this portfolio. This entry focuses on the technical architecture and scope of work.
