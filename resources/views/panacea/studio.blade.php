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
  <link rel="stylesheet" href="{{ asset('panacea/studio.css') }}?v=4">
  <script>
    window.PANACEA_STUDIO = {
      stateUrl: @json($apiState),
      actionUrl: @json($apiAction),
      floorUrl: @json($floorSaveUrl),
      csrf: @json(csrf_token())
    };
  </script>
  <link rel="stylesheet" href="{{ asset('panacea/studio-premium.css') }}?v=4">
  <script defer src="{{ asset('panacea/studio.js') }}?v=4"></script>
  <script defer src="{{ asset('panacea/studio-shell.js') }}?v=4"></script>
</head>
<body>
<a class="skip-link" href="#mainContent">Saltar al contenido</a>
<svg xmlns="http://www.w3.org/2000/svg" class="svg-sprite" aria-hidden="true" focusable="false">
<symbol id="ic-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
<symbol id="ic-panel" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></symbol>
<symbol id="ic-collapse" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 9l-3 3 3 3"/></symbol>
<symbol id="ic-expand" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18m4-6 3-3-3-3"/></symbol>
<symbol id="ic-home" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></symbol>
<symbol id="ic-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 15h.01M12 15h.01M16 15h.01"/></symbol>
<symbol id="ic-table" viewBox="0 0 24 24"><path d="M3 6h18v5H3zM5 11v9m14-9v9M8 15h8"/></symbol>
<symbol id="ic-orders" viewBox="0 0 24 24"><path d="M8 4h11a2 2 0 0 1 2 2v14H5V6a2 2 0 0 1 2-2h1ZM9 3h6v3H9zM9 11h8M9 15h8M9 19h5"/></symbol>
<symbol id="ic-chef" viewBox="0 0 24 24"><path d="M6 14a4 4 0 0 1-1-7.9 5 5 0 0 1 9-2 4.5 4.5 0 0 1 6 6.8A4 4 0 0 1 18 14H6ZM7 14v7h10v-7M7 18h10"/></symbol>
<symbol id="ic-wallet" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M16 13h5v5h-5a2.5 2.5 0 0 1 0-5ZM6 5V3h12"/></symbol>
<symbol id="ic-book" viewBox="0 0 24 24"><path d="M12 6a9 9 0 0 0-9-2v15a9 9 0 0 1 9 2 9 9 0 0 1 9-2V4a9 9 0 0 0-9 2v15M7 9h2M15 9h2"/></symbol>
<symbol id="ic-box" viewBox="0 0 24 24"><path d="m3 7 9-4 9 4v10l-9 4-9-4V7ZM3 7l9 4 9-4M12 11v10M7 5l9 4"/></symbol>
<symbol id="ic-users" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2H3ZM17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></symbol>
<symbol id="ic-staff" viewBox="0 0 24 24"><circle cx="10" cy="7" r="3"/><path d="M4 20v-2a6 6 0 0 1 9.5-4.8M16 18l2 2 4-5"/></symbol>
<symbol id="ic-alert" viewBox="0 0 24 24"><path d="m12 3 9 16H3L12 3ZM12 9v4M12 17h.01"/></symbol>
<symbol id="ic-sliders" viewBox="0 0 24 24"><path d="M4 7h6m4 0h6M4 17h9m4 0h3M10 4v6M17 14v6"/></symbol>
<symbol id="ic-chart" viewBox="0 0 24 24"><path d="M3 20V4m0 16h18M7 16v-4M12 16V7M17 16v-8M7 9l5-5 5 2 3-3"/></symbol>
<symbol id="ic-refresh" viewBox="0 0 24 24"><path d="M20 7v5h-5M4 17v-5h5M5 10a8 8 0 0 1 14-3l1 5M4 12a8 8 0 0 0 15 2"/></symbol>
<symbol id="ic-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></symbol>
<symbol id="ic-moon" viewBox="0 0 24 24"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z"/></symbol>
<symbol id="ic-sparkles" viewBox="0 0 24 24"><path d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3ZM19 18l.7 2.3L22 21l-2.3.7L19 24l-.7-2.3L16 21l2.3-.7L19 18Z"/></symbol>
<symbol id="ic-plus" viewBox="0 0 24 24"><path d="M12 4v16M4 12h16"/></symbol>
<symbol id="ic-arrow" viewBox="0 0 24 24"><path d="M7 17 17 7M7 7h10v10"/></symbol>
<symbol id="ic-check" viewBox="0 0 24 24"><path d="m5 12 5 5L20 7"/></symbol>
<symbol id="ic-layers" viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/></symbol>
<symbol id="ic-bell" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4"/></symbol>
<symbol id="ic-eye-off" viewBox="0 0 24 24"><path d="m3 3 18 18M10.6 5.2A10 10 0 0 1 12 5c5 0 9 7 9 7a16 16 0 0 1-3 3.5M6.4 6.4A16 16 0 0 0 3 12s4 7 9 7a9.5 9.5 0 0 0 4.1-.9M10 10a3 3 0 0 0 4 4"/></symbol>
</svg>
<div class="app-shell" id="appShell">
  <aside class="side" id="sidebar" aria-label="Navegación principal">
<div class="side-top"><div class="identity"><div class="brand-symbol" aria-hidden="true">✳</div><div class="brand-copy"><strong>panacea</strong><span>RESTAURANT · STUDIO</span></div></div><button type="button" class="sidebar-compact-toggle" id="sidebarCompactToggle" aria-label="Contraer barra lateral" title="Contraer barra lateral"><svg class="icon" aria-hidden="true"><use href="#ic-collapse"></use></svg></button></div>
    <div class="side-caption">ESPACIO DE TRABAJO</div>
    <nav class="navigation" id="sidebarNav" aria-label="Secciones de Panacea">
      <button type="button" data-nav="inicio" class="active" title="Resumen" aria-label="Resumen" aria-current="page"><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-home"></use></svg></span><span class="nav-text">Resumen</span></button>
      <button type="button" data-nav="reservas" title="Reservas" aria-label="Reservas" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-calendar"></use></svg></span><span class="nav-text">Reservas</span></button>
      <button type="button" data-nav="salon" title="Salón y mesas" aria-label="Salón y mesas" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-table"></use></svg></span><span class="nav-text">Salón y mesas</span></button>
      <button type="button" data-nav="pedidos" title="Pedidos" aria-label="Pedidos" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-orders"></use></svg></span><span class="nav-text">Pedidos</span></button>
      <button type="button" data-nav="cocina" title="Cocina" aria-label="Cocina" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-chef"></use></svg></span><span class="nav-text">Cocina</span></button>
      <button type="button" data-nav="caja" title="Caja y cobros" aria-label="Caja y cobros" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-wallet"></use></svg></span><span class="nav-text">Caja y cobros</span></button>
      <button type="button" data-nav="menu" title="Catálogo" aria-label="Catálogo" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-book"></use></svg></span><span class="nav-text">Catálogo</span></button>
      <div class="nav-separator" data-section-label="GESTIÓN">GESTIÓN</div>
      <button type="button" data-nav="inventario" title="Inventario" aria-label="Inventario" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-box"></use></svg></span><span class="nav-text">Inventario</span></button>
      <button type="button" data-nav="clientes" title="Clientes" aria-label="Clientes" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-users"></use></svg></span><span class="nav-text">Clientes</span></button>
      <button type="button" data-nav="personal" title="Personal" aria-label="Personal" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-staff"></use></svg></span><span class="nav-text">Personal</span></button>
      <button type="button" data-nav="incidencias" title="Incidencias" aria-label="Incidencias" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-alert"></use></svg></span><span class="nav-text">Incidencias</span></button>
      <button type="button" data-nav="simulador" title="Simulador" aria-label="Simulador" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-sliders"></use></svg></span><span class="nav-text">Simulador</span></button>
      <button type="button" data-nav="gerencia" title="Gerencia" aria-label="Gerencia" ><span class="nav-symbol"><svg class="icon" aria-hidden="true"><use href="#ic-chart"></use></svg></span><span class="nav-text">Gerencia</span></button>
    </nav>
        <div class="side-bottom"><div class="side-status"><span class="pulse"></span><span>Entorno local de desarrollo</span></div><p>El modo real utiliza MariaDB. Los cobros se registran manualmente y no son transacciones bancarias ni comprobantes fiscales.</p><a href="/panacea-operations">Administración TastyIgniter <span>↗</span></a></div>
  </aside>
  <button type="button" id="sidebarScrim" class="sidebar-scrim" aria-label="Cerrar navegación" tabindex="-1" hidden></button>

  <div class="main-column">
    <header class="topbar">
      <div class="topbar-leading">
        <button type="button" class="icon-button menu-toggle" id="sidebarToggle" aria-controls="sidebar" aria-expanded="true" aria-label="Ocultar barra lateral" title="Ocultar o mostrar menú"><svg class="icon" aria-hidden="true"><use href="#ic-menu"></use></svg></button>
        <div class="breadcrumbs"><span>PANACEA</span><span class="slash">/</span><span>RESTAURANT</span><span class="slash">/</span><strong id="breadcrumb">RESUMEN</strong></div>
      </div>
      <div class="topbar-actions">
        <span class="source-indicator" id="sourceIndicator">● Conectando</span>
        <div class="mode-control" role="group" aria-label="Fuente de datos">
          <button type="button" id="realMode" class="active" aria-pressed="true">Datos reales</button>
          <button type="button" id="demoMode" aria-pressed="false">Demostración</button>
        </div>
        <button type="button" class="icon-button" id="reload" title="Actualizar desde la base de datos" aria-label="Actualizar datos"><svg class="icon" aria-hidden="true"><use href="#ic-refresh"></use></svg></button>
        <button type="button" class="icon-button" id="themeSwitch" title="Cambiar apariencia" aria-label="Cambiar apariencia" aria-pressed="false"><svg class="icon" aria-hidden="true"><use href="#ic-moon"></use></svg></button>
      </div>
    </header>

    <main class="work-area" id="mainContent">
      <div id="toast" role="status" aria-live="polite" class="toast" hidden></div>
      <div id="banner" class="banner" hidden></div>

      <section class="view active" data-view="inicio">
        <div class="section-intro"><div><p class="overline">CENTRO DE OPERACIONES</p><h1>Todo el servicio, bajo control.</h1><p class="subhead">Mesas, reservas, pedidos y cobros conectados en un mismo recorrido.</p></div><button type="button" class="primary-btn" data-goto="salon">Abrir el salón <span>↗</span></button></div>
        <div class="guest-feature" aria-label="Experiencia pública del restaurante"><div class="guest-feature-copy"><span class="guest-feature-eyebrow">UNA EXPERIENCIA PARA TUS CLIENTES</span><h2>La mesa comienza<br><em>mucho antes de llegar.</em></h2><p>Explora la nueva portada gastronómica, descubre la carta y solicita una reserva desde una experiencia pensada para invitados.</p><a class="guest-feature-link" href="/panacea" target="_blank" rel="noopener">Ver experiencia del cliente <span aria-hidden="true">↗</span></a></div><div class="guest-feature-photo" aria-hidden="true"><span>✳</span></div></div>
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
        <div class="section-intro"><div><p class="overline">EXISTENCIAS Y COMPRAS</p><h1>Inventario sin sorpresas.</h1><p class="subhead">Controla ingredientes, cantidades y recetas asociadas al catálogo. Los movimientos se mantienen separados del stock nativo.</p></div><div class="intro-actions"><button class="secondary-btn" data-command="new-recipe">Configurar receta</button><button class="primary-btn" data-command="new-ingredient">+ Ingrediente</button></div></div>
        <div class="metrics" id="inventoryMetrics"></div><div class="dashboard-grid"><article class="surface"><div class="surface-heading"><div><p class="overline">ALMACÉN</p><h2>Existencias y mínimos</h2></div></div><div id="inventoryList"></div></article><article class="surface"><div class="surface-heading"><div><p class="overline">INTEGRACIÓN</p><h2>Conexión con la cocina</h2></div></div><div id="inventoryNotes"></div></article></div>
      </section>
      <section class="view" data-view="clientes">
        <div class="section-intro"><div><p class="overline">RELACIONES</p><h1>Atención con memoria.</h1><p class="subhead">Perfiles opcionales con consentimiento explícito e historial de visitas atendidas.</p></div></div><div class="intro-actions"><button class="primary-btn" data-command="new-profile">+ Nuevo perfil</button></div><div class="metrics" id="customerMetrics"></div><div class="reservation-grid" id="customerList"></div>
      </section>
      <section class="view" data-view="personal">
        <div class="section-intro"><div><p class="overline">EQUIPO DE SERVICIO</p><h1>Personas, roles y turnos.</h1><p class="subhead">Directorio de equipo y turnos de Panacea. Los permisos efectivos siguen administrándose en TastyIgniter.</p></div></div><div class="intro-actions"><button class="primary-btn" data-command="new-staff">+ Integrante</button></div><div class="metrics" id="staffMetrics"></div><div class="reservation-grid" id="staffList"></div>
      </section>
      <section class="view" data-view="incidencias">
        <div class="section-intro"><div><p class="overline">CONTROL OPERATIVO</p><h1>Que nada quede sin atender.</h1><p class="subhead">Registro persistente de incidencias, responsables y resoluciones con rastro de auditoría.</p></div><button class="primary-btn" data-command="new-incident">+ Nueva incidencia</button></div><div class="reservation-grid" id="incidentList"></div>
      </section>
      <section class="view" data-view="simulador">
        <div class="section-intro"><div><p class="overline">ESCENARIOS</p><h1>Probar antes de decidir.</h1><p class="subhead">Simulación orientativa de ingresos y margen; los resultados no modifican ventas ni inventario.</p></div></div><div class="dashboard-grid"><article class="surface"><h2>Parámetros del escenario</h2><div class="simulator-fields"><label>Precio por pedido (USD)<input type="number" id="simPrice" min="0" step="0.5" value="18"></label><label>Costo variable por pedido (USD)<input type="number" id="simCost" min="0" step="0.5" value="8"></label><label>Pedidos estimados al día<input type="number" id="simVolume" min="0" step="1" value="65"></label><label>Descuento (%)<input type="number" id="simDiscount" min="0" max="100" step="1" value="5"></label></div></article><article class="surface"><p class="overline">SIMULACIÓN</p><h2>Resultados proyectados</h2><div class="metrics simulator-results" id="simulationResults"></div><p class="small-note">Modelo de contribución simplificado; no incluye impuestos, costos fijos ni cambios de demanda.</p></article></div>
      </section>
      <section class="view" data-view="gerencia">
        <div class="section-intro"><div><p class="overline">DIRECCIÓN DEL RESTAURANTE</p><h1>Decisiones con contexto.</h1><p class="subhead">Indicadores separados por fuente; la contabilidad oficial sigue correspondiendo al sistema fiscal y contable.</p></div></div><div class="metrics" id="managementMetrics"></div><div class="dashboard-grid"><article class="surface"><p class="overline">OPERACIÓN PANACEA</p><h2>Comandas por estado</h2><div id="managementOrders"></div></article><article class="surface"><p class="overline">FUENTES EXTERNAS</p><h2>Datos nativos y auditoría</h2><div id="managementSources"></div></article></div>
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
