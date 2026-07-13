---
title: "FEMN — Encuestas Socioeconómicas"
client: FEMN
year: 2026
yearRange: "2025–2026"
stack: ["Flutter", "Firestore", "Firebase Auth", "Riverpod", "Hive", "PDF", "fl_chart", "Clean Architecture"]
summary: "App offline-first para evaluadores de campo de ONG: encuestas socioeconómicas y fichas de inscripción con PDF."
role: "Lead Mobile Developer"
cover: ../../../assets/projects/femn-mobile.webp
placeholder: false
confidential: false
locale: es
order: 9
---

## El problema

FEMN (Fundación para la Educación de Mujeres y Niños) necesitaba una herramienta digital para sus evaluadores de campo: registrar encuestas socioeconómicas de adultos y fichas de inscripción de infantes en zonas con conectividad limitada, sincronizar los datos con la plataforma central cuando hay conexión, y generar PDFs de los documentos para entrega a las familias. Con el tiempo, además, la oficina central necesitaba leer esos datos: entender qué está pasando en campo sin exportar todo a mano.

## La solución

Desarrollé la app con Flutter sobre una arquitectura limpia (capas core / data / domain / presentation), con Firestore y Firebase Auth como backend. El diseño es offline-first: cada encuesta se persiste primero en un almacén local con Hive y se sincroniza con Firestore cuando vuelve la conectividad, detectada con `internet_connection_checker`. Riverpod gestiona el estado de sincronización y las colas de pendientes de forma reactiva. La navegación es Navigator/MaterialPageRoute nativo, sin router externo.

La generación de PDFs (fichas de inscripción y estudios socioeconómicos) se realiza en el dispositivo con la librería `pdf` + `printing`, permitiendo entregar el documento imprimible a la familia en el momento de la visita. Se empaquetan las fuentes NotoSans para que el PDF renderice correctamente acentos y caracteres Unicode del español.

## Mi rol

Diseñé la arquitectura offline-first, implementé los formularios de encuesta de adulto y de infante por secciones, desarrollé el módulo de generación de PDFs, y construí la capa de sincronización con Firestore (casos de uso de submit, update, delete y sync de pendientes). En 2026 sumé la capa de reportería analítica sobre los datos ya sincronizados.

## Resultado

Los evaluadores completan encuestas sin conexión y generan el PDF en el momento de la visita; la sincronización automática pone los datos a disposición del equipo central en cuanto se recupera la señal. La capa de reportería 2026 agregó un dashboard analítico con `fl_chart` (gráficos de dona, línea de tiempo, barras rankeadas y KPIs), drill-down por categoría con exportación a Excel, búsqueda de encuestas, el módulo de encuestas de infantes y una agregación canónica de campos de texto libre — que unifica variantes escritas a mano ("IMSS" / "imss" / "imms") en memoria, sin mutar Firestore. El impacto directo es reducir el tiempo entre la captura en campo y su lectura útil en la oficina central.

## Aprendizaje notable

El diseño offline-first obliga a pensar los datos distinto: no es solo "guardar en local si no hay internet". Acá el almacén local con Hive es la fuente de verdad inmediata del evaluador, y la sincronización con Firestore es una reconciliación diferida que dispara la reconexión. Y del lado de reportería, el aprendizaje real fue que los datos de campo llegan sucios: los mismos campos de texto libre aparecen con decenas de variantes, y agregarlos de forma útil exige canonicalizarlos en la capa de presentación sin tocar el dato original.
