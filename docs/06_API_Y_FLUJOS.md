# 06 — Contratos HTTP, estados y flujos

**Alcance:** solo entornos con `APP_ENV=local`. Son **rutas de desarrollo**, no una API pública versionada lista para producción. Los métodos POST de Laravel esperan token CSRF y credenciales de origen cuando corresponde.

## Mapa de rutas

| Método | Ruta | Función | Persistencia |
| --- | --- | --- | --- |
| GET | `/` | Web nativa de TastyIgniter | Nativa |
| GET | `/admin` | Administración TastyIgniter | Nativa |
| GET | `/panacea-operations` | Redirigir a administración nativa | — |
| GET | `/panacea-preview` | Blade del Operations Studio | — |
| GET | `/panacea-preview/state` | Estado local de Panacea + datos nativos de lectura | Lectura |
| GET | `/panacea-preview/health` | Diagnóstico de tablas e integración local | Lectura |
| POST | `/panacea-preview/action` | Comandos según campo `type` | Tablas Panacea |
| POST | `/panacea-preview/floor-plan` | Edición de mesas nativas + elementos Panacea | Mixta (local) |
| GET | `/experiencia` | Portada/carta para clientes | Catálogo nativo lectura |
| POST | `/experiencia/reservar` | Registrar solicitud cliente pendiente | Tabla Panacea |

La petición del portal tiene límite de velocidad `throttle:6,1` definido en la ruta; este control aislado no reemplaza una estrategia antiabuso.

## GET /panacea-preview/state

Devuelve JSON con colecciones de Studio: `mode`, `migrated`, `areas`, `tables`, `menus`, `native_reservations`, `native_links`, `reservations`, `sessions`, `orders`, `lines`, `payments`, `extensions`, `source_counts`.

- `areas` y `tables`: representan áreas/mesas configuradas mediante TastyIgniter.
- `menus`: producto, precio, descripción/fotografía opcional.
- `reservations`, `sessions`, `orders`, `lines`, `payments`: **Panacea**, no `reservations/orders` nativas.
- `extensions`: inventario, recetas, perfiles, personal, incidencias y auditoría, con estado `ready`.
- `source_counts`: conteos informativos nativos.

No confundir los campos de demo del frontend con la respuesta real; el modo ficticio es generado en el navegador.

## GET /panacea-preview/health

Contiene, entre otras propiedades: `service_schema_ready`, `management_schema_ready`, `management_snapshot_ready`, `management_snapshot_reason`, `native_tables_present`, `native_integration`, `live_payments=false`, `tax_invoicing=false` y `access_control_for_production=false`. Solo indica preparación de esquema/consultas; **no prueba integración end-to-end**.

## POST /panacea-preview/action

Todas las operaciones utilizan el campo `type`; los payloads siguientes muestran los **campos principales**. La validación completa está en los controladores/servicios.

| `type` | Campos relevantes | Efecto actual |
| --- | --- | --- |
| `reserve` | `table_id,guest_name,party_size,reserved_at,notes?` | Reserva interna confirmada |
| `confirm_reservation` | `reservation_id` | `pending→confirmed` |
| `cancel_reservation` | `reservation_id` | `pending/confirmed→cancelled` |
| `seat` | `table_id,guest_name,party_size,reservation_id?,guest_profile_id?` | Sesión abierta |
| `add_order` | `session_id,items:[{menu_id,qty}]` | Orden pendiente, precio tomado del servidor |
| `advance_order` | `order_id` | Siguiente etapa de cocina (consume receta al empezar) |
| `pay` | `session_id,amount,method,idempotency_key` | Abono **manual** |
| `close` | `session_id` | Cierra sesión solo si está lista |
| `ingredient_create` | `name,unit,min_stock,unit_cost` | Ingrediente Panacea |
| `stock_receive` | `ingredient_id,quantity,unit_cost,note?` | Entrada de existencias |
| `recipe_set` | `menu_id,ingredient_id,quantity` | Asociación/upsert de receta |
| `profile_create` | `display_name,contact_opt_in` | Perfil de cliente |
| `staff_create` | `display_name,role,shift_label?` | Directorio de personal |
| `incident_create` | `title,severity,owner_label?,dining_table_id?` | Incidencia abierta |
| `incident_resolve` | `incident_id` | Marca resuelta |

Ejemplo ilustrativo de operación **en desarrollo local**:

```http
POST /panacea-preview/action
Content-Type: application/json
Accept: application/json
X-CSRF-TOKEN: <TOKEN_DE_LA_SESION>

{
  "type": "add_order",
  "session_id": 1,
  "items": [{"menu_id": 3, "qty": 2}]
}
```

No es un endpoint de pedido cliente público; no enviar cargas ficticias sobre una base que contenga información real. El cliente web obtiene automáticamente el token CSRF.

### Condiciones relevantes de negocio

- `reserve`: capacidad y fecha entre ahora y 90 días; solapamiento de reservas Panacea y enlaces nativos próximos.
- `seat`: evita más de un servicio abierto por mesa, respeta reserva confirmada.
- `add_order`: entre 1 y 30 líneas, cada cantidad 1 a 30; precio reconsultado a `menus`.
- `advance_order`: no saltar estados; receta con stock insuficiente impide iniciar preparación.
- `pay`: monto positivo a dos decimales, método etiquetado `cash|card|other`, clave idempotente de 16 a 80 caracteres. **`card` no cobra una tarjeta; solo registra una etiqueta manual.**
- `close`: exige saldo cero y órdenes terminadas.
- Acciones de inventario/gerencia exigen migraciones de extensión.

## POST /experiencia/reservar

Cuerpo validado:

```json
{
  "guest_name": "Cliente de prueba",
  "email": "prueba@example.test",
  "party_size": 2,
  "reserved_at": "2026-11-10 19:00:00",
  "privacy_consent": true
}
```

**Valores de ejemplo**, no reserva realizada ni disponibilidad comprobada. Regla actual: entre 30 minutos y 60 días; 1 a 16 personas; consentimiento obligatorio; búsqueda de mesa compatible y controles de conflicto.

Respuesta esperada al crear:

```json
{
  "ok": true,
  "request_id": 123,
  "status": "pending",
  "message": "Solicitud recibida. La reserva todavía no está confirmada."
}
```

El identificador `123` es ilustrativo. HTTP `201` indica solicitud creada, **no confirmación de mesa**.

## POST /panacea-preview/floor-plan

Campos: `area_id`, `positions:[{id,x,y,rotation}]`, `properties?:[{id,name,capacity,shape}]`, `elements?:[{kind,x,y,width,height,label?}]`. La carga debe pertenecer al área seleccionada y cumplir límites de validación.

`shape` acepta `rectangle` y `round`; `kind` acepta `wall,door,window,aisle`. Escribe `seat_layout`/propiedades nativas de mesas y `panacea_floor_elements`.

## Errores y seguridad

| Código | Significado habitual |
| --- | --- |
| 201 | Solicitud web registrada como pendiente |
| 200 | Consulta/acción aceptada |
| 404 | No existe recurso o ruta deshabilitada fuera de `local` |
| 419 | CSRF o sesión inválida (convención Laravel) |
| 422 | Validación de datos o regla de negocio |
| 429 | Límite de solicitudes en portal |
| 503 | Faltan migraciones o preparación del entorno |
| 500 | Excepción inesperada; revisar logs Laravel |

Los mensajes de respuesta no deben revelar información sensible. **No invocar estos endpoints desde Internet en producción:** el código aún carece de autenticación/autorización por puesto, aunque esté limitado a `APP_ENV=local`.
