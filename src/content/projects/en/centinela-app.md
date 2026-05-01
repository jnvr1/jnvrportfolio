---
title: "Centinela — Residential Access Control System"
client: Angel
year: 2024
yearRange: "2022–2024"
stack: ["Flutter", "Firebase", "Stripe", "MercadoPago"]
summary: "Mobile SaaS for residential access control: visitor management, real-time chat, push notifications, and subscriptions."
role: "Lead Mobile Developer & Architect"
cover: ../../../assets/projects/centinela-app.webp
placeholder: false
confidential: false
locale: en
order: 1
---

## The problem

Residential communities managed visitor access manually — paper logs, security guards with no real-time visibility, and no way to alert residents instantly. The client needed a mobile-first solution to digitize the entire flow: from visitor check-in to resident notification, under a scalable SaaS subscription model that could serve multiple gated communities from a single installation.

## The solution

I designed and built Centinela: a Flutter application for Android and iOS using Firebase as the complete backend. The architecture follows Clean Architecture conventions (layers: `presentation`, `domain`, `application`, `data`) to keep business logic decoupled from the framework.

Core modules include: QR code generation for visitor passes with configurable expiration, real-time resident chat with moderation, FCM push notifications for entry alerts and messages, and a subscription billing system integrating both Stripe (international cards) and MercadoPago (Mexican market). Firebase App Check protects Cloud Functions from abuse.

## My role

I was the sole developer and architect. I defined the Firestore collection structure, implemented security rules, set up Cloud Functions for payment processing and notification delivery, and shipped the project from prototype to the first production releases on the Play Store.

## Outcome

The app allows community administrators to manage 100% of visitor flows from their phone, eliminating paper logs entirely. The SaaS model enabled onboarding new communities without infrastructure changes. Residents receive push alerts within 2 seconds of a visitor being registered at the gate.

## Notable learning

Integrating two payment gateways (Stripe for international cards, MercadoPago for the Mexican market) in a single Cloud Function required designing a clean payment abstraction layer — so the application domain had no knowledge of any specific gateway. Dependency inversion principle applied in a real production context.
