# 07 — Instalación, uso local, mantenimiento y diagnóstico

**Ámbito:** Windows PowerShell/CMD y Docker Desktop con contenedores Linux. Validado **por inspección del repositorio**, no como receta de despliegue productivo.

## Requisitos mínimos de herramientas (no requisitos de hardware medidos)

- Git, Docker Desktop y Docker Compose v2 operativos.
- Docker con capacidad para ejecutar contenedores `php:8.3-apache` y `mariadb:11.4`.
- Puerto **127.0.0.1:8088** libre.
- Conexión a Internet durante instalación de dependencias, carga de fuentes o imágenes ilustrativas.
- Archivo `.env` con clave de aplicación y conexión a `db`; TastyIgniter instalado/configurado.
- Opcional: PHP y Composer locales para desarrollo fuera de Docker; Node.js/npm para assets/tests JavaScript.

No hay presupuesto de CPU/RAM/disco formalmente medido. Se deben definir después de pruebas de carga y antes de contratar infraestructura.

## Clonación y rama

```bat
git clone https://github.com/90oso/Panacea-Rest-.git
cd Panacea-Rest-
git switch feat/panacea-restaurant-mvp
```

Si la carpeta ya existe:

```bat
git status -sb
git pull origin feat/panacea-restaurant-mvp
```

**Importante:** si hay cambios locales sin guardar, confirmar o respaldar antes de hacer `pull`.

## Preparación local

```bat
docker compose -f compose.panacea.yml up -d --build
docker compose -f compose.panacea.yml exec app composer install
copy .env.example .env
```

En PowerShell, si `copy` no funciona como en CMD, usar `Copy-Item .env.example .env`. **No sobrescribir un `.env` existente**; allí están datos de configuración y claves de la instalación.

Definir en `.env`:
- `APP_NAME="Panacea Restaurant"`
- `APP_ENV=local`
- `APP_DEBUG` solo si corresponde en desarrollo; **false** en producción.
- `APP_URL=http://localhost:8088`
- `DB_CONNECTION=mysql`, `DB_HOST=db`, `DB_PORT=3306`, `DB_DATABASE=panacea`, `DB_USERNAME=panacea`
- `DB_PASSWORD`: usar **exclusivamente la credencial local** configurada en `compose.panacea.yml`, nunca reutilizarla en producción.
- `DB_PREFIX`: conservar la configuración compatible con la instancia TastyIgniter; no modificar sin verificar el esquema instalado.
- Zona horaria: las reglas de reserva del código usan `America/Panama`.

Generar clave únicamente si no existe:

```bat
docker compose -f compose.panacea.yml exec app php artisan key:generate
```

Seguir el instalador y la configuración **propios de la versión de TastyIgniter instalada**. No ejecutar migraciones antes de que el núcleo esté preparado.

Tras configurar TastyIgniter, comprobar migraciones de Panacea:

```bat
docker compose -f compose.panacea.yml exec app php artisan migrate:status
docker compose -f compose.panacea.yml exec app php artisan migrate
docker compose -f compose.panacea.yml exec app php artisan optimize:clear
```

La segunda orden altera el esquema local: hacer copia de seguridad si existen datos importantes.

## URLs locales

| URL | Función |
| --- | --- |
| `http://localhost:8088/` | Inicio nativo de TastyIgniter |
| `http://localhost:8088/admin` | Administrador nativo |
| `http://localhost:8088/panacea-preview` | Studio del personal |
| `http://localhost:8088/panacea-preview/health` | Comprobaciones técnicas locales |
| `http://localhost:8088/experiencia` | Página del cliente para demostración |

La ruta `/panacea` **no se usa** como portal porque colisiona con la carpeta física `public/panacea` bajo Apache.

## Primer recorrido comprobable

1. Abrir Studio, seleccionar **Demostración**. Recorrer inicio, Reservas, Salón, Pedidos, Cocina y Caja.
2. Pulsar el pequeño botón ✳ en la barra superior para iniciar **Presenter Quest**. Elegir Exprés o Completo.
3. Abrir `/experiencia`, examinar carta y fotografías. No usar datos personales reales en las pruebas.
4. Si corresponde, seleccionar Datos reales y revisar que el esquema muestre `service_schema_ready` y `management_schema_ready` en `/health`.
5. Solo con copia/snapshot del entorno: probar la ruta real de una reserva, una comanda, receta, abono y cierre.

## Comandos de operación

```bat
docker compose -f compose.panacea.yml ps
docker compose -f compose.panacea.yml logs --tail=100 app
docker compose -f compose.panacea.yml logs --tail=100 db
docker compose -f compose.panacea.yml exec app php artisan route:list --path=panacea
docker compose -f compose.panacea.yml exec app php artisan migrate:status
docker compose -f compose.panacea.yml exec app php artisan optimize:clear
```

Inspección de últimos errores Laravel:

```bat
docker compose -f compose.panacea.yml exec app sh -lc "tail -n 80 storage/logs/laravel.log"
```

Ese nombre de log es el habitual; en un entorno con otro canal de logs puede diferir.

## Problemas frecuentes

| Síntoma | Verificación |
| --- | --- |
| HTTP 500 en Studio | `app` y `db` activos; `.env`; `migrate:status`; logs Laravel; `/panacea-preview/health` |
| HTTP 403 al ir a `/panacea` | Dirección antigua; utilizar `/experiencia` |
| No se reflejan CSS/JS nuevos | `php artisan optimize:clear` y recarga forzada `Ctrl+F5` |
| No hay imágenes de plato | Producto sin foto nativa, URL externa no accesible o medio no configurado |
| Datos reales vacíos | Revisar catálogo/mesas/instalación TastyIgniter y esquema Panacea |
| Reserva rechazó horario | Capacidad, sesiones activas, solicitudes pendientes y reservas nativas conservadoras |
| Consumo de ingrediente no cambia | Producto sin receta asociada o comanda aún `pending` |
| Pantalla no permite grabar guía | Salir de editor de plano/formulario; botón ✳ en barra superior |

## Copias y restauración

El servicio `db` persiste datos en el volumen Docker `panacea_db`. Antes de actualizar esquema, respaldar la base mediante una herramienta compatible con MariaDB y probar la restauración en **otro entorno**, sin sobrescribir el volumen de trabajo. No confundir `docker compose down` con `down -v`: este último elimina volúmenes asociados y puede provocar pérdida de datos.

**Prohibido para producción sin revisión:** publicar Docker actual a Internet, reutilizar contraseñas locales, usar `APP_ENV=local` para habilitar endpoints, o asumir que la existencia de Docker equivale a seguridad.

## Actualizaciones futuras

1. Revisar cambios en rama `feat/panacea-restaurant-mvp`.
2. Revisar migraciones nuevas y compatibilidad TastyIgniter.
3. Respaldar BD y archivos de medios.
4. Actualizar, instalar dependencias si cambiaron y migrar en una copia.
5. Ejecutar pruebas automatizadas + recorrido de aceptación manual.
6. Documentar la versión probada y plan de retorno.
