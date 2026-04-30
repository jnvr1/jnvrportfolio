---
title: "Teotech CRM — Suite de Facturación y Repositorio"
client: Teotech
year: 2025
yearRange: "2022–2025"
stack: ["PHP", "MySQL", "JavaScript", "dompdf"]
summary: "Suite CRM + CFDI 4.0 + repositorio de archivos con PWA, control de cuotas y alertas de vigencia."
role: "Backend Developer & Systems Architect"
placeholder: true
confidential: true
locale: es
order: 5
---

## El problema

Una empresa de servicios profesionales necesitaba unificar tres flujos críticos en un solo sistema: emisión de facturas CFDI 4.0 cumpliendo la normativa del SAT mexicano, gestión de cotizaciones con seguimiento de estado, y un repositorio digital de documentos con control de acceso por usuario, cuotas de almacenamiento y alertas de vigencia por tipo de archivo.

## La solución

Diseñé e implementé una suite PHP modular sobre XAMPP/Apache con MySQL. La arquitectura separa la lógica en capas `php/` (dominio) y `api/` (endpoints REST consumidos por el frontend JS). El módulo de facturación cubre los tipos de comprobante CFDI 4.0: normal, global, complemento de pago y cancelación, con timbrado SAT.

El repositorio de archivos maneja control de permisos por usuario, cuotas configurables por rol y alertas automáticas por correo (PHPMailer) cuando un documento está próximo a vencer. El sistema incluye un manifest PWA para instalación en escritorio como aplicación.

## Mi rol

Fui el desarrollador y arquitecto del proyecto completo. Diseñé el schema de base de datos, implementé los módulos de facturación y repositorio, integré PHPMailer para notificaciones, configuré los scripts de migración y backup, y entregué documentación técnica para el administrador del sistema.

## Resultado

El sistema centraliza la operación documental y fiscal de la empresa en un portal interno. La emisión de facturas CFDI cumple con la normativa SAT vigente. El repositorio elimina el uso de carpetas compartidas no estructuradas y da visibilidad sobre el estado de vigencia de los documentos críticos.

## Nota de confidencialidad

Este proyecto es para un cliente privado. Los detalles específicos del negocio, nombres de clientes y configuraciones del SAT no se exponen en el portafolio. El foco de esta entrada es la arquitectura técnica y el alcance del trabajo.
