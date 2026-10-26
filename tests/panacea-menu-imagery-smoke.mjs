import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const mediaSource=readFileSync('public/panacea/menu-imagery.js','utf8');
const operator=readFileSync('resources/views/panacea/studio.blade.php','utf8');
const guest=readFileSync('resources/views/panacea/guest.blade.php','utf8');
const night=readFileSync('public/panacea/studio-night.css','utf8');
const catalog=readFileSync('public/panacea/studio-menu.css','utf8');
const php=readFileSync('app/Services/Panacea/MenuPresentation.php','utf8');
const studioJs=readFileSync('public/panacea/studio.js','utf8');

assert.match(guest, /menu-imagery\.js/, 'Guest page must load shared image library');
assert.match(operator, /menu-imagery\.js/, 'Operator page must load shared image library');
assert.match(operator, /studio-night\.css/, 'Night mode must have its final theme override');
assert.match(operator, /studio-menu\.css/, 'Operator menu must load photographic cards');
assert.match(php, /Igniter\\Cart\\Models\\Menu/, 'Image service must use native TastyIgniter Menu model');
assert.match(php, /->thumb/, 'Image service must consult native item attachment');
assert.match(php, /getThumb/, 'Image service must use native thumbnail URL');
assert.match(php, /'image_source' => \$url \? 'native'/, 'Source must distinguish real from illustrative images');
assert.match(studioJs, /data-menu-photo/, 'Operator menu must render image elements');
assert.match(catalog, /object-fit:cover/, 'Operator photos should keep a consistent crop');
assert.match(night, /:root\.dark/, 'Night design must be scoped to dark mode');
assert.match(night, /\.dark \.surface,/, 'Night design must override light card backgrounds');
assert.match(night, /\.dark \.activity-row b,/, 'Night design must override dashboard heading colors');

const fakeDocument={addEventListener(){}};
const fakeWindow={};
vm.runInNewContext(mediaSource,{window:fakeWindow,document:fakeDocument}, {filename:'menu-imagery.js'});
const images=fakeWindow.PanaceaMenuVisuals;
assert.ok(images);
const native=images.resolve({id:22,name:'Pizza artesanal',image:'/storage/media/real-pizza.jpg'});
assert.equal(native.native,true);
assert.equal(native.src,'/storage/media/real-pizza.jpg');
assert.equal(native.badge,'FOTO DEL PRODUCTO');
const pizza=images.resolve({id:22,name:'Pizza artesanal',image:null});
const salad=images.resolve({id:25,name:'Ensalada fresca',image:null});
const coffee=images.resolve({id:42,name:'Café de la casa',image:null});
assert.equal(pizza.native,false);
assert.match(pizza.src,/^https:\/\/images\.unsplash\.com\/photo-/);
assert.notEqual(pizza.src,salad.src,'Food category should select different illustrative photos');
assert.notEqual(pizza.src,coffee.src,'Coffee should not reuse pizza illustration');
assert.equal(pizza.badge,'IMAGEN ILUSTRATIVA');
assert.match(pizza.alt,/ilustrativa/i);
const rejected=images.resolve({id:22,name:'Pizza artesanal',image:'javascript:alert(1)'});
assert.equal(rejected.native,false);
assert.equal(rejected.src,pizza.src);
assert.equal(images.safeNative('//attacker.example/photo.jpg'),null);
assert.equal(images.safeNative('data:image/svg+xml;base64,XXX'),null);
assert.equal(images.safeNative('https://example.com/real.jpg'),'https://example.com/real.jpg');

function luminance(hex){
  const channels=hex.slice(1).match(/../g).map(c=>parseInt(c,16)/255)
    .map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4);
  return 0.2126*channels[0]+0.7152*channels[1]+0.0722*channels[2];
}
function contrast(a,b){
  const x=luminance(a),y=luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
assert.ok(contrast('#f0f4e9','#20372c')>=7,'Night primary text must pass AAA');
assert.ok(contrast('#bdcfbe','#20372c')>=4.5,'Night secondary text must pass AA');
assert.ok(contrast('#c6d8c7','#112c21')>=4.5,'Night navigation must pass AA');
console.log('Panacea menu/night: native photos, labeled illustrations, URL safety, card markup and contrast OK');
