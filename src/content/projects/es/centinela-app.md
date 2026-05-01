---
title: "Centinela — Sistema de Control de Accesos"
client: Angel
year: 2024
yearRange: "2022–2024"
stack: ["Flutter", "Firebase", "Stripe", "MercadoPago"]
summary: "SaaS móvil de control de accesos residencial: visitantes, chat, notificaciones push y suscripciones."
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

Diseñé y desarrollé Centinela: una aplicación Flutter para Android e iOS con Firebase como backend completo. La arquitectura sigue el patrón Clean (capas `presentation`, `domain`, `application`, `data`) para mantener la lógica de negocio independiente del framework.

Los módulos principales son: generación de códigos QR para visitantes con expiración configurable, chat en tiempo real entre residentes con moderación, push notifications vía FCM para alertas de entrada y mensajes, y un sistema de suscripciones con Stripe y MercadoPago. Firebase App Check protege las Cloud Functions de abuso.

## Mi rol

Fui el único desarrollador y arquitecto del proyecto. Definí la estructura de colecciones en Firestore, implementé las reglas de seguridad, configuré las Cloud Functions para el procesamiento de pagos y el envío de notificaciones, y entregué el proyecto completo desde el prototipo hasta las primeras versiones en producción en la Play Store.

## Resultado

La aplicación permite al administrador del fraccionamiento gestionar el 100% del flujo de visitantes desde el móvil, eliminando los registros en papel. El modelo SaaS facilitó la incorporación de nuevos fraccionamientos sin cambios de infraestructura. Los residentes reciben alertas push en menos de 2 segundos desde que el portero registra la entrada.

## Aprendizaje notable

Integrar dos pasarelas de pago (Stripe para tarjetas internacionales, MercadoPago para el mercado mexicano) en una misma Cloud Function requirió diseñar una capa de abstracción de pagos limpia. Esto evitó que el dominio de la aplicación conociera los detalles de ninguna pasarela específica — un principio de inversión de dependencias aplicado en producción.
