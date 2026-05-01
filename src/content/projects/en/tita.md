---
title: "Tita — School Management App"
client: FEMN
year: 2025
yearRange: "2024–2025"
stack: ["Flutter", "Firebase", "Riverpod", "go_router"]
summary: "Mobile school management app with multi-role support, objective tracking, materials, and parent-teacher communication."
role: "Lead Mobile Developer"
cover: ../../../assets/projects/tita-mobile.webp
placeholder: false
confidential: false
locale: en
order: 8
---

## The problem

A private educational institution needed an app to connect parents, teachers, and administrators in a single platform: student progress tracking, materials management, weekly schedules, direct communication, and push notifications — replacing informal WhatsApp group coordination.

## The solution

I built Tita with Flutter 3 and Firebase as the backend, using Riverpod for state management and go_router for typed navigation. The architecture is feature-based: each module (objectives, daily practice, materials, communication, schedule) has its own repository layer that isolates Firestore access logic.

Roles (parent, teacher, administrator) are modeled in Firestore with security rules that enforce each user can only read and write their own data. FCM push notifications alert parents to updates on their child's progress.

## My role

I was the lead developer. I designed the Firestore collection structure, implemented the objective tracking and daily practice modules, built the PDF report generation flow, and set up Cloud Functions for scheduled notification delivery.

## Outcome

The app replaced informal WhatsApp communication with a structured, documented channel. Teachers log progress directly from the app and parents receive real-time notifications. PDF report generation eliminates the manual document creation work at the end of each period.

## Notable learning

Riverpod with Flutter 3 provides a very clean approach to derived and asynchronous state. The `AsyncNotifier` + `ref.watch` pattern makes loading and error states automatically reactive without boilerplate. Compared to BLoC (used in earlier projects), the code is significantly more concise and easier to unit-test.
