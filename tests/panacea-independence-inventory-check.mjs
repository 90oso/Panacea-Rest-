import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Checks that every tracked file at the audit baseline has a documented
// disposition before extracting it into a TastyIgniter-free product.
// docs/architecture holds the audit itself; this check is also exempt.

const csv = readFileSync('docs/architecture/INVENTARIO_INDEPENDENCIA.csv','utf8').trim();
const lines = csv.split(/\r?\n/);
assert.equal(lines.shift(),'path,origen,decision,prioridad,criterio');

function parseRow(line) {
  const columns=[];
  const pattern=/"((?:[^"]|"")*)"(?:,|$)/g;
  let m;
  while ((m=pattern.exec(line))) columns.push(m[1].replaceAll('""','"'));
  assert.equal(columns.length,5,'Invalid quoted CSV row: '+line.slice(0,160));
  return {path:columns[0],source:columns[1],action:columns[2],priority:columns[3],note:columns[4]};
}
const rows=lines.filter(Boolean).map(parseRow);
const approved=new Set([
  'REGENERAR','REESCRIBIR','REEMPLAZAR','ADAPTAR','REDISENAR',
  'ACTUALIZAR_ARCHIVAR','DESCARTAR','REVISAR_ATRIBUCION',
  'CONSERVAR_ADAPTAR','REFRACTORIZAR','ARCHIVAR'
]);
const listed=new Set();
for (const r of rows) {
  assert.ok(!listed.has(r.path),'Duplicate inventory path: '+r.path);
  listed.add(r.path);
  assert.ok(approved.has(r.action),'Unknown audit disposition: '+r.path+' '+r.action);
  assert.ok(['P0','P1','P2'].includes(r.priority),'Missing priority: '+r.path);
  assert.ok(r.note.length>=20,'Missing action rationale: '+r.path);
}
const excluded=p=>p.startsWith('docs/architecture/')||p==='tests/panacea-independence-inventory-check.mjs';
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'})
  .split('\0').filter(Boolean).filter(p=>!excluded(p));
const actual=new Set(tracked);
const missing=tracked.filter(p=>!listed.has(p));
const stale=rows.map(x=>x.path).filter(p=>!actual.has(p));
if(missing.length)console.error('Unclassified tracked files:\n'+missing.join('\n'));
if(stale.length)console.error('Audited files absent from repository:\n'+stale.join('\n'));
assert.equal(missing.length,0,'Inventory must cover all tracked files except audit artifacts');
assert.equal(stale.length,0,'Inventory must not refer to deleted files');
assert.ok(rows.length>=100,'Audit must include full starter application, not only Panacea modules');
const totals=rows.reduce((counts,r)=>{
  counts[r.action]=(counts[r.action]||0)+1;
  return counts;
},{});
console.log('Panacea standalone audit: '+rows.length+' tracked files classified across decisions');
console.log(JSON.stringify(totals));
console.log('Reminder: matching inventory does not mean the application is already independent.');
