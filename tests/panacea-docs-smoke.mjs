import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import path from 'node:path';

const expected=[
  'README.md',
  'docs/README.md',
  'docs/01_VISION_Y_ALCANCE.md',
  'docs/02_ARQUITECTURA_Y_STACK.md',
  'docs/03_REQUISITOS_Y_REGLAS.md',
  'docs/04_CASOS_DE_USO.md',
  'docs/05_MODELO_DE_DATOS.md',
  'docs/06_API_Y_FLUJOS.md',
  'docs/07_INSTALACION_Y_OPERACION.md',
  'docs/08_CALIDAD_SEGURIDAD_Y_RIESGOS.md',
  'docs/09_HOJA_DE_RUTA.md',
  'docs/10_GUIA_DE_USUARIO.md',
];
for (const filename of expected) {
  assert.ok(existsSync(filename),'Required document missing: '+filename);
  const content=readFileSync(filename,'utf8');
  assert.ok(content.length>1200,'Document unexpectedly short: '+filename);
  assert.match(content,/^# /m,'Document missing main heading: '+filename);
  for (const match of content.matchAll(/\[[^\]\n]*\]\(([^)]+)\)/g)) {
    const href=match[1].trim().split(/\s+"/)[0].replace(/^<|>$/g,'');
    if (!href || /^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('#')) continue;
    const filepath=decodeURIComponent(href.split('#')[0].split('?')[0]);
    const resolved=path.normalize(path.resolve(path.dirname(filename),filepath));
    assert.ok(existsSync(resolved),filename+' has broken local documentation link: '+href);
  }
}
const readme=readFileSync('README.md','utf8');
assert.match(readme,/TastyIgniter.*4\.x/);
assert.match(readme,/no.*producci[oó]n/i);
assert.match(readme,/Samuel Adepoyigi/, 'Keep attribution to the upstream project');
const requirements=readFileSync('docs/03_REQUISITOS_Y_REGLAS.md','utf8');
const cases=readFileSync('docs/04_CASOS_DE_USO.md','utf8');
const expectedRF=[...requirements.matchAll(/\| (RF-\d+) \|/g)].map(x=>x[1]);
assert.ok(expectedRF.length>=25,'Requirements matrix should cover the product scope');
for(const uc of ['UC-01','UC-02','UC-03','UC-04','UC-05','UC-06','UC-07','UC-08','UC-09','UC-10','UC-11','UC-12','UC-13','UC-14','UC-15']){
  assert.ok(cases.includes(uc),'Missing business use case: '+uc);
}
console.log('Panacea documentation: '+expected.length+' files, local links, upstream attribution, requirements and use cases verified');
