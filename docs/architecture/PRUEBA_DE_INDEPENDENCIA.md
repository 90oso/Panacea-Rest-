# Prueba de independencia — Definition of Done de Panacea Core

El nuevo proyecto es independiente solo cuando **todas** estas pruebas pasan **en la misma revisión/commit**, desde una instalación limpia. Es una condición de aceptación futura: **NO está superada en el repositorio actual**.

## A. Dependencias y licencia

- [ ] `composer.json` nombra a Panacea y no declara `tastyigniter/core`, repositorios de paquetes TastyIgniter ni scripts `Igniter\\Flame`.
- [ ] `composer.lock` y las dependencias instaladas no contienen `tastyigniter/*`, `igniter/*` ni dependencia transitiva no justificada de su ecosistema.
- [ ] `package.json` y lockfile frontend no introducen código/activos TastyIgniter obligatorios.
- [ ] No se redistribuye ninguna extensión comercial sin licencia compatible.
- [ ] Avisos MIT/copyright preservados en cualquier archivo sustancialmente reutilizado; registro de procedencia por activo.

## B. Código y configuración

- [ ] `app/`, `routes/`, `resources/`, `public/` de runtime no incluyen `Igniter\\` ni enlaces de API indispensables al servidor antiguo.
- [ ] No existen referencias a `/admin` de TastyIgniter, `IGNITER_*`, `composer.tastyigniter.com`, `tastyigniter/core`.
- [ ] La navegación, autenticación y autorización son de Panacea.
- [ ] El favicon, logo y assets de marca son nuevos o cuentan con licencia acreditada.
- [ ] Documentación histórica y notas de procedencia pueden mencionar TastyIgniter; no deben incluirse en un escáner indiscriminado de runtime.

## C. Modelo de datos

- [ ] Base nueva se crea desde **cero** mediante migraciones Panacea.
- [ ] No hay ninguna consulta a tablas del legado `ti_*`, ni dependencias de `reservation_tables` o esquemas sin mapear.
- [ ] Relaciones, claves, estados, inventario y dinero cuentan con pruebas de integridad.
- [ ] Datos Demo no contaminan DB y no incorporan PII extraída de ambiente real.
- [ ] El plan de traslado de datos está probado con reporte de conteos, totales y referencias.

## D. Funcionamiento independiente

- [ ] `git clone` y build solo del nuevo repo, en máquina o runner limpio, sin TastyIgniter instalado.
- [ ] Crear producto y mesa, recibir reserva, abrir servicio, enviar comanda, preparar, registrar pago **manual simulado** y cerrar, todo con Panacea.
- [ ] Dos usuarios simultáneos no pueden ocupar la misma mesa ni generar cobros duplicados.
- [ ] Rutas protegidas por roles y auditoría de autor verificable.
- [ ] Fotos de catálogo, modo oscuro, mobile y Presenter Quest funcionan sin recursos nativos antiguos.
- [ ] Suite CI y pruebas E2E con MariaDB pasan.
- [ ] Restauración de backup probada en ambiente aparte.

## E. Preparación comercial — puerta adicional, no confundir con independencia

La independencia no significa automáticamente preparación para operar dinero real. Requiere caja por turnos, devoluciones, conciliación, hardware, medios de pago reales autorizados, facturación fiscal, protección de datos, resiliencia operativa y piloto controlado. Esta evaluación se ejecuta después de demostrar el núcleo independiente.

## Referencia de comprobación automatizada sugerida

```bash
composer show --locked
composer validate --strict
php artisan migrate:fresh --force
php artisan test
npm test
```

**Advertencia:** `migrate:fresh` destruye tablas de la conexión configurada. Ejecutarlo **solo en una base efímera de CI** y nunca en la base antigua, una base de producción ni el Docker compartido por la demo.

Ejemplo de grep orientativo para **runtime solamente**:

```bash
grep -RInE 'Igniter\\\\|tastyigniter/core|composer.tastyigniter.com|IGNITER_' app routes config bootstrap resources public composer.json .env.example
```

El grep es solo una señal: la condición definitiva es **instalación y prueba de extremo a extremo sin dependencia antigua**.
