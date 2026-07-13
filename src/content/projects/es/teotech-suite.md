---
title: "Teotech — Suite CRM, Facturación CFDI 4.0 y Gestión Documental"
client: Teotech
year: 2026
yearRange: "2025–2026"
stack: ["PHP 8", "MySQL", "JavaScript", "CFDI 4.0 / SAT", "PHPMailer", "dompdf", "PWA"]
summary: "Suite PHP 8 multiempresa: facturación CFDI 4.0, cola de timbrado, repositorio con AV/DLP y observabilidad."
role: "Backend Developer & Systems Architect"
placeholder: true
confidential: true
locale: es
order: 5
---

## El problema

Teotech operaba su gestión fiscal, comercial y documental repartida entre hojas de cálculo, carpetas compartidas y trámites manuales ante el SAT. Faltaba una plataforma multiempresa que emitiera CFDI 4.0 de forma confiable, controlara accesos y cuotas por archivo, y diera trazabilidad de extremo a extremo sobre timbrado, cobranza y vigencia de constancias. El timbrado síncrono contra el PAC era frágil: cada request quedaba a merced de la latencia y las caídas del servicio externo.

## La solución

Construí una suite PHP 8 sobre MySQL que fue migrando hacia una arquitectura en capas de corte DDD. La lógica de dominio vive en un `src/` con PSR-4 (`Teotech\Domain` para Archivos, Clientes y Facturación; `Teotech\Http` para request/response), mientras que `php/` y `api/` exponen los endpoints REST y controladores que aún encapsulan reglas heredadas y las van drenando hacia el dominio.

El núcleo fiscal cubre los comprobantes CFDI 4.0 —normal, global, complemento de pago y cancelación— apoyado en los catálogos del SAT (régimen fiscal, uso CFDI, formas de pago, claves de producto y unidad). El timbrado se desacopló en una cola de trabajos con reintentos, backoff y métricas, procesada por un worker fuera del ciclo de request. Alrededor crecieron módulos reales: gestión de clientes y sus certificados, cobranza, tickets de soporte, constancias de vigencia con alertas por correo (PHPMailer) y tareas programadas.

El repositorio documental es multiempresa, con cuotas por rol y estructura por usuario. Las subidas pasan por un pipeline de seguridad: lista blanca de extensiones/MIME, escaneo AV/DLP por políticas de repositorio y versionado de archivos. Un worker de indexación mantiene una cola aparte para catalogar el contenido, y un middleware de observabilidad propaga un correlation ID por petición y exporta eventos estructurados de autenticación y operación. El dashboard carga sus módulos de forma dinámica con lazy-loading según los permisos y módulos habilitados por empresa, y un manifest PWA permite instalarlo como aplicación de escritorio.

## Mi rol

Fui el desarrollador y arquitecto de la plataforma. Diseñé el esquema de base de datos y las migraciones versionadas, extraje el dominio a la capa PSR-4, implementé las colas de timbrado e indexación con sus workers, el pipeline de subida con AV/DLP y versionado, el middleware de observabilidad, y el sistema de roles, cuotas y módulos por empresa. Integré PHPMailer para alertas y entregué scripts de migración, seed y respaldo vía Composer.

## Resultado

Teotech opera hoy sobre un único portal interno que centraliza facturación, clientes, cobranza, soporte y documentos. El timbrado asíncrono absorbe las caídas del PAC sin bloquear al usuario y deja métricas para diagnosticar fallos. El repositorio reemplazó las carpetas compartidas por almacenamiento controlado, escaneado y versionado, y la observabilidad da trazabilidad por request sobre toda la operación.

## Aprendizaje notable

Desacoplar el timbrado en una cola con reintantos fue el cambio de mayor impacto: convertir una dependencia externa inestable en un proceso asíncrono con backoff y métricas transformó la percepción de fiabilidad del sistema. También aprendí a migrar una base heredada hacia DDD de forma incremental —dominio en `src/` conviviendo con endpoints legacy en `php/`— sin detener la operación.

## Nota de confidencialidad

Este proyecto es para un cliente privado. Los nombres de negocio, configuraciones del SAT, credenciales y datos operativos no se exponen en el portafolio. Esta entrada se centra en la arquitectura técnica y el alcance del trabajo.
