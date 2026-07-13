---
title: "Centinela — Residential Access Control System"
client: Centinela
year: 2026
yearRange: "2024–2026"
stack: ["Flutter", "Firebase", "Cloud Functions", "Firestore", "MercadoPago", "FCM"]
summary: "Mobile SaaS for residential access control: visitors, chat with voice notes, notifications, and subscriptions."
role: "Lead Mobile Developer & Architect"
cover: ../../../assets/projects/centinela-app-mobile.webp
placeholder: false
confidential: false
locale: en
order: 1
---

## The problem

Residential communities managed visitor access manually — paper logs, security guards with no real-time visibility, and no way to alert residents instantly. The client needed a mobile-first solution to digitize the entire flow: from visitor check-in to resident notification, under a scalable SaaS subscription model that could serve multiple gated communities from a single installation.

## The solution

I designed and built Centinela: a Flutter application for Android and iOS using Firebase as the complete backend. The architecture follows Clean Architecture conventions (layers: `presentation`, `domain`, `application`, `data`) to keep business logic decoupled from the framework, with a unidirectional `Repository → UseCase → Controller → Screen` flow.

Core modules include: visitor access codes with configurable expiration and use limits, shared as text or number (share_plus) with nothing to scan; real-time resident chat with voice notes; exportable Excel reports; FCM push notifications plus transactional email via Nodemailer; and a subscription system built on MercadoPago alongside a manual subscription type. Firebase App Check protects Cloud Functions from abuse.

## My role

I was the lead developer and architect. I defined the Firestore collection structure and its indexes, implemented security rules, and built the Cloud Functions (Node 20, v2) for payments, reconciliation, notifications, and scheduled jobs. I shipped the project from prototype to production releases on the Play Store.

## Outcome

The app lets community administrators manage 100% of visitor flows from their phone, eliminating paper logs entirely. The SaaS model enabled onboarding new communities without infrastructure changes, and residents receive push alerts in real time the moment a visitor is registered at the gate.

## Notable learning

Integrating MercadoPago in production meant more than taking payments: I built a scheduled job (`reconcileMercadoPagoPayments`) that queries the API, detects refunds and chargebacks, and suspends or reactivates subscriptions based on the payment's real status. All of it sits behind a payment-type abstraction (MercadoPago and manual coexist without the domain knowing any gateway's details) — dependency inversion applied to a real money flow.
