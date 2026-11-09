/* Carga bajo demanda de Isla Saboga. Un solo archivo para las siete páginas.
   1. Fotos de la galería, de usos y de la banda Visitar: se descargan cuando el visitante se acerca (600 px antes),
      así no compiten con la portada en celulares. En el HTML llevan data-src y data-srcset en lugar de src y srcset.
   2. Fotografía aérea del mapa de la sección 03: se descarga al acercarse al mapa; en celular usa la versión de 1200 px.
   3. Mapa de la sección 06 (De la capital a Saboga): botones Ruta / Satélite / 3D. La vista satelital de Google Maps
      solo se carga cuando el visitante la pide; 3D abre Google Earth en otra pestaña. */
(function(){
  'use strict';
  var lang = (document.documentElement.lang || 'es').slice(0, 2).toLowerCase();

  /* 1. Fotos diferidas */
  var fotos = [].slice.call(document.querySelectorAll('img[data-src]'));
  var carga = function(im){
    if (im.getAttribute('data-srcset')) { im.setAttribute('srcset', im.getAttribute('data-srcset')); im.removeAttribute('data-srcset'); }
    im.setAttribute('src', im.getAttribute('data-src')); im.removeAttribute('data-src');
  };
  if ('IntersectionObserver' in window) {
    var iof = new IntersectionObserver(function(es){
      es.forEach(function(e){ if (e.isIntersecting) { carga(e.target); iof.unobserve(e.target); } });
    }, { rootMargin: '600px 0px' });
    fotos.forEach(function(im){ iof.observe(im); });
  } else { fotos.forEach(carga); }

  /* 2. Fotografía aérea diferida */
  var img = document.querySelector('#mapa image[data-href]');
  if (img) {
    var put = function(){
      if (img.getAttribute('href')) { return; }
      var m = window.innerWidth <= 720 && img.getAttribute('data-href-m');
      img.setAttribute('href', m || img.getAttribute('data-href'));
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(es){
        if (es.some(function(e){ return e.isIntersecting; })) { put(); io.disconnect(); }
      }, { rootMargin: '900px 0px' });
      io.observe(img.ownerSVGElement || img);
    } else { put(); }
  }

  /* 3. Vista satelital y Google Earth */
  var T = {
    es: { route:'Ruta', sat:'Satélite', group:'Tipo de mapa', earth:'Ver en 3D · Google Earth', cap:'Vista satelital · Saboga y Contadora', title:'Mapa satelital interactivo de Isla Saboga e Isla Contadora', gl:'es' },
    en: { route:'Route', sat:'Satellite', group:'Map type', earth:'View in 3D · Google Earth', cap:'Satellite view · Saboga and Contadora', title:'Interactive satellite map of Saboga Island and Contadora Island', gl:'en' },
    it: { route:'Percorso', sat:'Satellite', group:'Tipo di mappa', earth:'Vedi in 3D · Google Earth', cap:'Vista satellitare · Saboga e Contadora', title:'Mappa satellitare interattiva di Isla Saboga e Isla Contadora', gl:'it' },
    fr: { route:'Itinéraire', sat:'Satellite', group:'Type de carte', earth:'Voir en 3D · Google Earth', cap:'Vue satellite · Saboga et Contadora', title:'Carte satellite interactive des îles Saboga et Contadora', gl:'fr' },
    de: { route:'Route', sat:'Satellit', group:'Kartentyp', earth:'In 3D ansehen · Google Earth', cap:'Satellitenansicht · Saboga und Contadora', title:'Interaktive Satellitenkarte der Inseln Saboga und Contadora', gl:'de' },
    zh: { route:'路线', sat:'卫星', group:'地图类型', earth:'3D 查看 · Google 地球', cap:'卫星视图 · 萨博加岛与孔塔多拉岛', title:'萨博加岛与孔塔多拉岛互动卫星地图', gl:'zh-CN' },
    ar: { route:'المسار', sat:'القمر الصناعي', group:'نوع الخريطة', earth:'عرض ثلاثي الأبعاد · Google Earth', cap:'صورة بالقمر الصناعي · سابوغا وكونتادورا', title:'خريطة تفاعلية بالقمر الصناعي لجزيرتي سابوغا وكونتادورا', gl:'ar' }
  };
  var L = T[lang] || T.es;
  var fig = document.querySelector('#llegar figure.region');
  if (!fig) { return; }
  var svg = fig.querySelector('svg');
  var cap = fig.querySelector('figcaption');
  if (!svg || !cap) { return; }

  var EMBED = 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d26000!2d-79.056!3d8.621!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1s' + L.gl + '!2spa!4v1762700000000!5m2!1s' + L.gl + '!2spa';
  var EARTH = 'https://earth.google.com/web/@8.6165,-79.0630,10a,7000d,35y,15h,58t,0r';

  var css = '' +
    '#llegar figure.region .mv-tabs{position:absolute;top:.6rem;right:.6rem;z-index:2;display:flex;padding:3px;gap:2px;background:rgba(237,241,238,.94);border:1px solid var(--line,rgba(15,39,41,.14));border-radius:999px;box-shadow:0 1px 6px rgba(10,30,32,.12)}' +
    '#llegar figure.region .mv-tabs button{appearance:none;border:0;background:transparent;color:var(--ink,#0F2729);font:600 .66rem/1 var(--f-mono,sans-serif);letter-spacing:.08em;text-transform:uppercase;padding:.5rem .8rem;border-radius:999px;cursor:pointer;min-height:32px}' +
    '#llegar figure.region .mv-tabs button[aria-pressed="true"]{background:var(--ink,#0F2729);color:var(--paper,#EDF1EE)}' +
    '#llegar figure.region .mv-tabs .mv-earth{display:inline-flex;align-items:center;gap:.3rem;color:var(--lagoon,#0D6964);font:600 .66rem/1 var(--f-mono,sans-serif);letter-spacing:.08em;text-decoration:none;padding:.5rem .75rem;border-radius:999px;min-height:32px;box-sizing:border-box;border-inline-start:1px solid var(--line,rgba(15,39,41,.14))}' +
    '#llegar figure.region .mv-tabs .mv-earth:hover{background:rgba(13,105,100,.1)}' +
    '#llegar figure.region .mv-earth svg{width:10px;height:10px;flex:none}' +
    'html[dir=rtl] #llegar figure.region .mv-earth svg{transform:scaleX(-1)}' +
    '#llegar figure.region .mv-tabs button:focus-visible,#llegar figure.region .mv-earth:focus-visible{outline:2px solid var(--pick,#E2B26E);outline-offset:2px}' +
    '#llegar figure.region .mv-sat{display:block;width:100%;aspect-ratio:3/2;border:0;background:#0D2A2D}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var capText = cap;
  var routeCap = cap.textContent;

  /* Botones Ruta / Satélite y enlace 3D a Google Earth (se abre en otra pestaña). Siempre arriba a la derecha, también en árabe: la geografía del mapa no se invierte. */
  var tabs = document.createElement('div'); tabs.className = 'mv-tabs'; tabs.setAttribute('role', 'group'); tabs.setAttribute('aria-label', L.group);
  var bR = document.createElement('button'); bR.type = 'button'; bR.textContent = L.route; bR.setAttribute('aria-pressed', 'true');
  var bS = document.createElement('button'); bS.type = 'button'; bS.textContent = L.sat; bS.setAttribute('aria-pressed', 'false');
  var earth = document.createElement('a');
  earth.className = 'mv-earth'; earth.href = EARTH; earth.target = '_blank'; earth.rel = 'noopener';
  earth.title = L.earth; earth.setAttribute('aria-label', L.earth);
  earth.innerHTML = '3D<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2h6v6M10 2 2 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  earth.addEventListener('click', function(){ try { if (window.goatcounter && window.goatcounter.count) { window.goatcounter.count({ path: 'google-earth-3d', title: 'Google Earth 3D abierto', event: true }); } } catch (e) {} });
  tabs.appendChild(bR); tabs.appendChild(bS); tabs.appendChild(earth);
  fig.insertBefore(tabs, fig.firstChild);

  var frame = null;
  function show(sat){
    if (sat && !frame) {
      frame = document.createElement('iframe');
      frame.className = 'mv-sat'; frame.src = EMBED; frame.title = L.title;
      frame.setAttribute('allowfullscreen', ''); frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      fig.insertBefore(frame, svg);
      try { if (window.goatcounter && window.goatcounter.count) { window.goatcounter.count({ path: 'mapa-satelite', title: 'Mapa satelital abierto', event: true }); } } catch (e) {}
    }
    if (frame) { frame.style.display = sat ? '' : 'none'; }
    svg.style.display = sat ? 'none' : '';
    bR.setAttribute('aria-pressed', String(!sat)); bS.setAttribute('aria-pressed', String(sat));
    capText.textContent = sat ? L.cap : routeCap;
  }
  bR.addEventListener('click', function(){ show(false); });
  bS.addEventListener('click', function(){ show(true); });
})();
