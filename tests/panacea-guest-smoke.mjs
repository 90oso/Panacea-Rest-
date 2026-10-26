import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync('public/panacea/guest.js','utf8');
const html=readFileSync('resources/views/panacea/guest.blade.php','utf8');
assert.ok(html.includes('id="guestBookingForm"'));
assert.ok(html.includes('id="guestMenuCards"'));
assert.ok(html.includes('privacy_consent'));
assert.ok(html.includes('guest.js'));

class Element {
  constructor(){this.value='';this.listeners={};this.innerHTML='';this.textContent='';this.hidden=false;this.disabled=false;this.min='';this.max='';this.style={};this.classList={add(){},toggle(){}};}
  addEventListener(name,fn){this.listeners[name]=fn;}
  scrollIntoView(){}
}
const nodes=new Map();
function get(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);}
const dateNode=new Element();
const form=get('guestBookingForm');
const button=new Element();
form.reportValidity=()=>true;
form.querySelector=()=>button;
form.reset=()=>{};
const document={
  getElementById:get,
  documentElement:{scrollHeight:1200},
  querySelector:selector=>selector==='[name="reserved_at"]'?dateNode:null,
  querySelectorAll:()=>[]
};
const requestLog=[];
class FormDataMock {
  constructor(){}
  get(key){return {guest_name:'Ana Demo',email:'ana@example.test',party_size:'2',reserved_at:'2026-11-11T19:15',privacy_consent:'1'}[key];}
}
const window={
  PANACEA_GUEST:{bookingUrl:'/panacea/book',csrf:'token',items:[{id:1,name:'Bowl <Especial>',price:12.5},{id:2,name:'Limonada',price:5}]},
  matchMedia:()=>({matches:true}),
  addEventListener(){},
  innerHeight:500,scrollY:150
};
const sandbox={document,window,FormData:FormDataMock,
  fetch:async(url,args)=>{requestLog.push({url,args});return {ok:true,json:async()=>({request_id:41,status:'pending'})};},
  Intl,Date,String,Number,JSON,Math,console,requestAnimationFrame:cb=>cb()};
vm.runInNewContext(source,sandbox,{filename:'guest.js'});
assert.match(get('guestMenuCards').innerHTML,/Bowl &lt;Especial&gt;/);
assert.doesNotMatch(get('guestMenuCards').innerHTML,/Bowl <Especial>/);
assert.match(get('guestMenuCards').innerHTML,/Limonada/);
get('guestMenuSearch').value='lim';
get('guestMenuSearch').listeners.input();
assert.doesNotMatch(get('guestMenuCards').innerHTML,/Bowl/);
assert.match(get('guestMenuCards').innerHTML,/Limonada/);
await form.listeners.submit({preventDefault(){}});
assert.equal(requestLog.length,1);
assert.equal(requestLog[0].url,'/panacea/book');
const data=JSON.parse(requestLog[0].args.body);
assert.equal(data.party_size,2);
assert.equal(data.privacy_consent,true);
assert.equal(requestLog[0].args.headers['X-CSRF-TOKEN'],'token');
assert.match(get('bookingMessage').textContent,/pendiente de confirmación/);
assert.equal(button.disabled,false);
console.log('Guest portal: escaped menu, filtering, CSRF and pending booking UX verified');
