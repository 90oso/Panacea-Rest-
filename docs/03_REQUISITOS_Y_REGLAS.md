# 03 — Especificación de requisitos y reglas del negocio

**Versión de análisis:** 2026-10-26 · **Contexto:** rama `feat/panacea-restaurant-mvp`.  
Los requisitos reflejan tanto el software **existente** como el **objetivo pendiente**. No constituyen certificación de producción.

## Convenciones

- **I:** implementado como función Panacea, con verificación de código y smoke tests cuando aplica; se requiere aceptación local.
- **P:** parcial, limitado o falta sincronización nativa.
- **S:** simulación en navegador, explícitamente ficticia.
- **F:** requisito futuro.
- **Prioridades:** Alta / Media / Evolutiva. Son propuestas de planificación, no compromisos de entrega.

## Requisitos funcionales

| ID | Requisito verificable | Estado | Prioridad | Caso |
| --- | --- | --- | --- | --- |
| RF-01 | Mostrar resumen de mesas, servicios, reservas y comandas según fuente | I | Alta | UC-01 |
| RF-02 | Alternar entre datos ficticios y locales sin mezclarlos | I | Alta | UC-01 |
| RF-03 | Editar posiciones, rotaciones, forma, nombre y capacidad de mesas | I | Media | UC-04 |
| RF-04 | Persistir paredes, puertas, ventanas y pasos del plano 2D | I | Media | UC-04 |
| RF-05 | Registrar y consultar reservas por mesa/fecha/comensales | P | Alta | UC-02 |
| RF-06 | Recibir solicitud pública y dejarla pendiente de confirmación | P | Alta | UC-02 |
| RF-07 | Detectar conflictos de horario y capacidad antes de confirmar | P | Alta | UC-02 |
| RF-08 | Confirmar o cancelar reservas válidas | P | Alta | UC-02 |
| RF-09 | Abrir un solo servicio Panacea activo por mesa | I | Alta | UC-03 |
| RF-10 | Vincular servicio a reserva o perfil registrado cuando corresponda | I | Media | UC-03 |
| RF-11 | Crear comandas por servicio con productos/precio nativos | P | Alta | UC-05 |
| RF-12 | Transicionar `pending→preparing→ready→served` en cocina | I | Alta | UC-06 |
| RF-13 | Registrar abonos manuales sin exceder saldo ni duplicar envío | P | Alta | UC-07 |
| RF-14 | Cerrar servicio solo sin deuda ni pedidos por entregar | I | Alta | UC-07 |
| RF-15 | Crear ingredientes, mínimo, unidad y costo | I | Media | UC-08 |
| RF-16 | Registrar entradas y receta por producto | I | Media | UC-08 |
| RF-17 | Descontar receta al comenzar preparación y evitar doble consumo | P | Alta | UC-06/08 |
| RF-18 | Crear perfiles de clientes con consentimiento explícito | I | Media | UC-09 |
| RF-19 | Contabilizar visita de perfil vinculado al cerrar servicio | I | Media | UC-09 |
| RF-20 | Crear integrantes y turnos informativos | I | Media | UC-10 |
| RF-21 | Registrar incidencias, prioridades y resolución | I | Media | UC-11 |
| RF-22 | Mostrar métricas y señales basadas en reglas y fuentes identificadas | P | Media | UC-12 |
| RF-23 | Simular precio, costo, demanda y descuento sin guardar ventas | S | Evolutiva | UC-13 |
| RF-24 | Mostrar catálogo con fotografía real/ilustrativa distinguida | I | Media | UC-14 |
| RF-25 | Ofrecer recorrido guiado exprés/completo sin acciones de negocio | I | Media | UC-15 |
| RF-26 | Autenticar y autorizar individualmente cada operación sensible | F | Alta | UC-16 |
| RF-27 | Sincronizar reservas, pedidos, stock y estados con TastyIgniter nativo | F | Alta | UC-17 |
| RF-28 | Procesar pagos/facturación/conciliación conforme a normativa aplicable | F | Alta | UC-18 |
| RF-29 | Gestionar proveedores, lotes, mermas, devoluciones y compras integrales | F | Media | UC-19 |
| RF-30 | Notificar confirmaciones y cambios de reserva al cliente | F | Media | UC-20 |
| RF-31 | Atribuir auditoría a usuario autenticado con permisos y trazabilidad | F | Alta | UC-16 |
| RF-32 | Ofrecer multirestaurante/multisucursal con aislamiento de datos | F | Evolutiva | UC-21 |

**Nota de trazabilidad:** RF-05 a RF-08 y RF-11 son parciales porque se guardan en Panacea, **no porque sean ya reservas o comandas nativas plenamente integradas**. RF-17 funciona en el subinventario Panacea cuando la receta está configurada; no actualiza stock nativo.

## Requisitos no funcionales

| ID | Objetivo y criterio de aceptación propuesto | Estado |
| --- | --- | --- |
| RNF-01 Seguridad | Rutas de mutación protegidas por login, permisos y CSRF, con pruebas de acceso no autorizado | **Pendiente producción**; actualmente local-only + CSRF |
| RNF-02 Integridad | Consumo, pago y cierre transaccionales, con pruebas de reintento y simultaneidad | Parcial; se usan transacciones/bloqueos y clave idempotente para pago |
| RNF-03 Privacidad | Datos mínimos, consentimiento, retención/borrado y avisos apropiados | Parcial; faltan políticas completas |
| RNF-04 Accesibilidad | Navegación por teclado, focos visibles, contraste WCAG AA y movimiento reducido | Parcial; CSS/pruebas de contraste y tour, falta auditoría integral |
| RNF-05 Responsive | Operable en móvil/tablet/escritorio con pruebas de navegador real | Parcial |
| RNF-06 Observabilidad | Errores estructurados, correlación por solicitud y diagnóstico por entorno | Parcial; Laravel logs y `/health` local |
| RNF-07 Disponibilidad | SLA definido y verificado con métricas/alertas | Pendiente; no asignar números sin acuerdo |
| RNF-08 Rendimiento | Presupuesto de respuesta/consulta y prueba bajo carga definida | Pendiente medición |
| RNF-09 Mantenibilidad | Código modular, contratos versionados, pruebas automatizadas y documentación sincronizada | Parcial; lógica Studio extensa |
| RNF-10 Compatibilidad | Contratos de extensión/TastyIgniter fijados por versión y pruebas de actualización | Pendiente formalizar |
| RNF-11 Portabilidad | Desarrollo reproducible en Docker, sin secretos en repositorio | Parcial; entorno local documentado |
| RNF-12 Respaldo | Copias comprobadas y restauración de MariaDB/archivos | Pendiente procedimiento validado |
| RNF-13 Consistencia visual | Demo y Real comparten composición y distinguen fuentes | Implementado a nivel de interfaz |
| RNF-14 Internacionalización | Español y configuración correcta de zona horaria/moneda | Parcial; varias reglas usan America/Panama/USD |
| RNF-15 Cumplimiento | Fiscal, pagos, protección de datos y licencias documentados y verificados antes de lanzamiento | Pendiente |

## Reglas de negocio comprobables

| Regla | Implementación actual | Observación |
| --- | --- | --- |
| RN-01 | Capacidad entre mínimo y máximo configurados por mesa | Validación del controlador |
| RN-02 | Reservas staff: próximas hasta 90 días | Solicitudes cliente: 30 min a 60 días, grupos 1–16 |
| RN-03 | Duración operativa por defecto: 90 minutos | Solapamiento conservador en la misma mesa |
| RN-04 | `pending`/ `confirmed` Panacea impiden reserva concurrente | Estados nativos aún sin equivalencia verificada |
| RN-05 | Una mesa no puede tener dos sesiones Panacea `open` | Validación dentro de transacción y bloqueo |
| RN-06 | Una reserva solo se recibe si está `confirmed` y pertenece a esa mesa | Al recibir pasa a `seated` |
| RN-07 | Solo se comanda en una sesión `open` | El servidor usa el precio del catálogo nativo |
| RN-08 | Cocina progresa en orden: `pending→preparing→ready→served` | El cambio inicial puede consumir receta |
| RN-09 | Stock insuficiente de ingrediente con receta impide iniciar preparación | Sin receta no hay consumo; registrar cobertura faltante |
| RN-10 | Abono manual debe ser positivo, como máximo saldo y con clave idempotente | `card` es etiqueta manual, NO pasarela |
| RN-11 | Cierre requiere saldo cero y órdenes entregadas | Una sesión cerrada no recibe comandas |
| RN-12 | Visitas se suman solo si hay perfil explícitamente vinculado | No se identifica por coincidencia de nombre |
| RN-13 | Solicitud web nace `pending` | No envía email ni confirma automáticamente |
| RN-14 | Modo Demo nunca debe invocar mutaciones reales | Verificación con pruebas JS, completar E2E |
| RN-15 | Todo Studio/portal Panacea es local-only en servidor | No equivalente a autenticación productiva |

## Criterios de aceptación de ejemplo

- Dada una mesa con reserva para las 19:00, al crear otra para las 19:30 debe rechazarse por solapamiento (verificar también límite ±90 min).
- Dada una comanda con receta de 0,2 kg por unidad y stock insuficiente, al iniciar preparación se rechaza y no cambia de estado.
- Dado un saldo de 25,00 USD, abono 30,00 USD debe rechazarse; reenviar la **misma** clave idempotente no debe sumar otro abono.
- Dada una sesión con pedido sin entregar, aun con saldo cero no debe cerrarse.
- Dado modo Demo activo, crear y modificar ejemplos no debe dejar registros nuevos en MariaDB.
- Dada visita en portal, respuesta 201 debe indicar `status=pending`, sin aparentar confirmación.

Estos criterios forman parte del **plan de aceptación**, no de resultados de pruebas E2E ya ejecutadas.
