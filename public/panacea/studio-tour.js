'use strict';

/*
 * Panacea · Presenter Quest
 * A non-destructive, accessible walkthrough intended for demo recording.
 * All interaction is UI navigation / source switching (real -> demo).
 * No fetch, write request, menu mutations, payments or modal submissions.
 */
(() => {
  const $ = id => document.getElementById(id);
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A complete tour and a shorter path share the same grounded content.
  // Each anchor points at a real existing view or DOM control.
  const CATALOG = Object.freeze([
    {
      id:'source',view:'inicio',anchor:'.mode-control',chapter:'PREPARACIÓN',quick:true,
      title:'Una plataforma, dos modos.',
      copy:'Demostración presenta un restaurante ficticio y permite explorar sin escribir en MariaDB. Datos reales muestra lo registrado localmente. La guía utiliza la demostración para que puedas grabar con ejemplos.'
    },
    {
      id:'overview',view:'inicio',anchor:'#dashboardMetrics .metric:first-child',chapter:'CENTRO DE OPERACIONES',quick:true,
      title:'Tu restaurante de un vistazo.',
      copy:'Este panel resume mesas configuradas, servicios abiertos, reservas próximas y comandas en cocina. Los indicadores se actualizan según el modo seleccionado.'
    },
    {
      id:'activity',view:'inicio',anchor:'#activityFeed',chapter:'CENTRO DE OPERACIONES',quick:false,
      title:'Actividad que se puede seguir.',
      copy:'Aquí aparecen los movimientos recientes de la operación: reservas y pedidos con su estado. Es la primera parada para entender qué está ocurriendo.'
    },
    {
      id:'guest',view:'inicio',anchor:'.guest-feature-copy',chapter:'EXPERIENCIA DEL CLIENTE',quick:true,
      title:'La experiencia empieza antes de llegar.',
      copy:'Este acceso lleva a la página del cliente: fotografías, carta de productos y solicitud de mesa. Las solicitudes quedan pendientes hasta que el restaurante las confirme.',
      portal:true
    },
    {
      id:'reservations',view:'reservas',anchor:'.view[data-view="reservas"] .section-intro',chapter:'RECEPCIÓN',quick:true,
      title:'Primero, organizamos las reservas.',
      copy:'Recepción puede consultar la agenda, crear reservas y confirmar solicitudes. Se revisan capacidades y conflictos de horario; la integración con reservas nativas sigue separada.'
    },
    {
      id:'reservation-cards',view:'reservas',anchor:'#reservationGrid .reservation-card:first-child',chapter:'RECEPCIÓN',quick:false,
      title:'Cada reserva tiene su estado.',
      copy:'Las tarjetas muestran hora, comensales, mesa y situación. Desde aquí puedes confirmar, cancelar o recibir una visita cuando corresponda.'
    },
    {
      id:'floor',view:'salon',anchor:'#floorViewport',chapter:'SALÓN',quick:true,
      title:'El salón cobra vida.',
      copy:'Este plano 2D representa la distribución de las mesas. La ficha permite consultar el servicio y el estado de atención; la ausencia de un servicio Panacea no garantiza disponibilidad nativa.'
    },
    {
      id:'inspector',view:'salon',anchor:'#tableInspector',prepare:'selectTable',chapter:'SALÓN',quick:true,
      title:'Una ficha por cada mesa.',
      copy:'Al seleccionar una mesa ves sus datos y acciones de servicio. Desde aquí pueden abrirse comandas y relacionarse clientes, según el estado de la mesa.'
    },
    {
      id:'floor-edit',view:'salon',anchor:'#editFloor',chapter:'SALÓN',quick:false,
      title:'También puedes diseñar el espacio.',
      copy:'El editor permite ajustar la posición y propiedades de mesas, y representar paredes, puertas o zonas de circulación. La guía muestra el control sin entrar en edición ni guardar cambios.'
    },
    {
      id:'orders',view:'pedidos',anchor:'#ordersList .order-card:first-child',chapter:'SERVICIO',quick:true,
      title:'Una comanda sigue su recorrido.',
      copy:'Los pedidos nacen de una mesa y mantienen el detalle de productos y su estado. Puedes filtrarlos entre pendientes, preparando, listos y entregados.'
    },
    {
      id:'kitchen',view:'cocina',anchor:'#kitchenBoard .kitchen-lane:first-child',chapter:'COCINA',quick:true,
      title:'La cocina tiene su propia pantalla.',
      copy:'El KDS organiza las comandas por etapa. Al pasar una comanda a preparación, se consume el inventario propio de Panacea si su receta está configurada.'
    },
    {
      id:'cash',view:'caja',anchor:'#cashMetrics .metric:first-child',chapter:'CAJA',quick:true,
      title:'Cobrar y cerrar, sin perder el control.',
      copy:'Caja calcula saldos de servicios Panacea y permite registrar abonos manuales y cerrar mesas. No procesa tarjetas ni emite facturas fiscales.'
    },
    {
      id:'menu',view:'menu',anchor:'#catalogGrid .catalog-card:first-child',chapter:'CATÁLOGO',quick:false,
      title:'La carta también forma parte de la experiencia.',
      copy:'Los productos, precios y fotografías provienen del catálogo nativo cuando existen. Las fotografías de apoyo están etiquetadas como ilustrativas.'
    },
    {
      id:'inventory',view:'inventario',anchor:'#inventoryMetrics .metric:first-child',chapter:'INVENTARIO',quick:true,
      title:'De la receta a la existencia.',
      copy:'Panacea registra ingredientes, stock mínimo y costos. Las comandas pueden descontar su propia existencia; el inventario nativo de TastyIgniter sigue siendo independiente.'
    },
    {
      id:'recipes',view:'inventario',anchor:'#inventoryNotes',chapter:'INVENTARIO',quick:false,
      title:'Conectamos platos con ingredientes.',
      copy:'Cada receta indica la cantidad necesaria por producto. Esto permite estimar el consumo y detectar faltantes antes de continuar la preparación.'
    },
    {
      id:'customers',view:'clientes',anchor:'#customerMetrics .metric:first-child',chapter:'RELACIONES',quick:false,
      title:'Hospitalidad con memoria.',
      copy:'Los perfiles de clientes son opcionales. Las visitas se vinculan expresamente y el consentimiento de contacto se registra separado.'
    },
    {
      id:'staff',view:'personal',anchor:'.view[data-view="personal"] .section-intro',chapter:'EQUIPO',quick:false,
      title:'El personal, en contexto.',
      copy:'Consulta un directorio con puestos y turnos. Estos roles son informativos: no reemplazan los permisos de usuario gestionados por TastyIgniter.'
    },
    {
      id:'incidents',view:'incidencias',anchor:'#incidentList .reservation-card:first-child',chapter:'CALIDAD',quick:false,
      title:'Los problemas también tienen seguimiento.',
      copy:'Las incidencias registran prioridad, responsable y resolución. El seguimiento ayuda a que una observación no quede sin atender.'
    },
    {
      id:'simulator',view:'simulador',anchor:'.simulator-fields',chapter:'SIMULACIÓN',quick:false,
      title:'¿Y si cambiamos un escenario?',
      copy:'Puedes ajustar precio, volumen, descuentos y costos variables para observar una contribución orientativa. Es una simulación: no cambia ventas ni inventario.'
    },
    {
      id:'management',view:'gerencia',anchor:'#managementSignals .signal-item:first-child',chapter:'GERENCIA',quick:true,
      title:'De los datos a las decisiones.',
      copy:'Gerencia presenta indicadores y alertas basadas en reglas: reservas pendientes, cocina atrasada, existencias bajas e incidencias. No se trata aún de IA generativa ni de contabilidad fiscal.'
    },
    {
      id:'finish',center:true,chapter:'MISIÓN COMPLETADA',quick:true,
      title:'Listo para presentar Panacea.',
      copy:'Ya conoces el recorrido desde la reserva hasta la atención, cocina, caja y decisiones gerenciales. Puedes repetir la guía desde el icono ✳ de la barra superior.'
    }
  ]);

  const state={
    opened:false,
    mode:null,
    steps:[],
    index:-1,
    playing:false,
    autoTimer:null,
    renderVersion:0,
    rafPending:false,
    originalFocus:null
  };
  let elements={};

  function bridge(){
    return window.PanaceaStudioGuide || null;
  }
  function available(){
    return Boolean(bridge()?.ready?.());
  }
  function isBusy(){
    return Boolean(bridge()?.isEditing?.() || bridge()?.modalOpen?.());
  }
  function setHidden(el,hidden){if(el)el.hidden=Boolean(hidden)}
  function setText(el,value){if(el)el.textContent=value}
  function makeVisible(){
    elements.overlay.hidden=false;
    elements.overlay.setAttribute('aria-hidden','false');
    elements.launcher.setAttribute('aria-expanded','true');
    document.body.classList.add('tour-is-open');
  }
  function statusMessage(message){
    setText(elements.description,message);
    elements.description.setAttribute('role','status');
  }
  function isOpen(){return state.opened}
  function clearAutoplay(){
    if(state.autoTimer!==null){window.clearTimeout(state.autoTimer);state.autoTimer=null}
  }
  function stopAutoplay(){
    clearAutoplay();
    state.playing=false;
    elements.autoplay.setAttribute('aria-pressed','false');
    elements.autoplay.textContent='▶';
    elements.autoplay.setAttribute('aria-label','Activar avance automático');
    elements.autoplay.title='Avance automático cada 9 segundos';
  }
  function close(){
    if(!state.opened)return;
    stopAutoplay();
    state.opened=false;
    state.mode=null;
    state.steps=[];
    state.index=-1;
    state.renderVersion++;
    elements.overlay.hidden=true;
    elements.overlay.setAttribute('aria-hidden','true');
    elements.launcher.setAttribute('aria-expanded','false');
    document.body.classList.remove('tour-is-open');
    elements.launcher.focus();
  }
  function open(){
    if(state.opened){close();return}
    if(isBusy()){
      const banner=$('toast');
      if(banner){
        banner.hidden=false;
        banner.textContent='Cierra el formulario o guarda/cancela la edición del plano antes de iniciar la guía.';
        window.setTimeout(()=>{if(banner.textContent?.startsWith('Cierra el formulario'))banner.hidden=true},4800);
      }
      return;
    }
    state.opened=true;
    state.originalFocus=document.activeElement;
    makeVisible();
    renderWelcome();
  }
  function placeDimmer(el,left,top,width,height){
    el.style.left=Math.max(0,left)+'px';
    el.style.top=Math.max(0,top)+'px';
    el.style.width=Math.max(0,width)+'px';
    el.style.height=Math.max(0,height)+'px';
  }
  function setWholeScreen(){
    const w=window.innerWidth,h=window.innerHeight;
    placeDimmer(elements.dimTop,0,0,w,h);
    placeDimmer(elements.dimLeft,0,0,0,0);
    placeDimmer(elements.dimRight,0,0,0,0);
    placeDimmer(elements.dimBottom,0,0,0,0);
    elements.spotlight.hidden=true;
  }
  function clamp(value,min,max){return Math.max(min,Math.min(value,Math.max(min,max)))}
  function placeCentered(){
    if(!state.opened)return;
    state.rafPending=false;
    elements.overlay.classList.add('is-centered');
    elements.dialog.classList.add('is-centered');
    setWholeScreen();
    const w=window.innerWidth,h=window.innerHeight;
    const card=elements.dialog.getBoundingClientRect();
    elements.dialog.style.left=Math.round((w-card.width)/2)+'px';
    elements.dialog.style.top=Math.round(clamp((h-card.height)/2,10,Math.max(10,h-card.height-10)))+'px';
  }
  function elementFor(step){
    if(!step || step.center)return null;
    const queried=document.querySelector(step.anchor);
    if(queried && queried.getBoundingClientRect().width > 0
        && queried.getBoundingClientRect().height > 0) return queried;

    const fallback=document.querySelector('.view[data-view="'+step.view+'"] .section-intro');
    if(fallback && fallback.getBoundingClientRect().width > 0)return fallback;
    return null;
  }
  function positionStep({scroll=false}={}){
    if(!state.opened)return;
    const step=state.steps[state.index];
    if(!step||step.center||!state.mode){placeCentered();return}
    const target=elementFor(step);
    if(!target){placeCentered();return}
    if(scroll){
      target.scrollIntoView({
        behavior:'instant',
        block:window.innerWidth<=760?'start':'center',
        inline:'nearest'
      });
    }
    const w=window.innerWidth,h=window.innerHeight;
    const r=target.getBoundingClientRect();
    // On narrow screens leave a pocket at the bottom for the guide card.
    // Clip an oversized target rather than drawing outside the viewport.
    const padding=w<760?6:9;
    const left=clamp(r.left-padding,7,w-24);
    const top=clamp(r.top-padding,7,h-24);
    const right=clamp(r.right+padding,left+18,w-7);
    const bottom=clamp(r.bottom+padding,top+18,h-7);
    const width=right-left,height=bottom-top;

    placeDimmer(elements.dimTop,0,0,w,top);
    placeDimmer(elements.dimLeft,0,top,left,height);
    placeDimmer(elements.dimRight,right,top,w-right,height);
    placeDimmer(elements.dimBottom,0,bottom,w,h-bottom);

    elements.spotlight.hidden=false;
    elements.spotlight.style.left=left+'px';
    elements.spotlight.style.top=top+'px';
    elements.spotlight.style.width=width+'px';
    elements.spotlight.style.height=height+'px';
    elements.overlay.classList.remove('is-centered');
    elements.dialog.classList.remove('is-centered');

    const dialogRect=elements.dialog.getBoundingClientRect();
    const cw=dialogRect.width||Math.min(390,w-26),ch=dialogRect.height||280;
    const gap=18,margin=12;
    let x,y;
    if(w<=760){
      x=(w-cw)/2;
      y=h-ch-margin;
    }else if(w-right >= cw+gap+margin){
      x=right+gap;y=clamp(top,h>ch?margin:0,h-ch-margin);
    }else if(left >= cw+gap+margin){
      x=left-gap-cw;y=clamp(top,margin,h-ch-margin);
    }else if(h-bottom >= ch+gap+margin){
      x=clamp(left,margin,w-cw-margin);y=bottom+gap;
    }else if(top >= ch+gap+margin){
      x=clamp(left,margin,w-cw-margin);y=top-gap-ch;
    }else{
      // Target occupies much of the screen (e.g. the floor plan):
      // place the presenter HUD in the corner with less overlap.
      x=left+w/2 > w/2 ? margin : w-cw-margin;
      y=top > h/2 ? margin : h-ch-margin;
    }
    elements.dialog.style.left=Math.round(clamp(x,margin,w-cw-margin))+'px';
    elements.dialog.style.top=Math.round(clamp(y,margin,h-ch-margin))+'px';
  }
  function queuedPosition(scroll=false){
    if(!state.opened)return;
    const version=++state.renderVersion;
    window.requestAnimationFrame(()=>{
      window.requestAnimationFrame(()=>{
        if(!state.opened||version!==state.renderVersion)return;
        positionStep({scroll});
      });
    });
  }
  function focusCurrent(){
    if(state.index<0){
      elements.short.focus();
    }else{
      elements.next.focus({preventScroll:true});
    }
  }
  function renderWelcome(){
    state.index=-1;
    state.mode=null;
    state.steps=[];
    stopAutoplay();
    setText(elements.chapter,'BIENVENIDA · MODO PRESENTACIÓN');
    setText(elements.counter,'ELIGE TU AVENTURA');
    setText(elements.title,'Tu restaurante, explicado paso a paso.');
    statusMessage('Recorre Panacea como un tutorial de videojuego: cada pantalla se presenta con un foco visual. La guía activa los datos de demostración y no ejecuta acciones operativas.');
    setHidden(elements.chooser,false);
    setHidden(elements.progressWrap,true);
    setHidden(elements.controls,true);
    setHidden(elements.autoplay,true);
    setHidden(elements.portal,true);
    setText(elements.hint,'Ideal para grabar · Sin cambiar datos reales');
    queuedPosition();
    focusCurrent();
  }
  function start(kind){
    if(!state.opened)return;
    if(!available()){
      statusMessage('Todavía se están cargando los datos. Comprueba que la aplicación haya terminado de iniciar e inténtalo de nuevo.');
      return;
    }
    if(isBusy()){
      statusMessage('Finaliza la edición del plano o cierra el formulario antes de empezar.');
      return;
    }

    // Switching to Demo is an explicit opt-in from the welcome screen. This
    // changes only the browser's active source, never MariaDB.
    bridge().useDemo();
    state.mode=kind==='full'?'full':'quick';
    state.steps=CATALOG.filter(step=>state.mode==='full'||step.quick);
    state.index=0;
    setHidden(elements.chooser,true);
    setHidden(elements.controls,false);
    setHidden(elements.progressWrap,false);
    setHidden(elements.autoplay,false);
    renderStep();
  }
  function renderStep(){
    if(!state.opened || state.index<0)return;
    clearAutoplay();
    const step=state.steps[state.index];
    const final=step.id==='finish';
    setText(elements.chapter,step.chapter);
    setText(elements.counter,'PASO '+String(state.index+1).padStart(2,'0')+' / '+String(state.steps.length).padStart(2,'0'));
    setText(elements.title,step.title);
    statusMessage(step.copy);
    setHidden(elements.portal,!step.portal);
    elements.back.disabled=false;
    setText(elements.next,final?'Terminar recorrido ↗':'Siguiente →');
    const progress=Math.round((state.index+1)/state.steps.length*100);
    elements.progressBar.style.width=progress+'%';
    setText(elements.progressText,progress+'%');
    setText(elements.hint,final
      ? 'Puedes iniciar otra guía cuando quieras.'
      : '← anterior  ·  → siguiente  ·  Esc cerrar  ·  ▶ automático');

    if(step.view && bridge()?.view()!==step.view)bridge()?.navigate(step.view);
    if(step.prepare==='selectTable')bridge()?.selectFirstTable();
    if(step.center){
      queuedPosition();
    }else{
      queuedPosition(true);
    }
    focusCurrent();
    if(state.playing&&!final) scheduleAuto();
    if(final&&state.playing)stopAutoplay();
  }
  function next(){
    if(!state.opened||state.index<0)return;
    if(state.index>=state.steps.length-1){close();return}
    state.index++;
    renderStep();
  }
  function back(){
    if(!state.opened||state.index<0)return;
    if(state.index===0){renderWelcome();return}
    state.index--;
    renderStep();
  }
  function scheduleAuto(){
    clearAutoplay();
    if(!state.opened||!state.playing||state.index<0)return;
    state.autoTimer=window.setTimeout(()=>{
      state.autoTimer=null;
      if(document.hidden){
        stopAutoplay();
        return;
      }
      next();
    },9000);
  }
  function toggleAuto(){
    if(!state.opened||state.index<0)return;
    if(state.playing){stopAutoplay();return}
    state.playing=true;
    elements.autoplay.setAttribute('aria-pressed','true');
    elements.autoplay.textContent='Ⅱ';
    elements.autoplay.setAttribute('aria-label','Pausar avance automático');
    elements.autoplay.title='Pausar reproducción guiada';
    scheduleAuto();
  }
  function onKey(event){
    if(!state.opened)return;
    if(event.key==='Escape'){
      event.preventDefault();event.stopImmediatePropagation();
      close();
      return;
    }
    if(event.key==='Tab'){
      const all=[...elements.dialog.querySelectorAll('button, a[href]')]
        .filter(el=>!el.hidden&&!el.disabled&&!el.closest('[hidden]'));
      if(!all.length)return;
      const first=all[0],last=all[all.length-1];
      if(event.shiftKey && (document.activeElement===first || !elements.dialog.contains(document.activeElement))){
        event.preventDefault();last.focus();
      }else if(!event.shiftKey && (document.activeElement===last||!elements.dialog.contains(document.activeElement))){
        event.preventDefault();first.focus();
      }
      return;
    }
    if(state.index<0)return;
    const tag=document.activeElement?.tagName?.toLowerCase();
    if(['input','select','textarea'].includes(tag))return;
    if(event.key==='ArrowRight'){
      event.preventDefault();event.stopImmediatePropagation();next();
    }else if(event.key==='ArrowLeft'){
      event.preventDefault();event.stopImmediatePropagation();back();
    }
  }
  function init(){
    elements={
      launcher:$('tourLaunch'),
      overlay:$('tourOverlay'),
      shield:$('tourShield'),
      dialog:$('tourDialog'),
      dimTop:$('tourDimTop'),
      dimLeft:$('tourDimLeft'),
      dimRight:$('tourDimRight'),
      dimBottom:$('tourDimBottom'),
      spotlight:$('tourSpotlight'),
      title:$('tourTitle'),
      description:$('tourDescription'),
      chapter:$('tourChapter'),
      counter:$('tourCounter'),
      chooser:$('tourChooser'),
      short:document.querySelector('[data-tour-length="quick"]'),
      full:document.querySelector('[data-tour-length="full"]'),
      portal:$('tourPortalLink'),
      progressWrap:$('tourProgressWrap'),
      progressBar:$('tourProgress'),
      progressText:$('tourProgressText'),
      controls:$('tourControls'),
      back:$('tourBack'),
      next:$('tourNext'),
      hint:$('tourHint'),
      close:$('tourClose'),
      autoplay:$('tourAutoplay')
    };
    if(!elements.launcher||!elements.overlay||!elements.short||!elements.dialog)return;

    elements.launcher.addEventListener('click',open);
    elements.close.addEventListener('click',close);
    elements.short.addEventListener('click',()=>start('quick'));
    elements.full.addEventListener('click',()=>start('full'));
    elements.back.addEventListener('click',back);
    elements.next.addEventListener('click',next);
    elements.autoplay.addEventListener('click',toggleAuto);
    elements.shield.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
    });
    elements.shield.addEventListener('wheel',event=>event.preventDefault(),{passive:false});
    document.addEventListener('keydown',onKey,true);
    window.addEventListener('resize',()=>{if(state.opened)queuedPosition()});
    window.addEventListener('scroll',()=>{if(state.opened)queuedPosition()},{passive:true,capture:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAutoplay()});

    // No autoplay at load and no automatic first-run popup.
    // This bridge is useful for deterministic smoke tests and is read-only.
    window.PanaceaPresenterQuest=Object.freeze({
      isOpen:()=>state.opened,
      mode:()=>state.mode,
      step:()=>state.index>=0?state.steps[state.index]?.id:null,
      total:()=>state.steps.length,
      open,close,start,next,back
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
