---
title: "Centinela — Sistema de Control de Accesos"
client: Centinela
year: 2026
yearRange: "2024–2026"
stack: ["Flutter", "Firebase", "Cloud Functions", "Firestore", "MercadoPago", "FCM"]
summary: "SaaS móvil de control de accesos residencial: visitantes, chat con notas de voz, notificaciones y suscripciones."
role: "Lead Mobile Developer & Architect"
cover: ../../../assets/projects/centinela-app-mobile.webp
placeholder: false
confidential: false
locale: es
order: 1
---

## El problema

Los fraccionamientos residenciales gestionaban el control de visitantes de forma manual: registros en papel, porteros con acceso limitado a información histórica y sin capacidad de alertar en tiempo real a los residentes. El cliente necesitaba una solución móvil que digitalizara todo el flujo — desde la solicitud de entrada hasta la notificación al residente — y que soportara múltiples fraccionamientos bajo un modelo de suscripción escalable.

## La solución

Diseñé y desarrollé Centinela: una aplicación Flutter para Android e iOS con Firebase como backend completo. La arquitectura sigue el patrón Clean (capas `presentation`, `domain`, `application`, `data`) para mantener la lógica de negocio independiente del framework y el flujo unidireccional `Repository → UseCase → Controller → Screen`.

Los módulos principales son: códigos de acceso para visitantes con expiración y usos configurables, compartibles como texto o número (share_plus) sin necesidad de escanear nada; chat en tiempo real entre residentes con notas de voz; reportes exportables en Excel; notificaciones push vía FCM y correos transaccionales vía Nodemailer; y un sistema de suscripciones con MercadoPago más un tipo de suscripción manual. Firebase App Check protege las Cloud Functions de abuso.

## Mi rol

Fui lead developer y arquitecto del proyecto. Definí la estructura de colecciones en Firestore y sus índices, implementé las reglas de seguridad, y construí las Cloud Functions (Node 20, v2) para pagos, reconciliación, notificaciones y trabajos programados. Entregué el proyecto desde el prototipo hasta las versiones en producción en la Play Store.

## Resultado

La aplicación permite al administrador del fraccionamiento gestionar el 100% del flujo de visitantes desde el móvil, eliminando los registros en papel. El modelo SaaS facilitó la incorporación de nuevos fraccionamientos sin cambios de infraestructura, y los residentes reciben alertas push en tiempo real desde que el portero registra la entrada.

## Aprendizaje notable

Integrar MercadoPago en producción implicó más que cobrar: diseñé un trabajo programado (`reconcileMercadoPagoPayments`) que consulta la API, detecta reembolsos y contracargos, y suspende o reactiva suscripciones según el estado real del pago. Todo detrás de una abstracción por tipo de pago (MercadoPago y manual conviven sin que el dominio conozca los detalles de ninguna pasarela) — inversión de dependencias aplicada en un flujo de dinero real.
