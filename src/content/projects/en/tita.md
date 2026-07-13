---
title: "Tita — Accompaniment Plans"
client: FEMN
year: 2026
stack: ["Flutter", "Firebase", "Riverpod", "Cloud Functions", "go_router", "Firestore", "FCM", "TypeScript"]
summary: "App for intervention professionals and families: quarterly accompaniment plans with objectives, practices, and adherence tracking."
role: "Full-Stack Developer (Flutter + Firebase / Cloud Functions)"
cover: ../../../assets/projects/tita-mobile.webp
placeholder: false
confidential: false
locale: en
order: 8
---

## The problem

Intervention professionals —special-education teachers, speech therapists, and psychologists— build quarterly accompaniment plans for each child: objectives, at-home practices, and week-by-week adherence tracking. That work lived in scattered documents and informal messaging: no traceability, no auditable history, and no clear way for the family to understand what to do at home. Two audiences with opposing needs —the clinician needs precision, the family needs clarity— sharing the same case without a common surface.

## The solution

Tita connects the professional with the family around a living quarterly plan. The professional defines objectives and practices, records adherence check-ins, and leaves an auditable history; the family receives the plan in plain language, sees progress, and contributes from home.

The app is built with Flutter and Firebase: Riverpod for asynchronous state, go_router for typed navigation, and a per-feature repository layer (plans, objectives, practices, check-ins, tutor comments) that isolates Firestore access. Behind it sits a TypeScript Cloud Functions backend (Node 22) with more than twelve Firestore triggers and a hardened security-rules layer with its own test harness.

## My role

I was the sole full-stack developer of the whole system. On the client I built the plans, objectives, at-home practices, and adherence check-in modules with Flutter and Riverpod. On the backend I wrote the Cloud Functions in TypeScript —event-driven triggers with jest tests— and hardened the Firestore rules, modeling exactly three roles: docente (teacher), psicólogo (psychologist), and familia (parent/guardian); there is no in-app administrator role. I also set up the rules-test harness against the emulators and the CI that runs Flutter analyze, Functions build and tests, and the rules tests on every PR.

## Outcome

Accompaniment moved from scattered documents and informal messaging to a structured, auditable plan. Notifications are event-driven push via Cloud Functions + FCM —not scheduled: they fire when something real happens in the plan (`onObjectiveAchieved`, `onPlanPublished`, `onTutorCommentCreated` / `onTutorCommentReplied`), so family and professional learn about it at the exact moment. Because it handles sensitive data of minors, there is no public URL.

## Notable learning

Separating pure logic from the Firebase triggers is what made the backend testable: each function delegates to a logic module with no `firebase-functions` dependency, leaving the trigger as a thin shell. That let jest cover both business logic and migrations, and let me validate the security rules against the emulators before touching production. In a domain with minors' data, that test net isn't optional —it's what lets you iterate without fear.
