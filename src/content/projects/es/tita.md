---
title: "Tita — Planes de Acompañamiento"
client: FEMN
year: 2026
stack: ["Flutter", "Firebase", "Riverpod", "Cloud Functions", "go_router", "Firestore", "FCM", "TypeScript"]
summary: "App para profesionales de intervención y familias: planes trimestrales de acompañamiento con objetivos, prácticas y seguimiento de adherencia."
role: "Full-Stack Developer (Flutter + Firebase / Cloud Functions)"
cover: ../../../assets/projects/tita-mobile.webp
placeholder: false
confidential: false
locale: es
order: 8
---

## El problema

Los profesionales de intervención —docentes de educación especial, terapeutas del lenguaje y psicólogos— arman planes trimestrales de acompañamiento para cada niño: objetivos, prácticas para casa y seguimiento de adherencia semana a semana. Ese trabajo vivía en documentos sueltos y mensajería informal: sin trazabilidad, sin historial auditable y sin una forma clara de que la familia entendiera qué hacer en casa. Dos audiencias con necesidades opuestas —el clínico necesita precisión, la familia necesita claridad— compartiendo el mismo caso sin una superficie común.

## La solución

Tita conecta al profesional con la familia alrededor de un plan trimestral vivo. El profesional define objetivos y prácticas, registra check-ins de adherencia y deja un historial auditable; la familia recibe el plan en lenguaje claro, ve el progreso y aporta desde casa.

La app está construida con Flutter y Firebase: Riverpod para estado asíncrono, go_router para navegación tipada y una capa de repositorios por feature (planes, objetivos, prácticas, check-ins, comentarios de tutor) que aísla el acceso a Firestore. Detrás hay un backend de Cloud Functions en TypeScript (Node 22) con más de doce triggers de Firestore y una capa de reglas de seguridad endurecida con su propio arnés de tests.

## Mi rol

Fui el desarrollador full-stack, en solitario, de todo el sistema. En el cliente construí los módulos de planes, objetivos, prácticas en casa y check-ins de adherencia con Flutter y Riverpod. En el backend escribí las Cloud Functions en TypeScript —triggers event-driven con tests en jest— y endurecí las reglas de Firestore modelando exactamente tres roles: docente, psicólogo y familia (padre/tutor); no existe un rol de administrador dentro de la app. Monté además el arnés de tests de reglas contra los emuladores y la CI que corre análisis de Flutter, build y tests de Functions, y los tests de reglas en cada PR.

## Resultado

El acompañamiento pasó de documentos sueltos y mensajería informal a un plan estructurado y auditable. Las notificaciones son push por eventos vía Cloud Functions + FCM —no programadas: se disparan cuando pasa algo real en el plan (`onObjectiveAchieved`, `onPlanPublished`, `onTutorCommentCreated` / `onTutorCommentReplied`), de modo que familia y profesional se enteran en el momento exacto. Como maneja datos sensibles de menores, no hay URL pública.

## Aprendizaje notable

Separar la lógica pura de los triggers de Firebase fue lo que hizo testeable el backend: cada función delega en un módulo de lógica sin dependencias de `firebase-functions`, y el trigger queda como una cáscara delgada. Eso permitió cubrir con jest tanto la lógica de negocio como las migraciones, y validar las reglas de seguridad contra los emuladores antes de tocar producción. En un dominio con datos de menores, esa red de tests no es opcional: es lo que te deja iterar sin miedo.
