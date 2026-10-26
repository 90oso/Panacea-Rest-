# Panacea Restaurant — modo de presentación guiada

## Para grabar la demo

1. Abre `http://localhost:8088/panacea-preview`.
2. Busca el **pequeño icono ✳ (15 px, botón de 29 px)** en la barra superior, entre «Actualizar» y el tema claro/oscuro. Se llama **Guía de la demo**.
3. Elige **Ruta exprés** para una grabación corta o **Recorrido completo** para presentar todos los módulos.
4. La guía activa **Demostración** al comenzar; no escribe en MariaDB. El modo real permanece intacto.
5. Sigue la tarjeta flotante y el foco luminoso. El sistema navega automáticamente a la pantalla que se explica.

## Controles

- **Siguiente / Anterior:** botones de la tarjeta.
- **Flechas derecha e izquierda:** avanzar y retroceder entre capítulos.
- **▶ / Ⅱ:** iniciar o pausar el avance automático, cada **9 segundos**. Se detiene al terminar o cambiar de pestaña.
- **Esc o ×:** cerrar inmediatamente. Para reiniciar, utiliza el pequeño icono ✳.
- **Ver portada del cliente:** disponible durante el capítulo de experiencia pública; abre `/experiencia` en una nueva pestaña.

La guía **no se muestra por defecto**: hay que iniciarla manualmente. No abre editores ni confirma pagos ni reservas; bloquea clics en botones operativos mientras está activa.

Si hay un formulario abierto o una edición del plano sin guardar, termina o cancela la operación antes de abrirla.

## Recorrido exprés

Presenta fuente de datos → inicio/KPI → experiencia del cliente → reservas → salón → ficha de mesa → pedidos → cocina → caja → inventario → gerencia → cierre.

## Recorrido completo

Añade actividad reciente, tarjetas de reserva, editor de plano, carta fotográfica, recetas, clientes, personal, incidencias y simulador financiero. Todos los pasos utilizan módulos ya existentes.

## Límites de la demostración

- Los estados mostrados en **Demostración** son ficticios y sirven para ilustrar el flujo. No representan disponibilidad, importes ni pagos reales.
- Los datos propios de Panacea y los registros nativos de TastyIgniter siguen diferenciados.
- «Caja» registra abonos manuales, no cobros bancarios ni facturas fiscales.
- Las recomendaciones de gerencia son reglas explicables, no un asistente de IA generativa.
- El tour se limita al panel de operaciones; el portal cliente se abre aparte si el presentador lo desea.

## Actualización local

```bat
git pull origin feat/panacea-restaurant-mvp
docker compose -f compose.panacea.yml exec app php artisan optimize:clear
```

No hay nuevas migraciones. Recarga la página con `Ctrl + F5` si el navegador conserva CSS/JS anterior.

## Control de calidad

`tests/panacea-presenter-quest-smoke.mjs` comprueba la navegación segura, modo de presentación, conteo de pasos, foco de pantalla, avance opcional y cierre con Escape. Las verificaciones de GitHub no equivalen a probar la grabación y el posicionamiento visual en el navegador local.
