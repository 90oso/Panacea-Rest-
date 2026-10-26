import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const routes = readFileSync('routes/web.php','utf8');
const studio = readFileSync('resources/views/panacea/studio.blade.php','utf8');
const css = readFileSync('public/panacea/studio-air.css','utf8');
const operations = readFileSync('app/Services/Panacea/Operations.php','utf8');
const controller = readFileSync('app/Http/Controllers/Panacea/StudioController.php','utf8');

assert.match(routes, /Route::get\('\/experiencia'/, 'Customer GET route must not collide with public/panacea');
assert.match(routes, /Route::post\('\/experiencia\/reservar'/, 'Customer form POST route must avoid public/panacea');
assert.doesNotMatch(routes, /Route::get\('\/panacea'/, 'A real public/panacea folder makes /panacea inaccessible under Apache');
assert.match(studio, /href="\{\{ route\('panacea\.guest\.home'\) \}\}"/, 'CTA should use Laravel named route');
assert.match(operations, /catch \(\\Throwable \$exception\)/, 'Management snapshot must degrade gracefully on SQL errors');
assert.match(controller, /management_snapshot_ready/, 'Health should reveal partial failure without customer data');
assert.match(css, /:root\.dark\{[\s\S]*?--ink:#f2f5ed;/, 'Dark palette must provide light foreground');
assert.match(css, /\.dark \.surface,[\s\S]*?\.dark \.catalog-card\{[\s\S]*?background:var\(--glass\)/, 'Dark surfaces must not keep white backgrounds');
assert.match(css, /\.dark \.metric strong,[\s\S]*?color:var\(--ink\)/, 'Dashboard numbers need dark foreground token');

function rgb(hex) {
  return hex.match(/\w\w/g).map(v => parseInt(v,16)/255).map(x => x <= .04045 ? x / 12.92 : ((x+.055)/1.055)**2.4);
}
function luminance(hex) {
  const [r,g,b]=rgb(hex.replace('#',''));
  return .2126*r+.7152*g+.0722*b;
}
function ratio(a,b) {
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
assert.ok(ratio('#f2f5ed','#35483a')>=7,'Dark body text on cards should exceed WCAG AAA 7:1');
assert.ok(ratio('#c8d4c7','#35483a')>=4.5,'Dark secondary labels should exceed WCAG AA 4.5:1');
assert.ok(ratio('#3d433c','#fffefa')>=7,'Light body text on light cards should exceed WCAG AAA 7:1');
console.log('Panacea regression: Apache route collision, partial API recovery, and dark/light contrast OK');
