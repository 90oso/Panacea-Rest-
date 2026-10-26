# Panacea Restaurant — Visual System v4

## Dirección de diseño
Hospedaje y gastronomía premium + una interfaz operativa moderna.

**Tono:** verde botánico profundo, acentos cobre/terracota, marfil suave; el modo oscuro usa verde abeto y superficies transparentes oscuras. La tipografía de interfaz es Manrope/DM Sans; Cormorant Garamond se utiliza solamente en titulares editoriales seleccionados.

**Regla de accesibilidad:** el glassmorphism se aplica a marcos, topbar, tarjetas y modales con un fondo suficiente para mantener el contraste; los datos densos conservan superficies casi opacas.

## Archivos
- `resources/views/panacea/studio.blade.php`: navegación con iconos SVG embebidos, barra y controles del shell.
- `public/panacea/studio.css`: estilos funcionales existentes.
- `public/panacea/studio-premium.css`: capa visual premium; sobrescribe estilos sin introducir dependencia de JavaScript.
- `public/panacea/studio.js`: lógica existente de módulos y renderizado; los KPIs usan iconos del mismo sprite.
- `public/panacea/studio-shell.js`: manejo de barra lateral y preferencias de apariencia; no modifica operaciones.
- `tests/panacea-studio-shell-smoke.mjs`: navegación, estados compacto/oculto, móvil, teclado, foco, atributos ARIA y tema.

## Navegación
- **Expandida:** identidad, texto e iconos.
- **Compacta:** rail de iconos con títulos nativos en hover, retorno mediante botón en sidebar.
- **Oculta:** mayor espacio de trabajo; se recupera desde el botón de la barra superior.
- **Móvil:** panel superpuesto con fondo oscurecido. Se cierra con clic fuera, navegación o Escape.
- Los estados de navegación y apariencia se guardan en localStorage con manejo de errores para entornos donde el almacenamiento no está disponible.
- Los controles incluyen títulos, etiquetas accesibles y atributos ARIA. El sistema respeta `prefers-reduced-motion`.

## Compatibilidad y límites
- No hay cambios en modelos, endpoints, migraciones, autorización ni datos.
- **Demo y Real conservan los mismos componentes**; solo cambia su fuente de datos y las acciones autorizadas de desarrollo.
- Las mesas mantienen su distribución persistida y el panel inspector permanece junto al plano en resoluciones de escritorio suficientes.
- Los iconos usan un sprite SVG inline, sin CDN de iconos.
- Transparencia con respaldo opaco si el navegador no soporta `backdrop-filter`.
- El tema claro/oscuro respeta la preferencia explícita guardada después del arranque; si no existe, usa la preferencia del sistema.

## Actualización local
```bat
git pull origin feat/panacea-restaurant-mvp
docker compose -f compose.panacea.yml exec app php artisan optimize:clear
```
Luego abrir `http://localhost:8088/panacea-preview`. Si el navegador conserva CSS viejo, realizar recarga forzada.

## Pruebas de aceptación visual
1. En escritorio, comprobar barra expandida, compacta y oculta. La página debe ocupar el ancho libre en cada modo.
2. Recargar y confirmar que la última preferencia de navegación se mantiene.
3. Abrir Demo y Datos reales; verificar que no cambia la composición de Salón, Reservas, Cocina y Caja.
4. Cambiar tema claro/oscuro y recargar. Confirmar que persiste la preferencia.
5. Reducir la ventana a 375 px; abrir/cerrar menú móvil, navegar y cerrar con Escape.
6. Editar el plano en modo real y mover una mesa guardada; confirmar después de recargar que no se pierde su posición.
7. Repetir reserva → servicio → cocina → abono manual → cierre para verificar que no se rompió el flujo.

## Siguiente evolución
En una entrega posterior: pruebas automáticas con navegador real (Playwright), revisión WCAG por pantalla, flujos de permisos y auditoría para producción. El diseño no sustituye las integraciones operativas pendientes con TastyIgniter.
