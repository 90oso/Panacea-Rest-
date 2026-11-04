# Panacea Restaurant · Demo pública autónoma

Esta carpeta contiene una **demostración 100 % estática** para Vercel. Preserva la interfaz visual desarrollada para Panacea, el catálogo fotográfico y el tutorial Presenter Quest. **No requiere TastyIgniter, Laravel, PHP, Composer, MariaDB, un API ni operaciones reales.**

## Rutas

- `/` — experiencia gastronómica del cliente (catálogo ficticio y simulación de reserva).
- `/studio/` — Operations Studio: salón, pedidos, cocina, caja, inventario, reportes y tutorial interactivo.

## Límites explícitos

- Productos, precios, mesas, personal, clientes y transacciones **son datos ficticios**.
- Todos los flujos del Studio se ejecutan **solo en la memoria de esa pestaña**. Recargar restablece el escenario.
- `/studio/` no permite habilitar el modo Datos reales.
- El formulario de reserva muestra datos sintéticos de prueba; al enviarlo **solo enseña un mensaje de vista previa**. No hace ninguna petición de red.
- No se reciben ni almacenan nombres, correos, pedidos, pagos ni reservas en un servidor.
- Solo las preferencias visuales del navegador (tema y barra lateral) pueden permanecer en localStorage.
- Las fotografías ilustrativas proceden de Unsplash; se identifican como ilustraciones, no como platos reales.
- Los recursos tipográficos se cargan desde Google Fonts.
- Las imágenes/fuentes externas necesitan Internet; la lógica de negocio y navegación no.
- No existe garantía de disponibilidad, cobro, inventario ni facturación real.
- El despliegue para validación NO reemplaza Panacea Core ni acredita preparación para producción.

## Arquitectura del paquete

```text
demo-public/
  index.html               # página del cliente
  studio/index.html        # panel de operaciones
  assets/
    fixtures.js            # único conjunto de datos ficticios
    studio.js              # interacciones simuladas, sin fetch
    guest.js               # menú y formulario sin peticiones
    studio-shell.js
    studio-tour.js
    menu-imagery.js
    *.css                  # diseño existente y declaración de demo
  vercel.json              # cabeceras seguridad + /studio
  README.md
```

El `vercel.json` bloquea conexiones JS externas con `connect-src 'none'`, formularios HTTP con `form-action 'none'`, iframes y permisos de cámara, micrófono, geolocalización y pagos.

## Despliegue

### Vercel

Importar el repositorio **`90oso/Panacea-Rest-`** en Vercel con una configuración de proyecto **aislada**, nunca la carpeta raíz del Laravel heredado. Es imprescindible elegir como **Production Branch** `feat/panacea-public-demo-vercel` (la rama por defecto del repositorio original es `4.x`) y como **Root Directory** `demo-public`. Seleccionar Framework **Other**, sin build ni install command, y publicar esa rama. Verificar que la carpeta raíz se establezca antes del despliegue: los únicos archivos que deben servir al navegador son los de `demo-public`.

Pasos de importación: Vercel Dashboard → Add New → Project → Import Git Repository `90oso/Panacea-Rest-` → Root Directory `demo-public` → Framework Preset `Other` → configurar producción desde `feat/panacea-public-demo-vercel` → Deploy. Si Vercel solo permite cambiar **Production Branch** después de crear el proyecto, **no publiques primero la rama por defecto**: configura la rama correcta y dispara un despliegue nuevo antes de compartir la URL. El directorio está preparado para entregar `index.html` y `studio/index.html` directamente.

En el flujo de despliegue por archivos, Vercel recibe únicamente los archivos de esta carpeta: **no** se incluyen los controladores PHP, `composer.json`, la base de datos ni credenciales del proyecto legado.

### Local sin servidor de backend

Desde `demo-public`:

```bash
python -m http.server 4173
```

Navegar a `http://localhost:4173/` y `http://localhost:4173/studio/`.

## Verificaciones

```bash
node tests/panacea-public-demo-smoke.mjs
```

Este script se encuentra en la raíz del repositorio y valida los recursos, ausencia de llamadas a API, rutas, configuración de seguridad y contenido sintético. No reemplaza la validación visual en móviles/escritorio.

## Fuente y atribución

Los diseños y scripts incluidos se extraen de las vistas/archivos Panacea de la rama `feat/panacea-restaurant-mvp`, adaptados a funcionar sin runtime. No distribuye el core TastyIgniter. El desarrollo futuro de Panacea Core independiente está documentado en `docs/architecture/` del repositorio de origen.

Cualquier uso futuro de componentes o assets de terceros debe revisar su licencia y procedencia; las imágenes ilustrativas se cargan remotamente.

## Estado de publicación

Los archivos y las pruebas están publicados en GitHub, pero el primer intento de creación directa del proyecto Vercel devolvió **403 Forbidden** (la integración conectada no tiene permiso para crear el proyecto). Una URL pública **solo** debe comunicarse una vez que Vercel muestre el despliegue como READY y ambas rutas hayan sido abiertas y verificadas. No confundir una rama lista con un sitio ya publicado.
