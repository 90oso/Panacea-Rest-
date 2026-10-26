# Plan ejecutable — Migración a Panacea Standalone

**Principio operativo:** no romper la demo; migrar funcionalidad por vertical completa, con pruebas y sin arrastrar tablas antiguas a una nueva base.  
**Referencia:** [Auditoría](AUDITORIA_INDEPENDENCIA.md) · [Inventario CSV](INVENTARIO_INDEPENDENCIA.csv) · [ADR-001](ADR_001_CORE_INDEPENDIENTE.md).

## Etapa 0 — Congelar la versión actual

**Acciones**
1. Mantener `90oso/Panacea-Rest-` en `feat/panacea-restaurant-mvp` como versión de demostración.
2. Guardar commit base SHA, lista de dependencias y licencia, capturas principales.
3. Exportar una copia de la BD de prueba y comprobar que restaura en contenedor **separado**. No incluir datos personales en Git.
4. Registrar configuración, rutas, esquemas y resultados de aceptación, incluidos bugs conocidos.

**Salida:** punto de retorno verificable y sin escrituras del proyecto nuevo en la BD vieja.

## Etapa 1 — Crear base Laravel propia

**Acciones**
1. Crear repositorio independiente `panacea-restaurant` y proyecto Laravel limpio compatible con la plataforma de despliegue.
2. Elegir y fijar versión del framework y PHP; dejar `composer.lock` y lockfile frontend versionados según convenga.
3. Configurar Docker con nombre de proyecto, volúmenes, red, rutas y credenciales **distintos** del proyecto anterior. No montar el volumen `panacea_db`.
4. Implementar `/health`, CI de sintaxis/pruebas, migraciones base, logging y configuración local.
5. Crear autenticación y primera autorización `can('sales.create')` / policy equivalente.
6. Documentar paquete propio, licencia y referencias de terceros.

**Salida:** `docker compose up --build` desde cero; app y DB correctas, sin clases, paquetes, archivos de marca ni tablas Igniter.

## Etapa 2 — Modelos y contratos propios

**Acciones**
1. Diseñar desde dominio `Organization,Location,FloorArea,DiningTable,Product,Reservation,ServiceSession,Order,OrderItem,Payment,Ingredient,StockMovement,AuditEvent`.
2. Publicar diccionario de datos, estados y diagrama ER. Construir primeras migraciones.
3. Crear DTOs para operaciones de negocio y respuestas REST `/api/v1/...`, sin exportar nombres `menu_id` o `ti_*` del sistema antiguo.
4. Especificar invariantes, bloqueo y esquema de idempotencia; probar dos operaciones simultáneas sobre misma mesa.

**Salida:** fixtures sintéticos con mesa y producto, CRUD mínimo autenticado, DB íntegra.

## Etapa 3 — Primera vertical completa de venta

Prioridad máxima: **salón → abrir mesa → comanda → cocina → pago manual → cerrar**.

**Acciones**
1. `DiningTable` y ocupación propia; `ServiceSession` por mesa.
2. `Order` y `OrderItem` con precio exacto, líneas editables, notas y estados.
3. `KitchenTicket` o eventos de estado para KDS.
4. `CashShift`, pago manual idempotente y cierre con saldo correcto.
5. Registrar eventos de auditoría y autor por cada cambio.
6. Integración HTTP y pruebas con MariaDB; simulación de reintentos y fallos.

**Salida:** flujo E2E validado con dos navegadores/usuarios, y sin TastyIgniter. **Pago bancario/factura real NO se incluye aún.**

## Etapa 4 — Portar interfaz Panacea

**Acciones**
1. Mover plantillas y CSS propios, limpiar marca/URL/labels TastyIgniter y unificar capas visuales.
2. Dividir `studio.js` por dominio: estado/fuentes, salón, reservas, pedidos, cocina, caja, inventario, gerencia, experiencia cliente.
3. Mantener sidebar, glass dark/light, fotos, accesibilidad, modo guiado y barra responsive.
4. Sustituir `/panacea-preview` por rutas de producto propias mediante redirecciones solo de desarrollo si es necesario.
5. Modo Demo usa fixtures independientes, no copias de registros reales que pudieran contener datos personales.

**Salida:** navegación sin fallos, mismo nivel UX, pruebas de contraste/teclado/E2E con nuevo API.

## Etapa 5 — Reservas, inventario y experiencia cliente

**Acciones**
1. Reserva propia con zona horaria, duración, capacidades, disponibilidad y cancelación.
2. Validar reservas concurrentes y sesiones abiertas; evitar sobrerreservas.
3. Incorporar ingredientes, recetas, entradas, consumos, mermas y conteo de stock.
4. Catálogo fotográfico servido desde almacenamiento propio, con políticas/licencias por medio.
5. Portal cliente, notificaciones y privacidad antes de abrirlo al público.

**Salida:** reservas/stock end-to-end sin consultas `reservation_tables`, `menus` ni `dining_tables` del legado.

## Etapa 6 — Exportar datos del sistema anterior (solo si se necesitan)

**IMPORTANTE:** No empezar esta etapa sin inventario de la información a exportar y reglas de privacidad.

- Fuente: DB antigua de prueba en **solo lectura**.
- Destino: DB nueva con migraciones propias; nunca compartir volumen.
- CSV/JSON o migrador bajo prueba con campos permitidos y mapa de IDs; no copiar prefijo `ti_` ni historial de extensiones innecesario.
- Mapas mínimos: `(old_area_id,new_area_id)`, `(old_table_id,new_table_id)`, `(old_menu_id,new_product_id)`, `(old_reservation_id,new_reservation_id)`.
- Relacionar datos de `panacea_service_sessions`, `panacea_service_orders`, líneas, pagos, receta y movimientos solo tras mapear IDs.
- Dry-run sin escrituras productivas; conteos de origen/destino, sumas en centavos, hashes y errores referenciales.
- Revisión manual y corte único para evitar escritura simultánea en dos sistemas.
- Capturas de backup y rollback, y eliminación segura de exportaciones temporales.

**Salida:** informe de conciliación firmado y sin referencias huérfanas, sin pérdida de datos autorizados.

## Etapa 7 — POS comercial y operación real

- Autorizaciones por usuario/puesto y auditoría.
- Caja por turnos, arqueos, anulaciones, devoluciones, pagos mixtos y conciliación.
- Facturación y cumplimiento fiscal aplicable en Panamá tras selección de proveedor/mecanismo autorizado.
- Impresoras, terminales, red, monitoreo, backups y restauración ensayada.
- Pruebas de carga, concurrencia, recuperación, accesibilidad y seguridad.
- Piloto controlado y criterios de go/no-go.

**Salida:** autorización de operación real basada en pruebas, no en apariencia de demo.

## Forma de trabajo: frentes independientes

| Frente | Primer PR | Dependencia |
|---|---|---|
| A — Core/infra | Laravel limpio, health, CI, DB nueva | Inventario |
| B — Dominio | Modelos de mesa y catálogo, reservas, casos de uso | A |
| C — UX | UI y modo demo con API mock estable | Contrato JSON acordado |
| D — Calidad | Pruebas E2E, seguridad y conciliación | A+B, paralelo desde el inicio |

### Criterios para cada PR

- Issue con requisito RF/UC y resultado verificable.
- Prueba que falla antes de implementación, luego pasa.
- No agregar dependencias TastyIgniter ni permisos por defecto abiertos.
- Prueba negativa (duplicados/permisos/concurrencia).
- Capturas si cambia UX; ejemplo de API y documentación si cambia contrato.
- CI y revisión; sin modificar `main` directamente.
