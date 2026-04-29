---
title: "FEMN — Encuestas Socioeconómicas"
slug: femn
client: FEMN
year: 2025
yearRange: "2024–2025"
stack: ["Flutter", "Firebase", "Riverpod", "go_router"]
summary: "App offline-first para evaluadores de campo de ONG: encuestas socioeconómicas y fichas de inscripción con PDF."
role: "Lead Mobile Developer"
placeholder: true
confidential: false
locale: es
order: 9
---

## El problema

FEMN (Fundación para la Educación de Mujeres y Niños) necesitaba una herramienta digital para sus evaluadores de campo: registrar encuestas socioeconómicas de adultos y fichas de inscripción de infantes en zonas con conectividad limitada, sincronizar los datos con la plataforma central cuando hay conexión, y generar PDFs de los documentos para entrega a las familias.

## La solución

Desarrollé la app con Flutter 3 orientado a tres plataformas (Android, iOS, Web), con Firebase como backend. El diseño es offline-first: los datos se guardan localmente y se sincronizan con Firestore cuando hay conexión disponible. Riverpod gestiona el estado de sincronización de forma reactiva.

La generación de PDFs (fichas de inscripción y estudios socioeconómicos) se realiza en el dispositivo usando una librería Dart, permitiendo al evaluador entregar el documento imprimible a la familia en el mismo momento de la visita. La app soporta múltiples idiomas (flutter_localizations) para adaptarse a los contextos regionales de operación de la fundación.

## Mi rol

Diseñé la arquitectura offline-first, implementé los formularios de encuesta y ficha de inscripción, desarrollé el módulo de generación de PDFs, y configuré la lógica de sincronización con Firestore incluyendo el manejo de conflictos por edición concurrente.

## Resultado

Los evaluadores de campo pueden completar encuestas sin conexión a internet y generar el PDF del documento en el momento de la visita. La sincronización automática garantiza que el equipo central tenga acceso a los datos tan pronto como el evaluador recupera conectividad. El impacto directo es una reducción en el tiempo de procesamiento de datos del campo a la oficina central.

## Aprendizaje notable

El diseño offline-first requiere pensar en los datos de forma diferente: no se trata solo de "guardar en local si no hay internet", sino de diseñar los modelos de datos para que los conflictos sean resolubles determinísticamente. En este proyecto, cada encuesta tiene un timestamp de creación y el evaluador que la inició como propietario — lo que hace que las reglas de merge sean simples y predecibles.
