import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root='demo-public';
const read=p=>readFileSync(path.join(root,p),'utf8');
const index=read('index.html'),studio=read('studio/index.html');
const appJs=read('assets/studio.js'),guestJs=read('assets/guest.js');
const tourJs=read('assets/studio-tour.js'),fixturesJs=read('assets/fixtures.js');
const config=JSON.parse(read('vercel.json'));
const required=[
  'index.html','studio/index.html','vercel.json',
  'assets/fixtures.js','assets/studio.js','assets/guest.js',
  'assets/studio-shell.js','assets/studio-tour.js','assets/menu-imagery.js',
  'assets/studio.css','assets/studio-premium.css','assets/studio-air.css',
  'assets/studio-menu.css','assets/studio-night.css','assets/studio-tour.css',
  'assets/guest.css','assets/public-demo.css'
];
for (const file of required) assert.ok(existsSync(path.join(root,file)),'Missing static file: '+file);
for (const html of [index,studio]) {
  assert.doesNotMatch(html,/\{\{|@json|@csrf|<\?php|csrf-token/,'No Laravel or Blade on public pages');
  assert.match(html,/public-demo\.css/);
  assert.match(html,/public-demo-strip/,'Visible disclaimer required');
  assert.doesNotMatch(html,/<script(?![^>]*src=)[^>]*>[\s\S]*?<\/script>/i,'Scripts must be external for CSP');
  for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)[^"]*"/g)) {
    assert.ok(existsSync(path.join(root,m[1].slice(1))),'Broken asset URL '+m[1]);
  }
}
assert.match(index,/href="\/studio\/"/,'Homepage must link to Studio');
assert.match(studio,/href="\/"/,'Studio must link back to customer page');
assert.match(index,/name="guest_name"[^>]*readonly/,'Use fake readonly reservation identity');
assert.match(index,/name="email"[^>]*readonly/,'Use fake readonly email');
assert.match(studio,/id="realMode"[^>]*disabled hidden/,'No real data switch allowed');
assert.match(studio,/id="tourLaunch"/,'Presenter quest launcher required');
assert.match(studio,/id="tourOverlay"/,'Presenter quest overlay required');

const forbidden=/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|\bsendBeacon\s*\(|\baxios\b|\$\.ajax\b/;
for(const [name,src] of [['studio.js',appJs],['guest.js',guestJs],['studio-tour.js',tourJs],['fixtures.js',fixturesJs]]){
  assert.doesNotMatch(src,forbidden, name+' must not send any requests');
  new Function(src);
}
assert.match(appJs,/let source='demo'/);
assert.match(appJs,/if\(mode!=='demo'\)return/);
assert.match(appJs,/return demoAction\(type,payload\)/);
assert.doesNotMatch(appJs,/cfg\.actionUrl|cfg\.floorUrl|cfg\.stateUrl/,'No backend URLs');
assert.match(guestJs,/Vista previa completada/);
assert.doesNotMatch(guestJs,/cfg\.bookingUrl|cfg\.csrf/,'Public booking cannot use server actions');
assert.match(tourJs,/PanaceaPresenterQuest/);
assert.match(tourJs,/9 segundos|9000/);

const sandbox={window:{}};
vm.runInNewContext(fixturesJs,sandbox);
assert.equal(sandbox.window.PANACEA_STUDIO.staticDemo,true);
assert.ok(sandbox.window.PANACEA_GUEST.items.length>=6);
assert.ok(sandbox.window.PANACEA_DEMO_FIXTURES.tables.length>=10);
assert.ok(sandbox.window.PANACEA_GUEST.items.every(item=>item.image===null));
assert.ok(sandbox.window.PANACEA_GUEST.items.every(item=>item.price>0));
assert.ok(sandbox.window.PANACEA_GUEST.items.every(item=>item.id>=90000));
assert.equal(sandbox.window.PANACEA_DEMO_FIXTURES.reservations.length,0);
assert.equal(sandbox.window.PANACEA_DEMO_FIXTURES.payments.length,0);

const policy=config.headers?.find(x=>x.source==='/(.*)')?.headers?.find(x=>x.key==='Content-Security-Policy')?.value;
assert.ok(policy);
assert.match(policy,/script-src 'self'/);
assert.match(policy,/connect-src 'none'/);
assert.match(policy,/form-action 'none'/);
assert.match(policy,/frame-ancestors 'none'/);
assert.ok(config.rewrites.some(r=>r.source==='/studio'));

function crawl(dir){
  for(const item of readdirSync(path.join(root,dir),{withFileTypes:true})){
    const file=path.posix.join(dir,item.name);
    if(item.isDirectory())crawl(file);
    else assert.ok(!/\.(?:php|env|sql|sqlite|key|pem|p12|lock)$/i.test(file),'Server file must not be published: '+file);
  }
}
crawl('');
console.log('PUBLIC DEMO OK — 2 static pages; genuine Panacea visuals/guide; fake records; zero business requests; CSP blocks outbound connections.');
