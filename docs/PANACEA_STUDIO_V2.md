# Panacea Restaurant — Operations Studio v2

## Propósito
El modo Demo y Datos reales usan los mismos componentes, distribución y navegación. Cambia únicamente la fuente de datos y la persistencia de las acciones.

## Qué incluye
- Interfaz unificada y adaptable (vista, JS, CSS propios).
- Operaciones locales: reservas, apertura de servicios, comandas, avance por cocina, abonos manuales y cierre.
- Integración del plano guardado con TastyIgniter y edición de mesas y elementos arquitectónicos.
- Espacios secundarios de inventario, clientes, personal, incidencias, simulador y gerencia. Sus operaciones reales siguen pendientes de integración.

## Instalación en Docker
Desde la carpeta del proyecto, ejecutar en orden:

    git pull origin feat/panacea-restaurant-mvp
    docker compose -f compose.panacea.yml exec app php artisan migrate
    docker compose -f compose.panacea.yml exec app php artisan optimize:clear

Abrir http://localhost:8088/panacea-preview

## Prueba funcional completa
1. En Demo, ir al salón y comprobar que el plano corresponde al de Datos reales.
2. Crear una reserva futura válida, recibir al cliente e iniciar el servicio.
3. Crear una comanda usando productos del catálogo. En Cocina, avanzar Pendiente → Preparando → Listo → Entregado.
4. En Caja, registrar un abono manual, liquidar el saldo y cerrar el servicio.
5. Volver al Salón; el servicio debe aparecer cerrado. Alternar modos y verificar que Demo no ha modificado los datos reales.
6. Repetir con datos de prueba reales en Docker; recargar el navegador y comprobar persistencia.
7. Probar una reserva que se superponga con otra, dos servicios simultáneos en la misma mesa y un abono mayor al saldo. Deben rechazarse.

## Límites explícitos
- Los endpoints están habilitados solo cuando APP_ENV=local. No cuentan con permisos operativos de producción.
- Las reservas, comandas, servicios y abonos de Panacea se guardan en tablas separadas; no alteran automáticamente las reservas ni los pedidos nativos de TastyIgniter.
- La ausencia de un servicio de Panacea no demuestra disponibilidad u ocupación real de la mesa.
- Los abonos son registros manuales: no procesan pagos electrónicos ni generan facturas fiscales.
- El catálogo real se lee de TastyIgniter, pero el inventario, recetas, costos, roles, multisedes y reportes fiscales todavía requieren integración.
- El JavaScript de Demo es efímero, solo en el navegador; la base de datos nunca recibe acciones Demo.
- La vista anterior se conserva como archivo de referencia; no se utiliza en la ruta activa.

## Validación técnica
El workflow de GitHub Actions Panacea Studio static checks verifica sintaxis PHP y JavaScript. No reemplaza las pruebas de ejecución en el Docker local.
