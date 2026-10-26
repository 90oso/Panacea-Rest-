'use strict';
(() => {
  const cfg = window.PANACEA_STUDIO;
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const money = value => new Intl.NumberFormat('es-PA',{style:'currency',currency:'USD'}).format(Number(value)||0);
  const pad = n => String(n).padStart(2,'0');
  const localDate = date => { const d=new Date(date);return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); };
  const localTime = date => { const d=new Date(date);return pad(d.getHours())+':'+pad(d.getMinutes()); };
  const dbDate = date => localDate(date)+' '+localTime(date)+':00';
  const fmtDate = value => {
    if(!value)return 'Sin fecha';
    const v=String(value).replace('T',' ');
    const chunks=v.split(' ');
    if(!chunks[0]||!chunks[0].includes('-'))return esc(v);
    const parts=chunks[0].split('-');
    return parts[2]+'/'+parts[1]+'/'+parts[0]+(chunks[1]?' · '+chunks[1].slice(0,5):'');
  };
  const statusNames={pending:'Pendiente',preparing:'Preparando',ready:'Listo',served:'Entregado',confirmed:'Confirmada',cancelled:'Cancelada',seated:'En servicio'};
  const nextStep={pending:'preparing',preparing:'ready',ready:'served'};
  const nextLabel={pending:'Comenzar preparación',preparing:'Marcar listo',ready:'Marcar entregado'};
  let source='real',view='inicio',real=null,demo=null,selectedTable=null,selectedElement=null,editDraft=null,orderFilter='all',toastTimer=null,modalContext=null,loading=false,dragging=null;
  const labels={inicio:'RESUMEN',reservas:'RESERVAS',salon:'SALÓN',pedidos:'PEDIDOS',cocina:'COCINA',caja:'CAJA',menu:'CATÁLOGO',inventario:'INVENTARIO',clientes:'CLIENTES',personal:'PERSONAL',incidencias:'INCIDENCIAS',simulador:'SIMULADOR',gerencia:'GERENCIA'};
  const demoMenu=[
    {id:90001,name:'Pizza artesanal',price:16.50},
    {id:90002,name:'Bowl mediterráneo',price:13.50},
    {id:90003,name:'Hamburguesa de la casa',price:15},
    {id:90004,name:'Ensalada de temporada',price:10},
    {id:90005,name:'Limonada especial',price:5.50},
    {id:90006,name:'Postre de la casa',price:7.50}
  ];
  const current=()=>source==='demo'?demo:real;
  const clone=data=>JSON.parse(JSON.stringify(data));
  function notify(message,error=false){
    const node=$('toast');node.textContent=message;node.hidden=false;node.style.background=error?'#933f32':'#204f3b';
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.hidden=true,4800);
  }
  function empty(title,description,action=''){
    return '<div class="empty"><strong>'+esc(title)+'</strong>'+esc(description)+(action?'<div style="margin-top:13px">'+action+'</div>':'')+'</div>';
  }
  function metric(title,value,note){
    return '<div class="metric"><span>'+esc(title)+'</span><strong>'+esc(value)+'</strong><small>'+esc(note)+'</small></div>';
  }
  function pendingOrders(data,sessionId){return (data.orders||[]).filter(o=>Number(o.session_id)===Number(sessionId));}
  function openSession(data,tableId){return (data.sessions||[]).find(s=>Number(s.dining_table_id)===Number(tableId)&&s.status==='open');}
  function activeReservations(data,tableId){return (data.reservations||[]).filter(r=>Number(r.dining_table_id)===Number(tableId)&&r.status==='confirmed');}
  function orderLines(data,orderId){return (data.lines||[]).filter(l=>Number(l.order_id)===Number(orderId));}
  function sessionBalance(data,sessionId){
    const total=pendingOrders(data,sessionId).filter(o=>o.status!=='cancelled').reduce((sum,o)=>sum+Math.round(Number(o.subtotal)*100),0);
    const paid=(data.payments||[]).filter(p=>Number(p.session_id)===Number(sessionId)).reduce((sum,p)=>sum+Math.round(Number(p.amount)*100),0);
    return {total:total/100,paid:paid/100,due:Math.max(0,total-paid)/100};
  }
  function tableName(data,id){return (data.tables||[]).find(t=>Number(t.id)===Number(id))?.name||('Mesa '+id);}
  function stageStatus(data,tableId){
    const session=openSession(data,tableId);
    if(session){
      const orders=pendingOrders(data,session.id);
      const bill=sessionBalance(data,session.id);
      if(orders.some(o=>o.status==='pending'||o.status==='preparing'))return {className:'kitchen',label:'En cocina',session};
      if(orders.length&&bill.due>0&&orders.every(o=>o.status==='served'))return {className:'billing',label:'Por cobrar',session};
      return {className:'serving',label:'En servicio',session};
    }
    const within=activeReservations(data,tableId).some(r=>{
      const t=new Date(String(r.reserved_at).replace(' ','T')).getTime();
      return Math.abs(t-Date.now())<2*3600000;
    });
    return within?{className:'reserved',label:'Reserva próxima'}:{className:'neutral',label:'Sin servicio'};
  }
  function demoSeed(basis){
    const tables=clone(basis.tables||[]);
    if(!tables.length)for(let i=0;i<12;i++)tables.push({id:i+1,area_id:1,name:'Mesa '+pad(i+1),shape:i%4?'rectangle':'round',min_capacity:1,capacity:4+(i%3)*2,seatLayout:{x:40+(i%5)*158,y:38+Math.floor(i/5)*140,rotation:0}});
    const areas=clone(basis.areas?.length?basis.areas:[{id:1,name:'Salón principal',elements:[]}]);
    const menu=clone(basis.menus?.length?basis.menus:demoMenu);
    const first=tables[0],second=tables[1]||first,third=tables[2]||first,fourth=tables[3]||first;
    const soon=new Date(Date.now()+3*3600000),later=new Date(Date.now()+5*3600000);
    const reservations=[
      {id:8101,dining_table_id:third.id,guest_name:'Reserva de ejemplo',party_size:Math.max(Number(third.min_capacity)||1,Math.min(2,third.capacity)),reserved_at:dbDate(soon),status:'confirmed'},
      {id:8102,dining_table_id:fourth.id,guest_name:'Familia de ejemplo',party_size:Math.max(Number(fourth.min_capacity)||1,Math.min(4,fourth.capacity)),reserved_at:dbDate(later),status:'confirmed'}
    ];
    const sessions=[
      {id:8201,dining_table_id:first.id,guest_name:'Visita de ejemplo',party_size:Math.max(Number(first.min_capacity)||1,Math.min(2,first.capacity)),status:'open',opened_at:dbDate(new Date(Date.now()-35*60000))},
      {id:8202,dining_table_id:second.id,guest_name:'Grupo de ejemplo',party_size:Math.max(Number(second.min_capacity)||1,Math.min(3,second.capacity)),status:'open',opened_at:dbDate(new Date(Date.now()-55*60000))}
    ];
    const m1=menu[0],m2=menu[1]||m1,m3=menu[2]||m1;
    const orders=[
      {id:8301,session_id:8201,status:'pending',subtotal:Number(m1.price)+Number(m2.price)},
      {id:8302,session_id:8202,status:'preparing',subtotal:Number(m3.price)},
    ];
    const lines=[
      {id:8401,order_id:8301,menu_id:m1.id,title:m1.name,quantity:1,unit_price:m1.price},
      {id:8402,order_id:8301,menu_id:m2.id,title:m2.name,quantity:1,unit_price:m2.price},
      {id:8403,order_id:8302,menu_id:m3.id,title:m3.name,quantity:1,unit_price:m3.price}
    ];
    return {mode:'demo',migrated:true,areas,tables,menus:menu,native_reservations:[],reservations,sessions,orders,lines,payments:[],source_counts:{stocks:7,customers:3,staffs:4,orders:orders.length,menus:menu.length},inventory:[{id:1,name:'Harina de trigo',qty:18,min:8,unit:'kg'},{id:2,name:'Mozzarella',qty:3,min:5,unit:'kg'},{id:3,name:'Tomate',qty:7,min:5,unit:'kg'},{id:4,name:'Aceite de oliva',qty:2,min:4,unit:'L'},{id:5,name:'Carne de res',qty:6,min:4,unit:'kg'}],customers:[{name:'María González',visits:14,preference:'Mesa junto a la ventana'},{name:'Carlos Pérez',visits:8,preference:'Sin preferencias registradas'},{name:'Familia Rodríguez',visits:19,preference:'Visita familiar'}],staff:[{name:'Andrea López',role:'Recepción',shift:'12:00 – 20:00'},{name:'Luis Moreno',role:'Mesero',shift:'11:00 – 19:00'},{name:'Sofía Ramos',role:'Cocina',shift:'12:00 – 22:00'},{name:'Mateo Díaz',role:'Caja',shift:'14:00 – 22:00'}],incidents:[{id:1,title:'Mozzarella por debajo del mínimo',severity:'Alta',resolved:false},{id:2,title:'Revisar limpieza de zona de paso',severity:'Media',resolved:false}]};
  }
  function syncDemoFloor(){
    if(!real||!demo)return;
    for(const t of demo.tables){
      const saved=real.tables.find(a=>a.id===t.id);
      if(saved){t.name=saved.name;t.shape=saved.shape;t.capacity=saved.capacity;t.min_capacity=saved.min_capacity;t.seatLayout=clone(saved.seatLayout);}
    }
    demo.areas=clone(real.areas);
  }
  async function loadReal(showNotice=false){
    if(loading)return;
    loading=true;
    try{
      const res=await fetch(cfg.stateUrl,{headers:{Accept:'application/json'},credentials:'same-origin',cache:'no-store'});
      if(!res.ok)throw Error('HTTP '+res.status);
      real=await res.json();
      if(!demo)demo=demoSeed(real);else syncDemoFloor();
      $('banner').hidden=!!real.migrated;
      $('banner').textContent=real.migrated?'':'Para activar las reservas, comandas y caja debes ejecutar: php artisan migrate. El plano puede visualizarse mientras tanto.';
      if(showNotice)notify('Datos actualizados desde MariaDB');
      render();
    }catch(err){
      $('banner').hidden=false;
      $('banner').textContent='No se pudo leer el entorno local: '+err.message+'. Comprueba Docker, las rutas y la consola del navegador.';
      if(showNotice)notify('Error al actualizar: '+err.message,true);
      if(!real){real={areas:[],tables:[],menus:[],native_reservations:[],reservations:[],sessions:[],orders:[],lines:[],payments:[],migrated:false};demo=demoSeed(real);}
      render();
    }finally{loading=false;}
  }
  function setView(name){
    if(!labels[name])name='inicio';
    view=name;
    document.querySelectorAll('[data-view]').forEach(n=>n.classList.toggle('active',n.dataset.view===view));
    document.querySelectorAll('[data-nav]').forEach(n=>n.classList.toggle('active',n.dataset.nav===view));
    $('breadcrumb').textContent=labels[view];history.replaceState(null,'','#'+view);
    window.scrollTo({top:0,behavior:'instant'});renderView();
  }
  function setMode(mode){
    if(mode===source)return;
    if(editDraft){editDraft=null;selectedElement=null;}
    source=mode;
    if(source==='demo')syncDemoFloor();
    $('realMode').classList.toggle('active',source==='real');
    $('demoMode').classList.toggle('active',source==='demo');
    $('realMode').setAttribute('aria-pressed',String(source==='real'));
    $('demoMode').setAttribute('aria-pressed',String(source==='demo'));
    $('sourceIndicator').textContent=source==='real'?'● BASE DE DATOS LOCAL':'✦ ESCENARIO FICTICIO';
    $('footerMode').textContent=source==='real'?'Datos reales · Desarrollo local':'Demo · Cambios solo en memoria';
    render();
  }
  function render(){
    if(!current())return;
    const data=current();
    $('sourceIndicator').textContent=source==='real'?'● BASE DE DATOS LOCAL':'✦ ESCENARIO FICTICIO';
    $('footerMode').textContent=source==='real'?'Datos reales · Desarrollo local':'Demo · Cambios solo en memoria';
    renderView();
  }
  function renderView(){
    if(!current())return;
    if(view==='inicio')renderDashboard();
    if(view==='reservas')renderReservations();
    if(view==='salon')renderFloor();
    if(view==='pedidos')renderOrders();
    if(view==='cocina')renderKitchen();
    if(view==='caja')renderCash();
    if(view==='menu')renderCatalog();
    if(view==='inventario')renderInventory();
    if(view==='clientes')renderCustomers();
    if(view==='personal')renderStaff();
    if(view==='incidencias')renderIncidents();
    if(view==='simulador')renderSimulator();
    if(view==='gerencia')renderManagement();
  }
  function renderDashboard(){
    const data=current(),open=data.sessions.filter(s=>s.status==='open'),inKitchen=data.orders.filter(o=>o.status==='pending'||o.status==='preparing');
    const future=data.reservations.filter(r=>r.status==='confirmed'&&new Date(String(r.reserved_at).replace(' ','T')).getTime()>=Date.now()-3600000);
    $('dashboardMetrics').innerHTML=metric('Mesas registradas',data.tables.length,'Configuración del salón')+metric('Servicios abiertos',open.length,'Control Panacea')+metric('Reservas próximas',future.length,'Confirmadas en Panacea')+metric('Pedidos en cocina',inKitchen.length,'Pendientes o preparando');
    let events=[];
    data.orders.slice().sort((a,b)=>b.id-a.id).slice(0,4).forEach(o=>{
      const session=data.sessions.find(s=>Number(s.id)===Number(o.session_id));
      events.push({title:'Pedido #'+o.id+' · '+tableName(data,session?.dining_table_id),desc:'Comanda · '+(statusNames[o.status]||o.status),status:o.status});
    });
    data.reservations.slice().sort((a,b)=>b.id-a.id).slice(0,3).forEach(r=>events.push({title:'Reserva #'+r.id+' · '+tableName(data,r.dining_table_id),desc:fmtDate(r.reserved_at)+' · '+r.party_size+' personas',status:r.status}));
    $('activityFeed').innerHTML=events.length?events.map(e=>'<div class="activity-row"><div><b>'+esc(e.title)+'</b><small>'+esc(e.desc)+'</small></div>'+pill(e.status)+'</div>').join(''):empty('Sin actividad registrada','Aquí aparecerán las reservas y los pedidos cuando comience el servicio.','<button class="micro-btn accent" data-goto="reservas">Crear reserva ↗</button>');
  }
  function pill(status){
    const cls={confirmed:'success',seated:'process',cancelled:'muted',pending:'warning',preparing:'process',ready:'success',served:'muted'}[status]||'muted';
    return '<span class="pill '+cls+'">'+esc(statusNames[status]||status)+'</span>';
  }
  function renderReservations(){
    const data=current(),date=$('reservationDate').value;
    const reservations=data.reservations.filter(r=>!date||String(r.reserved_at).slice(0,10)===date).sort((a,b)=>String(a.reserved_at).localeCompare(String(b.reserved_at)));
    $('reservationCount').textContent=reservations.length+' reserva'+(reservations.length===1?'':'s');
    $('reservationGrid').innerHTML=reservations.length?reservations.map(r=>{
      const time=String(r.reserved_at).slice(11,16),day=fmtDate(r.reserved_at).split(' · ')[0];
      const valid=r.status==='confirmed';
      return '<article class="reservation-card"><p class="overline">RESERVA #'+r.id+' · '+esc(day)+'</p><div class="reservation-time">'+esc(time)+'</div><h3>'+esc(r.guest_name)+'</h3><div class="card-meta">'+r.party_size+' personas · '+esc(tableName(data,r.dining_table_id))+'</div><div class="card-footer">'+pill(r.status)+'<div class="card-buttons">'+(valid?'<button class="micro-btn" data-cancel-res="'+r.id+'">Cancelar</button><button class="micro-btn accent" data-seat-res="'+r.id+'">Recibir ↗</button>':'')+'</div></div></article>';
    }).join(''):empty('No hay reservas para esta selección','Puedes registrar una reserva utilizando el botón superior. El mismo diseño se mantiene en ambos modos.','<button class="micro-btn accent" data-command="new-reservation">+ Nueva reserva</button>');
    const natives=source==='real'?data.native_reservations:[];
    $('nativeReservationList').innerHTML=natives.length?'<div class="native-grid">'+natives.map(r=>'<div class="native-chip">#'+esc(r.reservation_id)+' · '+esc(r.reserve_date||'Fecha no disponible')+' '+esc(r.reserve_time||'')+' · Estado '+esc(r.status_id??'—')+'</div>').join('')+'</div>':empty(source==='real'?'Sin reservas nativas':'Datos nativos no mostrados en Demo',source==='real'?'No hay registros de reserva en TastyIgniter. Las reservas de Panacea se muestran arriba de forma separada.':'Este panel no mezcla los datos reales del sistema original con el escenario de demostración.');
  }
  function floorData(){return editDraft||current();}
  function tablePosition(table,i){
    const raw=table.seatLayout;
    return {x:Number(raw?.x??(42+(i%5)*157)),y:Number(raw?.y??(43+Math.floor(i/5)*145)),rotation:Number(raw?.rotation??0)};
  }
  function renderFloor(){
    const data=floorData();if(!data)return;
    const original=current();
    const area=data.areas?.[0];
    const tables=data.tables.filter(t=>!area||Number(t.area_id)===Number(area.id));
    const open=original.sessions.filter(s=>s.status==='open');
    const future=original.reservations.filter(r=>r.status==='confirmed');
    $('areaName').textContent=area?.name||'Salón principal';
    $('roomMeta').innerHTML='<span>'+tables.length+' mesas configuradas</span><span>'+open.length+' servicios activos</span><span>'+future.length+' reservas confirmadas</span><span>'+(source==='real'?'Datos desde MariaDB':'Estados simulados')+'</span>';
    $('editFloor').textContent=editDraft?'Editando plano':'Editar plano';
    $('editToolbar').hidden=!editDraft;
    $('floorHint').textContent=editDraft?'Arrastra para mover · selecciona para editar':'Desplaza el plano para explorar';
    const areas=(area?.elements||[]);
    const maxX=Math.max(850,...tables.map((t,i)=>tablePosition(t,i).x+170),...areas.map(a=>Number(a.x)+Number(a.width)+35));
    const maxY=Math.max(560,...tables.map((t,i)=>tablePosition(t,i).y+135),...areas.map(a=>Number(a.y)+Number(a.height)+35));
    const surface=$('floorSurface');
    surface.style.width=Math.min(2600,Math.ceil(maxX/40)*40)+'px';
    surface.style.height=Math.min(2600,Math.ceil(maxY/40)*40)+'px';
    const elements=areas.map((e,i)=>'<div class="floor-architecture '+esc(e.kind)+(editDraft?' editable':'')+'" data-architecture="'+i+'" style="left:'+Number(e.x)+'px;top:'+Number(e.y)+'px;width:'+Number(e.width)+'px;height:'+Number(e.height)+'px" title="'+esc(e.label||e.kind)+'">'+esc(e.label||({wall:'Pared',door:'Puerta',window:'Ventana',aisle:'Paso'}[e.kind]))+'</div>').join('');
    surface.innerHTML=elements+tables.map((t,i)=>{
      const p=tablePosition(t,i),status=stageStatus(original,t.id),round=t.shape==='round';
      return '<button type="button" data-floor-table="'+t.id+'" class="floor-table '+(round?'round ':'')+status.className+(selectedTable===t.id?' selected':'')+(editDraft?' editable':'')+'" style="left:'+p.x+'px;top:'+p.y+'px;transform:rotate('+p.rotation+'deg)" aria-label="'+esc(t.name)+': '+status.label+'"><strong>'+esc(t.name)+'</strong><small>'+esc(status.label)+'</small><small>'+t.capacity+' plazas</small></button>';
    }).join('');
    renderInspector();
  }
  function renderInspector(){
    const d=current(),fd=floorData(),t=fd.tables.find(t=>Number(t.id)===Number(selectedTable));
    if(editDraft&&selectedElement!==null){
      const e=fd.areas[0]?.elements[selectedElement];
      if(e){
        $('tableInspector').innerHTML='<div class="inspector-head"><p class="overline">EDITOR DEL RECINTO</p><span class="pill process">Elemento</span></div><h2 class="inspector-name">'+esc(({wall:'Pared',door:'Puerta',window:'Ventana',aisle:'Circulación'}[e.kind]||e.kind))+'</h2><div class="inspector-form"><label>Etiqueta<input id="archLabel" maxlength="80" value="'+esc(e.label||'')+'"></label><label>Ancho (px)<input id="archWidth" type="number" min="10" max="2000" value="'+Number(e.width)+'"></label><label>Alto (px)<input id="archHeight" type="number" min="10" max="2000" value="'+Number(e.height)+'"></label></div><div class="inspector-actions"><button class="primary-btn" data-command="apply-arch">Aplicar cambios</button><button class="secondary-btn" data-command="delete-arch">Eliminar elemento</button></div>';
        return;
      }
    }
    if(!t){
      $('tableInspector').innerHTML='<p class="overline">FICHA DEL SALÓN</p><h2 class="inspector-name">Selecciona una mesa.</h2><p class="inspector-desc">Aquí podrás consultar las reservas próximas, iniciar un servicio, tomar comandas y preparar la cuenta. El panel permanece visible mientras exploras el plano.</p><div class="inspector-rows"><div class="inspector-row"><span>Origen de información</span><strong>'+(source==='real'?'MariaDB':'Demo')+'</strong></div><div class="inspector-row"><span>Ocupación sin servicio</span><strong>No verificada</strong></div></div>';
      return;
    }
    if(editDraft){
      $('tableInspector').innerHTML='<div class="inspector-head"><p class="overline">EDITOR DE MESA</p><span class="pill process">Cambios sin guardar</span></div><h2 class="inspector-name">'+esc(t.name)+'</h2><p class="inspector-desc">Las propiedades se guardan utilizando los modelos nativos de TastyIgniter.</p><div class="inspector-form"><label>Nombre<input id="floorName" maxlength="80" value="'+esc(t.name)+'"></label><label>Capacidad máxima<input id="floorCapacity" type="number" min="'+Number(t.min_capacity||1)+'" max="100" value="'+Number(t.capacity)+'"></label><label>Forma<select id="floorShape"><option value="rectangle"'+(t.shape!=='round'?' selected':'')+'>Rectangular</option><option value="round"'+(t.shape==='round'?' selected':'')+'>Redonda</option></select></label></div><div class="inspector-actions"><button class="primary-btn" data-command="apply-floor-props">Aplicar propiedades</button><button class="secondary-btn" data-command="rotate-floor">↻ Girar mesa 90°</button></div>';
      return;
    }
    const session=openSession(d,t.id),status=stageStatus(d,t.id),bookings=activeReservations(d,t.id).sort((a,b)=>String(a.reserved_at).localeCompare(String(b.reserved_at)));
    const orders=session?pendingOrders(d,session.id):[],balance=session?sessionBalance(d,session.id):null;
    $('tableInspector').innerHTML='<div class="inspector-head"><p class="overline">MESA #'+t.id+'</p>'+pill(status.label)+'</div><h2 class="inspector-name">'+esc(t.name)+'</h2><p class="inspector-desc">'+t.min_capacity+'–'+t.capacity+' personas · '+(t.shape==='round'?'Redonda':'Rectangular')+'</p><div class="inspector-rows"><div class="inspector-row"><span>Servicio Panacea</span><strong>'+esc(session?.guest_name||'Sin servicio abierto')+'</strong></div><div class="inspector-row"><span>Comandas</span><strong>'+orders.length+'</strong></div><div class="inspector-row"><span>Saldo pendiente</span><strong>'+(session?money(balance.due):'—')+'</strong></div><div class="inspector-row"><span>Reservas confirmadas</span><strong>'+bookings.length+'</strong></div></div>'+(bookings.length?'<div class="small-note">Próxima: '+fmtDate(bookings[0].reserved_at)+' · '+esc(bookings[0].guest_name)+'</div>':'')+'<div class="inspector-actions">'+(session?'<button class="primary-btn" data-command="new-order" data-session="'+session.id+'">+ Tomar pedido</button><button class="secondary-btn" data-command="pay-session" data-session="'+session.id+'">Ver cobro ↗</button><button class="secondary-btn" data-close-session="'+session.id+'">Finalizar servicio</button>':'<button class="primary-btn" data-command="new-seat" data-table="'+t.id+'">+ Iniciar servicio</button>')+'<button class="secondary-btn" data-command="new-reservation" data-table="'+t.id+'">+ Reservar esta mesa</button></div>';
  }
  function renderOrders(){
    const data=current(),list=data.orders.filter(o=>orderFilter==='all'||o.status===orderFilter).sort((a,b)=>b.id-a.id);
    $('orderCount').textContent=list.length+' comandas';
    $('ordersList').innerHTML=list.length?list.map(o=>{
      const session=data.sessions.find(s=>Number(s.id)===Number(o.session_id));
      return '<article class="order-card"><p class="overline">COMANDA #'+o.id+'</p><h3>'+esc(tableName(data,session?.dining_table_id))+'</h3>'+pill(o.status)+'<div class="items">'+orderLines(data,o.id).map(l=>esc(l.quantity+' × '+l.title)).join('<br>')+'</div><footer><strong class="total">'+money(o.subtotal)+'</strong>'+(nextStep[o.status]?'<button class="micro-btn accent" data-advance="'+o.id+'">'+esc(nextLabel[o.status])+' ↗</button>':'<span class="small-note">Finalizada</span>')+'</footer></article>';
    }).join(''):empty('No hay comandas en este estado','Abre una mesa desde el salón y toma un pedido para comenzar.','<button class="micro-btn accent" data-goto="salon">Ir al salón ↗</button>');
  }
  function renderKitchen(){
    const d=current();
    const lanes=[{status:'pending',name:'Por preparar',hint:'Enviar a preparación'},{status:'preparing',name:'En preparación',hint:'Marcar listo'},{status:'ready',name:'Listo para entregar',hint:'Entregado'}];
    $('kitchenBoard').innerHTML=lanes.map(l=>{
      const list=d.orders.filter(o=>o.status===l.status);
      return '<div class="kitchen-lane"><div class="lane-head"><h2>'+l.name+'</h2><span>'+list.length+'</span></div>'+(list.length?list.map(o=>{
        const session=d.sessions.find(s=>Number(s.id)===Number(o.session_id));
        return '<article class="kitchen-ticket"><p class="overline">COMANDA #'+o.id+'</p><h3>'+esc(tableName(d,session?.dining_table_id))+'</h3><p>'+orderLines(d,o.id).map(x=>esc(x.quantity+' × '+x.title)).join('<br>')+'</p><button class="primary-btn" data-advance="'+o.id+'">'+l.hint+' ↗</button></article>';
      }).join(''):'<p class="small-note">No hay comandas en esta etapa.</p>')+'</div>';
    }).join('');
  }
  function renderCash(){
    const data=current(),open=data.sessions.filter(s=>s.status==='open'),due=open.reduce((sum,s)=>sum+sessionBalance(data,s.id).due,0);
    const paid=data.payments.reduce((sum,p)=>sum+Number(p.amount),0);
    $('cashMetrics').innerHTML=metric('Servicios abiertos',open.length,'Mesas con atención activa')+metric('Saldo por cobrar',money(due),'Comandas de Panacea')+metric('Abonos registrados',money(paid),'Registro manual')+metric('Servicios cerrados',data.sessions.filter(s=>s.status==='closed').length,'Cierre operativo');
    $('cashList').innerHTML=open.length?open.map(s=>{
      const balance=sessionBalance(data,s.id),orders=pendingOrders(data,s.id),readyToClose=balance.due===0&&orders.every(o=>o.status==='served');
      return '<article class="cash-card"><p class="overline">SERVICIO #'+s.id+'</p><h3>'+esc(tableName(data,s.dining_table_id))+'</h3><div class="card-meta">'+esc(s.guest_name)+' · '+s.party_size+' personas</div><div class="items">Consumo: '+money(balance.total)+'<br>Abonos: '+money(balance.paid)+'<br>Comandas: '+orders.length+'</div><footer><div><span class="small-note">POR COBRAR</span><div class="total">'+money(balance.due)+'</div></div><div class="card-buttons">'+(balance.due>0?'<button class="micro-btn accent" data-command="pay-session" data-session="'+s.id+'">Cobrar</button>':'')+'<button class="micro-btn" data-close-session="'+s.id+'" '+(readyToClose?'':'disabled title="Completa los pedidos y saldos"')+'>Cerrar</button></div></footer></article>';
    }).join(''):empty('No hay cuentas abiertas','Los servicios abiertos en el salón aparecerán aquí con su saldo.','<button class="micro-btn accent" data-goto="salon">Ir al salón ↗</button>');
  }
  function renderCatalog(){
    const data=current(),term=$('menuSearch').value.trim().toLowerCase();
    const items=data.menus.filter(m=>String(m.name).toLowerCase().includes(term));
    $('menuCount').textContent=items.length+' productos';
    $('catalogGrid').innerHTML=items.length?items.map(m=>'<article class="catalog-card"><p class="overline">PRODUCTO #'+m.id+'</p><strong>'+esc(m.name)+'</strong><span class="small-note">Precio del catálogo '+(source==='real'?'TastyIgniter':'demostrativo')+'</span><span class="price">'+money(m.price)+'</span></article>').join(''):empty('El catálogo está vacío','No se encontraron productos. En modo real se utiliza exclusivamente el catálogo registrado en TastyIgniter.');
  }


  function renderInventory(){
    const d=current(),items=source==='demo'?(d.inventory||[]):[];
    const low=items.filter(x=>x.qty<x.min);
    $('inventoryMetrics').innerHTML=metric('Registros de stock',source==='real'?(d.source_counts?.stocks??'—'):items.length,source==='real'?'Total nativo, sin cantidades verificadas':'Almacén ficticio')+
      metric('Bajo mínimo',source==='real'?'—':low.length,source==='real'?'Requiere mapeo del modelo de stock':'Según mínimos del escenario')+
      metric('Propuesta de compra',source==='real'?'Pendiente':low.length,'Solo demostración')+
      metric('Descuento al vender','No activo','Pendiente de integración con recetas');
    $('inventoryList').innerHTML=items.length?items.map(x=>'<div class="activity-row"><div><b>'+esc(x.name)+'</b><small>Umbral: '+x.min+' '+esc(x.unit)+'</small></div><div><strong>'+x.qty+' '+esc(x.unit)+'</strong><div>'+pill(x.qty<x.min?'Bajo mínimo':'Normal')+'</div></div></div>').join(''):empty('Inventario nativo identificado por recuento','No se muestran existencias ni costos sin verificar las columnas y reglas de la extensión de stock.');
    $('inventoryNotes').innerHTML=source==='demo'?'<p class="inspector-desc">Las reposiciones de prueba modifican únicamente la memoria del navegador. No se descuentan insumos al crear comandas.</p><p class="small-note">Pendiente: recetas, mermas, movimientos auditables y compras.</p>':'<p class="inspector-desc">Hay '+esc(d.source_counts?.stocks??'—')+' registros de stock en el sistema nativo. Su contenido requiere mapeo antes de mostrar cifras o permitir movimientos reales.</p><p class="small-note">No se alteran las existencias de TastyIgniter.</p>';
  }
  function renderCustomers(){
    const d=current(),people=source==='demo'?d.customers||[]:[];
    $('customerMetrics').innerHTML=metric('Clientes registrados',source==='real'?(d.source_counts?.customers??'—'):people.length,source==='real'?'Conteo del sistema nativo':'Contactos ficticios')+
      metric('Historial de visitas',source==='real'?'Sin integrar':people.reduce((n,p)=>n+p.visits,0),source==='real'?'Requiere consentimiento y relaciones verificadas':'Visitas ilustrativas')+
      metric('Reservas Panacea',d.reservations.length,'Registros de la fuente seleccionada')+
      metric('Fidelización','Pendiente','No hay puntos reales');
    $('customerList').innerHTML=people.length?people.map(p=>'<article class="reservation-card"><p class="overline">CONTACTO FICTICIO</p><h3 style="margin-top:20px">'+esc(p.name)+'</h3><p class="card-meta">'+p.visits+' visitas ilustrativas</p><div class="card-footer"><span class="pill muted">'+esc(p.preference)+'</span></div></article>').join(''):empty('Directorio aún no integrado','El número de clientes se consulta cuando la tabla nativa existe. Los perfiles y preferencias no se exponen sin un modelo de permisos y consentimiento.');
  }
  function renderStaff(){
    const d=current(),people=source==='demo'?d.staff||[]:[];
    $('staffMetrics').innerHTML=metric('Registros de personal',source==='real'?(d.source_counts?.staffs??'—'):people.length,'Fuente seleccionada')+
      metric('Roles y permisos',source==='real'?'TastyIgniter':'4 perfiles','Gestión central')+
      metric('Turnos',source==='real'?'Sin integrar':'Ilustrativos','No modifica calendarios')+
      metric('Registro de acciones','Pendiente','Auditoría por usuario');
    $('staffList').innerHTML=people.length?people.map(p=>'<article class="reservation-card"><p class="overline">'+esc(p.role)+'</p><h3 style="margin-top:20px">'+esc(p.name)+'</h3><p class="card-meta">Horario · '+esc(p.shift)+'</p><div class="card-footer"><span class="pill muted">Turno demo</span></div></article>').join(''):empty('Personal gestionado desde administración','Los permisos, turnos y fichajes nativos necesitan autenticación y autorización antes de gestionarse desde Panacea.');
  }
  function renderIncidents(){
    const items=source==='demo'?demo.incidents:[];
    $('incidentList').innerHTML=items.length?items.map(i=>'<article class="reservation-card"><p class="overline">INCIDENCIA #'+i.id+'</p><h3 style="margin-top:20px">'+esc(i.title)+'</h3><p class="card-meta">Prioridad '+esc(i.severity)+'</p><div class="card-footer">'+pill(i.resolved?'Resuelta':'Abierta')+(i.resolved?'':'<button class="micro-btn accent" data-resolve-incident="'+i.id+'">Resolver</button>')+'</div></article>').join(''):empty(source==='real'?'Incidencias no habilitadas en datos reales':'No hay incidencias abiertas','Se requiere registro persistente, roles y auditoría para el uso operativo. La demostración se mantiene interactiva.');
  }
  function renderSimulator(){
    const price=Number($('simPrice').value)||0,cost=Number($('simCost').value)||0,volume=Number($('simVolume').value)||0,discount=Math.max(0,Math.min(100,Number($('simDiscount').value)||0));
    const sales=volume*price*(1-discount/100),variable=volume*cost;
    $('simulationResults').innerHTML=metric('Ingreso diario',money(sales),'Con descuento')+metric('Costo variable',money(variable),'Por volumen')+metric('Contribución',money(sales-variable),'Antes de costos fijos')+metric('Margen',sales?((sales-variable)/sales*100).toFixed(1)+'%':'—','Simulación únicamente');
  }
  function renderManagement(){
    const d=current(),closed=d.sessions.filter(s=>s.status==='closed'),orders=d.orders,payments=d.payments;
    const paid=payments.reduce((sum,p)=>sum+Number(p.amount),0);
    $('managementMetrics').innerHTML=metric('Comandas Panacea',orders.length,'No incluye pedidos nativos')+
      metric('Abonos manuales',money(paid),'Sin validación bancaria')+
      metric('Servicios cerrados',closed.length,'Ciclo completado')+
      metric('Reservas Panacea',d.reservations.length,'Separadas de TastyIgniter');
    $('managementOrders').innerHTML=['pending','preparing','ready','served'].map(status=>'<div class="activity-row"><div><b>'+esc(statusNames[status])+'</b><small>Comandas de la operación Panacea</small></div><strong>'+orders.filter(o=>o.status===status).length+'</strong></div>').join('');
    const counts=d.source_counts||{};
    $('managementSources').innerHTML=source==='real'?['orders','menus','stocks','customers','staffs'].map(name=>'<div class="activity-row"><div><b>'+esc(({orders:'Pedidos nativos',menus:'Productos',stocks:'Stock',customers:'Clientes',staffs:'Personal'}[name]))+'</b><small>Conteo de registros nativos, no sumado a Panacea</small></div><strong>'+esc(counts[name]??'—')+'</strong></div>').join(''):'<p class="inspector-desc">El modo demostración utiliza cantidades simuladas para ensayar operaciones. Cambia a Datos reales para consultar los recuentos de TastyIgniter.</p>';
  }

  async function post(type,payload){
    if(source==='demo')return demoAction(type,payload);
    const res=await fetch(cfg.actionUrl,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':cfg.csrf},body:JSON.stringify({type,...payload})});
    let json={};try{json=await res.json()}catch(_){}
    if(!res.ok)throw Error(json.message||Object.values(json.errors||{})[0]?.[0]||'HTTP '+res.status);
    await loadReal();
    return json;
  }
  function demoAction(type,p){
    const data=demo,now=dbDate(new Date());
    const uid=arr=>Math.max(9000,...arr.map(x=>Number(x.id)||0))+1;
    if(type==='reserve'){
      const table=data.tables.find(t=>t.id===Number(p.table_id));
      if(!table||Number(p.party_size)<Number(table.min_capacity)||Number(p.party_size)>Number(table.capacity))throw Error('Capacidad fuera del rango de la mesa.');
      const time=new Date(String(p.reserved_at).replace(' ','T')).getTime();
      if(time<Date.now())throw Error('La fecha debe ser futura.');
      if(data.reservations.some(r=>r.dining_table_id===table.id&&r.status==='confirmed'&&Math.abs(new Date(String(r.reserved_at).replace(' ','T')).getTime()-time)<90*60000))throw Error('La mesa tiene una reserva cercana.');
      data.reservations.push({id:uid(data.reservations),dining_table_id:table.id,guest_name:p.guest_name,party_size:Number(p.party_size),reserved_at:p.reserved_at,status:'confirmed'});
    }
    if(type==='cancel_reservation'){
      const r=data.reservations.find(r=>r.id===Number(p.reservation_id));
      if(!r||r.status!=='confirmed')throw Error('No se puede cancelar esta reserva.');
      r.status='cancelled';
    }
    if(type==='seat'){
      const t=data.tables.find(t=>t.id===Number(p.table_id));
      if(!t||p.party_size<t.min_capacity||p.party_size>t.capacity)throw Error('Capacidad de mesa no válida.');
      if(openSession(data,t.id))throw Error('Ya existe un servicio abierto.');
      const near=data.reservations.find(r=>r.dining_table_id===t.id&&r.status==='confirmed'&&Math.abs(new Date(String(r.reserved_at).replace(' ','T')).getTime()-Date.now())<90*60000);
      if(near&&Number(p.reservation_id)!==Number(near.id))throw Error('Hay una reserva próxima: recibe primero esa reserva.');
      if(p.reservation_id){const r=data.reservations.find(r=>r.id===Number(p.reservation_id));if(!r||r.status!=='confirmed'||r.dining_table_id!==t.id)throw Error('Reserva inválida.');r.status='seated';}
      data.sessions.push({id:uid(data.sessions),dining_table_id:t.id,reservation_id:p.reservation_id||null,guest_name:p.guest_name,party_size:Number(p.party_size),status:'open',opened_at:now});
    }
    if(type==='add_order'){
      const s=data.sessions.find(s=>s.id===Number(p.session_id)&&s.status==='open');if(!s)throw Error('Servicio no disponible.');
      const items=p.items.filter(i=>i.qty>0),id=uid(data.orders);if(!items.length)throw Error('Selecciona al menos un producto.');
      let subtotal=0;
      for(const item of items){
        const m=data.menus.find(m=>m.id===Number(item.menu_id));if(!m)throw Error('Producto no encontrado.');
        subtotal+=m.price*item.qty;
        data.lines.push({id:uid(data.lines),order_id:id,menu_id:m.id,title:m.name,quantity:item.qty,unit_price:m.price});
      }
      data.orders.push({id,session_id:s.id,status:'pending',subtotal:Math.round(subtotal*100)/100,created_at:now});
    }
    if(type==='advance_order'){
      const o=data.orders.find(o=>o.id===Number(p.order_id));if(!o||!nextStep[o.status])throw Error('El pedido ya terminó.');
      o.status=nextStep[o.status];
    }
    if(type==='pay'){
      const s=data.sessions.find(s=>s.id===Number(p.session_id)&&s.status==='open');if(!s)throw Error('Servicio cerrado.');
      const cents=Math.round(Number(p.amount)*100),due=Math.round(sessionBalance(data,s.id).due*100);
      if(cents<1||cents>due)throw Error('Importe superior al saldo o no válido.');
      data.payments.push({id:uid(data.payments),session_id:s.id,amount:cents/100,method:p.method,recorded_at:now});
    }
    if(type==='close'){
      const s=data.sessions.find(s=>s.id===Number(p.session_id)&&s.status==='open');if(!s)throw Error('Servicio cerrado.');
      if(sessionBalance(data,s.id).due>0||pendingOrders(data,s.id).some(o=>o.status!=='served'))throw Error('Faltan entregas o pagos.');
      s.status='closed';s.closed_at=now;
    }
    render();return {ok:true};
  }
  async function execute(type,p,success){
    try{await post(type,p);notify(success);render();return true}catch(error){notify(error.message,true);return false;}
  }
  function showModal(eyebrow,title,fields,action,button='Confirmar'){
    modalContext=action;$('modalEyebrow').textContent=eyebrow;$('modalTitle').textContent=title;$('modalFields').innerHTML=fields;
    $('modalSubmit').textContent=button;$('modalError').hidden=true;$('modalOverlay').hidden=false;
    setTimeout(()=>$('modalForm').querySelector('input,select,textarea')?.focus(),0);
  }
  function hideModal(){$('modalOverlay').hidden=true;modalContext=null;$('modalForm').reset();}
  function field(label,name,type,value='',attrs=''){
    return '<label class="modal-field">'+esc(label)+'<input type="'+type+'" name="'+esc(name)+'" value="'+esc(value)+'" '+attrs+' required></label>';
  }
  function tableOptions(data,selected=null){
    return data.tables.map(t=>'<option value="'+t.id+'"'+(Number(t.id)===Number(selected)?' selected':'')+'>'+esc(t.name)+' · '+t.min_capacity+'–'+t.capacity+' personas</option>').join('');
  }
  function reserveModal(tableId=null){
    const d=current();if(!d.tables.length)return notify('No hay mesas configuradas',true);
    const at=new Date(Date.now()+2*3600000);at.setMinutes(Math.ceil(at.getMinutes()/15)*15,0,0);
    showModal('AGENDA · NUEVA RESERVA','Preparar una llegada',
      '<label class="modal-field">Mesa<select name="table_id" required>'+tableOptions(d,tableId)+'</select></label>'+
      field('Nombre del cliente','guest_name','text','', 'maxlength="100"')+
      field('Número de personas','party_size','number',2,'min="1" max="50"')+
      field('Fecha y hora','reserved_at','datetime-local',localDate(at)+'T'+localTime(at))+
      '<label class="modal-field">Observaciones<textarea name="notes" rows="2" maxlength="255"></textarea></label>',
      'reserve','Guardar reserva');
  }
  function seatModal(tableId,reservationId=null){
    const d=current(),reservation=d.reservations.find(r=>r.id===Number(reservationId));
    const table=reservation?.dining_table_id||tableId;
    showModal('SALÓN · RECEPCIÓN','Abrir servicio',
      '<label class="modal-field">Mesa<select name="table_id" required>'+tableOptions(d,table)+'</select></label>'+
      field('Nombre del cliente','guest_name','text',reservation?.guest_name||'', 'maxlength="100"')+
      field('Comensales','party_size','number',reservation?.party_size||2,'min="1" max="50"')+
      '<input type="hidden" name="reservation_id" value="'+(reservation?.id||'')+'">'+
      '<p class="small-note">Esto registra un servicio de Panacea, no cambia automáticamente el estado de ocupación nativo de TastyIgniter.</p>',
      'seat','Iniciar servicio');
  }
  function orderModal(sessionId){
    const d=current();if(!d.menus.length)return notify('No hay productos con precio en el catálogo real. Revisa TastyIgniter.',true);
    const session=d.sessions.find(s=>s.id===Number(sessionId));if(!session)return;
    showModal('COMANDA · '+tableName(d,session.dining_table_id),'Tomar un pedido',
      '<input type="hidden" name="session_id" value="'+session.id+'"><p class="small-note" style="margin-bottom:12px">Selecciona cantidades. Los precios reales se validan nuevamente en el servidor.</p>'+
      d.menus.slice(0,100).map(m=>'<div class="order-line-picker"><div><strong>'+esc(m.name)+'</strong><small>'+money(m.price)+'</small></div><input type="number" name="qty_'+m.id+'" data-menu-id="'+m.id+'" aria-label="Cantidad de '+esc(m.name)+'" min="0" max="30" value="0"></div>').join(''),
      'add_order','Enviar a cocina');
  }
  function paymentModal(sessionId){
    const d=current(),s=d.sessions.find(s=>s.id===Number(sessionId));if(!s)return;
    const due=sessionBalance(d,s.id).due;
    if(due<=0)return notify('No hay saldo pendiente para este servicio.');
    showModal('CAJA · ABONO MANUAL','Registrar un cobro',
      '<input type="hidden" name="session_id" value="'+s.id+'"><p class="small-note" style="margin:0 0 15px">Saldo pendiente: <strong>'+money(due)+'</strong>. El registro no procesa tarjetas ni emite documento fiscal.</p>'+
      field('Importe (USD)','amount','number',due.toFixed(2),'min="0.01" step="0.01" max="'+due.toFixed(2)+'"')+
      '<label class="modal-field">Método informado<select name="method" required><option value="cash">Efectivo</option><option value="card">Tarjeta (registrada manualmente)</option><option value="other">Otro medio</option></select></label>',
      'pay','Registrar abono');
  }
  async function submitModal(event){
    event.preventDefault();
    if(!modalContext)return;
    const form=$('modalForm'),fd=new FormData(form),data=Object.fromEntries(fd.entries());
    let type=modalContext;
    if(type==='add_order'){
      data.items=[...form.querySelectorAll('[data-menu-id]')].map(input=>({menu_id:Number(input.dataset.menuId),qty:Number(input.value)})).filter(item=>item.qty>0);
      if(!data.items.length){$('modalError').textContent='Debes seleccionar al menos un producto.';$('modalError').hidden=false;return;}
    }
    if(type==='reserve')data.reserved_at=data.reserved_at.replace('T',' ')+':00';
    if(type==='seat'&&!data.reservation_id)delete data.reservation_id;
    $('modalSubmit').disabled=true;$('modalError').hidden=true;
    try{
      await post(type,data);
      hideModal();notify(({reserve:'Reserva confirmada',seat:'Servicio iniciado',add_order:'Comanda enviada a cocina',pay:'Abono registrado'})[type]||'Operación registrada');
      render();
    }catch(error){$('modalError').textContent=error.message;$('modalError').hidden=false;}
    finally{$('modalSubmit').disabled=false;}
  }
  async function saveFloor(){
    if(!editDraft)return;
    const d=editDraft;
    const area=d.areas[0];if(!area)return;
    const positions=d.tables.filter(t=>t.area_id===area.id).map((t,i)=>({id:t.id,...tablePosition(t,i)}));
    const properties=d.tables.filter(t=>t.area_id===area.id).map(t=>({id:t.id,name:t.name,capacity:Number(t.capacity),shape:t.shape}));
    const elements=(area.elements||[]).map(e=>({kind:e.kind,x:Number(e.x),y:Number(e.y),width:Number(e.width),height:Number(e.height),label:e.label||''}));
    $('saveFloor').disabled=true;
    try{
      if(source==='real'){
        const response=await fetch(cfg.floorUrl,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':cfg.csrf},body:JSON.stringify({area_id:area.id,positions,properties,elements})});
        let json={};try{json=await response.json()}catch(_){}
        if(!response.ok)throw Error(json.message||Object.values(json.errors||{})[0]?.[0]||'HTTP '+response.status);
        editDraft=null;selectedElement=null;await loadReal();
      }else{
        demo.tables=clone(d.tables);demo.areas=clone(d.areas);editDraft=null;selectedElement=null;
      }
      renderFloor();notify(source==='real'?'Plano guardado en MariaDB':'Plano modificado solo en demostración');
    }catch(error){notify('No se pudo guardar el plano: '+error.message,true);}
    finally{$('saveFloor').disabled=false;}
  }
  function updateFloorProperties(){
    if(!editDraft)return;
    const t=editDraft.tables.find(t=>t.id===selectedTable);if(!t)return;
    const name=$('floorName').value.trim(),capacity=Number($('floorCapacity').value),shape=$('floorShape').value;
    if(!name||!Number.isInteger(capacity)||capacity<Number(t.min_capacity)||capacity>100)return notify('Revisa el nombre y las capacidades permitidas.',true);
    Object.assign(t,{name,capacity,shape});renderFloor();notify('Propiedades preparadas. Guarda la distribución.');
  }
  function updateArchitecture(){
    if(!editDraft||selectedElement===null)return;
    const e=editDraft.areas[0].elements[selectedElement],w=Number($('archWidth').value),h=Number($('archHeight').value);
    if(w<10||h<10||w>2000||h>2000)return notify('Dimensiones entre 10 y 2000 px.',true);
    Object.assign(e,{label:$('archLabel').value,width:w,height:h});renderFloor();
  }
  function pointerDown(e){
    if(!editDraft)return;
    const target=e.target.closest('[data-floor-table],[data-architecture]');if(!target)return;
    const tableId=target.dataset.floorTable;
    if(tableId){selectedTable=Number(tableId);selectedElement=null;}
    else{selectedElement=Number(target.dataset.architecture);}
    const rect=$('floorSurface').getBoundingClientRect();
    const x=Number(target.style.left.replace('px','')),y=Number(target.style.top.replace('px',''));
    dragging={pointerId:e.pointerId,target,offsetX:e.clientX-rect.left-x,offsetY:e.clientY-rect.top-y,kind:tableId?'table':'element',id:tableId?Number(tableId):Number(target.dataset.architecture)};
    target.setPointerCapture(e.pointerId);
    e.preventDefault();renderInspector();
  }
  function pointerMove(e){
    if(!dragging||e.pointerId!==dragging.pointerId||!editDraft)return;
    const rect=$('floorSurface').getBoundingClientRect();
    const t=dragging.target,x=Math.max(0,Math.min(rect.width-t.offsetWidth,e.clientX-rect.left-dragging.offsetX));
    const y=Math.max(0,Math.min(rect.height-t.offsetHeight,e.clientY-rect.top-dragging.offsetY));
    t.style.left=Math.round(x)+'px';t.style.top=Math.round(y)+'px';
    if(dragging.kind==='table'){
      const table=editDraft.tables.find(t=>t.id===dragging.id);
      const p=tablePosition(table,editDraft.tables.indexOf(table));
      table.seatLayout={...p,x:Math.round(x),y:Math.round(y)};
    }else{
      const element=editDraft.areas[0].elements[dragging.id];element.x=Math.round(x);element.y=Math.round(y);
    }
  }
  function pointerUp(e){if(dragging&&e.pointerId===dragging.pointerId)dragging=null;}
  async function handleClick(e){
    const goto=e.target.closest('[data-goto],[data-nav]');
    if(goto){setView(goto.dataset.goto||goto.dataset.nav);return;}
    const table=e.target.closest('[data-floor-table]');
    if(table&&!editDraft){selectedTable=Number(table.dataset.floorTable);renderFloor();return;}
    const arch=e.target.closest('[data-architecture]');
    if(arch&&editDraft){selectedElement=Number(arch.dataset.architecture);renderInspector();return;}
    const command=e.target.closest('[data-command]');
    if(command){
      const cmd=command.dataset.command;
      if(cmd==='new-reservation')reserveModal(command.dataset.table||null);
      if(cmd==='new-seat')seatModal(Number(command.dataset.table));
      if(cmd==='new-order')orderModal(Number(command.dataset.session));
      if(cmd==='pay-session'){paymentModal(Number(command.dataset.session));}
      if(cmd==='apply-floor-props')updateFloorProperties();
      if(cmd==='rotate-floor'){
        const t=editDraft?.tables.find(t=>t.id===selectedTable);if(t){const p=tablePosition(t,0);t.seatLayout={...p,rotation:(p.rotation+90)%360};renderFloor();}
      }
      if(cmd==='apply-arch')updateArchitecture();
      if(cmd==='delete-arch'){editDraft.areas[0].elements.splice(selectedElement,1);selectedElement=null;renderFloor();}
      if(cmd==='restock-demo'){if(source!=='demo')return notify('Reponer existencias requiere integración con stock real.',true);demo.inventory.forEach(i=>{if(i.qty<i.min)i.qty=i.min*2});renderInventory();notify('Reposición simulada');}
      if(cmd==='new-incident'){if(source!=='demo')return notify('El registro real requiere auditoría y permisos.',true);demo.incidents.unshift({id:Math.max(...demo.incidents.map(i=>i.id),0)+1,title:'Incidencia de ejemplo',severity:'Media',resolved:false});renderIncidents();notify('Incidencia simulada');}
      return;
    }
    const resolved=e.target.closest('[data-resolve-incident]');if(resolved&&source==='demo'){const incident=demo.incidents.find(i=>i.id===Number(resolved.dataset.resolveIncident));if(incident)incident.resolved=true;renderIncidents();notify('Incidencia resuelta en demo');return;}
    const seatRes=e.target.closest('[data-seat-res]');
    if(seatRes){const r=current().reservations.find(r=>r.id===Number(seatRes.dataset.seatRes));if(r)seatModal(r.dining_table_id,r.id);return;}
    const cancelRes=e.target.closest('[data-cancel-res]');
    if(cancelRes){if(confirm('¿Cancelar esta reserva?'))await execute('cancel_reservation',{reservation_id:Number(cancelRes.dataset.cancelRes)},'Reserva cancelada');return;}
    const advance=e.target.closest('[data-advance]');
    if(advance){await execute('advance_order',{order_id:Number(advance.dataset.advance)},'Comanda actualizada');return;}
    const close=e.target.closest('[data-close-session]');
    if(close&&!close.disabled){if(confirm('¿Finalizar el servicio y liberar la mesa en Panacea?'))await execute('close',{session_id:Number(close.dataset.closeSession)},'Servicio finalizado');return;}
  }
  function init(){
    const persisted=window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(persisted)document.documentElement.classList.add('dark');
    const hash=location.hash.slice(1);if(labels[hash])view=hash;
    document.addEventListener('click',handleClick);
    $('realMode').addEventListener('click',()=>setMode('real'));
    $('demoMode').addEventListener('click',()=>setMode('demo'));
    $('reload').addEventListener('click',()=>source==='real'?loadReal(true):notify('Demo local: cambia a Datos reales para actualizar desde MariaDB'));
    $('kitchenRefresh').addEventListener('click',()=>source==='real'?loadReal(true):renderKitchen());
    $('themeSwitch').addEventListener('click',()=>document.documentElement.classList.toggle('dark'));
    $('reservationDate').addEventListener('change',renderReservations);
    $('clearDate').addEventListener('click',()=>{$('reservationDate').value='';renderReservations();});
    $('menuSearch').addEventListener('input',renderCatalog);
    ['simPrice','simCost','simVolume','simDiscount'].forEach(id=>$(id).addEventListener('input',renderSimulator));
    $('orderTabs').addEventListener('click',e=>{
      const button=e.target.closest('[data-order-filter]');if(!button)return;
      orderFilter=button.dataset.orderFilter;
      document.querySelectorAll('[data-order-filter]').forEach(x=>x.classList.toggle('active',x===button));
      renderOrders();
    });
    $('editFloor').addEventListener('click',()=>{
      if(!current()?.tables.length)return notify('Todavía no hay mesas para editar.',true);
      if(editDraft)return;
      editDraft=clone(current());selectedElement=null;renderFloor();
      notify('Modo edición. Guarda o cancela para salir.');
    });
    $('cancelFloor').addEventListener('click',()=>{editDraft=null;selectedElement=null;renderFloor();notify('Cambios del plano descartados');});
    $('saveFloor').addEventListener('click',saveFloor);
    $('elementType').addEventListener('change',e=>{
      if(!editDraft||!e.target.value)return;
      const kind=e.target.value,area=editDraft.areas[0];
      if(!area)return;
      area.elements=area.elements||[];
      area.elements.push({kind,x:60,y:60,width:kind==='wall'?160:kind==='aisle'?160:95,height:kind==='aisle'?65:kind==='wall'?12:28,label:''});
      selectedElement=area.elements.length-1;selectedTable=null;e.target.value='';renderFloor();
    });
    $('floorSurface').addEventListener('pointerdown',pointerDown);
    $('floorSurface').addEventListener('pointermove',pointerMove);
    $('floorSurface').addEventListener('pointerup',pointerUp);
    $('floorSurface').addEventListener('pointercancel',pointerUp);
    $('modalForm').addEventListener('submit',submitModal);
    $('closeModal').addEventListener('click',hideModal);
    $('cancelModal').addEventListener('click',hideModal);
    $('modalOverlay').addEventListener('click',e=>{if(e.target===$('modalOverlay'))hideModal();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modalOverlay').hidden)hideModal();});
    setView(view);loadReal();
    setInterval(()=>{if(source==='real'&&!loading&&$('modalOverlay').hidden&&!editDraft)loadReal();},30000);
  }
  init();
})();
