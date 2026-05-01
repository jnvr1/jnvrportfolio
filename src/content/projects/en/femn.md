---
title: "FEMN — Socioeconomic Surveys"
client: FEMN
year: 2025
yearRange: "2024–2025"
stack: ["Flutter", "Firebase", "Riverpod", "go_router"]
summary: "Offline-first NGO field survey app for socioeconomic assessments and infant enrollment forms with on-device PDF generation."
role: "Lead Mobile Developer"
cover: ../../../assets/projects/femn.webp
placeholder: false
confidential: false
locale: en
order: 9
---

## The problem

FEMN (Fundación para la Educación de Mujeres y Niños — Foundation for the Education of Women and Children) needed a digital tool for field evaluators: record adult socioeconomic surveys and infant enrollment forms in areas with limited connectivity, sync data to the central platform when online, and generate PDFs of the completed documents for families.

## The solution

I developed the app with Flutter 3 targeting Android, iOS, and Web, using Firebase as the backend. The design is offline-first: data is saved locally and synced to Firestore when a connection is available. Riverpod manages sync state reactively.

PDF generation (enrollment forms and socioeconomic study documents) happens on the device using a Dart library, allowing evaluators to deliver a printable document to the family during the visit itself. The app supports multiple languages (flutter_localizations) to adapt to the regional contexts where the foundation operates.

## My role

I designed the offline-first architecture, implemented the survey and enrollment form modules, built the on-device PDF generation module, and configured the Firestore sync logic including conflict handling for concurrent edits.

## Outcome

Field evaluators can complete surveys without an internet connection and generate the PDF document on-site. Automatic sync ensures the central team has access to data as soon as the evaluator regains connectivity. The direct impact is a reduction in the time between data collection in the field and availability at headquarters.

## Notable learning

Offline-first design requires thinking about data differently: it's not just "save locally if no internet" — you have to design data models so that conflicts are deterministically resolvable. In this project, each survey is owned by the evaluator who created it and carries a creation timestamp — which makes merge rules simple and predictable.
