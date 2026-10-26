# Documentación oficial del proyecto Panacea Restaurant

**Corte documental:** 26 de octubre de 2026  
**Rama evaluada:** `feat/panacea-restaurant-mvp`  
**Naturaleza:** prototipo operativo en desarrollo local, sobre TastyIgniter 4.x; no listo para explotación comercial.

> **Principio de lectura:** se distinguen lo **implementado en Panacea**, lo **heredado de TastyIgniter**, lo **simulado** y lo **pendiente**. Que una función aparezca en el diseño no significa que esté integrada en producción.

## Documentos de referencia

| Documento | Contenido |
| --- | --- |
| [01. Visión, objetivos y alcance](01_VISION_Y_ALCANCE.md) | Contexto, alcance, personas usuarias, módulos y limitaciones |
| [02. Stack y arquitectura](02_ARQUITECTURA_Y_STACK.md) | Componentes, dependencias, límites de integración y diagramas |
| [03. Requisitos funcionales y no funcionales](03_REQUISITOS_Y_REGLAS.md) | Requisitos trazables, prioridad, estado y reglas de negocio |
| [04. Casos de uso](04_CASOS_DE_USO.md) | Actores, pre/postcondiciones, flujos principal y alterno |
| [05. Modelo de datos](05_MODELO_DE_DATOS.md) | Entidades nativas, tablas Panacea, relaciones y persistencia |
| [06. API y procesos](06_API_Y_FLUJOS.md) | Endpoints, mensajes, estados, validaciones y errores |
| [07. Instalación, operación y diagnóstico](07_INSTALACION_Y_OPERACION.md) | Docker, entorno, comandos, URLs, logs y respaldo |
| [08. Pruebas, seguridad y riesgos](08_CALIDAD_SEGURIDAD_Y_RIESGOS.md) | Evidencia automatizada, plan de pruebas, riesgos y controles |
| [09. Hoja de ruta y criterios de cierre](09_HOJA_DE_RUTA.md) | Etapas restantes, dependencias y aceptación |
| [10. Guía de usuario y grabación](10_GUIA_DE_USUARIO.md) | Roles de uso, recorrido manual y Presenter Quest |

## Otros documentos anteriores

- [MVP inicial](PANACEA_MVP.md): intención de producto al inicio.
- [Cobertura ampliada inicial](PANACEA_PRODUCT_SCOPE.md): **documento histórico, parcialmente obsoleto**; no usar para determinar el estado actual.
- [Implementación por etapas](PANACEA_PHASES_3_TO_10_DELIVERY.md): historial de la fase operativa.
- [Diseño visual anterior](PANACEA_DESIGN_SYSTEM_V4.md): referencia estética anterior.
- [Recorrido guiado](PANACEA_PRESENTER_QUEST.md): detalle funcional del tutorial.
- [Docker local](DOCKER_LOCAL.md): guía breve complementaria.

## Criterios de evidencia

- **Implementado:** existe código en la rama y un comportamiento definido; puede requerir validación en Docker real.
- **Parcial:** existe funcionalidad pero faltan controles o sincronización con TastyIgniter.
- **Simulado:** lógica de navegador y ejemplos no persistentes.
- **Pendiente:** se expresa como requisito, no como capacidad disponible.
- **Verificación:** las pruebas de GitHub no equivalen a pruebas de extremo a extremo con base real.

**Fuentes examinadas:** `composer.json`, `package.json`, `compose.panacea.yml`, `docker/Dockerfile`, `routes/web.php`, controladores y servicios `app/Http/Controllers/Panacea/` y `app/Services/Panacea/`, migraciones `2026_10_25_*`, vistas `resources/views/panacea/`, recursos `public/panacea/` y pruebas `tests/panacea-*.mjs`.

## Mantenimiento

Al implementar una funcionalidad: actualizar su requisito RF/RNF, caso de uso, endpoint/esquema pertinente, estado en hoja de ruta y prueba de aceptación. Nunca publicar credenciales ni datos personales reales en la documentación.
