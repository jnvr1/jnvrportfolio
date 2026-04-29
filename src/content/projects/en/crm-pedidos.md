---
title: "Order Management CRM — Private Educational Institution"
slug: crm-pedidos
client: Teotech
year: 2025
yearRange: "2023–2025"
stack: ["PHP", "MySQL", "JavaScript", "Font Awesome"]
summary: "Role-based internal CRM with order management, quantity adjustments, ticket processing, and an adaptive dashboard."
role: "Backend Developer"
placeholder: true
confidential: true
locale: en
order: 7
---

## The problem

A private educational institution needed to digitize its internal order and invoicing process: differentiated roles (administrator, operator, read-only), order management with quantity adjustment history, ticket processing with configurable states, and a dashboard showing business status adapted to each user's access level.

## The solution

I built a PHP 8+ CRM with MySQL, session-based authentication, and role-based access control. The architecture is a lightweight MVC: PHP controllers for business logic, models using prepared statements to prevent SQL injection, and HTML + Vanilla JS + Font Awesome for the UI.

The order module includes quantity adjustments with change history, ticket processing with configurable status transitions, and an adaptive dashboard that shows different metrics depending on the authenticated user's role.

## My role

I designed the data model, implemented the role and permission system, developed the order management and dashboard modules, and delivered the system ready for production with deployment instructions for the client's infrastructure.

## Outcome

The institution centralized its internal order process, eliminating spreadsheet-based workflows. Role-based access control ensures each user sees only the data relevant to their function. The order change history provides traceability for internal audits.

## Confidentiality note

This project is for a private client in the education sector. Per a confidentiality agreement, client names, user data, and business specifics are not disclosed. This entry focuses on the technical architecture and scope of work performed.
