---
title: "CRM de Pedidos — Sistema de Gestión para Institución Educativa"
slug: crm-pedidos
client: Teotech
year: 2025
yearRange: "2023–2025"
stack: ["PHP", "MySQL", "JavaScript", "Font Awesome"]
summary: "CRM web interno con roles, gestión de pedidos, ajustes de cantidad y dashboard por nivel de usuario."
role: "Backend Developer"
placeholder: true
confidential: true
locale: es
order: 7
---

## El problema

Una institución educativa privada necesitaba digitalizar su proceso interno de pedidos y facturación: roles diferenciados (administrador, operador, consulta), gestión de órdenes con ajustes de cantidad, procesamiento de tickets y un dashboard que mostrara el estado del negocio según el nivel de acceso del usuario.

## La solución

Desarrollé un sistema CRM web en PHP 8+ con MySQL, autenticación basada en sesiones y control de acceso por rol. La arquitectura es MVC ligero: controladores PHP para la lógica de negocio, modelos con consultas preparadas (evitando SQL injection), y vistas HTML + Vanilla JS + Font Awesome para la interfaz.

El módulo de pedidos incluye ajustes de cantidad con historial de cambios, procesamiento de tickets con estados configurables, y un dashboard adaptativo que muestra métricas distintas según el rol del usuario autenticado.

## Mi rol

Diseñé el modelo de datos, implementé el sistema de roles y permisos, desarrollé los módulos de pedidos y dashboard, y entregué el sistema listo para producción con instrucciones de despliegue en la infraestructura del cliente.

## Resultado

La institución centralizó su proceso de pedidos internos, eliminando el uso de hojas de cálculo. El control de roles garantiza que cada usuario ve únicamente la información relevante para su función. El historial de cambios en pedidos proporciona trazabilidad para auditorías internas.

## Nota de confidencialidad

Este proyecto es para un cliente del sector educativo privado. Por acuerdo de confidencialidad, no se incluyen nombres del cliente, datos de usuarios ni detalles del negocio. El foco de esta entrada es la arquitectura técnica y el alcance del trabajo realizado.
