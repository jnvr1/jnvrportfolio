---
title: "Teotech CRM — Facturación y Archivos (Brocha)"
slug: brocha-facturacion
client: Teotech
year: 2025
yearRange: "2023–2025"
stack: ["PHP", "MySQL", "PHPMailer", "QR Code"]
summary: "CRM de facturación CFDI 4.0, cotizaciones y repositorio de archivos con cuotas y alertas por correo."
role: "Backend Developer"
placeholder: true
confidential: false
locale: es
order: 6
---

## El problema

La Brocha necesitaba un sistema de facturación complementario a su POS: emitir CFDI 4.0 válidos ante el SAT, gestionar cotizaciones con historial, y mantener un repositorio de archivos por usuario con control de cuotas y recordatorios automáticos de vencimiento. Todo en un sistema web interno accesible desde la misma infraestructura XAMPP.

## La solución

Desarrollé un módulo PHP independiente con Composer como gestor de dependencias. Las librerías clave son PHPMailer (notificaciones y recordatorios), una librería de generación de QR para comprobantes, un parser de PDF (para re-procesar archivos existentes) y dompdf para generar los comprobantes en PDF.

El módulo de facturación cubre CFDI 4.0: facturas normales, globales, complementos de pago y cancelaciones. El repositorio de archivos incluye permisos granulares por usuario y cuotas de almacenamiento con alertas por correo cuando se acerca el límite o vence un documento.

## Mi rol

Implementé los módulos de facturación y repositorio, configuré las dependencias Composer, integré PHPMailer para el sistema de alertas automáticas, y desplegué el sistema en la infraestructura existente del cliente.

## Resultado

La Brocha puede emitir facturas CFDI 4.0 conformes directamente desde su sistema interno sin depender de portales externos. El repositorio de archivos reemplazó las carpetas compartidas sin control, y las alertas automáticas redujeron el riesgo de documentos vencidos sin que nadie los detectara.
