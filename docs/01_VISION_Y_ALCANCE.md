# 01 — Visión, objetivos y alcance

**Fecha de referencia:** 2026-10-26 · **Estado:** desarrollo y demostración local.

## Resumen ejecutivo

**Panacea Restaurant** es un sistema de operaciones para restaurantes cuyo propósito es reunir la atención al cliente y los procesos internos en un mismo entorno: reservar → recibir al grupo → abrir servicio → tomar comanda → preparar → entregar → registrar pago → cerrar → analizar. Se construye sobre **TastyIgniter 4.x**; aprovecha el catálogo y la estructura de mesas nativas, y desarrolla su propia interfaz de operaciones e inventario.

La propuesta de producto apunta a restaurantes que requieren visibilidad operacional, consistencia de procesos, información accionable y una experiencia digital atractiva para clientes y colaboradores.

## Problema y oportunidad

En la operación de restaurante, las reservas, mesas, cocina, cuentas e insumos suelen consultarse en sistemas o procesos separados. El problema se traduce en duplicación de capturas, menor trazabilidad, errores de coordinación y poca visibilidad para dirección. Panacea busca reducir la fragmentación, **sin afirmar todavía una integración completa con los registros nativos**.

## Objetivo general

Desarrollar y validar una plataforma integrada y extensible para coordinar las operaciones de un restaurante, con un frontend apropiado a la hospitalidad, trazabilidad de transacciones y soporte para decisiones basadas en datos operativos confiables.

## Objetivos específicos

1. Representar áreas, mesas y estados de servicios, con edición persistente de la distribución.
2. Gestionar reservas y solicitudes desde el cliente, evitando conflictos de horario o capacidad.
3. Vincular comandas a servicios y reflejar su recorrido por cocina y entrega.
4. Registrar abonos manuales y condicionar el cierre de servicios al estado de cuenta.
5. Asociar platos a ingredientes y movimientos de inventario con costo de consumo.
6. Mantener un registro básico de clientes, equipo, incidencias y eventos auditables.
7. Proveer indicadores gerenciales, alertas explicables y escenarios de simulación separados de los datos reales.
8. Preparar, de forma futura, la integración transaccional nativa, seguridad, fiscalidad y operación productiva.

## Usuarios y actores

| Actor de negocio | Funciones esperadas | Implementación de permisos |
| --- | --- | --- |
| Cliente | Explorar carta y solicitar reserva | Portal local sin cuenta del cliente |
| Recepción/anfitrión | Agenda, recepción y mesas | Acciones en Studio local; permisos granulares pendientes |
| Mesero/a | Servicio y comandas | Acciones en Studio; permisos granulares pendientes |
| Cocina | Preparar, marcar listo y entregar | KDS Panacea; permisos por estación pendientes |
| Cajero/a | Registrar abonos y cerrar servicios | Registro manual; seguridad y pasarela pendientes |
| Almacén | Ingredientes, recetas, entradas | Subregistro Panacea |
| Gerencia | Indicadores, alertas e incidencias | Analítica parcial con reglas explicables |
| Administrador técnico | Configuración TastyIgniter, migraciones y soporte | Administración nativa y entorno de desarrollo |

**Importante:** estos son actores del análisis funcional, **no perfiles autorizados implementados** en Panacea. El directorio de personal es informativo y no concede permisos.

## Límites de alcance actual

**Implementado o parcialmente integrado**
- Panel Studio con modo Demo (simulación en navegador) y Datos reales (lectura y escritura local mediante endpoints Panacea).
- Plano de salón 2D con posiciones y propiedades de mesas nativas, elementos arquitectónicos propios.
- Reservas Panacea, recepción, servicios y comandas con estados de cocina.
- Abonos manuales, saldo pendiente y cierre de mesa.
- Inventario Panacea por ingredientes, recetas, entradas y movimientos al iniciar preparación.
- Perfiles, personal, incidencias, auditoría básica, reglas gerenciales, simulador.
- Sitio cliente `/experiencia` con catálogo nativo e imágenes y solicitud pendiente.
- Tutorial `Presenter Quest` con recorridos de presentación y navegación no destructiva.

**No equivale a producto listo para vender**
- No sincroniza transacciones con las reservas, pedidos, pagos ni stock operativos de TastyIgniter.
- No existe autorización productiva por empleado, multiusuario verificado, registro de autor en auditoría ni políticas de acceso desplegadas.
- No hay pasarela de pagos, conciliación bancaria, impuestos/cumplimiento fiscal de Panamá, facturación ni comprobantes autorizados.
- No se ha validado un ciclo completo con pruebas de integración reales y despliegue público.
- No se ha implementado completamente compras, proveedores, lotes, mermas, devoluciones, promociones, fidelización, notificaciones o multi-sucursal.

## Diferenciadores de UX

Estética Hospitality Tech premium: verde bosque en modo oscuro, marfil/cobre, superficies glass con contraste accesible, fotografías de carta reales cuando están disponibles, barra lateral expandible/compacta/oculta, animaciones que respetan movimiento reducido y demo guiada. **La estética no sustituye garantías de fiabilidad, seguridad o cumplimiento.**

## Indicadores de éxito propuestos (no medidos)

- Operaciones del flujo principal sin estados imposibles ni duplicados.
- Reservas sin asignación simultánea a la misma mesa y franja.
- Descuento de inventario coherente con recetas y sin consumo duplicado.
- Cuentas que cierran únicamente con saldo cero y comandas entregadas.
- Pruebas de permisos y registros de autor para cada operación sensible.
- Flujo completo reproducible por el personal sin soporte técnico.

No se asignan aquí porcentajes de disponibilidad ni objetivos de latencia como hechos: deben acordarse y medirse en la fase de aceptación.
