/* Sugerencia de idioma. Un solo archivo para index.html y en.html.
   En la página en español: si el navegador no tiene el español entre sus idiomas, ofrece la versión en inglés.
   En la página en inglés: si el idioma principal del navegador es español, ofrece la versión en español.
   No redirige: solo muestra un aviso discreto que se puede cerrar. La elección se recuerda en este navegador. */
(function(){
  'use strict';
  var KEY = 'sbga-lang-choice';
  var pageEn = /^en/i.test(document.documentElement.lang || 'es');
  var langs = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language || ''];
  var hasEs = false;
  for (var i = 0; i < langs.length; i++) { if (/^es\b/i.test(langs[i] || '')) { hasEs = true; break; } }
  var firstEs = /^es\b/i.test(langs[0] || '');

  var offer = pageEn ? firstEs : !hasEs;
  if (!offer) return;
  try { if (localStorage.getItem(KEY)) return; } catch (e) {}

  var T = pageEn
    ? { msg: 'Este sitio también está en español.', go: 'Ver en español', href: './', close: 'Cerrar', lang: 'es' }
    : { msg: 'This site is also available in English.', go: 'View in English', href: 'en.html', close: 'Close', lang: 'en' };

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
    box.id = 'sbga-lang'; box.setAttribute('role', 'region'); box.setAttribute('lang', T.lang); box.setAttribute('aria-label', T.msg);
    box.innerHTML = '<p>' + T.msg + '</p><a href="' + T.href + '" hreflang="' + T.lang + '">' + T.go + '</a>' +
      '<button type="button" aria-label="' + T.close + '"><svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>';
    var top = document.querySelector('.top');
    var place = function(){ box.style.top = ((top ? top.getBoundingClientRect().height : 64) + 10) + 'px'; };
    place(); window.addEventListener('resize', place);
    var a = box.querySelector('a');
    a.addEventListener('click', function(){ remember(T.lang); a.href = T.href + (location.hash || ''); });
    box.querySelector('button').addEventListener('click', function(){
      remember(pageEn ? 'en' : 'es'); box.classList.remove('on'); setTimeout(function(){ box.remove(); }, 400);
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
