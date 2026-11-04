'use strict';
/* All business records are fabricated for the public preview. Never use real PII. */
(function () {
  const menu = [
    {id:90001,name:'Pizza artesanal',price:16.50,description:'Masa de larga fermentación, tomate, mozzarella y albahaca fresca.',image:null},
    {id:90002,name:'Bowl mediterráneo',price:13.50,description:'Granos suaves, vegetales de temporada, hierbas y aderezo cítrico.',image:null},
    {id:90003,name:'Hamburguesa de la casa',price:15.00,description:'Pan artesanal, vegetales frescos y acompañamiento crujiente.',image:null},
    {id:90004,name:'Ensalada de temporada',price:10.00,description:'Hojas frescas, hortalizas de estación y vinagreta de autor.',image:null},
    {id:90005,name:'Limonada especial',price:5.50,description:'Cítricos recién exprimidos y un toque de hierbabuena.',image:null},
    {id:90006,name:'Postre de la casa',price:7.50,description:'Selección dulce preparada para cerrar una gran experiencia.',image:null},
    {id:90007,name:'Pasta fresca',price:14.00,description:'Pasta al dente, salsa de tomate asado y queso curado.',image:null},
    {id:90008,name:'Café de especialidad',price:4.25,description:'Selección de café con notas aromáticas y tueste equilibrado.',image:null}
  ];
  const tables = Array.from({length:12},(_,i)=>({
    id:i+1,area_id:1,name:'Mesa '+String(i+1).padStart(2,'0'),
    shape:i%4?'rectangle':'round',min_capacity:1,capacity:4+(i%3)*2,
    seatLayout:{x:50+(i%4)*195,y:55+Math.floor(i/4)*155,rotation:0}
  }));
  const areas=[{id:1,name:'Salón de demostración',elements:[
    {kind:'wall',x:12,y:13,width:805,height:12,label:''},
    {kind:'wall',x:12,y:13,width:12,height:520,label:''},
    {kind:'door',x:650,y:510,width:80,height:26,label:'Entrada'},
    {kind:'window',x:250,y:13,width:200,height:20,label:'Ventanal'}
  ]}];
  const data={areas,tables,menus:menu,source_counts:{orders:0,menus:menu.length,stocks:0,customers:0,staffs:0},
    native_reservations:[],native_links:[],reservations:[],sessions:[],orders:[],lines:[],payments:[],
    migrated:false,extensions:{ready:false}};
  Object.defineProperty(window,'PANACEA_DEMO_FIXTURES',{value:data,writable:false,configurable:false});
  Object.defineProperty(window,'PANACEA_STUDIO',{value:Object.freeze({staticDemo:true}),writable:false});
  Object.defineProperty(window,'PANACEA_GUEST',{value:Object.freeze({items:menu}),writable:false});
})();
