---
title: "Tita — Sistema de Gestión Escolar"
slug: tita
client: FEMN
year: 2025
yearRange: "2024–2025"
stack: ["Flutter", "Firebase", "Riverpod", "go_router"]
summary: "App móvil de gestión escolar con roles múltiples, seguimiento de objetivos y comunicación padre-maestro."
role: "Lead Mobile Developer"
placeholder: true
confidential: false
locale: es
order: 8
---

## El problema

Una institución educativa privada necesitaba una app que conectara a padres, maestros y administradores en una sola plataforma: seguimiento del progreso del alumno, gestión de materiales, horarios semanales, comunicación directa y notificaciones push sin depender de grupos de WhatsApp informales.

## La solución

Desarrollé Tita con Flutter 3 y Firebase como backend, usando Riverpod como gestor de estado y go_router para navegación tipada. La arquitectura separa responsabilidades por feature: cada módulo (objetivos, práctica diaria, materiales, comunicación, horario) tiene su propia capa de repositorio, que aísla la lógica de acceso a Firestore.

Los roles (padre, maestro, administrador) están modelados en Firestore con reglas de seguridad que garantizan que cada usuario solo puede leer y escribir los datos que le corresponden. Las notificaciones push vía FCM alertan a los padres sobre actualizaciones del progreso de sus hijos.

## Mi rol

Fui el desarrollador principal. Diseñé la estructura de colecciones en Firestore, implementé los módulos de seguimiento de objetivos y práctica diaria, construí el flujo de generación de PDFs para reportes, y configuré las Cloud Functions para el envío de notificaciones programadas.

## Resultado

La app reemplazó la comunicación informal por WhatsApp con un canal estructurado y documentado. Los maestros registran el progreso directamente desde la app y los padres reciben notificaciones en tiempo real. La generación de PDFs de reportes elimina el trabajo manual de creación de documentos al final del período.

## Aprendizaje notable

Riverpod con Flutter 3 ofrece una forma muy limpia de gestionar estado derivado y asíncrono. El patrón `AsyncNotifier` + `ref.watch` hace que los estados de carga y error sean automáticamente reactivos sin código boilerplate. Comparado con BLoC (que usé en proyectos anteriores), el código es significativamente más conciso y fácil de probar.
