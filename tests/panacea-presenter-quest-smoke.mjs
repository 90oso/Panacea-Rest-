import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const js=readFileSync('public/panacea/studio-tour.js','utf8');
const css=readFileSync('public/panacea/studio-tour.css','utf8');
const blade=readFileSync('resources/views/panacea/studio.blade.php','utf8');
const app=readFileSync('public/panacea/studio.js','utf8');

assert.match(js,/function\s+positionStep/, 'Guided tour must reposition its spotlight');
assert.doesNotMatch(js,/\bfetch\s*\(/, 'Tour must not call the backend');
assert.doesNotMatch(js,/\bpost\s*\(/, 'Tour must not submit server actions');
assert.match(css,/prefers-reduced-motion:reduce/, 'Respect reduced-motion accessibility');
assert.match(css,/\.tour-launcher\{[\s\S]*?width:29px/, 'Launcher must stay tiny');
assert.match(css,/\.tour-overlay\[hidden\]/, 'Hidden overlay must never obscure the app');
assert.match(blade,/id="tourLaunch"/, 'Guided tour launcher is required');
assert.match(blade,/id="tourOverlay" class="tour-overlay" hidden/, 'Tour must be opt-in');
assert.match(blade,/studio-tour\.css/, 'Guide styling must load');
assert.match(blade,/studio-tour\.js/, 'Guide controller must load');
assert.match(blade,/data-tour-length="quick"/);
assert.match(blade,/data-tour-length="full"/);
assert.match(blade,/aria-modal="true"/);
assert.match(app,/window\.PanaceaStudioGuide/, 'Tour should access safe, UI-only navigation');
assert.match(app,/selectFirstTable/, 'Tour should be able to demonstrate table inspector');
assert.match(app,/useDemo/, 'Tour should display the fictional scenario, never write to MariaDB');

class Classes {
  constructor(){this.list=new Set();}
  add(key){this.list.add(key);}
  remove(key){this.list.delete(key);}
  contains(key){return this.list.has(key);}
  toggle(key,force){
    const yes=force===undefined?!this.list.has(key):Boolean(force);
    if(yes)this.add(key);else this.remove(key);
    return yes;
  }
}
let document;
class Element {
  constructor(id){
    this.id=id;
    this.hidden=true;
    this.disabled=false;
    this.textContent='';
    this.style={};
    this.attributes={};
    this.listeners={};
    this.classList=new Classes();
    this.focused=false;
  }
  addEventListener(name,cb){(this.listeners[name]??=[]).push(cb);}
  fire(name,payload={}){for(const f of this.listeners[name]||[])f(payload);}
  setAttribute(name,value){this.attributes[name]=String(value);}
  removeAttribute(name){delete this.attributes[name];}
  getAttribute(name){return this.attributes[name]??null;}
  getBoundingClientRect(){
    if(this.id==='tourDialog')return {top:20,left:20,right:410,bottom:350,width:390,height:330};
    return {top:140,left:440,right:800,bottom:360,width:360,height:220};
  }
  scrollIntoView(){this.scrolled=(this.scrolled||0)+1;}
  focus(){this.focused=true;document.activeElement=this;}
  closest(){return null;}
  contains(el){return Boolean(el && (el.id||'').startsWith('tour'));}
  querySelectorAll(){return [nodes.tourClose,nodes.tourAutoplay,nodes.short,nodes.full,nodes.tourBack,nodes.tourNext];}
}
const nodeIds=[
  'tourLaunch','tourOverlay','tourShield','tourDialog','tourDimTop','tourDimLeft',
  'tourDimRight','tourDimBottom','tourSpotlight','tourTitle','tourDescription',
  'tourChapter','tourCounter','tourChooser','tourPortalLink','tourProgressWrap',
  'tourProgress','tourProgressText','tourControls','tourBack','tourNext','tourHint',
  'tourClose','tourAutoplay','toast'
];
const nodes={};
for(const id of nodeIds)nodes[id]=new Element(id);
nodes.short=new Element('tourShort');
nodes.full=new Element('tourFull');
let screen='inicio',usedDemo=0,tableSelections=0,busy=false,ready=true;
const navHistory=[],writeOperations=[];
const bridge={
  ready:()=>ready,
  view:()=>screen,
  isEditing:()=>busy,
  modalOpen:()=>false,
  useDemo:()=>{usedDemo++;},
  navigate:name=>{screen=name;navHistory.push(name);},
  selectFirstTable:()=>{tableSelections++;return true;},
};
document={
  readyState:'complete',
  hidden:false,
  body:new Element('body'),
  activeElement:null,
  listeners:{},
  addEventListener(name,cb){(this.listeners[name]??=[]).push(cb);},
  fire(name,event){for(const cb of this.listeners[name]||[])cb(event);},
  getElementById:id=>nodes[id]??null,
  querySelector(selector){
    if(selector==='[data-tour-length="quick"]')return nodes.short;
    if(selector==='[data-tour-length="full"]')return nodes.full;
    return new Element('anchor:'+selector);
  }
};
nodes.tourOverlay.hidden=true;
const timers=[];
const window={
  PanaceaStudioGuide:bridge,
  innerWidth:1360,
  innerHeight:890,
  requestAnimationFrame:callback=>callback(),
  setTimeout:(callback,delay)=>{timers.push({callback,delay});return timers.length;},
  clearTimeout(){},
  matchMedia:()=>({matches:false}),
  listeners:{},
  addEventListener(name,cb){(this.listeners[name]??=[]).push(cb);}
};
const sandbox={document,window,console};
vm.runInNewContext(js,sandbox,{filename:'studio-tour.js'});
const tour=window.PanaceaPresenterQuest;
assert.ok(tour,'Presenter API must initialize');
assert.equal(tour.isOpen(),false);
tour.open();
assert.equal(tour.isOpen(),true);
assert.equal(nodes.tourOverlay.hidden,false);
assert.equal(nodes.tourLaunch.attributes['aria-expanded'],'true');
assert.equal(nodes.tourChooser.hidden,false);
assert.equal(usedDemo,0,'Opening explanation alone must not switch mode');
tour.start('quick');
const shortLength=tour.total();
assert.ok(shortLength>=9 && shortLength<=14,'Quick route must suit a short recording');
assert.equal(usedDemo,1,'Starting must use the safe browser-only demo mode');
assert.equal(tour.step(),'source');
assert.equal(nodes.tourSpotlight.hidden,false);
assert.match(nodes.tourTitle.textContent,/dos modos/);
assert.equal(nodes.tourControls.hidden,false);
assert.equal(nodes.tourAutoplay.hidden,false);
assert.equal(nodes.tourPortalLink.hidden,true);
const dimHeight=Number(nodes.tourDimTop.style.height.replace('px',''));
assert.ok(dimHeight>0,'Spotlight must dim the background');

nodes.tourAutoplay.fire('click');
assert.equal(nodes.tourAutoplay.attributes['aria-pressed'],'true');
assert.ok(timers.some(t=>t.delay===9000),'Optional autoplay should step every 9 seconds');
nodes.tourAutoplay.fire('click');
assert.equal(nodes.tourAutoplay.attributes['aria-pressed'],'false');

const seen=[];
while(tour.step()!=='finish'){
  seen.push(tour.step());
  tour.next();
  assert.ok(seen.length<25, 'Tutorial must terminate');
}
assert.ok(seen.includes('floor'));
assert.ok(seen.includes('inspector'));
assert.ok(seen.includes('guest'));
assert.ok(seen.includes('management'));
assert.ok(navHistory.includes('salon'));
assert.ok(navHistory.includes('cocina'));
assert.ok(navHistory.includes('caja'));
assert.ok(navHistory.includes('inventario'));
assert.ok(navHistory.includes('gerencia'));
assert.ok(tableSelections>=1,'Table inspection should be UI-only');
assert.equal(writeOperations.length,0);
assert.equal(nodes.tourSpotlight.hidden,true,'Finish should be centered, no spotlight');
assert.match(nodes.tourTitle.textContent,/Listo para presentar/);
tour.next();
assert.equal(tour.isOpen(),false);
assert.equal(nodes.tourOverlay.hidden,true);
assert.equal(nodes.tourLaunch.attributes['aria-expanded'],'false');

tour.open();
tour.start('full');
assert.ok(tour.total()>shortLength, 'Full tour should contain additional modules');
const event={key:'Escape',preventDefault(){this.prevented=true;},stopImmediatePropagation(){this.stopped=true;}};
document.fire('keydown',event);
assert.equal(event.prevented,true);
assert.equal(event.stopped,true);
assert.equal(tour.isOpen(),false);

busy=true;
tour.open();
assert.equal(tour.isOpen(),false,'Do not interrupt unsaved floor edits');
assert.match(nodes.toast.textContent,/guarda\/cancela/);
busy=false;
ready=false;
tour.open();
tour.start('quick');
assert.equal(tour.step(),null,'No navigation should run before the app is ready');
assert.match(nodes.tourDescription.textContent,/están cargando/);
tour.close();
console.log('Presenter Quest: tiny launcher, quick/full walkthroughs, UI-only demo mode, navigation, autoplay, Escape, busy guards OK');
