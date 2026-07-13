---
title: "Teotech CRM — Invoicing and multi-role CRM (Brocha)"
client: Teotech
year: 2025
stack: ["PHP 8", "MySQL", "PHPMailer", "QR Code", "PDF Parser", "Vanilla JS", "Composer", "WordPress"]
summary: "Multi-role CRM for Teotech: CFDI 4.0 invoicing, quotations, orders, and a file repository with role-based quotas and email alerts."
role: "Full-Stack Developer"
cover: ../../../assets/projects/brocha-facturacion.webp
placeholder: false
confidential: false
locale: en
order: 6
---

## The problem

Teotech ran on scattered processes: invoicing depended on external portals, quotations and orders lived in loose spreadsheets, and files were shared in folders with no control or quotas. They needed a single internal web system, running on their existing XAMPP infrastructure, that unified CFDI 4.0 invoicing, day-to-day commercial operations, and a per-user file repository, all with permissions tied to each person's role.

## The solution

I built a full-stack CRM in PHP 8 with Composer, served from the client's own environment and able to run embedded in WordPress (it pulls the `DB_*` constants via `wp-load.php` when present, or falls back to its own `config.json`).

The system is multi-role: client, team lead, driver, and administrator, each with its own dashboard and capabilities. On top of that base sit orders, quotations, point of sale, notices, payments, and credit history, alongside the invoicing module and the file repository.

Invoicing orchestrates CFDI 4.0 (invoices, global invoices, payment complements, and cancellations) by assembling the document and delegating the stamping to an external PAC via `curl` to `TIMBRADO_API_URL`. A PDF parser (smalot/pdfparser) extracts fiscal data straight from the client's Constancia de Situación Fiscal (tax ID, legal name, tax regime), removing manual data entry. PHPMailer handles notifications and reminders; a QR library (endroid) generates the receipt codes. Quotation PDF generation degrades gracefully to a "simulated PDF" when dompdf is not installed.

## My role

I designed and implemented the whole system, from the PHP backend to the Vanilla JS frontend. I modeled the roles and their capabilities, the per-role storage quotas (configurable via `CUOTA_{ROLE}_MB`) with email alerts, the integration with the stamping PAC, the fiscal-constancia parsing, and the configurable login branding. I deployed it on the client's existing infrastructure, with responsive support.

## Outcome

Teotech issues compliant CFDI 4.0 invoices from their own system without relying on external portals, and manages orders, quotations, payments, and credit in one place according to each user's role. The quota-enabled repository replaced uncontrolled shared folders, and the automatic alerts reduced the risk of critical documents expiring unnoticed.

## Notable learning

Designing the stamping integration as a call to an external PAC, rather than trying to stamp inside the system, kept fiscal responsibility out of the code and made it far easier to maintain. The same discipline applied to dompdf: guarding PDF generation behind a `class_exists` and degrading to a "simulated PDF" lets the rest of the CRM keep running even when an optional dependency is missing.
