import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const code = readFileSync('public/panacea/studio-shell.js', 'utf8');
const html = readFileSync('resources/views/panacea/studio.blade.php', 'utf8');
const css = readFileSync('public/panacea/studio-premium.css', 'utf8');
for (const fragment of ['id="sidebarToggle"', 'id="sidebarCompactToggle"', 'id="sidebarScrim"', 'id="sidebarNav"', 'studio-premium.css', 'studio-shell.js']) {
  assert.ok(html.includes(fragment), 'Missing shell hook: ' + fragment);
}
for (const fragment of ['.sidebar-compact', '.sidebar-hidden', '.mobile-sidebar-open', 'backdrop-filter', 'prefers-reduced-motion']) {
  assert.ok(css.includes(fragment), 'Missing shell style: ' + fragment);
}

class Classes {
  constructor(start = []) { this.values = new Set(start); }
  add(name) { this.values.add(name); }
  remove(name) { this.values.delete(name); }
  contains(name) { return this.values.has(name); }
  toggle(name, force) {
    const next = force === undefined ? !this.contains(name) : force;
    if (next) this.add(name); else this.remove(name);
    return next;
  }
}
class El {
  constructor(id, classes = []) {
    this.id = id;
    this.listeners = new Map();
    this.attributes = {};
    this.classList = new Classes(classes);
    this.hidden = false;
    this.inert = false;
    this.focused = false;
    this.iconUse = { attrs: {}, setAttribute(name, value) { this.attrs[name] = value; } };
  }
  addEventListener(name, fn) {
    const list = this.listeners.get(name) || [];
    list.push(fn);
    this.listeners.set(name, list);
  }
  fire(name, payload={}) { for (const fn of this.listeners.get(name) || []) fn(payload); }
  setAttribute(name, val) { this.attributes[name] = val; }
  removeAttribute(name) { delete this.attributes[name]; }
  querySelector(tag) { return tag === 'use' ? this.iconUse : null; }
  focus() { this.focused = true; }
}
const els = new Map();
for (const id of ['appShell','sidebar','sidebarToggle','sidebarCompactToggle','sidebarScrim','themeSwitch']) els.set(id,new El(id));
const navButtons = [new El('navHome',['active']), new El('navSalon')];
const sidebar = els.get('sidebar');
sidebar.querySelectorAll = () => navButtons;
const shell = els.get('appShell');
shell.querySelector = () => navButtons.find(e => e.classList.contains('active')) || null;
const theme = els.get('themeSwitch');
const root = new El('root');
const body = new El('body');
const document = new El('document');
document.readyState = 'complete';
document.body = body;
document.documentElement = root;
document.getElementById = id => els.get(id) || null;
const store = new Map();
const storage = { getItem:key=>store.get(key)??null, setItem:(key,value)=>store.set(key,value) };
const mobileQuery = {matches:false,listeners:[],addEventListener(name,cb){this.listeners.push(cb);},fire(){for (const cb of this.listeners) cb();}};
const window = {localStorage:storage,matchMedia:()=>mobileQuery};
const context = {window,document,requestAnimationFrame:fn=>fn(),console};
theme.addEventListener('click',()=>root.classList.toggle('dark')); // existing studio.js handler
vm.runInNewContext(code, context, {filename:'studio-shell.js'});

const click = id => els.get(id).fire('click');
assert.equal(sidebar.inert,false);
assert.equal(els.get('sidebarToggle').attributes['aria-expanded'],'true');
click('sidebarCompactToggle');
assert.equal(shell.classList.contains('sidebar-compact'),true);
assert.equal(store.get('panacea.studio.sidebar.v4'),'compact');
assert.equal(els.get('sidebarCompactToggle').attributes['aria-label'],'Expandir barra lateral');
click('sidebarToggle');
assert.equal(shell.classList.contains('sidebar-hidden'),true);
assert.equal(sidebar.inert,true);
assert.equal(els.get('sidebarToggle').attributes['aria-expanded'],'false');
click('sidebarToggle');
assert.equal(shell.classList.contains('sidebar-compact'),true);
assert.equal(sidebar.inert,false);

mobileQuery.matches = true; mobileQuery.fire();
assert.equal(shell.classList.contains('sidebar-compact'),false);
assert.equal(els.get('sidebarScrim').hidden,true);
assert.equal(sidebar.inert,true);
click('sidebarToggle');
assert.equal(shell.classList.contains('mobile-sidebar-open'),true);
assert.equal(els.get('sidebarScrim').hidden,false);
assert.equal(body.classList.contains('navigation-open'),true);
assert.equal(navButtons[0].focused,true);
document.fire('click',{target:{closest:()=>navButtons[0]}});
assert.equal(shell.classList.contains('mobile-sidebar-open'),false);
assert.equal(sidebar.inert,true);
click('sidebarToggle');
document.fire('keydown',{key:'Escape',preventDefault(){}});
assert.equal(shell.classList.contains('mobile-sidebar-open'),false);
assert.equal(els.get('sidebarToggle').focused,true);

click('themeSwitch');
assert.equal(store.get('panacea.studio.theme.v4'),'dark');
assert.equal(theme.attributes['aria-label'],'Cambiar a modo claro');
click('themeSwitch');
assert.equal(store.get('panacea.studio.theme.v4'),'light');
assert.equal(theme.attributes['aria-label'],'Cambiar a modo oscuro');

mobileQuery.matches = false; mobileQuery.fire();
assert.equal(shell.classList.contains('sidebar-compact'),true);
assert.equal(sidebar.inert,false);
console.log('Panacea premium shell: sidebar compact/hide/mobile, focus, ARIA, theme persistence OK');
