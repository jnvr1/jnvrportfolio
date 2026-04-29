---
title: "Teotech CRM — Invoicing and Files (Brocha)"
slug: brocha-facturacion
client: Teotech
year: 2025
yearRange: "2023–2025"
stack: ["PHP", "MySQL", "PHPMailer", "QR Code"]
summary: "CFDI 4.0 invoicing module, quotation management, and user-scoped file repository with quotas and email alerts."
role: "Backend Developer"
placeholder: true
confidential: false
locale: en
order: 6
---

## The problem

La Brocha needed a complementary invoicing system alongside its POS: generate valid CFDI 4.0 documents for the SAT, manage quotations with history, and maintain a user-scoped file repository with quota control and automatic expiration reminders. All within the same XAMPP infrastructure already in use.

## The solution

I built a standalone PHP Composer-managed module. Key libraries: PHPMailer for notifications and reminders, a QR code generation library for receipt documents, a PDF parser for re-processing existing files, and dompdf for generating PDF receipts.

The invoicing module covers CFDI 4.0: standard invoices, global invoices, payment complements, and cancellations. The file repository includes per-user permissions, role-based storage quotas, and email alerts when a document approaches its expiration limit.

## My role

I implemented both the invoicing and repository modules, configured the Composer dependencies, integrated PHPMailer for the automated alert system, and deployed the module to the client's existing infrastructure.

## Outcome

La Brocha can issue SAT-compliant CFDI 4.0 invoices directly from their internal system without relying on external portals. The file repository replaced uncontrolled shared folders, and the automatic alerts reduced the risk of critical documents expiring unnoticed.
