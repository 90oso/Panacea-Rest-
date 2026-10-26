# 10 — Guía de usuario y demostración de Panacea Restaurant

**Público:** personal de prueba, evaluadores y presentador comercial.  
**Entorno:** instalación local; no introducir datos de clientes reales durante demostraciones.

## Acceso a pantallas

- Panel operativo: `http://localhost:8088/panacea-preview`.
- Experiencia del cliente: `http://localhost:8088/experiencia`.
- Administración original: `http://localhost:8088/admin` (sujeta a cuenta y permisos nativos).
- El panel tiene barra lateral expandible, compacta u oculta; conserva preferencias de apariencia.

## Dos fuentes de datos

| Modo | Qué ves | Qué ocurre al modificar |
| --- | --- | --- |
| **Demostración** | Restaurante ficticio, mesas, pedidos, reservas y métricas de ejemplo | Cambios solo en memoria del navegador |
| **Datos reales** | Mesas/catálogo nativos y registros Panacea leídos desde MariaDB | Algunas acciones guardan datos Panacea locales; **no probar sin cuidado** |

La composición visual es la misma en ambos modos. Que el modo se llame **Datos reales** no significa que órdenes y pagos ya estén sincronizados con todas las entidades nativas de TastyIgniter.

## Ruta de demostración manual

1. **Inicio:** identifica las métricas y el panel de actividad. Observa alertas explicables.
2. **Reservas:** elige una mesa y una fecha compatible; crea o consulta una reserva ficticia.
3. **Salón:** selecciona la mesa para ver su ficha; muestra cómo abrir un servicio.
4. **Pedidos:** crea una comanda en un servicio de ejemplo y revisa estados.
5. **Cocina:** avanza `Pendiente → Preparando → Listo → Entregado`.
6. **Caja:** revisa monto adeudado y muestra cómo registrar un abono manual.
7. **Inventario:** muestra ingredientes, mínimos y recetas; explica el consumo al iniciar preparación.
8. **Clientes y Personal:** enseña perfiles/turnos informativos; evita decir que el sistema ya tiene permisos de acceso por rol.
9. **Gerencia:** muestra indicadores y señales; aclara que no son utilidad neta ni IA generativa.
10. **Experiencia:** abre en otra pestaña `/experiencia`; busca un plato y visualiza el formulario de solicitud de reserva pendiente.

En Demo, si un módulo no contiene ejemplos coherentes con tu presentación, no improvises una transacción real. Prepara los datos ficticios de antemano.

## Presenter Quest — tutorial tipo videojuego

Se inicia mediante el **diminuto botón ✳** situado en la esquina superior derecha del Studio. No se abre automáticamente.

**Ruta exprés:** presentación compacta del servicio y sus decisiones.  
**Ruta completa:** incluye también catálogo, personal, incidencias, simulador y detalles de interfaz.

Al iniciar, la guía propone el modo Demo, resalta controles reales y presenta una tarjeta explicativa. No ejecuta reservas, cobros ni envía formularios.

| Control | Acción |
| --- | --- |
| Siguiente / Anterior | Cambiar paso |
| Flechas `→`/`←` | Avanzar y retroceder |
| `▶` / `Ⅱ` | Activar o pausar avance cada 9 segundos |
| `Esc` o `×` | Cerrar |
| Icono `✳` otra vez | Reiniciar presentación |
| En paso «Cliente» | Enlace para abrir página del comensal en nueva pestaña |

Se recomienda grabar con el navegador en una resolución estable, barra lateral expandida y modo oscuro si el contraste es correcto en pantalla. Desactivar notificaciones del sistema, mantener zoom cómodo y utilizar ejemplos ficticios.

## Descripción funcional básica de cada sección

| Sección | Para qué sirve | Advertencia |
| --- | --- | --- |
| Resumen | Visión general de actividad | Distinguir Demo/Real |
| Reservas | Agenda y confirmaciones | Portal crea solicitudes `pending` |
| Salón | Plano 2D, mesas, servicio | No inferir ocupación nativa solo por falta de sesión Panacea |
| Pedidos | Comandas por servicio | No crea `orders` nativas |
| Cocina | Fases de preparación | Inventario propio se descuenta solo con receta |
| Caja | Abonos y cierre | No hay pago bancario/fiscal |
| Catálogo | Productos/fotos/precios de TastyIgniter | Fotos ilustrativas etiquetadas |
| Inventario | Ingredientes, entradas, receta | No mueve stock contable nativo |
| Clientes | Perfiles y visitas | Consentimiento explícito; sin CRM completo |
| Personal | Directorio y turnos | No es autorización de usuarios |
| Incidencias | Registro y resolución | Auditoría todavía no atribuida a cuenta |
| Simulador | Escenarios hipotéticos | Sin impacto en ventas |
| Gerencia | Indicadores y alertas | No son métricas fiscales ni IA generativa |

## Errores comunes

- **HTTP 403 en antigua URL:** usar `/experiencia`, no `/panacea`.
- **HTTP 500:** comprobar Docker, `/health`, migraciones y `storage/logs/laravel.log`.
- **Cambios visuales no aparecen:** `php artisan optimize:clear` y `Ctrl+F5`.
- **La guía no se abre:** terminar edición de plano o cerrar formularios.
- **Reserva no confirmada:** solicitud cliente siempre queda pendiente hasta revisión.
- **No cambia inventario:** revisar asociación de receta y momento de transición a preparando.

## Qué puede afirmarse durante una presentación

> «Panacea centraliza la experiencia visual y dispone de operaciones propias persistentes en entorno local. Reutiliza datos y modelos de TastyIgniter para catálogo y mesas. Estamos completando la sincronización nativa, los permisos por rol y los procesos de pago y facturación necesarios para su despliegue comercial».

Evitar afirmar que el producto ya realiza pagos electrónicos, factura fiscalmente, ofrece IA generativa productiva o cumple con seguridad productiva.
