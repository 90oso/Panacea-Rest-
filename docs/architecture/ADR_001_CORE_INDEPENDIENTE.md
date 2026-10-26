# ADR-001 — Panacea Restaurant como producto standalone

**Estado:** PROPUESTA PARA IMPLEMENTACIÓN (arquitectura elegida para el próximo Core; el repositorio vigente NO está migrado)  
**Fecha:** 2026-10-26 · **Ámbito:** Panacea Restaurant · **Responsables:** equipo técnico del proyecto.

## Contexto y motivación

La versión MVP está construida sobre la distribución TastyIgniter 4.x. Aunque existen pantallas, reglas y tablas Panacea, la instalación sigue dependiendo de `tastyigniter/core`, modelos `Igniter\\...`, configuración propia del proyecto anterior, y tablas nativas. Quitar únicamente la dependencia Composer rompe salón, reservas, catálogo, portal y acciones operativas.

La decisión del producto es poseer la totalidad del POS como **Panacea Core**, usando TastyIgniter **solo como fuente de aprendizaje y referencia de producto**, sin depender de su runtime, esquema, extensiones o administración.

## Decisión

1. Crear **nuevo proyecto Laravel limpio** en repositorio independiente, sin copiar la distribución completa TastyIgniter.
2. Usar arquitectura de **monolito modular** con dominios explícitos: Identidad/Accesos, Organización/Locales, Salón/Reservas, Catálogo/Productos, Venta/Servicios, Cocina, Pagos/Caja, Inventario/Recetas, Clientes, Incidencias, Informes y Auditoría.
3. Una única fuente de verdad **Panacea** por entidad: un pedido es un pedido Panacea; no habrá duplicación TastyIgniter/Panacea.
4. Diseñar tablas, migraciones e invariantes propias antes de portar controladores; migrar datos de pruebas solo mediante un exportador/importador aislado con mapeo de IDs.
5. Reusar **experiencia visual y requisitos** propios de Panacea, no el núcleo antiguo. El código visual requiere adaptación del contrato JSON y limpieza de referencias TastyIgniter.
6. Definir permisos, idempotencia, transacciones y auditoría **desde la primera vertical**. Cada caso de uso tendrá pruebas DB y E2E.
7. No desarrollar funcionalidades nuevas en la aplicación antigua salvo correcciones que protejan la demo o una necesidad explícita.
8. Conservar la rama `feat/panacea-restaurant-mvp` intacta como **fuente de referencia y respaldo**. No hacer un refactor destructivo ni eliminar tablas.

## Alternativas evaluadas

| Alternativa | Ventaja | Desventaja / razón de rechazo |
|---|---|---|
| Seguir integrando TastyIgniter | Aprovecha contratos y extensiones existentes | Viola objetivo de independencia del runtime |
| Quitar `tastyigniter/core` en el mismo repo | Menos pasos al inicio | Dejaría configuración, boot y muchas referencias rotas, además de historial/archivos heredados |
| Crear microservicios desde el inicio | Escalado independiente eventual | Complejidad y consistencia distribuida excesivas para MVP POS |
| **Nuevo Laravel + monolito modular (elegida)** | Control del núcleo, pruebas, propiedad de esquema y evolución | Esfuerzo de migrar reglas y UI; exige disciplina de producto |

## Organización propuesta del código

```text
app/
  Domain/
    Catalog/
    Floor/
    Reservations/
    Sales/
    Kitchen/
    Cash/
    Inventory/
    Customers/
    Staff/
    Reporting/
    Shared/
  Application/
    Commands/
    Queries/
  Infrastructure/
    Persistence/
    Payments/
    Printing/
    Notifications/
  Http/
    Controllers/
    Requests/
    Resources/
    Middleware/
    Policies/
resources/views/
resources/js/
database/migrations/
database/seeders/
tests/Unit/
tests/Feature/
tests/Integration/
tests/E2E/
```

Los namespaces concretos pueden evolucionar; **no introducir repositorios y abstracciones vacías** solo por seguir una plantilla. Una vertical pequeña debe demostrar contratos reutilizables.

## Diseño de entidades mínimas de la primera vertical

```text
organizations, locations
users, roles, permissions (según estrategia de auth)
floor_areas, dining_tables, floor_elements
menu_categories, products, product_prices, product_media
reservations
service_sessions
orders, order_items, order_events
payments (registro de cobro y estado autorizado)
cash_registers, cash_shifts, cash_movements
ingredients, recipes, recipe_lines, stock_movements
audit_events
```

Términos como `orders` y `products` son nombres de dominio genéricos, no dependencias de los modelos nativos antiguos.

### Invariantes desde la base

- Prohibir más de una sesión activa por mesa; asegurar integridad también en DB donde sea viable.
- Precios monetarios mediante enteros de la unidad monetaria menor o decimal exacto, nunca float para cálculos financieros.
- Pedidos versionados o bloqueados de forma optimista/pesimista para evitar pérdidas en modificaciones concurrentes.
- Pagos idempotentes, por proveedor y sesión/caja, sin guardar PAN/CVV.
- El inventario se mueve mediante ledger; **no disminuir stock por un evento reintentado**.
- Atribuir cada acción crítica a usuario/rol y ubicación.
- Separación estricta de datos Demo y Datos reales; Demo nunca consulta/modifica el store productivo.
- Migraciones reversibles cuando corresponda y estrategia de despliegue en dos etapas para cambios destructivos.
- Tiempo almacenado en UTC; display en zona horaria configurada del restaurante.

## Consecuencias y puertas de salida

**Positivas:** control integral de arquitectura, código, licencias, almacenamiento e integraciones; menor acoplamiento operativo.

**Costos:** escribir y probar aquello que resolvía el framework anterior, incluidos usuarios, menú, disponibilidad, permisos, tareas programadas, notificaciones, caja y auditoría.

**Gate de creación:** inventario documental aprobado, backend y esquema mínimos diseñados, paquete Laravel elegido y riesgos críticos reconocidos.

**Gate de independencia:** cero paquetes TastyIgniter en dependencias instaladas y manifiesto, cero imports/clases `Igniter\\` en runtime, cero consultas a tablas `ti_*`, arranque desde Docker limpio y transacción POS de extremo a extremo sin necesidad de datos ni archivos TastyIgniter.

## Propiedad intelectual

El nuevo repositorio empieza desde una instalación Laravel limpia, no desde un fork de TastyIgniter. Si posteriormente se reutiliza contenido sujeto a MIT, registrar origen, versión, archivo y atribución; respetar avisos y licencia. Toda extensión y recurso externo lleva revisión independiente.
