# Panacea Restaurant — Bloque integrado: servicio, gestión, cliente y rediseño

Versión de desarrollo para la rama `feat/panacea-restaurant-mvp`.

## Activación en Docker
Desde `C:\Users\Rafael Batista\Panacea-Restaurant`:

```bat
git pull origin feat/panacea-restaurant-mvp
docker compose -f compose.panacea.yml exec app php artisan migrate
docker compose -f compose.panacea.yml exec app php artisan optimize:clear
```

**Panel del personal:** http://localhost:8088/panacea-preview

**Portada del cliente:** http://localhost:8088/experiencia

**Estado técnico (sin datos personales):** http://localhost:8088/panacea-preview/health

Si no aparecen los nuevos estilos, utiliza Ctrl+F5.

## 1. Operación: reservas, salón, cocina y caja
- Reservas de Panacea y solicitud de clientes con estados `pending → confirmed → seated`, cancelación, control de capacidad y solapamiento.
- Se comprueban vínculos nativos de reservas de TastyIgniter en modo **conservador**; mientras no esté verificada la semántica de sus estados, esos vínculos pueden bloquear horarios.
- Apertura de servicio por mesa; órdenes con productos y precios del catálogo original; estados de cocina `pending → preparing → ready → served`.
- Registro **manual** de abonos, validación de saldo, cierre de servicio y contador de visitas solo con perfil vinculado.
- La clave de idempotencia evita duplicar un abono cuando se reenvía una misma solicitud desde el formulario.
- No se crean ni se modifican las reservas, pedidos, estados de mesa ni los pagos **nativos** de TastyIgniter. Esta integración requiere adaptar su ciclo de vida y permisos.

## 2. Inventario y costos
- Ingredientes, unidades, umbral mínimo y costo unitario; entradas y movimientos con historial.
- Recetas por producto nativo; al pasar una comanda a preparación, consume el inventario **propio de Panacea** una sola vez.
- Se rechaza el inicio de preparación si una receta configurada requiere más stock del disponible.
- Costos de consumo; la gerencia indica si hay líneas de pedido sin receta.
- Los movimientos no modifican el stock nativo de TastyIgniter. Quedan pendientes proveedores, compras completas, mermas, lotes y conciliación con extensión nativa.

## 3. Clientes, personal e inteligencia operativa
- Perfiles optativos de clientes y consentimiento de contacto; selección explícita del perfil al abrir un servicio; registro de visitas al cierre.
- Directorio de personal, roles informativos y turnos. **Estos roles no conceden permisos reales.**
- Incidencias persistentes, prioridad, responsable, resolución y registro básico de auditoría.
- Gerencia: estados de comandas, abonos manuales, consumo por recetas, faltantes de cobertura y conteos nativos no mezclados.
- Recomendaciones con reglas transparentes sobre reservas pendientes, cocina atrasada, stock bajo, incidencias y saldos abiertos. **No es IA generativa**, ni se presentan métricas como utilidad neta o ventas fiscalmente conciliadas.

## 4. Experiencia de cliente
- Nueva portada `/experiencia`: estilo gastronómico luminoso, fotografía ilustrativa, animaciones con `prefers-reduced-motion`, carta consultable y buscador.
- El catálogo se obtiene de la tabla nativa `menus`, sin precios inventados.
- Solicitud de reserva con correo, nombre, fecha, comensales, consentimiento, limitación de frecuencia, validaciones y asignación conservadora de mesa.
- La solicitud queda **pendiente**; el personal debe confirmar desde Reservas. No enviamos correos de confirmación todavía.
- **No se sustituye** el inicio nativo `/` de TastyIgniter en esta fase. La portada se muestra por `/experiencia` para no alterar rutas y extensiones existentes.
- Antes de lanzar la portada públicamente hacen falta privacidad, notificaciones, autenticación operativa, políticas de atención, antiabuso persistente y revisión fiscal/legal aplicable.

## Rediseño paralelo
- Panel más claro: marfil, blanco cálido, cobre y verde salvia ligero.
- Navegación expandible, compacta u oculta, iconos SVG y preferencias de modo.
- Animaciones de página, tarjetas y cambios de estado; vistas Demo/Real conservan el mismo diseño.
- El inicio del panel destaca un enlace a la experiencia pública del cliente.

## Prueba integrada sugerida
1. Ejecutar migraciones y abrir el endpoint `/panacea-preview/health`. Comprobar `service_schema_ready=true` y `management_schema_ready=true`.
2. En **Demo**, probar menú, salón, reserva, servicio, comanda, preparación, cobro y cierre. Comprobar que los cambios Demo no pasan a MariaDB.
3. En **Datos reales**, crear ingrediente, registrar entrada, vincular una receta con un producto y enviar una comanda al estado `preparing`; verificar la reducción de stock Panacea. Intentar preparar otra comanda con existencia insuficiente.
4. Desde `/experiencia`, solicitar una reserva futura con datos de prueba. Debe mostrarse un número de solicitud con estado pendiente.
5. En `/panacea-preview#reservas`, revisar la solicitud y confirmarla. Recibir al cliente, abrir servicio, avanzar la comanda por cocina, liquidar y cerrar.
6. Probar una reserva superpuesta, un segundo servicio abierto para la misma mesa y un abono mayor que el saldo. Confirmar que se rechazan.
7. Crear cliente, seleccionarlo al abrir un servicio y verificar que tras cerrar se registra una visita. Añadir integrante e incidencia y resolverla.
8. Cambiar entre Demo/Real y verificar que la navegación, el plano y las tarjetas conservan su estructura; revisar modo claro, tema oscuro opcional, móvil y animaciones reducidas.

## Seguridad y límites que siguen abiertos
- Las rutas del estudio y la portada están habilitadas solo en `APP_ENV=local`. **No publicar este código como sistema de producción.**
- No hay SSO, autenticación por puesto, permisos efectivos, firma de pagos, validación fiscal de Panamá ni integración bancaria.
- Los datos operativos de Panacea usan tablas propias y **no están sincronizados con el ciclo de vida nativo** de TastyIgniter.
- Las existencias y costos de Panacea son un subregistro operativo, no el inventario contable oficial.
- El directorio del personal y el registro de auditoría todavía no identifican de manera autenticada al usuario que realizó cada acción.
- El sitio público usa fotografías ilustrativas externas; reemplazarlas por material autorizado del restaurante antes del lanzamiento.

## Automatización
El workflow `Panacea Studio static checks` valida sintaxis PHP, JavaScript, navegación Demo/Real y comportamiento básico del portal. No reemplaza pruebas en MariaDB/TastyIgniter ni pruebas end-to-end de navegador.
