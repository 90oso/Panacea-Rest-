<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>Panacea Restaurant · Operations Studio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('panacea/studio.css') }}?v=3">
  <script>
    window.PANACEA_STUDIO = {
      stateUrl: @json($apiState),
      actionUrl: @json($apiAction),
      floorUrl: @json($floorSaveUrl),
      csrf: @json(csrf_token())
    };
  </script>
  <script defer src="{{ asset('panacea/studio.js') }}?v=3"></script>
</head>
<body>
<div class="app-shell">
  <aside class="side">
    <div class="identity"><div class="brand-symbol">✳</div><div><strong>panacea</strong><span>RESTAURANT · STUDIO</span></div></div>
    <div class="side-caption">ESPACIO DE TRABAJO</div>
    <nav class="navigation" aria-label="Secciones de Panacea">
      <button type="button" data-nav="inicio" class="active"><span class="nav-symbol">◈</span>Resumen</button>
      <button type="button" data-nav="reservas"><span class="nav-symbol">▦</span>Reservas</button>
      <button type="button" data-nav="salon"><span class="nav-symbol">▤</span>Salón y mesas</button>
      <button type="button" data-nav="pedidos"><span class="nav-symbol">≡</span>Pedidos</button>
      <button type="button" data-nav="cocina"><span class="nav-symbol">◫</span>Cocina</button>
      <button type="button" data-nav="caja"><span class="nav-symbol">▣</span>Caja y cobros</button>
      <button type="button" data-nav="menu"><span class="nav-symbol">◩</span>Catálogo</button>
      <div class="nav-separator">GESTIÓN</div>
      <button type="button" data-nav="inventario"><span class="nav-symbol">◧</span>Inventario</button>
      <button type="button" data-nav="clientes"><span class="nav-symbol">♙</span>Clientes</button>
      <button type="button" data-nav="personal"><span class="nav-symbol">♧</span>Personal</button>
      <button type="button" data-nav="incidencias"><span class="nav-symbol">⚑</span>Incidencias</button>
      <button type="button" data-nav="simulador"><span class="nav-symbol">◇</span>Simulador</button>
      <button type="button" data-nav="gerencia"><span class="nav-symbol">▥</span>Gerencia</button>
    </nav>
    <div class="side-bottom"><div class="side-status"><span class="pulse"></span><span>Entorno local de desarrollo</span></div><p>El modo real utiliza MariaDB. Los cobros se registran manualmente y no son transacciones bancarias ni comprobantes fiscales.</p><a href="/panacea-operations">Administración TastyIgniter <span>↗</span></a></div>
  </aside>

  <div class="main-column">
    <header class="topbar">
      <div class="breadcrumbs"><span>PANACEA</span><span class="slash">/</span><span>RESTAURANT</span><span class="slash">/</span><strong id="breadcrumb">RESUMEN</strong></div>
      <div class="topbar-actions">
        <span class="source-indicator" id="sourceIndicator">● Conectando</span>
        <div class="mode-control" role="group" aria-label="Fuente de datos">
          <button type="button" id="realMode" class="active" aria-pressed="true">Datos reales</button>
          <button type="button" id="demoMode" aria-pressed="false">Demostración</button>
        </div>
        <button type="button" class="icon-button" id="reload" title="Actualizar desde la base de datos" aria-label="Actualizar datos">↻</button>
        <button type="button" class="icon-button" id="themeSwitch" title="Cambiar apariencia" aria-label="Cambiar apariencia">◐</button>
      </div>
    </header>

    <main class="work-area">
      <div id="toast" role="status" aria-live="polite" class="toast" hidden></div>
      <div id="banner" class="banner" hidden></div>

      <section class="view active" data-view="inicio">
        <div class="section-intro"><div><p class="overline">CENTRO DE OPERACIONES</p><h1>Todo el servicio, bajo control.</h1><p class="subhead">Mesas, reservas, pedidos y cobros conectados en un mismo recorrido.</p></div><button type="button" class="primary-btn" data-goto="salon">Abrir el salón <span>↗</span></button></div>
        <div class="metrics" id="dashboardMetrics"></div>
        <div class="dashboard-grid">
          <article class="surface"><div class="surface-heading"><div><p class="overline">AHORA MISMO</p><h2>Actividad del restaurante</h2></div><span class="small-note">Actualización manual y periódica</span></div><div id="activityFeed" class="activity-feed"></div></article>
          <article class="surface"><div class="surface-heading"><div><p class="overline">SIGUIENTE ACCIÓN</p><h2>Tu operación, en orden</h2></div></div><div class="journey"><div><span>01</span><strong>Reservar</strong><small>Fecha, comensales y mesa</small></div><div><span>02</span><strong>Atender</strong><small>Abrir servicio y pedir</small></div><div><span>03</span><strong>Preparar</strong><small>Cocina y entrega</small></div><div><span>04</span><strong>Cobrar</strong><small>Abono y cierre</small></div></div><button class="quiet-btn" data-goto="reservas">Administrar reservas ↗</button></article>
        </div>
      </section>

      <section class="view" data-view="reservas">
        <div class="section-intro"><div><p class="overline">AGENDA DE HOSPITALIDAD</p><h1>Reservas organizadas.</h1><p class="subhead">Planifica la llegada de tus clientes y asigna una mesa adecuada.</p></div><button class="primary-btn" type="button" data-command="new-reservation">+ Nueva reserva</button></div>
        <div class="toolbar"><div class="toolbar-left"><span id="reservationCount" class="stat-inline">0 reservas</span><label class="inline-label">Fecha <input id="reservationDate" type="date"></label><button id="clearDate" class="quiet-btn">Todas las fechas</button></div><span class="small-note">Reservas Panacea · reservas nativas visibles solo para consulta</span></div>
        <div id="reservationGrid" class="reservation-grid"></div>
        <div class="native-block"><div class="surface-heading"><div><p class="overline">TASTYIGNITER</p><h2>Reservas del sistema original</h2></div><span class="pill muted">Solo lectura</span></div><div id="nativeReservationList"></div></div>
      </section>

      <section class="view" data-view="salon">
        <div class="section-intro"><div><p class="overline">SALÓN · OPERACIÓN DEL DÍA</p><h1>El restaurante, de un vistazo.</h1><p class="subhead">La misma distribución para datos reales y demostración, con estados claramente identificados.</p></div><div class="intro-actions"><button class="secondary-btn" id="editFloor">Editar plano</button><button class="primary-btn" data-command="new-reservation">+ Reserva</button></div></div>
        <div class="room-meta" id="roomMeta"></div>
        <div class="room-layout">
          <article class="room-card"><div class="room-card-head"><div><span class="room-dot"></span><strong id="areaName">Salón principal</strong><span class="area-label">PLANO 2D</span></div><span class="small-note">ENTRADA ↘</span></div><div class="floor-viewport" id="floorViewport"><div class="floor-surface" id="floorSurface" aria-label="Plano interactivo del salón"></div></div><div class="floor-bottom"><div class="legend"><span><i class="legend-dot neutral"></i>Sin servicio</span><span><i class="legend-dot reserved"></i>Reserva</span><span><i class="legend-dot active-status"></i>En servicio</span><span><i class="legend-dot kitchen-status"></i>Cocina</span><span><i class="legend-dot paid-status"></i>Cobro</span></div><span class="small-note" id="floorHint">Selecciona una mesa</span></div><div class="edit-toolbar" id="editToolbar" hidden><select id="elementType" aria-label="Nuevo elemento"><option value="">+ Elemento arquitectónico</option><option value="wall">Pared</option><option value="door">Puerta</option><option value="window">Ventana</option><option value="aisle">Circulación</option></select><button class="secondary-btn" id="cancelFloor">Cancelar</button><button class="primary-btn" id="saveFloor">Guardar distribución</button></div></article>
          <aside class="table-inspector surface" id="tableInspector" aria-label="Detalle de mesa"></aside>
        </div>
      </section>

      <section class="view" data-view="pedidos">
        <div class="section-intro"><div><p class="overline">COMANDAS</p><h1>Cada pedido, en su lugar.</h1><p class="subhead">Desde la mesa hasta su entrega, sin perder el estado de preparación.</p></div><button class="primary-btn" data-goto="salon">+ Pedido desde mesa</button></div>
        <div class="toolbar"><div class="status-tabs" id="orderTabs"><button data-order-filter="all" class="active">Todos</button><button data-order-filter="pending">Pendientes</button><button data-order-filter="preparing">Preparando</button><button data-order-filter="ready">Listos</button><button data-order-filter="served">Entregados</button></div><span id="orderCount" class="small-note"></span></div>
        <div class="order-grid" id="ordersList"></div>
      </section>

      <section class="view" data-view="cocina">
        <div class="section-intro"><div><p class="overline">PANTALLA DE COCINA · KDS</p><h1>Una cocina que fluye.</h1><p class="subhead">Las comandas avanzan por etapas; los cambios se reflejan en pedidos y salón.</p></div><button class="secondary-btn" id="kitchenRefresh">↻ Actualizar</button></div>
        <div class="kitchen-columns" id="kitchenBoard"></div>
      </section>

      <section class="view" data-view="caja">
        <div class="section-intro"><div><p class="overline">CAJA · CONCILIACIÓN OPERATIVA</p><h1>Cierra el servicio con claridad.</h1><p class="subhead">Consulta saldos, registra abonos manuales y libera mesas al terminar el servicio.</p></div><span class="pill warning">Sin pasarela ni facturación fiscal</span></div>
        <div class="metrics" id="cashMetrics"></div>
        <div class="cash-grid" id="cashList"></div>
      </section>

      <section class="view" data-view="menu">
        <div class="section-intro"><div><p class="overline">CATÁLOGO</p><h1>Tu menú, bien presentado.</h1><p class="subhead">En datos reales los productos y precios se leen del catálogo de TastyIgniter.</p></div><button class="secondary-btn" data-goto="salon">Tomar pedido ↗</button></div>
        <div class="toolbar"><label class="search-wrapper">⌕ <input type="search" id="menuSearch" placeholder="Buscar en el catálogo..." aria-label="Buscar en el catálogo"></label><span id="menuCount" class="small-note"></span></div>
        <div class="catalog-grid" id="catalogGrid"></div>
      </section>


      <section class="view" data-view="inventario">
        <div class="section-intro"><div><p class="overline">EXISTENCIAS Y COMPRAS</p><h1>Inventario sin sorpresas.</h1><p class="subhead">Consulta el alcance actual del inventario, distinguiendo el simulador del sistema nativo.</p></div><button class="secondary-btn" data-command="restock-demo">+ Registrar reposición en demo</button></div>
        <div class="metrics" id="inventoryMetrics"></div><div class="dashboard-grid"><article class="surface"><div class="surface-heading"><div><p class="overline">ALMACÉN</p><h2>Existencias y mínimos</h2></div></div><div id="inventoryList"></div></article><article class="surface"><div class="surface-heading"><div><p class="overline">INTEGRACIÓN</p><h2>Conexión con la cocina</h2></div></div><div id="inventoryNotes"></div></article></div>
      </section>
      <section class="view" data-view="clientes">
        <div class="section-intro"><div><p class="overline">RELACIONES</p><h1>Atención con memoria.</h1><p class="subhead">Seguimiento de visitas y preferencias con privacidad y consentimiento.</p></div></div><div class="metrics" id="customerMetrics"></div><div class="reservation-grid" id="customerList"></div>
      </section>
      <section class="view" data-view="personal">
        <div class="section-intro"><div><p class="overline">EQUIPO DE SERVICIO</p><h1>Personas, roles y turnos.</h1><p class="subhead">La configuración del personal debe provenir del módulo de permisos y horarios autorizado.</p></div></div><div class="metrics" id="staffMetrics"></div><div class="reservation-grid" id="staffList"></div>
      </section>
      <section class="view" data-view="incidencias">
        <div class="section-intro"><div><p class="overline">CONTROL OPERATIVO</p><h1>Que nada quede sin atender.</h1><p class="subhead">Registro y seguimiento de incidencias; el escenario demo permite probar resoluciones.</p></div><button class="secondary-btn" data-command="new-incident">+ Incidencia de ejemplo</button></div><div class="reservation-grid" id="incidentList"></div>
      </section>
      <section class="view" data-view="simulador">
        <div class="section-intro"><div><p class="overline">ESCENARIOS</p><h1>Probar antes de decidir.</h1><p class="subhead">Simulación orientativa de ingresos y margen; los resultados no modifican ventas ni inventario.</p></div></div><div class="dashboard-grid"><article class="surface"><h2>Parámetros del escenario</h2><div class="simulator-fields"><label>Precio por pedido (USD)<input type="number" id="simPrice" min="0" step="0.5" value="18"></label><label>Costo variable por pedido (USD)<input type="number" id="simCost" min="0" step="0.5" value="8"></label><label>Pedidos estimados al día<input type="number" id="simVolume" min="0" step="1" value="65"></label><label>Descuento (%)<input type="number" id="simDiscount" min="0" max="100" step="1" value="5"></label></div></article><article class="surface"><p class="overline">SIMULACIÓN</p><h2>Resultados proyectados</h2><div class="metrics simulator-results" id="simulationResults"></div><p class="small-note">Modelo de contribución simplificado; no incluye impuestos, costos fijos ni cambios de demanda.</p></article></div>
      </section>
      <section class="view" data-view="gerencia">
        <div class="section-intro"><div><p class="overline">DIRECCIÓN DEL RESTAURANTE</p><h1>Decisiones con contexto.</h1><p class="subhead">Indicadores separados por fuente; la contabilidad oficial sigue correspondiendo al sistema fiscal y contable.</p></div></div><div class="metrics" id="managementMetrics"></div><div class="dashboard-grid"><article class="surface"><p class="overline">OPERACIÓN PANACEA</p><h2>Comandas por estado</h2><div id="managementOrders"></div></article><article class="surface"><p class="overline">FUENTES EXTERNAS</p><h2>Datos nativos de TastyIgniter</h2><div id="managementSources"></div></article></div>
      </section>

      <footer class="footer"><span>Panacea Restaurant · Operations Studio</span><span id="footerMode">Entorno local · Fuente real</span></footer>
    </main>
  </div>
</div>

<div id="modalOverlay" class="modal-overlay" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-top"><div><p class="overline" id="modalEyebrow">OPERACIÓN</p><h2 id="modalTitle">Nueva acción</h2></div><button id="closeModal" class="icon-button" aria-label="Cerrar">×</button></div>
    <form id="modalForm"><div id="modalFields"></div><div id="modalError" class="form-error" role="alert" hidden></div><div class="modal-actions"><button type="button" class="secondary-btn" id="cancelModal">Cancelar</button><button type="submit" id="modalSubmit" class="primary-btn">Confirmar</button></div></form>
  </div>
</div>
</body>
</html>
