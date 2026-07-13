---
title: "FEMN — Socioeconomic Surveys"
client: FEMN
year: 2026
yearRange: "2025–2026"
stack: ["Flutter", "Firestore", "Firebase Auth", "Riverpod", "Hive", "PDF", "fl_chart", "Clean Architecture"]
summary: "Offline-first NGO field survey app for socioeconomic assessments and infant enrollment forms with on-device PDF generation."
role: "Lead Mobile Developer"
cover: ../../../assets/projects/femn-mobile.webp
placeholder: false
confidential: false
locale: en
order: 9
---

## The problem

FEMN (Fundación para la Educación de Mujeres y Niños — Foundation for the Education of Women and Children) needed a digital tool for field evaluators: record adult socioeconomic surveys and infant enrollment forms in areas with limited connectivity, sync data to the central platform when online, and generate PDFs of the completed documents for families. Over time, headquarters also needed to read that data — to understand what was happening in the field without exporting everything by hand.

## The solution

I built the app with Flutter on a clean architecture (core / data / domain / presentation layers), using Firestore and Firebase Auth as the backend. The design is offline-first: each survey is persisted first to a local Hive store and synced to Firestore once connectivity returns, detected via `internet_connection_checker`. Riverpod manages sync state and pending-queue state reactively. Navigation is native Navigator/MaterialPageRoute — no external router.

PDF generation (enrollment forms and socioeconomic study documents) happens on the device with the `pdf` + `printing` libraries, letting evaluators hand a printable document to the family during the visit. The NotoSans fonts are bundled so the PDF renders Spanish accents and Unicode characters correctly.

## My role

I designed the offline-first architecture, implemented the sectioned adult and infant survey forms, built the on-device PDF generation module, and wrote the Firestore sync layer (submit, update, delete and sync-pending use cases). In 2026 I added the analytics reporting layer on top of the already-synced data.

## Outcome

Evaluators complete surveys offline and generate the PDF on-site; automatic sync makes the data available to the central team as soon as signal returns. The 2026 reporting layer added an analytics dashboard with `fl_chart` (donut charts, timeline, ranked bars and KPIs), category drill-down with Excel export, survey search, the infant survey module, and canonical aggregation of free-text fields — which unifies hand-typed variants ("IMSS" / "imss" / "imms") in memory, without mutating Firestore. The direct impact is cutting the time between capture in the field and useful reading at headquarters.

## Notable learning

Offline-first design forces you to think about data differently: it's not just "save locally if no internet." Here the local Hive store is the evaluator's immediate source of truth, and Firestore sync is a deferred reconciliation triggered by reconnection. On the reporting side, the real lesson was that field data arrives dirty: the same free-text fields show up in dozens of variants, and aggregating them usefully means canonicalizing at the presentation layer without ever touching the original record.
