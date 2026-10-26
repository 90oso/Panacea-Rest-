import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=readFileSync('public/panacea/studio.js','utf8');
const nodes=new Map();
class Node {
  constructor(id){
    this.id=id;this.innerHTML='';this.textContent='';this.value='';
    this.hidden=false;this.dataset={};this.style={};this.listeners={};
    this.classList={add(){},remove(){},toggle(){}};
  }
  addEventListener(name,callback){this.listeners[name]=callback;}
  setAttribute(){}
  querySelector(){return null;}
  querySelectorAll(){return [];}
}
const get=id=>{if(!nodes.has(id))nodes.set(id,new Node(id));return nodes.get(id);};
const document={
  getElementById:get,
  documentElement:new Node('html'),
  listeners:{},
  addEventListener(name,callback){this.listeners[name]=callback;},
  querySelectorAll(){return [];}
};
const data={
  migrated:true,
  areas:[{id:1,name:'Principal',elements:[]}],
  tables:[
    {id:1,area_id:1,name:'Mesa 01',min_capacity:1,capacity:4,shape:'rectangle',seatLayout:{x:50,y:45,rotation:0}},
    {id:2,area_id:1,name:'Mesa 02',min_capacity:2,capacity:6,shape:'round',seatLayout:{x:215,y:45,rotation:0}}
  ],
  menus:[{id:1,name:'Pizza',price:15}],
  native_reservations:[],native_links:[],
  reservations:[],sessions:[],orders:[],lines:[],payments:[],
  source_counts:{stocks:0,customers:0,staffs:0,orders:0,menus:1}
};
const sandbox={
  window:{PANACEA_STUDIO:{stateUrl:'/state',actionUrl:'/action',floorUrl:'/floor',csrf:'test'},matchMedia:()=>({matches:false}),scrollTo(){}},
  document,location:{hash:''},history:{replaceState(){}},navigator:{},
  fetch:async()=>({ok:true,json:async()=>structuredClone(data)}),
  setTimeout:()=>1,clearTimeout(){},setInterval:()=>1,
  Intl,Date,Number,String,JSON,Math,Array,Object,Set,Map,Error,Promise,console,structuredClone,confirm:()=>true
};
vm.runInNewContext(source,sandbox,{filename:'studio.js'});
await new Promise(resolve=>setTimeout(resolve,10));
assert.match(get('dashboardMetrics').innerHTML,/Mesas registradas/);
assert.match(get('dashboardMetrics').innerHTML,/>2</);
get('demoMode').listeners.click();
assert.match(get('dashboardMetrics').innerHTML,/Servicios abiertos/);
get('realMode').listeners.click();
assert.match(get('dashboardMetrics').innerHTML,/Servicios abiertos/);
const target=nav=>({closest:(selector)=>selector==='[data-goto],[data-nav]'?{dataset:{nav}}:null});
for(const name of ['reservas','salon','pedidos','cocina','caja','menu','inventario','clientes','personal','incidencias','simulador','gerencia']){
  document.listeners.click({target:target(name)});
}
assert.match(get('managementMetrics').innerHTML,/Comandas Panacea/);
document.listeners.click({target:target('salon')});
assert.match(get('floorSurface').innerHTML,/Mesa 01/);
assert.match(get('floorSurface').innerHTML,/Mesa 02/);
document.listeners.click({target:target('reservas')});
assert.match(get('reservationGrid').innerHTML,/No hay reservas/);
get('demoMode').listeners.click();
assert.match(get('reservationGrid').innerHTML,/Reserva de ejemplo/);
get('realMode').listeners.click();
assert.doesNotMatch(get('reservationGrid').innerHTML,/Reserva de ejemplo/);
console.log('Panacea Studio DOM smoke: shared layouts, navigation, demo isolation verified');
