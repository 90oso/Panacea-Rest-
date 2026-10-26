# 08 — Calidad, pruebas, seguridad y riesgos

## Evidencia real de pruebas en repositorio

El workflow `.github/workflows/panacea-studio-checks.yml` ejecuta:

- `php -l` de rutas, controladores, servicios y migraciones Panacea.
- `node --check` para JavaScript principal, portal, imágenes, shell y tutorial.
- `tests/panacea-studio-dom-smoke.mjs`: navegación/estado Demo-Real en DOM simulado.
- `tests/panacea-studio-shell-smoke.mjs`: colapsado, expansión, móvil, tema y atributos accesibles.
- `tests/panacea-guest-smoke.mjs`: búsqueda, escapado de contenido, CSRF y respuesta de solicitud pendiente.
- `tests/panacea-menu-imagery-smoke.mjs`: imágenes nativas prioritarias, respaldo etiquetado y controles de URL.
- `tests/panacea-presenter-quest-smoke.mjs`: rutas exprés/completa, navegación sin escrituras, foco, teclado y autoplay.
- `tests/panacea-regression-guards.mjs`: ruta `/experiencia`, fallos degradables y pruebas básicas de contraste.

También existe `.github/workflows/pipeline.yml`, que prepara PHP 8.3/8.4/8.5 y Composer para la canalización general.

**Alcance de la evidencia:** estas comprobaciones son sintácticas o de unidades/simulaciones del DOM. **No prueban por sí solas** disponibilidad, concurrencia MariaDB, seguridad de producción, cobertura de APIs ni la secuencia real integral con navegador.

### Plan de pruebas recomendado

| ID | Escenario de aceptación | Resultado esperado | Evidencia actual |
| --- | --- | --- | --- |
| QA-01 | Abrir Studio en Docker | Sin HTTP 500 y health correcto | Pendiente prueba local reciente |
| QA-02 | Modo Demo → Real → Demo | Sin mezclar datos ni mantener cambios ficticios en BD | Smoke DOM |
| QA-03 | Crear dos reservas superpuestas | Segunda rechazada | Requiere integración DB |
| QA-04 | Abrir dos servicios de la misma mesa concurrentemente | Uno solo activo | Requiere prueba de concurrencia |
| QA-05 | Precio de menú alterado por cliente | Backend usa precio nativo | Requiere integración DB |
| QA-06 | Preparación con receta y stock bajo | Rechaza avance; no descuenta ni cambia estado | Requiere integración DB |
| QA-07 | Enviar dos veces el mismo abono | Una sola entrada | Requiere integración DB |
| QA-08 | Cerrar con pedidos sin entregar | Cierre rechazado | Requiere integración DB |
| QA-09 | Solicitud cliente → recepción | Estado `pending`, luego confirmación voluntaria | Smoke parcial y E2E pendiente |
| QA-10 | Contraste y navegación teclado | Cumplimiento WCAG AA por pantalla | Smoke de contrastes parciales |
| QA-11 | Guía en móvil y escritorio | Spotlight legible, foco y salir seguros | Smoke JS, prueba visual pendiente |
| QA-12 | Usuario sin permiso accede a pago/reserva | 403 y auditoría atribuida | **No implementado** |
| QA-13 | Reinicio app y DB | Persistencia, sin datos demo contaminando | Pendiente |
| QA-14 | Backup + restauración de BD | Recuperación comprobada | Pendiente |

## Riesgos clasificados

| ID | Riesgo | Severidad | Mitigación mínima |
| --- | --- | --- | --- |
| R-01 | Rutas locales con mutaciones sin autenticación ni permisos por rol | **Crítica** para exposición pública | No publicar; auth + policies + pruebas |
| R-02 | Dos modelos operativos (Panacea vs TastyIgniter) divergentes | Alta | Contratos nativos, pruebas de conciliación y estrategia de migración |
| R-03 | Pago manual confundido con pago bancario o factura | Alta | Etiquetas explícitas, pasarela y fiscalidad verificadas antes de comercializar |
| R-04 | Reservas nativas con estados aún no mapeados | Alta | Mapeo de estados, verificación de horarios y contratos |
| R-05 | Datos personales almacenados sin política completa de privacidad | Alta | Consentimiento, retención, seguridad, acceso mínimo y borrado |
| R-06 | Contabilizar stock/costo Panacea como inventario oficial | Alta | Identificar subregistro, reconciliar con sistema nativo |
| R-07 | Concurrencia/reintentos no cubierta integralmente | Alta | Pruebas simultáneas DB, restricciones únicas e idempotencia |
| R-08 | Auditoría sin `user_id` autenticado | Alta | Identidad por evento, timestamps confiables y trazabilidad |
| R-09 | Ilustraciones externas confundidas con fotos del restaurante | Media | Etiqueta ilustrativa, medios propios autorizados |
| R-10 | Cambios directos incompatibles con versiones futuras de TastyIgniter | Media | Extensiones adaptadoras y pruebas al actualizar |
| R-11 | Pérdida de datos de volumen durante operación Docker | Alta | Backup automatizado y restauración validada |
| R-12 | Recomendaciones/escenarios interpretados como métricas fiscales | Media | Fuentes y cobertura de costos visibles y advertencias |

## Seguridad existente, pero insuficiente

- Rutas de Studio y portal limitadas por el servidor a `APP_ENV=local`.
- Protección CSRF propia de Laravel en formularios POST.
- Validación de entradas en controladores y servicio.
- Transacciones y algunos `lockForUpdate()` en mesas, sesiones, órdenes, stock/pagos.
- Validación de saldo antes de abonos, y `idempotency_key` único para evitar duplicados del mismo envío.
- `throttle:6,1` para solicitud de reserva web.
- Los archivos visuales distinguen imágenes nativas de ilustrativas; se escapa texto de usuario en vistas generadas por JS.

**No disponible actualmente:** autenticación productiva y RBAC/ABAC, autorización por acción y local/sucursal, auditoría con actor, seguridad de sesiones endurecida y protección antiabuso de nivel producción.

## Política de no exposición

1. Mantener `APP_ENV=local` solo en ordenador aislado, puerto limitado a `127.0.0.1`.
2. No crear túneles públicos ni publicar este Docker.
3. No introducir datos reales de clientes durante grabaciones.
4. No subir `.env`, contraseñas, tokens, backups, fotos sin permiso ni logs con PII.
5. Cumplir la licencia MIT del núcleo TastyIgniter y revisar licencias de extensiones/fotografías.
6. Revisar obligaciones aplicables en Panamá antes de gestionar datos y cobros reales.

## Calidad del proceso de desarrollo

- Trabajar en rama `feat/panacea-restaurant-mvp`; proteger rama base.
- PR con propósito, requerimientos, casos de uso, capturas y pruebas.
- Ejecutar lint/CI antes de marcar una función terminada.
- No alterar archivos `vendor/` como método de integración.
- Corregir la raíz del fallo antes de añadir funciones; casos como HTTP 500 requieren logs.
- Añadir pruebas DB y de navegador (Playwright o equivalente) antes de desplegar.
- Definir y medir objetivos de rendimiento, seguridad, disponibilidad y recuperación; no suponerlos alcanzados.

## Gate para cambiar estado a «listo para producción»

No marcarlo hasta cumplir de manera demostrable: identidad/permisos, integración nativa, fiscalidad/pagos pertinentes, pruebas E2E, pruebas de concurrencia, seguridad/privacidad, backup probado, monitoreo, validación por responsables del restaurante y operación de despliegue/rollback.
