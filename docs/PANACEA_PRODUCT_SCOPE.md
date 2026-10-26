# Panacea Restaurant — Cobertura de la especificación ampliada

> [!CAUTION]
> **Documento histórico (versión inicial de la especificación).** Su apartado «Conexión real actualmente disponible» ya no refleja completamente el estado del 26-10-2026. Existen tablas operativas Panacea persistentes y un portal cliente local, pero **la integración transaccional nativa continúa pendiente**. Para el estado verificado consulta el [índice de documentación](README.md), [requisitos](03_REQUISITOS_Y_REGLAS.md) y [hoja de ruta](09_HOJA_DE_RUTA.md).

## Estado de implementación (rama feat/panacea-restaurant-mvp)

La vista `/panacea-preview` es un prototipo interactivo local, **no** un sistema POS listo para producción. Está restringida a `APP_ENV=local`.

### Implementado en la demostración (estado en memoria del navegador)

- Inicio visual con fotografía, KPIs y actividad de ejemplo.
- Pedidos: creación ficticia, filtros, búsqueda y cambios de estado.
- Cocina: comandas de ejemplo y avance de estados.
- Menú: tarjetas fotográficas, búsqueda, categorías y creación de pedido simulado.
- Reservas: fichas y adición de reserva ficticia.
- Salón: plano de 12 mesas, ocupación, ficha, asignación de pedido y enlace a caja.
- Caja: subtotal por mesa, reparto por personas, descuentos, propinas, método de pago y confirmación **simulada**.
- Inventario: existencias ficticias, mínimos, costos, avisos y propuesta estimada de reposición.
- Clientes: fichas ficticias y representación del consentimiento para preferencias.
- Personal: roles, turnos y estaciones ficticias.
- Incidencias: registro y resolución simulados.
- Simulador: precio, costo, volumen y descuento con márgenes ilustrativos.
- Gerencia: resumen e indicadores de ejemplo.
- Modo oscuro, transiciones, estados vacíos y diseño responsive.

### Conexión real actualmente disponible

El modo `Datos reales` consulta **solo lectura** en MariaDB: conteos y un subconjunto de campos de las tablas `orders`, `menus`, `reservations`, `categories` y `statuses`. No expone nombres de clientes ni datos de pago. No se han validado todos los campos, estados o relaciones de TastyIgniter.

### Pendiente para considerar completa la especificación

1. **Seguridad y persistencia:** resolver login; proteger rutas operativas con autenticación y autorización; modelos, migraciones, transacciones, auditoría, validación y pruebas.
2. **Salón y reservas:** editor de plano persistente, combinación de mesas, lista de espera, drag-and-drop y gestión real de ocupación.
3. **Pedidos y cocina:** modificadores, alergias, disponibilidad, fases de servicio, estaciones, temporizadores, avisos y concurrencia entre dispositivos.
4. **Caja:** pagos reales, conciliación, devoluciones, cierres, comprobantes, impuestos configurables y cumplimiento fiscal de Panamá.
5. **Inventario:** recetas, subrecetas, unidades, lotes, caducidad, merma, proveedores, compras y descuento automático por venta.
6. **CRM y personal:** consentimiento verificable, recompensas, turnos, asistencia, permisos por rol y registro de acciones.
7. **Finanzas y analítica:** costos reales, gastos, márgenes, ventas por hora, tendencias y explicaciones con evidencia.
8. **Pedidos externos, cliente y sucursales:** delivery, menú público, seguimiento, horarios, multitienda y configuración.
9. **Fiabilidad:** trabajo sin conexión, sincronización, idempotencia, pruebas de carga y prevención de doble cobro.
10. **Asistente de gestión:** consultas y recomendaciones con trazabilidad de datos, no respuestas inventadas.

## Advertencias

- Los datos y transacciones del modo demostración son ficticios y se pierden al recargar.
- Las fotografías se obtienen de URLs públicas externas; requieren internet y deben sustituirse por imágenes autorizadas de cada restaurante.
- Los cálculos del simulador son aritmética de escenarios, no pronósticos.
- Los importes de caja demo no aplican impuestos ni realizan cobros.
- No publicar la ruta local de vista previa ni activar APP_DEBUG en producción.

## Validación local sugerida

```bat
git pull origin feat/panacea-restaurant-mvp
docker compose -f compose.panacea.yml exec app php artisan view:clear
```

Abrir `http://localhost:8088/panacea-preview`, activar la demostración, revisar el salón, crear un pedido, avanzar en cocina, cobrar la mesa, consultar inventario e incidencias. Verificar la consola del navegador si algo falla.
