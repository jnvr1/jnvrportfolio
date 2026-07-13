---
title: "Villa Educare — Sistema de Gestión Escolar"
client: Villa Educare
year: 2026
yearRange: "2025–2026"
stack: ["PHP 8", "MySQL", "PDO", "JavaScript", "Chart.js", "SheetJS", "TourGuide.js", "Font Awesome"]
summary: "Sistema de gestión escolar en PHP/MySQL: calificaciones, materias, grupos, expedientes, avisos, pagos y facturación CFDI, con acceso por rol."
role: "Full-Stack Developer"
cover: ../../../assets/projects/crm-pedidos.webp
placeholder: false
confidential: false
locale: es
order: 7
---

## El problema

El Instituto Villa Educare, una escuela privada con niveles de preescolar a secundaria, llevaba su operación académica y administrativa en hojas de cálculo dispersas: inscripciones por grupo, calificaciones por ciclo, asignación de profesores a materias, expedientes de alumnos, avisos, pagos mensuales y facturación. Sin una fuente única de verdad, cada área duplicaba datos y no había control de quién veía qué.

## La solución

Construí un sistema de información escolar (SIS) sobre PHP 8 y MySQL. El corazón académico modela materias por ciclo (`materias_ciclo`), grupos y la relación materia–grupo, sobre la que se apoyan asignaciones de profesores, calificaciones por ciclo e inscripciones. La matrícula admite importación masiva por CSV/Excel, resolviendo identificadores internos a partir de datos visibles (matrícula, nivel, grado, grupo, materia) y reportando filas ambiguas.

Alrededor del núcleo académico viven los módulos de expedientes de alumnos (salud, documentos, observaciones y auditoría de accesos), biblioteca con préstamos, avisos por asignación, contactos de emergencia y responsables legales, y un módulo financiero de pagos mensuales con facturación CFDI y descarga de comprobantes. Un dashboard con Chart.js resume la operación y TourGuide.js ofrece recorridos guiados de onboarding.

La arquitectura no es un MVC clásico: cada entidad expone una API JSON por endpoint (`api/<entidad>/<accion>.php`) que consumen componentes en JavaScript vanilla. La importación masiva usa SheetJS en el navegador para leer las hojas antes de enviarlas.

## Mi rol

Diseñé el modelo de datos y las relaciones académicas, implementé los endpoints JSON por entidad y los componentes de UI que los consumen, resolví la importación masiva de matrícula e inscripciones, y construí los módulos de calificaciones, expedientes, pagos y facturación CFDI. Definí también el control de acceso por rol que atraviesa todo el sistema.

## Resultado

La escuela pasó de hojas de cálculo dispersas a un sistema único donde académico y administración comparten la misma base de datos. Las inscripciones se sincronizan automáticamente al mover un alumno de grupo, las calificaciones quedan ligadas a la asignación materia–grupo del ciclo, y los expedientes registran una auditoría de accesos. El módulo financiero centraliza pagos y facturación CFDI en un solo flujo.

## Aprendizaje notable

Toda consulta pasa por PDO con sentencias preparadas y cada endpoint valida sesión y rol en `api/middleware/auth.php` (401 sin sesión, 403 sin permiso). El reto real no fue la seguridad sino la importación masiva: dejar que el usuario capture datos que entiende (nivel, grado, grupo, materia) y resolver del lado del servidor los identificadores internos, marcando explícitamente las ambigüedades en lugar de adivinar, fue lo que hizo el sistema usable para personal no técnico.
