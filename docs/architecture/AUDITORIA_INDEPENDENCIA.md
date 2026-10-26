# Auditoría A-001 — Independencia tecnológica de Panacea Restaurant

**Corte:** 26-10-2026 · **Rama examinada:** `feat/panacea-restaurant-mvp`.  
**Propósito:** planificar Panacea Standalone, usando TastyIgniter únicamente como referencia y sin alterar la instalación que soporta la demo.

## Resultado ejecutivo

Se auditó el árbol visible en GitHub (código, configuración, recursos, migraciones, documentación y pruebas) y se creó un inventario **archivo por archivo de 144 rutas**: [INVENTARIO_INDEPENDENCIA.csv](INVENTARIO_INDEPENDENCIA.csv).

**Importante:** este conteo corresponde a los archivos versionados enumerados en esta rama para el corte; no incluye `vendor/`, `node_modules/`, el volumen de MariaDB, archivos de medios añadidos en ejecución ni contenido local sin publicar. Las comparaciones de contenido con la rama oficial `tastyigniter/TastyIgniter@4.x` se efectuaron selectivamente; **no atribuir procedencia verificada** a entradas etiquetadas como comparación pendiente.

### Evidencias de procedencia verificadas

Se comparó el contenido de los siguientes archivos entre `90oso/Panacea-Rest-@feat/panacea-restaurant-mvp` y `tastyigniter/TastyIgniter@4.x`, con coincidencia exacta:

| Categoría | Ejemplos exactos |
|---|---|
| Metadatos de paquete | `composer.json`, `package.json`, `.env.example` |
| Arranque | `artisan`, `bootstrap/app.php`, `public/index.php` |
| Configuración | `config/app.php`, `config/auth.php`, `config/database.php`, `config/filesystems.php` |
| Núcleo app | `app/Models/User.php`, `app/Http/Kernel.php`, `app/Providers/RouteServiceProvider.php`, `app/Providers/AuthServiceProvider.php` |
| Infraestructura/base | `phpunit.xml`, `webpack.mix.js`, `public/.htaccess`, `public/favicon.svg` |
| Autoría/licencia | `LICENSE.md` |
| Artefactos de release | `.github/workflows/pipeline.yml`, `.github/workflows/release.yml`, `.github/scripts/build-release-zip.sh` |

La ausencia en la ruta equivalente del repositorio oficial se verificó, entre otros, para `app/Http/Controllers/Panacea/StudioController.php`, `public/panacea/studio.js`, `compose.panacea.yml` y la migración de gestión propia. **No encontrarse en upstream no prueba por sí solo autoría original ni licencia:** hay que revisar imágenes, iconos, dependencias y cualquier material añadido de terceros.

## Diagnóstico de dependencia actual

| Bloqueo | Evidencia en la rama | Impacto | Resolución |
|---|---|---|---|
| Manifiesto Composer heredado | Nombre `tastyigniter/tastyigniter`, `tastyigniter/core ^4.4`, repositorio `composer.tastyigniter.com` y scripts `Igniter\\Flame\\...` | **Crítico**: core no independiente | Nueva aplicación Laravel y Composer propio |
| Dependencia de modelos Igniter | `StudioController.php`: `DiningArea` y `DiningTable`; `GuestPortalController.php`: ambos; `Operations.php`: `DiningTable`; `MenuPresentation.php`: `Igniter\\Cart\\Models\\Menu` | **Crítico**: clases externas en runtime | Modelos y repositorios/servicios Panacea |
| Tabla de menú nativa | `menus`, `menu_id`, `menu_name`, `menu_price` | Alto: catálogo y precios no funcionarían sin esquema viejo | `products`, `product_variants`, `product_media` propios y mapeo |
| Mesas y áreas nativas | `dining_areas`, `dining_tables`, `seat_layout` | Alto: salón, reservas y cliente | `floor_areas`, `dining_tables`, `floor_objects` Panacea |
| Reservas nativas cruzadas | `reservation_tables`, `reservations`, `reserve_date` / `reserve_time` | Alto: validaciones mixtas | Nuevo calendario/estado de reserva y bloqueo |
| Escritos en tablas `panacea_*` con FKs lógicas a IDs nativos | `menu_id`, `dining_table_id`, `reservation_id` | Alto: no basta copiar migraciones | Diseño del esquema de destino e identificadores relacionados |
| Rutas mezcladas | `routes/web.php`: editor de plano usa relaciones Igniter, `/panacea-operations` redirige a `/admin` | Alto: rutas rotas en Laravel limpio | Router/Controllers Core propios |
| Configuración de BD | `config/database.php`: prefijo por defecto `ti_`; `strict=false` | Alto: tablas y validaciones inconsistentes | Prefijo explícitamente vacío, modo estricto y migraciones limpias |
| Entorno y apariencia heredados | `.env.example`: `IGNITER_CARTE_KEY`, `IGNITER_LOCATION_MODE`; `public/favicon.svg` upstream | Medio: marca y secretos residuales | Nuevo .env y branding propio |
| Identidad y permisos | `app/Models/User.php` depende de `Laravel\\Sanctum\\HasApiTokens`, no se declara Sanctum directamente en `composer.json`; rutas Studio solo guard `APP_ENV=local` | Crítico para producción | Auth desde cero, paquete explícito si aplica, policies/RBAC y auditoría |
| Build/reproducibilidad | No hay `composer.lock` ni `package-lock.json` en la raíz versionada observada | Medio/alto | Lockfiles y builds reproducibles en nuevo Core |
| Frontend monolítico | `public/panacea/studio.js` ronda 75 KB, lógica de UI y dominio mezclada; `preview.blade.php` ~66 KB no es ruta principal | Mantenibilidad | Refactor por módulos, preservar UX y contratos nuevos |

## Decisiones de reutilización

### 1. Conservar concepto/UX, adaptar contratos

- `public/panacea/*.css`: identidad visual Panacea, tema oscuro/claro, diseño hospitality, menú foto, animaciones y guía. Consolidar capas y limpiar recursos externos.
- `public/panacea/studio-shell.js`, `studio-tour.js`, `guest.js`, `menu-imagery.js`: conservar experiencia, actualizar rutas/eventos/campos y privacidad.
- `resources/views/panacea/studio.blade.php` y `guest.blade.php`: estructura visual aprovechable, pero actualizar permisos, API y texto TastyIgniter.
- Pruebas JS `tests/panacea-*.mjs`: reaprovechar casos, adaptar fixtures y ampliar E2E con BD.

### 2. Reescribir por acoplamiento o deuda

- `StudioController.php` (~23 KB) y `GuestPortalController.php`: separar HTTP y dominio, usar contratos de Panacea.
- `Operations.php` (~16 KB): descomponer en reservas, inventario, usuarios, auditoría e incidencias; eliminar consultas nativas.
- `MenuPresentation.php`: modelo de medios Panacea, sin `Igniter\\Cart\\Models\\Menu`.
- `routes/web.php`: editor de plano y redirección `/admin` heredados.
- `studio.js`: dividir flujos operativos, adaptadores HTTP, estado y componentes de presentación.
- Cinco migraciones `2026_10_25_*`: **no copiarlas sin cambios**, ya que contienen IDs ligados a tablas antiguas; usar como referencia para el nuevo esquema.

### 3. Regenerar del framework limpio (no copiar instalación upstream)

- `artisan`, `bootstrap/`, `config/`, `app/Http/Kernel.php`, middleware Laravel, `public/index.php`, usuarios, migraciones Laravel, test framework y configuración base.
- Crear con una versión fijada de Laravel y aplicar únicamente modificaciones justificadas. Configurar autenticación y permisos desde el inicio.
- Eliminar dependencias y rutas Igniter tanto del manifiesto como del *árbol de dependencias instalado*.

### 4. Descartar o archivar

- `extensions/`, `themes/`, `storage/igniter/`: no trasladarlos al Core nuevo.
- `public/favicon.svg`: es idéntico al upstream; reemplazar con un favicon original Panacea.
- `.github/scripts/build-release-zip.sh` y workflows release heredados: nuevo pipeline y política de releases.
- `resources/views/panacea/preview.blade.php`: prototipo histórico, no transferir automáticamente.
- Documentos históricos: preservar como archivo de referencia; reescribir README/especificaciones de la plataforma independiente.

## Clasificación del inventario

Los campos del CSV son `path, origen, decision, prioridad, criterio`. La decisión se aplica **al traslado al nuevo proyecto**, no como orden para borrar el archivo actual. En particular, `REGENERAR` indica crear el equivalente sobre el *nuevo esqueleto Laravel* y `REDISENAR` exige revisar datos e invariantes antes de escribir migraciones.

No hacer refactor en el repositorio antiguo únicamente para que un escáner encuentre cero menciones a Igniter. La meta es demostrar la independencia **del nuevo ejecutable**, mientras la demo anterior permanece disponible como referencia.

## Verificación de licencias y procedencia

1. El proyecto de origen declara **MIT** y `LICENSE.md` contiene copyright de Samuel Adepoyigi. El archivo **debe permanecer intacto** en la rama original.
2. MIT permite uso comercial y derivados con preservación de licencia/copyright en copias o partes sustanciales. La obligación depende del material realmente reutilizado; no es obligatorio atribuirle a TastyIgniter el código propio escrito independientemente.
3. **No presumir** que extensiones del marketplace, fotografías, marcas o iconos son MIT. Revisar cada paquete/activo.
4. En el Core nuevo, crear un inventario de dependencias y avisos `THIRD_PARTY_NOTICES.md` cuando corresponda, con vínculo a la licencia aplicable.
5. La matriz de origen es técnica y parcial, no análisis jurídico concluyente. La identificación de similitud textual no sustituye una revisión de propiedad intelectual.

## Riesgo de datos y migración

No reutilizar ni manipular directamente el volumen Docker `panacea_db` como base del Core nuevo. Exportar solo datos autorizados, con mapeo de IDs y entorno aislado. Reservas, correos, clientes y pagos requieren política de minimización, pruebas con datos sintéticos y reconciliación antes de corte.

**Siguiente puerta de decisión:** aprobar [ADR-001](ADR_001_CORE_INDEPENDIENTE.md) y ejecutar [plan de extracción](PLAN_MIGRACION_CORE.md). El nuevo Core únicamente se considera independiente cuando pasa la [prueba de independencia](PRUEBA_DE_INDEPENDENCIA.md).
