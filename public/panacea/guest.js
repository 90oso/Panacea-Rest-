'use strict';
(() => {
  const cfg=window.PANACEA_GUEST||{items:[]};
  const $=id=>document.getElementById(id);
  const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const money=value=>new Intl.NumberFormat('es-PA',{style:'currency',currency:'USD'}).format(Number(value)||0);
  const items=Array.isArray(cfg.items)?cfg.items:[];
  const reveal=()=>document.querySelectorAll('.reveal:not(.in-view)').forEach(el=>el.classList.add('in-view'));

  function renderMenu(){
    const term=$('guestMenuSearch').value.toLocaleLowerCase('es').trim();
    const matched=items.filter(i=>String(i.name).toLocaleLowerCase('es').includes(term));
    $('guestMenuCards').innerHTML=matched.length?matched.map((item,index)=>
      '<article class="menu-card"><div class="menu-card-top"><span>SELECCIÓN '+String(index+1).padStart(2,'0')+'</span><i aria-hidden="true">✳</i></div>'+
      '<h3>'+escapeHtml(item.name)+'</h3><div class="menu-card-bottom"><strong>'+money(item.price)+'</strong><span>PRECIO DEL CATÁLOGO</span></div></article>'
    ).join(''):'<div class="empty-menu"><strong>'+ (items.length?'Sin coincidencias':'La carta se está preparando')+'</strong>'+
      '<p>'+ (items.length?'Prueba con otro término.':'Aún no hay productos con precio publicados en el catálogo local de TastyIgniter.')+'</p></div>';
  }

  function stamp(input){
    const d=new Date(input);const pad=n=>String(n).padStart(2,'0');
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());
  }
  function configureDate(){
    const input=document.querySelector('[name="reserved_at"]');
    const start=new Date(Date.now()+65*60*1000);start.setMinutes(Math.ceil(start.getMinutes()/15)*15,0,0);
    const end=new Date(Date.now()+60*24*60*60*1000);
    input.min=stamp(start);input.max=stamp(end);input.value=stamp(start);
  }
  function feedback(text,error=false){
    const box=$('bookingMessage');box.hidden=false;box.textContent=text;box.classList.toggle('error',error);
    box.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
  }
  async function book(event){
    event.preventDefault();
    const form=$('guestBookingForm'),btn=form.querySelector('button[type="submit"]');
    if(!form.reportValidity())return;
    btn.disabled=true;btn.textContent='Enviando solicitud…';
    $('bookingMessage').hidden=true;
    const fields=new FormData(form);
    try{
      const res=await fetch(cfg.bookingUrl,{
        method:'POST',credentials:'same-origin',
        headers:{'Content-Type':'application/json','Accept':'application/json','X-CSRF-TOKEN':cfg.csrf},
        body:JSON.stringify({
          guest_name:String(fields.get('guest_name')||'').trim(),
          email:String(fields.get('email')||'').trim(),
          party_size:Number(fields.get('party_size')),
          reserved_at:String(fields.get('reserved_at')||'').replace('T',' ')+':00',
          privacy_consent:fields.get('privacy_consent')==='1'
        })
      });
      let body={};try{body=await res.json()}catch(_){}
      if(!res.ok){
        const all=Object.values(body.errors||{}).flat();
        throw Error(all[0]||body.message||'No pudimos registrar la solicitud.');
      }
      feedback('Solicitud #'+body.request_id+' recibida correctamente. Está pendiente de confirmación por el restaurante; todavía no es una reserva confirmada.');
      form.reset();configureDate();
    }catch(error){
      feedback(error.message||'Error de conexión. Intenta nuevamente.',true);
    }finally{
      btn.disabled=false;btn.innerHTML='Enviar solicitud <span>↗</span>';
    }
  }

  function initMotion(){
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!reduce&&'IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');observer.unobserve(e.target);}});
      },{threshold:.12,rootMargin:'0px 0px -30px 0px'});
      document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
    }else reveal();
    const progress=$('readingProgress');
    let running=false;
    const onScroll=()=>{
      if(running)return;running=true;
      requestAnimationFrame(()=>{
        const full=document.documentElement.scrollHeight-window.innerHeight;
        progress.style.width=(full>0?Math.max(0,Math.min(100,window.scrollY/full*100)):0)+'%';
        running=false;
      });
    };
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  }

  $('guestMenuSearch').addEventListener('input',renderMenu);
  $('guestBookingForm').addEventListener('submit',book);
  renderMenu();configureDate();initMotion();
})();
