/* Asistente de Isla Saboga. Un solo archivo para index.html y en.html.
   Config: <script src="assets/asistente.js" data-worker="https://saboga-ai....workers.dev" defer></script> */
(function(){
  'use strict';
  var tag = document.currentScript || document.querySelector('script[data-worker]');
  var WORKER = (tag && tag.getAttribute('data-worker')) || '';
  if(!WORKER){ return; }

  var EN = /^en/i.test(document.documentElement.lang || 'es');
  var T = EN ? {
    btn:'Assistant', title:'Isla Saboga', sub:'Project assistant',
    hello:'Good day. I can answer your questions about the island, the titled parcels, the acquisition process and the turnkey development service. How may I help you?',
    ph:'Write your question…', send:'Send',
    note:'AI-generated answers. Pricing, availability and binding terms are confirmed in writing by our team.',
    err:'The assistant is unavailable right now. You can write to us on <a href="https://wa.me/16159381935" target="_blank" rel="noopener">WhatsApp</a> or at <a href="mailto:sales@projectconsultingfirm.com">sales@projectconsultingfirm.com</a>.',
    close:'Close'
  } : {
    btn:'Asistente', title:'Isla Saboga', sub:'Asistente del proyecto',
    hello:'Buen día. Puedo responder sus preguntas sobre la isla, las parcelas tituladas, el proceso de adquisición y el servicio de desarrollo llave en mano. ¿En qué puedo ayudarle?',
    ph:'Escriba su consulta…', send:'Enviar',
    note:'Respuestas generadas con IA. Precios, disponibilidad y condiciones vinculantes se confirman por escrito por nuestro equipo.',
    err:'El asistente no está disponible en este momento. Puede escribirnos por <a href="https://wa.me/16159381935" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:sales@projectconsultingfirm.com">sales@projectconsultingfirm.com</a>.',
    close:'Cerrar'
  };

  var css = ''+
  '#sbga-btn{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(14px,3vw,28px);z-index:9000;display:inline-flex;align-items:center;gap:.55em;'+
    'padding:.78em 1.15em;background:var(--deep,#0A1E20);color:var(--on-deep,#E6EEEA);border:1px solid var(--line,rgba(15,39,41,.14));border-radius:0;'+
    'font:500 .88rem var(--f-body,"Schibsted Grotesk",sans-serif);letter-spacing:.04em;cursor:pointer;box-shadow:0 10px 30px rgba(6,18,19,.28)}'+
  '#sbga-btn:hover{background:var(--deep-2,#113A3B)}'+
  '#sbga-btn .dot{width:.5em;height:.5em;background:var(--lot,#5CC9BB);display:inline-block}'+
  '#sbga-panel{margin:0;padding:0;position:fixed;right:clamp(10px,3vw,28px);bottom:clamp(10px,3vw,28px);z-index:9001;width:min(400px,calc(100vw - 20px));'+
    'height:min(580px,calc(100dvh - 40px));display:none;flex-direction:column;background:var(--paper,#EDF1EE);color:var(--ink,#0F2729);'+
    'border:1px solid var(--line,rgba(15,39,41,.14));box-shadow:0 24px 60px rgba(6,18,19,.35);font-family:var(--f-body,"Schibsted Grotesk",sans-serif)}'+
  '#sbga-panel.open{display:flex}'+
  '#sbga-head{display:flex;align-items:center;justify-content:space-between;gap:.8em;padding:.9em 1em;background:var(--deep,#0A1E20);color:var(--on-deep,#E6EEEA)}'+
  '#sbga-head .t{font-size:.92rem;font-weight:600;letter-spacing:.05em}'+
  '#sbga-head .s{font-size:.7rem;color:var(--on-deep-2,#A3B9B4);letter-spacing:.08em;text-transform:uppercase;margin-top:.15em}'+
  '#sbga-x{background:none;border:0;color:var(--on-deep-2,#A3B9B4);font-size:1.15rem;line-height:1;cursor:pointer;padding:.3em .4em}'+
  '#sbga-x:hover{color:var(--on-deep,#E6EEEA)}'+
  '#sbga-log{flex:1;overflow-y:auto;padding:1em;display:flex;flex-direction:column;gap:.7em;scroll-behavior:smooth}'+
  '.sbga-m{max-width:88%;padding:.65em .85em;font-size:.86rem;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}'+
  '.sbga-m.ai{align-self:flex-start;background:var(--paper-2,#E1E8E4);border:1px solid var(--line,rgba(15,39,41,.14))}'+
  '.sbga-m.me{align-self:flex-end;background:var(--deep,#0A1E20);color:var(--on-deep,#E6EEEA)}'+
  '.sbga-m.err{align-self:flex-start;background:none;border:1px dashed var(--coast,rgba(15,39,41,.28));color:var(--ink-2,#465D5B);font-size:.8rem}'+
  '.sbga-m a{color:var(--lagoon,#0D6964)}.sbga-m.me a{color:var(--lot,#5CC9BB)}'+
  '#sbga-wait{align-self:flex-start;padding:.65em .85em;background:var(--paper-2,#E1E8E4);border:1px solid var(--line,rgba(15,39,41,.14))}'+
  '#sbga-wait i{display:inline-block;width:.4em;height:.4em;background:var(--ink-2,#465D5B);margin-right:.25em;animation:sbgaB 1.2s infinite}'+
  '#sbga-wait i:nth-child(2){animation-delay:.2s}#sbga-wait i:nth-child(3){animation-delay:.4s;margin-right:0}'+
  '@keyframes sbgaB{0%,80%,100%{opacity:.25}40%{opacity:1}}'+
  '#sbga-form{display:flex;gap:.5em;padding:.8em;border-top:1px solid var(--line,rgba(15,39,41,.14))}'+
  '#sbga-in{flex:1;resize:none;border:1px solid var(--line,rgba(15,39,41,.14));background:var(--paper-2,#E1E8E4);color:var(--ink,#0F2729);'+
    'padding:.6em .7em;font:400 .86rem var(--f-body,"Schibsted Grotesk",sans-serif);line-height:1.4;max-height:6em;border-radius:0}'+
  '#sbga-in:focus{outline:1px solid var(--lagoon,#0D6964)}'+
  '#sbga-go{border:0;background:var(--lagoon,#0D6964);color:#fff;padding:.6em 1em;font:500 .82rem var(--f-body,sans-serif);letter-spacing:.04em;cursor:pointer;border-radius:0}'+
  '#sbga-go:disabled{opacity:.5;cursor:default}'+
  '#sbga-note{padding:.45em 1em .7em;font-size:.62rem;letter-spacing:.03em;color:var(--ink-2,#465D5B)}'+
  '@media (max-width:560px){#sbga-panel{right:0;bottom:0;width:100vw;height:min(88dvh,640px);border-left:0;border-right:0;border-bottom:0}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id='sbga-btn'; btn.type='button'; btn.setAttribute('aria-haspopup','dialog');
  btn.innerHTML = '<span class="dot" aria-hidden="true"></span>'+T.btn;

  var panel = document.createElement('div');
  panel.id='sbga-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label',T.title+' · '+T.sub);
  panel.innerHTML =
    '<div id="sbga-head"><div><div class="t">'+T.title+'</div><div class="s">'+T.sub+'</div></div>'+
    '<button id="sbga-x" type="button" aria-label="'+T.close+'">×</button></div>'+
    '<div id="sbga-log" aria-live="polite"></div>'+
    '<form id="sbga-form"><textarea id="sbga-in" rows="1" maxlength="1200" placeholder="'+T.ph+'"></textarea>'+
    '<button id="sbga-go" type="submit">'+T.send+'</button></form>'+
    '<div id="sbga-note">'+T.note+'</div>';

  document.body.appendChild(btn); document.body.appendChild(panel);

  var log = panel.querySelector('#sbga-log'), input = panel.querySelector('#sbga-in'),
      go = panel.querySelector('#sbga-go'), form = panel.querySelector('#sbga-form');

  var history = [];
  try{ var saved = sessionStorage.getItem('sbga-h'); if(saved){ history = JSON.parse(saved)||[]; } }catch(e){}

  function persist(){ try{ sessionStorage.setItem('sbga-h', JSON.stringify(history.slice(-20))); }catch(e){} }
  function add(role, text, isErr){
    var d=document.createElement('div');
    d.className='sbga-m '+(isErr?'err':(role==='user'?'me':'ai'));
    if(isErr){ d.innerHTML=text; } else { d.textContent=text; }
    log.appendChild(d); log.scrollTop=log.scrollHeight; return d;
  }
  function waitOn(){ var w=document.createElement('div'); w.id='sbga-wait'; w.innerHTML='<i></i><i></i><i></i>'; log.appendChild(w); log.scrollTop=log.scrollHeight; }
  function waitOff(){ var w=document.getElementById('sbga-wait'); if(w){ w.remove(); } }

  function render(){
    log.innerHTML='';
    add('assistant', T.hello);
    history.forEach(function(m){ add(m.role, m.content); });
  }

  var open=false;
  function toggle(v){
    open = (v!==undefined)? v : !open;
    panel.classList.toggle('open', open);
    btn.style.display = open ? 'none' : '';
    if(open){ render(); setTimeout(function(){ input.focus(); },50); }
  }
  btn.addEventListener('click', function(){ toggle(true); });
  panel.querySelector('#sbga-x').addEventListener('click', function(){ toggle(false); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape' && open){ toggle(false); } });

  input.addEventListener('input', function(){ input.style.height='auto'; input.style.height=Math.min(input.scrollHeight,96)+'px'; });
  input.addEventListener('keydown', function(e){ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); form.requestSubmit(); } });

  var busy=false;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var q = input.value.trim();
    if(!q || busy){ return; }
    busy=true; go.disabled=true;
    input.value=''; input.style.height='auto';
    history.push({role:'user', content:q}); persist();
    add('user', q); waitOn();

    fetch(WORKER, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ messages: history.slice(-16), lang: EN?'en':'es', page: location.pathname })
    })
    .then(function(r){ if(!r.ok){ throw new Error('http '+r.status); } return r.json(); })
    .then(function(j){
      var a = j.reply || j.text || j.answer || j.message ||
              (j.content && j.content[0] && j.content[0].text) ||
              (typeof j.content==='string' ? j.content : '');
      if(!a){ throw new Error('empty'); }
      history.push({role:'assistant', content:a}); persist();
      waitOff(); add('assistant', a);
    })
    .catch(function(){ waitOff(); add('assistant', T.err, true); })
    .finally(function(){ busy=false; go.disabled=false; input.focus(); });
  });
})();
