---
title: "Villa Educare — School Management System"
client: Villa Educare
year: 2026
yearRange: "2025–2026"
stack: ["PHP 8", "MySQL", "PDO", "JavaScript", "Chart.js", "SheetJS", "TourGuide.js", "Font Awesome"]
summary: "PHP/MySQL school management system: grades, subjects, groups, student records, notices, payments, and CFDI invoicing, with role-based access."
role: "Full-Stack Developer"
cover: ../../../assets/projects/crm-pedidos.webp
placeholder: false
confidential: false
locale: en
order: 7
---

## The problem

Instituto Villa Educare, a private school running preschool through secondary levels, managed its academic and administrative operation across scattered spreadsheets: enrollment by group, grades per cycle, teacher-to-subject assignments, student records, notices, monthly payments, and invoicing. With no single source of truth, each area duplicated data and there was no control over who could see what.

## The solution

I built a school information system (SIS) on PHP 8 and MySQL. The academic core models subjects per cycle (`materias_ciclo`), groups, and the subject–group relationship, which teacher assignments, per-cycle grades, and enrollments all build on. Enrollment supports bulk CSV/Excel import, resolving internal identifiers from human-readable data (student ID, level, grade, group, subject) and flagging ambiguous rows.

Around the academic core live the modules for student records (health, documents, observations, and access auditing), a library with loans, notices per assignment, emergency contacts and legal guardians, and a financial module for monthly payments with CFDI invoicing and receipt downloads. A Chart.js dashboard summarizes operations, and TourGuide.js provides guided onboarding tours.

The architecture is not a classic MVC: each entity exposes a JSON API per endpoint (`api/<entity>/<action>.php`) consumed by vanilla-JavaScript components. Bulk import uses SheetJS in the browser to read the sheets before sending them.

## My role

I designed the data model and academic relationships, implemented the per-entity JSON endpoints and the UI components that consume them, solved bulk import of enrollment and registrations, and built the grades, student records, payments, and CFDI invoicing modules. I also defined the role-based access control that runs through the whole system.

## Outcome

The school moved from scattered spreadsheets to a single system where academics and administration share one database. Enrollments sync automatically when a student changes group, grades stay tied to the cycle's subject–group assignment, and student records keep an access audit trail. The financial module centralizes payments and CFDI invoicing into a single flow.

## Notable learning

Every query goes through PDO with prepared statements, and each endpoint validates session and role in `api/middleware/auth.php` (401 without a session, 403 without permission). The real challenge wasn't security but bulk import: letting users enter the data they understand (level, grade, group, subject) and resolving internal identifiers server-side — explicitly flagging ambiguities instead of guessing — is what made the system usable for non-technical staff.
