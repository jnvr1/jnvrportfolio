---
title: "Teotech CRM — Facturación y CRM multi-rol (Brocha)"
client: Teotech
year: 2025
stack: ["PHP 8", "MySQL", "PHPMailer", "QR Code", "PDF Parser", "Vanilla JS", "Composer", "WordPress"]
summary: "CRM multi-rol para Teotech: facturación CFDI 4.0, cotizaciones, pedidos y repositorio de archivos con cuotas por rol y alertas por correo."
role: "Full-Stack Developer"
cover: ../../../assets/projects/brocha-facturacion.webp
placeholder: false
confidential: false
locale: es
order: 6
---

## El problema

Teotech operaba con procesos dispersos: la facturación dependía de portales externos, las cotizaciones y pedidos vivían en hojas sueltas, y los archivos se compartían en carpetas sin control ni cuotas. Necesitaban un único sistema web interno, montado sobre su infraestructura XAMPP, que unificara facturación CFDI 4.0, la operación comercial diaria y un repositorio de archivos por usuario, todo con permisos según el rol de cada quien.

## La solución

Construí un CRM full-stack en PHP 8 con Composer, servido desde el mismo entorno del cliente y capaz de correr embebido en WordPress (toma las constantes `DB_*` vía `wp-load.php` cuando existe, o un `config.json` propio en su defecto).

El sistema es multi-rol: cliente, líder, repartidor y administrador, cada uno con su propio dashboard y capacidades. Sobre esa base viven pedidos, cotizaciones, punto de venta, avisos, pagos e histórico de crédito, además del módulo de facturación y el repositorio de archivos.

La facturación orquesta el CFDI 4.0 (facturas, globales, complementos de pago y cancelaciones) armando el comprobante y delegando el timbrado a un PAC externo mediante `curl` hacia `TIMBRADO_API_URL`. Un parser de PDF (smalot/pdfparser) extrae los datos fiscales directamente de la Constancia de Situación Fiscal del cliente (RFC, razón social, régimen), eliminando la captura manual. PHPMailer maneja notificaciones y recordatorios; una librería de QR (endroid) genera los códigos de los comprobantes. La generación de PDF de cotizaciones degrada de forma controlada a "PDF simulado" cuando dompdf no está instalado.

## Mi rol

Diseñé e implementé el sistema completo, del backend PHP al frontend en Vanilla JS. Modelé los roles y sus capacidades, las cuotas de almacenamiento por rol (configurables vía `CUOTA_{ROL}_MB`) con alertas por correo, la integración con el PAC de timbrado, el parseo de la constancia fiscal y el branding de login configurable. Lo desplegué sobre la infraestructura existente del cliente, con soporte responsive.

## Resultado

Teotech emite CFDI 4.0 conformes desde su propio sistema sin depender de portales externos, y gestiona pedidos, cotizaciones, pagos y crédito en un solo lugar según el rol de cada usuario. El repositorio con cuotas reemplazó las carpetas compartidas sin control, y las alertas automáticas redujeron el riesgo de documentos vencidos sin que nadie los detectara.

## Aprendizaje notable

Diseñar la integración de timbrado como una llamada a un PAC externo, en lugar de intentar timbrar dentro del sistema, mantuvo la responsabilidad fiscal fuera del código y lo hizo mucho más simple de mantener. La misma disciplina aplicó a dompdf: guardar la generación de PDF detrás de un `class_exists` y degradar a "PDF simulado" permite operar el resto del CRM aunque una dependencia opcional no esté presente.
