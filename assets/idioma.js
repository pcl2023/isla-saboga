/* Idiomas de Isla Saboga. Un solo archivo para las siete páginas (es, en, it, fr, de, zh, ar).
   1. Selector de idioma de la cabecera: navega a la página elegida y conserva el ancla; en pantallas estrechas muestra el código corto.
   2. Aviso discreto: si el idioma principal del navegador es uno de los siete y no coincide con el de la página, ofrece esa versión.
      No redirige. La elección se recuerda en este navegador. */
(function(){
  'use strict';
  var KEY = 'sbga-lang-choice';
  var PAGES = { es: './', en: 'en.html', it: 'it.html', fr: 'fr.html', de: 'de.html', zh: 'zh.html', ar: 'ar.html' };
  var MSGS = {
    es: { msg:'Este sitio también está en español.', go:'Ver en español', close:'Cerrar' },
    en: { msg:'This site is also available in English.', go:'View in English', close:'Close' },
    it: { msg:'Questo sito è disponibile anche in italiano.', go:'Vedi in italiano', close:'Chiudi' },
    fr: { msg:'Ce site existe aussi en français.', go:'Voir en français', close:'Fermer' },
    de: { msg:'Diese Website gibt es auch auf Deutsch.', go:'Auf Deutsch ansehen', close:'Schließen' },
    zh: { msg:'本网站另有中文版。', go:'查看中文版', close:'关闭' },
    ar: { msg:'هذا الموقع متاح أيضاً باللغة العربية.', go:'عرض النسخة العربية', close:'إغلاق' }
  };
  var page = (document.documentElement.lang || 'es').slice(0, 2).toLowerCase();
  if (!PAGES[page]) { page = 'es'; }

  /* 1. Selector */
  var sel = document.getElementById('langSel');
  if (sel) {
    var mq = window.matchMedia('(max-width:860px)');
    var relabel = function(){
      for (var i = 0; i < sel.options.length; i++) {
        var o = sel.options[i];
        if (!o.getAttribute('data-long')) { o.setAttribute('data-long', o.textContent); }
        o.textContent = mq.matches ? (o.getAttribute('data-short') || o.getAttribute('data-long')) : o.getAttribute('data-long');
      }
    };
    relabel();
    if (mq.addEventListener) { mq.addEventListener('change', relabel); } else if (mq.addListener) { mq.addListener(relabel); }
    sel.addEventListener('change', function(){
      var href = sel.value;
      var code = 'es';
      for (var c in PAGES) { if (PAGES[c] === href) { code = c; } }
      try { localStorage.setItem(KEY, code); } catch (e) {}
      location.href = href + (location.hash || '');
    });
  }

  /* 2. Aviso */
  var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
  var first = ((langs[0] || '').slice(0, 2)).toLowerCase();
  if (!PAGES[first] || first === page) { return; }
  try { if (localStorage.getItem(KEY)) { return; } } catch (e) {}
  var T = MSGS[first];
  if (!T) { return; }
  var rtl = first === 'ar';

  function remember(v){ try { localStorage.setItem(KEY, v); } catch (e) {} }

  var css = '' +
    '#sbga-lang{position:fixed;z-index:40;right:max(clamp(14px,2.4vw,28px),env(safe-area-inset-right,0px));' +
      'display:flex;align-items:center;gap:.75rem;max-width:min(420px,calc(100vw - 28px));padding:.55rem .55rem .55rem .9rem;' +
      'background:var(--deep,#0A1E20);color:var(--on-deep,#E6EEEA);border:1px solid rgba(230,238,234,.14);border-left:2px solid var(--sand,#9A6A30);' +
      'border-radius:var(--radius,6px);box-shadow:0 10px 30px rgba(6,18,19,.28);font:400 .84rem/1.3 var(--f-body,"Schibsted Grotesk","Helvetica Neue",Arial,sans-serif);' +
      'opacity:0;transform:translateY(-6px);transition:opacity .35s ease,transform .35s ease}' +
    '#sbga-lang.on{opacity:1;transform:none}' +
    '#sbga-lang p{margin:0}' +
    '#sbga-lang a{flex:none;color:var(--deep,#0A1E20);background:var(--on-deep,#E6EEEA);text-decoration:none;font-weight:600;font-size:.78rem;' +
      'letter-spacing:.01em;padding:.45rem .7rem;border-radius:calc(var(--radius,6px) - 2px)}' +
    '#sbga-lang a:hover{background:#fff}' +
    '#sbga-lang button{flex:none;display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:none;color:inherit;opacity:.7;cursor:pointer}' +
    '#sbga-lang button:hover{opacity:1;background:rgba(230,238,234,.08)}' +
    '#sbga-lang a:focus-visible,#sbga-lang button:focus-visible{outline:2px solid var(--sand,#9A6A30);outline-offset:2px}' +
    '@media (max-width:560px){#sbga-lang{left:max(14px,env(safe-area-inset-left,0px));right:max(14px,env(safe-area-inset-right,0px));max-width:none}#sbga-lang p{flex:1}}' +
    '@media (prefers-reduced-motion:reduce){#sbga-lang{transition:none}}';

  function show(){
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div');
    box.id = 'sbga-lang'; box.setAttribute('role', 'region'); box.setAttribute('lang', first); box.setAttribute('aria-label', T.msg);
    box.setAttribute('dir', rtl ? 'rtl' : 'ltr');
    box.innerHTML = '<p>' + T.msg + '</p><a href="' + PAGES[first] + '" hreflang="' + first + '">' + T.go + '</a>' +
      '<button type="button" aria-label="' + T.close + '"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    var top = document.querySelector('.top');
    var place = function(){ box.style.top = ((top ? top.getBoundingClientRect().height : 64) + 10) + 'px'; };
    place(); window.addEventListener('resize', place);
    var a = box.querySelector('a');
    a.addEventListener('click', function(){ remember(first); a.href = PAGES[first] + (location.hash || ''); });
    box.querySelector('button').addEventListener('click', function(){
      remember(page); box.classList.remove('on'); setTimeout(function(){ box.remove(); }, 400);
    });
    // Al bajar más allá de la portada se retira sin recordar la decisión: vuelve a ofrecerse en la próxima visita.
    var onScroll = function(){
      if (window.scrollY > window.innerHeight * 0.8) {
        window.removeEventListener('scroll', onScroll); box.classList.remove('on'); setTimeout(function(){ box.remove(); }, 400);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.body.appendChild(box);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ box.classList.add('on'); }); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(show, 900); });
  else setTimeout(show, 900);
})();
