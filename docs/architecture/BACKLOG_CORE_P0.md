# Backlog de extracción P0 — Panacea Core independiente

**Estado:** preparado para trasladarse a una herramienta de seguimiento. El repositorio actual tiene GitHub Issues deshabilitadas, por lo que estas tareas se versionan aquí.  
**Prioridad:** independencia del runtime **antes** de ampliar módulos comerciales.

| ID | Trabajo | Archivos/artefactos de salida | Criterio verificable |
|---|---|---|---|
| PC-001 | Fijar versión legado y probar backup local | SHA, backup fuera de Git, guía de restauración | Demo existente no se modifica |
| PC-002 | Crear proyecto Laravel limpio en repositorio nuevo | Docker distinto + composer propio + health | `docker compose up --build`, sin dependencia Igniter |
| PC-003 | Diseñar esquema Panacea | ER, migraciones, modelos de sala/producto/servicio | `migrate:fresh` solo en BD de pruebas, constraints válidas |
| PC-004 | Implementar autenticación/roles desde inicio | login, middleware, policies, auditoría actor | Un mesero no ejecuta cierre de caja sin autorización |
| PC-005 | Definir API versionada y DTOs | OpenAPI o contrato JSON `/api/v1/` | Unit tests de validación y respuestas estables |
| PC-006 | Mesas y ocupación | Area, Table, Session, Services | No doble sesión en concurrencia |
| PC-007 | Catálogo y precio exacto | Product, Price, Media | Backend calcula montos sin float y fotografía propia |
| PC-008 | Comandas y cocina | Order, OrderItem, OrderEvent, KDS | Estados válidos y sin pérdidas por reintento |
| PC-009 | Caja manual idempotente | Register, Shift, CashMovement, Payment | No abono duplicado ni cierre con deuda |
| PC-010 | Migrar interfaz y tour | Studio modular + CSS + Presenter Quest | Demo/Real sin estado mezclado, visual/teclado accesible |
| PC-011 | Extender reservas e inventario | Reservation, Recipe, StockLedger | Disponibilidad + consumo una sola vez |
| PC-012 | Plan de migración de datos | Exportador, mapeo IDs, pruebas y conciliación | Cantidades e importes coinciden, sin PII en fixtures |
| PC-013 | Trazabilidad y licencias | Provenance, avisos MIT si hay código reutilizado, SBOM | Dependencias trazables y sin assets ajenos sin permiso |
| PC-014 | Gate de independencia y PR | CI, E2E, checklist firmado | Todas las condiciones de `PRUEBA_DE_INDEPENDENCIA.md` pasan |

## Primeros tres PR del nuevo repositorio

**PR 1 — Base:** aplicación Laravel limpia, Docker separado, auth inicial, CI y health. No implementar pantallas del POS todavía.

**PR 2 — Dominio:** modelos de Mesa/Producto/Servicio/Pedido y migraciones nuevas con restricciones, fixtures y pruebas DB.

**PR 3 — Primera vertical:** abrir mesa, añadir comanda, mover cocina a servido, registrar pago manual y cerrar con auditoría. Probar concurrencia e idempotencia.

El frontend puede avanzar en paralelo contra DTOs simulados, pero no fusionar con backend sin contratos y pruebas.

## Regla para la demo histórica

No eliminar `tastyigniter/core` del repositorio anterior ni reescribir `composer.json` allí; ello rompería su funcionamiento mientras el nuevo Core se construye.

Enlazar cada futuro PR con [auditoría](AUDITORIA_INDEPENDENCIA.md), [ADR-001](ADR_001_CORE_INDEPENDIENTE.md), [plan](PLAN_MIGRACION_CORE.md) y [gate](PRUEBA_DE_INDEPENDENCIA.md).
