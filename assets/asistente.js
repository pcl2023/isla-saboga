/* Asistente de Isla Saboga. Un solo archivo para index.html y en.html.
   Config: <script src="assets/asistente.js" data-worker="https://saboga-ai....workers.dev/chat" defer></script>
   v2: botón redondo con globo de chat, aviso breve, sugerencias de inicio, no tapa la barra móvil. */
(function(){
  'use strict';
  var tag = document.currentScript || document.querySelector('script[data-worker]');
  var WORKER = (tag && tag.getAttribute('data-worker')) || '';
  if(!WORKER){ return; }

  // Inglés si la página es la inglesa o si el navegador no tiene el español entre sus idiomas
  // (un visitante alemán o francés en la página en español recibe el saludo en inglés).
  var LANGS = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || 'es'];
  var HAS_ES = false; for (var li = 0; li < LANGS.length; li++) { if (/^es\b/i.test(LANGS[li] || '')) { HAS_ES = true; break; } }
  var EN = /^en/i.test(document.documentElement.lang || 'es') || !HAS_ES;
  var T = EN ? {
    btn:'Ask our assistant', btnShort:'Chat', title:'Isla Saboga', sub:'Project assistant',
    hello:'Good day. I can answer your questions about the island, the titled parcels, the acquisition process and the turnkey development service. How may I help you?',
    chips:['Are the parcels titled?','How do I get to the island?','I would like to schedule a visit'],
    tip:'Questions about the island? Ask me here.',
    ph:'Write your question…', send:'Send',
    note:'AI-generated answers. Pricing, availability and binding terms are confirmed in writing by our team.',
    err:'The assistant is unavailable right now. You can write to us on <a href="https://wa.me/16159381935" target="_blank" rel="noopener">WhatsApp</a> or at <a href="mailto:sales@projectconsultingfirm.com">sales@projectconsultingfirm.com</a>.',
    close:'Close', closeTip:'Dismiss'
  } : {
    btn:'Pregunte al asistente', btnShort:'Chat', title:'Isla Saboga', sub:'Asistente del proyecto',
    hello:'Buen día. Puedo responder sus preguntas sobre la isla, las parcelas tituladas, el proceso de adquisición y el servicio de desarrollo llave en mano. ¿En qué puedo ayudarle?',
    chips:['¿Las parcelas están tituladas?','¿Cómo se llega a la isla?','Quiero agendar una visita'],
    tip:'¿Tiene preguntas sobre la isla? Escríbame aquí.',
    ph:'Escriba su consulta…', send:'Enviar',
    note:'Respuestas generadas con IA. Precios, disponibilidad y condiciones vinculantes se confirman por escrito por nuestro equipo.',
    err:'El asistente no está disponible en este momento. Puede escribirnos por <a href="https://wa.me/16159381935" target="_blank" rel="noopener">WhatsApp</a> o a <a href="mailto:sales@projectconsultingfirm.com">sales@projectconsultingfirm.com</a>.',
    close:'Cerrar', closeTip:'Descartar'
  };

  var ICON_CHAT = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke-width="2.6"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>';
  var ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  var F = 'var(--f-body,"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif)';
  var css = ''+
  /* Botón flotante: píldora con globo de chat en escritorio, círculo en móvil */
  '#sbga-btn{position:fixed;right:max(clamp(14px,2.4vw,28px),env(safe-area-inset-right,0px));bottom:calc(clamp(14px,2.4vw,28px) + env(safe-area-inset-bottom,0px));z-index:9000;'+
    'display:inline-flex;align-items:center;gap:.6rem;padding:.38rem 1.05rem .38rem .38rem;background:var(--deep,#0A1E20);color:var(--on-deep,#E6EEEA);'+
    'border:1px solid rgba(230,238,234,.14);border-radius:999px;font:500 .8rem/1 '+F+';letter-spacing:.01em;cursor:pointer;'+
    'box-shadow:0 10px 28px rgba(6,18,19,.32),0 2px 6px rgba(6,18,19,.18);transition:bottom .3s ease,opacity .25s,transform .25s,background .2s}'+
  '#sbga-btn:hover{background:var(--deep-2,#113A3B);transform:translateY(-1px)}'+
  '#sbga-btn:focus-visible{outline:2px solid var(--pick,#E2B26E);outline-offset:3px}'+
  '#sbga-btn .ico{position:relative;width:36px;height:36px;border-radius:50%;background:var(--lot,#5CC9BB);color:#0A1E20;display:grid;place-items:center;flex:none}'+
  '#sbga-btn .ico svg{width:19px;height:19px}'+
  '#sbga-btn .ico::after{content:"";position:absolute;inset:0;border-radius:50%;animation:sbgaP 2.6s ease-out 1.5s 3}'+
  '@keyframes sbgaP{0%{box-shadow:0 0 0 0 rgba(92,201,187,.6)}75%,100%{box-shadow:0 0 0 13px rgba(92,201,187,0)}}'+
  '#sbga-btn.up{bottom:calc(var(--sbga-up,76px) + env(safe-area-inset-bottom,0px))}'+
  '#sbga-btn.off,#sbga-tip.off{opacity:0;pointer-events:none;transform:translateY(8px)}'+
  '@media (max-width:560px){'+
    '#sbga-btn{padding:0;gap:0;background:none;border:0;box-shadow:none}'+
    '#sbga-btn:hover{background:none}'+
    '#sbga-btn .ico{width:54px;height:54px;box-shadow:0 10px 26px rgba(6,18,19,.34),0 2px 6px rgba(6,18,19,.2)}'+
    '#sbga-btn .ico svg{width:25px;height:25px}'+
    '#sbga-btn .sbga-txt{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'+
  '}'+
  /* Aviso breve, una vez por sesión */
  '#sbga-tip{position:fixed;z-index:9000;right:max(clamp(14px,2.4vw,28px),env(safe-area-inset-right,0px));max-width:min(250px,calc(100vw - 32px));'+
    'display:flex;align-items:flex-start;gap:.5rem;padding:.7rem .7rem .7rem .9rem;background:var(--paper,#EDF1EE);color:var(--ink,#0F2729);'+
    'border:1px solid var(--line,rgba(15,39,41,.14));border-radius:14px 14px 4px 14px;box-shadow:0 14px 36px rgba(6,18,19,.22);'+
    'font:400 .8rem/1.4 '+F+';cursor:pointer;transition:opacity .3s,transform .3s,bottom .3s ease}'+
  '#sbga-tip button{flex:none;background:none;border:0;color:var(--ink-2,#465D5B);width:22px;height:22px;margin:-.15rem -.15rem 0 0;border-radius:50%;display:grid;place-items:center;cursor:pointer;padding:0}'+
  '#sbga-tip button:hover{background:var(--paper-2,#E1E8E4);color:var(--ink,#0F2729)}'+
  '#sbga-tip button svg{width:13px;height:13px}'+
  /* Panel */
  '#sbga-panel{margin:0;padding:0;position:fixed;right:max(clamp(10px,2.4vw,28px),env(safe-area-inset-right,0px));bottom:calc(clamp(10px,2.4vw,28px) + env(safe-area-inset-bottom,0px));z-index:9001;'+
    'width:min(390px,calc(100vw - 20px));height:min(570px,calc(100dvh - 40px));display:none;flex-direction:column;overflow:hidden;'+
    'background:var(--paper,#EDF1EE);color:var(--ink,#0F2729);border:1px solid var(--line,rgba(15,39,41,.14));border-radius:16px;'+
    'box-shadow:0 24px 60px rgba(6,18,19,.34);font-family:'+F+';transform-origin:100% 100%}'+
  '#sbga-panel.open{display:flex;animation:sbgaIn .22s cubic-bezier(.2,.7,.2,1)}'+
  '@keyframes sbgaIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}'+
  '#sbga-head{display:flex;align-items:center;gap:.7rem;padding:.75rem .8rem .75rem .9rem;background:var(--deep,#0A1E20);color:var(--on-deep,#E6EEEA)}'+
  '#sbga-head .av{width:34px;height:34px;border-radius:50%;background:var(--lot,#5CC9BB);color:#0A1E20;display:grid;place-items:center;flex:none}'+
  '#sbga-head .av svg{width:18px;height:18px}'+
  '#sbga-head .who{flex:1;min-width:0}'+
  '#sbga-head .t{font-size:.9rem;font-weight:600;letter-spacing:.02em;line-height:1.2}'+
  '#sbga-head .s{display:flex;align-items:center;gap:.4rem;font-size:.68rem;color:var(--on-deep-2,#A3B9B4);letter-spacing:.03em;margin-top:.15rem}'+
  '#sbga-head .s i{width:6px;height:6px;border-radius:50%;background:var(--lot,#5CC9BB);display:inline-block}'+
  '#sbga-x{flex:none;width:32px;height:32px;border-radius:50%;background:none;border:0;color:var(--on-deep-2,#A3B9B4);display:grid;place-items:center;cursor:pointer;padding:0}'+
  '#sbga-x:hover{background:rgba(230,238,234,.1);color:var(--on-deep,#E6EEEA)}'+
  '#sbga-x svg{width:17px;height:17px}'+
  '#sbga-log{flex:1;overflow-y:auto;padding:1rem .9rem;display:flex;flex-direction:column;gap:.55rem;scroll-behavior:smooth;overscroll-behavior:contain}'+
  '.sbga-m{max-width:86%;padding:.6rem .8rem;font-size:.84rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;border-radius:14px}'+
  '.sbga-m.ai{align-self:flex-start;background:var(--paper-2,#E1E8E4);border-bottom-left-radius:4px}'+
  '.sbga-m.me{align-self:flex-end;background:var(--deep-2,#113A3B);color:var(--on-deep,#E6EEEA);border-bottom-right-radius:4px}'+
  '.sbga-m.err{align-self:flex-start;background:none;border:1px dashed var(--coast,rgba(15,39,41,.28));color:var(--ink-2,#465D5B);font-size:.78rem}'+
  '.sbga-m a{color:var(--lagoon,#0D6964)}.sbga-m.me a{color:var(--lot,#5CC9BB)}'+
  '.sbga-chips{display:flex;flex-direction:column;align-items:flex-start;gap:.4rem;margin-top:.2rem}'+
  '.sbga-chips button{font:500 .78rem/1.3 '+F+';color:var(--lagoon,#0D6964);background:transparent;border:1px solid currentColor;border-radius:999px;padding:.42rem .8rem;cursor:pointer;text-align:left}'+
  '.sbga-chips button:hover{background:var(--lagoon,#0D6964);color:var(--paper,#fff);border-color:var(--lagoon,#0D6964)}'+
  '#sbga-wait{align-self:flex-start;display:flex;gap:.28rem;padding:.75rem .85rem;background:var(--paper-2,#E1E8E4);border-radius:14px;border-bottom-left-radius:4px}'+
  '#sbga-wait i{width:6px;height:6px;border-radius:50%;background:var(--ink-2,#465D5B);animation:sbgaB 1.2s infinite}'+
  '#sbga-wait i:nth-child(2){animation-delay:.2s}#sbga-wait i:nth-child(3){animation-delay:.4s}'+
  '@keyframes sbgaB{0%,80%,100%{opacity:.25;transform:none}40%{opacity:1;transform:translateY(-2px)}}'+
  '#sbga-form{display:flex;align-items:flex-end;gap:.45rem;padding:.6rem .7rem;border-top:1px solid var(--line,rgba(15,39,41,.14))}'+
  '#sbga-in{flex:1;resize:none;border:1px solid var(--line,rgba(15,39,41,.14));background:var(--paper-2,#E1E8E4);color:var(--ink,#0F2729);'+
    'padding:.58rem .9rem;font:400 .84rem/1.4 '+F+';max-height:6em;border-radius:20px;min-height:40px}'+
  '#sbga-in:focus{outline:0;border-color:var(--lagoon,#0D6964)}'+
  '#sbga-go{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:var(--lagoon,#0D6964);color:var(--paper,#fff);display:grid;place-items:center;cursor:pointer;padding:0}'+
  '#sbga-go svg{width:18px;height:18px}'+
  '#sbga-go:hover{filter:brightness(1.12)}'+
  '#sbga-go:disabled{opacity:.45;cursor:default}'+
  '#sbga-note{padding:0 1rem .65rem;font-size:.6rem;line-height:1.4;letter-spacing:.01em;color:var(--ink-2,#465D5B)}'+
  '@media (max-width:560px){#sbga-panel{right:0;bottom:0;width:100vw;height:min(88dvh,640px);border-left:0;border-right:0;border-bottom:0;border-radius:16px 16px 0 0}}'+
  '@media (prefers-reduced-motion:reduce){#sbga-btn .ico::after{animation:none}#sbga-panel.open{animation:none}#sbga-wait i{animation:none;opacity:.6}}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id='sbga-btn'; btn.type='button'; btn.setAttribute('aria-haspopup','dialog'); btn.setAttribute('aria-label', T.btn);
  btn.innerHTML = '<span class="ico">'+ICON_CHAT+'</span><span class="sbga-txt">'+T.btn+'</span>';

  var panel = document.createElement('div');
  panel.id='sbga-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label',T.title+' · '+T.sub);
  panel.innerHTML =
    '<div id="sbga-head"><span class="av">'+ICON_CHAT+'</span><div class="who"><div class="t">'+T.title+'</div><div class="s"><i aria-hidden="true"></i>'+T.sub+'</div></div>'+
    '<button id="sbga-x" type="button" aria-label="'+T.close+'">'+ICON_X+'</button></div>'+
    '<div id="sbga-log" aria-live="polite"></div>'+
    '<form id="sbga-form"><textarea id="sbga-in" rows="1" maxlength="1200" placeholder="'+T.ph+'" aria-label="'+T.ph+'"></textarea>'+
    '<button id="sbga-go" type="submit" aria-label="'+T.send+'">'+ICON_SEND+'</button></form>'+
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

  function chips(){
    var c=document.createElement('div'); c.className='sbga-chips';
    T.chips.forEach(function(q){
      var b=document.createElement('button'); b.type='button'; b.textContent=q;
      b.addEventListener('click', function(){ input.value=q; c.remove(); form.requestSubmit(); });
      c.appendChild(b);
    });
    log.appendChild(c);
  }

  function render(){
    log.innerHTML='';
    add('assistant', T.hello);
    history.forEach(function(m){ add(m.role, m.content); });
    if(!history.length){ chips(); }
  }

  /* Aviso breve: aparece una vez por sesión a los 7 s si el visitante no ha abierto el chat */
  var tip=null, tipTimer=null;
  function tipOff(remember){
    if(tip){ tip.remove(); tip=null; }
    clearTimeout(tipTimer);
    if(remember){ try{ sessionStorage.setItem('sbga-tip','1'); }catch(e){} }
  }
  function placeTip(){
    if(!tip){ return; }
    var r=btn.getBoundingClientRect();
    tip.style.bottom = (window.innerHeight - r.top + 10) + 'px';
  }
  function showTip(){
    var seen=false; try{ seen = sessionStorage.getItem('sbga-tip')==='1'; }catch(e){}
    if(seen || open || history.length){ return; }
    tip=document.createElement('div'); tip.id='sbga-tip'; tip.setAttribute('role','status');
    tip.innerHTML='<span>'+T.tip+'</span><button type="button" aria-label="'+T.closeTip+'">'+ICON_X+'</button>';
    tip.addEventListener('click', function(e){
      if(e.target.closest('button')){ e.stopPropagation(); tipOff(true); return; }
      tipOff(true); toggle(true);
    });
    document.body.appendChild(tip); placeTip(); sync();
    tipTimer=setTimeout(function(){ tipOff(true); }, 12000);
  }
  setTimeout(showTip, 7000);

  /* No tapar la barra móvil ni el menú: se observa la página y se ajusta */
  var mbar=document.getElementById('mbar'), menu=document.getElementById('menu');
  function sync(){
    var up = !!(mbar && mbar.classList.contains('on') && getComputedStyle(mbar).display!=='none');
    if(up){ btn.style.setProperty('--sbga-up', (mbar.getBoundingClientRect().height + 14) + 'px'); }
    btn.classList.toggle('up', up);
    var hide = !!(menu && !menu.hidden);
    btn.classList.toggle('off', hide);
    if(tip){ tip.classList.toggle('off', hide); setTimeout(placeTip, 320); }
  }
  if('MutationObserver' in window){
    var mo=new MutationObserver(sync);
    if(mbar){ mo.observe(mbar,{attributes:true,attributeFilter:['class']}); }
    if(menu){ mo.observe(menu,{attributes:true,attributeFilter:['hidden']}); }
  }
  window.addEventListener('resize', sync, {passive:true});
  sync();

  var open=false;
  function toggle(v){
    open = (v!==undefined)? v : !open;
    panel.classList.toggle('open', open);
    btn.style.display = open ? 'none' : '';
    if(open){ tipOff(true); render(); setTimeout(function(){ input.focus(); },50); }
    else { btn.focus(); }
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
    var c=log.querySelector('.sbga-chips'); if(c){ c.remove(); }
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
