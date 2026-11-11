/* Música de fondo de Isla Saboga.
   Los navegadores no dejan sonar audio hasta que el visitante toca, hace clic o pulsa
   una tecla; la música arranca en ese primer gesto, con fundido y a volumen bajo.
   El bucle se reproduce con Web Audio (sin corte en la costura) y un filtro muy lento
   cambia el color del sonido en cada vuelta. Botón turquesa en la cabecera (o flotante en celular); si el visitante la
   silencia, el sitio lo recuerda. Se calla al abrir el film y al cambiar de pestaña.
   En iPhone respeta el interruptor de silencio del teléfono. */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC || !document.querySelector) { return; }

  var SRC = 'assets/musica-fondo.mp3';
  var LOOP_START = 0.5, LOOP_END = 35.0;  // el archivo es periódico entre estos puntos
  var VOL = 0.42;                          // nivel de fondo (el film suena unos 8 dB por encima)
  var KEY = 'saboga-musica';
  var T = {
    es: ['Activar la música', 'Silenciar la música'],
    en: ['Turn music on', 'Mute music'],
    it: ['Attiva la musica', 'Disattiva la musica'],
    fr: ['Activer la musique', 'Couper la musique'],
    de: ['Musik einschalten', 'Musik ausschalten'],
    zh: ['开启音乐', '关闭音乐'],
    ar: ['تشغيل الموسيقى', 'إيقاف الموسيقى']
  };
  var txt = T[(document.documentElement.lang || 'es').slice(0, 2)] || T.en;
  var ICON_ON = 'M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5.5a9 9 0 0 1 0 13';
  var ICON_OFF = 'M11 5 6 9H2v6h4l5 4V5zM22 9l-6 6M16 9l6 6';

  function getPref() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setPref(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  var conn = navigator.connection || {};
  var auto = getPref() !== 'off' && !conn.saveData;

  var ctx = null, gain = null, buffer = null, source = null, loading = null;
  var on = false;           // lo que quiere el visitante
  var film = document.getElementById('film');

  /* Botón turquesa (el color del asistente). En computadora va en la cabecera, pegado al
     margen derecho; si ese margen es angosto, junto a «Agendar visita». En celular y
     tableta flota abajo a la izquierda, a la altura del asistente. Al arrancar la música
     aparece unos segundos la leyenda «Silenciar la música» junto al botón. */
  var css = '.musica{position:fixed;left:max(clamp(14px,2.4vw,28px),env(safe-area-inset-left,0px));bottom:calc(clamp(14px,2.4vw,28px) + var(--mus-dy,0px) + env(safe-area-inset-bottom,0px));z-index:8990;width:44px;height:44px;padding:0;display:grid;place-items:center;border-radius:50%;border:1.5px solid var(--lot,#5CC9BB);background:rgba(6,18,19,.82);color:var(--lot,#5CC9BB);cursor:pointer;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);box-shadow:0 6px 22px rgba(0,0,0,.22);transition:bottom .35s ease,opacity .3s ease,transform .3s ease,background-color .25s,color .25s}' +
    '.musica[aria-pressed="true"]{background:var(--lot,#5CC9BB);color:#0A1E20}' +
    '.musica:focus-visible{outline:2px solid var(--pick,#E2B26E);outline-offset:3px}' +
    '.musica svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}' +
    '.musica.up{bottom:calc(var(--mus-up,76px) + var(--mus-dy,0px) + env(safe-area-inset-bottom,0px))}' +
    '.musica.off{opacity:0;pointer-events:none;transform:translateY(8px)}' +
    '.top .musica.borde,.top .musica.arriba{box-shadow:none;-webkit-backdrop-filter:none;backdrop-filter:none;background:rgba(6,18,19,.35);opacity:1;transform:none}' +
    '.top .musica.borde[aria-pressed="true"],.top .musica.arriba[aria-pressed="true"]{background:var(--lot,#5CC9BB)}' +
    '.top .musica.borde{position:absolute;left:auto;right:auto;bottom:auto;inset-inline-end:max(20px,env(safe-area-inset-right,0px));top:calc(env(safe-area-inset-top,0px) + 15px);width:42px;height:42px}' +
    '.top .musica.arriba{position:relative;left:auto;bottom:auto;flex:none;width:40px;height:40px;margin-inline-start:-.8rem}' +
    '.musica .mtip{position:absolute;left:calc(100% + 10px);top:50%;z-index:1;white-space:nowrap;pointer-events:none;background:rgba(6,18,19,.94);color:#EEF3F0;font:600 .78rem/1.2 var(--f-body,system-ui,sans-serif);letter-spacing:.01em;padding:.5rem .8rem;border-radius:999px;box-shadow:0 6px 20px rgba(0,0,0,.28);opacity:0;transform:translate(-4px,-50%);transition:opacity .3s ease,transform .3s ease}' +
    '.musica .mtip.show{opacity:1;transform:translate(0,-50%)}' +
    '.top .musica.borde .mtip,.top .musica.arriba .mtip{left:auto;top:calc(100% + 10px);inset-inline-end:0;transform:translateY(-4px)}' +
    '.top .musica.borde .mtip.show,.top .musica.arriba .mtip.show{transform:none}' +
    '@media (hover:hover){.musica:hover{filter:brightness(1.1)}.musica:hover .mtip{opacity:1;transform:translate(0,-50%)}.top .musica.borde:hover .mtip,.top .musica.arriba:hover .mtip{transform:none}}' +
    '@media print{.musica{display:none}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'musica';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + ICON_OFF + '"/></svg><span class="mtip" aria-hidden="true"></span>';
  var path = btn.querySelector('path');
  var tip = btn.querySelector('.mtip');

  // Dónde va el botón según el espacio que deja la cabecera (se mide, no se adivina).
  var topBar = document.querySelector('.top');
  var cta = document.querySelector('.top .wrap > .btn');
  var rtl = getComputedStyle(document.documentElement).direction === 'rtl';
  function mount() {
    if (btn.parentNode) { btn.parentNode.removeChild(btn); }
    var mode = 'flota';
    if (topBar && cta && window.innerWidth >= 1120 && getComputedStyle(cta).display !== 'none') {
      var r = cta.getBoundingClientRect();
      var free = rtl ? r.left : document.documentElement.clientWidth - r.right;
      mode = free >= 84 ? 'borde' : 'arriba';
    }
    if (mode === 'borde') { topBar.appendChild(btn); }
    else if (mode === 'arriba') { cta.parentNode.insertBefore(btn, cta.nextSibling); }
    else { document.body.appendChild(btn); }
    btn.classList.toggle('borde', mode === 'borde');
    btn.classList.toggle('arriba', mode === 'arriba');
  }
  mount();

  // Flotante: misma altura que el botón del asistente; sube sobre la barra móvil y se oculta con el menú.
  var mbar = document.getElementById('mbar'), menu = document.getElementById('menu');
  function place() {
    if (btn.classList.contains('borde') || btn.classList.contains('arriba')) { btn.classList.remove('up', 'off'); return; }
    var chat = document.getElementById('sbga-btn');
    if (chat) {
      var h = chat.getBoundingClientRect().height;
      if (h) { btn.style.setProperty('--mus-dy', Math.max(0, (h - 44) / 2) + 'px'); }
    }
    var up = !!(mbar && mbar.classList.contains('on') && getComputedStyle(mbar).display !== 'none');
    if (up) { btn.style.setProperty('--mus-up', (mbar.getBoundingClientRect().height + 14) + 'px'); }
    btn.classList.toggle('up', up);
    btn.classList.toggle('off', !!(menu && !menu.hidden));
  }
  if (window.MutationObserver) {
    var mo = new MutationObserver(place);
    if (mbar) { mo.observe(mbar, { attributes: true, attributeFilter: ['class'] }); }
    if (menu) { mo.observe(menu, { attributes: true, attributeFilter: ['hidden'] }); }
  }
  var raf = 0;
  function relayout() { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { mount(); place(); }); }
  window.addEventListener('resize', relayout);
  window.addEventListener('load', relayout);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(relayout); }
  place();

  var tipTimer = null;
  function showTip(ms) {
    clearTimeout(tipTimer);
    tip.classList.add('show');
    tipTimer = setTimeout(function () { tip.classList.remove('show'); }, ms);
  }
  function hideTip() { clearTimeout(tipTimer); tip.classList.remove('show'); }

  function render() {
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? txt[1] : txt[0]);
    tip.textContent = on ? txt[1] : txt[0];
    path.setAttribute('d', on ? ICON_ON : ICON_OFF);
  }
  render();

  /* Audio */
  function blocked() {
    return document.hidden || (film && (film.open || film.hasAttribute('open')));
  }

  function unlock() {
    // Debe ocurrir dentro del gesto del visitante.
    if (!ctx) {
      try { ctx = new AC(); } catch (e) { return; }
      gain = ctx.createGain();
      gain.gain.value = 0;
      var filt = ctx.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 5800;
      filt.Q.value = 0.6;
      var lfo = ctx.createOscillator();
      var depth = ctx.createGain();
      lfo.frequency.value = 1 / 83;   // una vuelta cada 83 s, nunca coincide con el bucle de 34,5 s
      depth.gain.value = 4000;
      lfo.connect(depth);
      depth.connect(filt.frequency);
      lfo.start();
      filt.connect(gain);
      gain.connect(ctx.destination);
      gain._in = filt;
    }
    if (ctx.state !== 'running' && ctx.resume) { ctx.resume().then(check, function () {}); }
    // Desbloqueo para Safari antiguo: un instante de silencio dentro del gesto.
    try {
      var s = ctx.createBufferSource();
      s.buffer = ctx.createBuffer(1, 1, 22050);
      s.connect(ctx.destination);
      s.start(0);
    } catch (e) {}
    load();
    check();
  }

  function load() {
    if (buffer || loading || !ctx) { return loading; }
    loading = fetch(SRC).then(function (r) {
      if (!r.ok) { throw new Error('audio ' + r.status); }
      return r.arrayBuffer();
    }).then(function (data) {
      return new Promise(function (ok, fail) { ctx.decodeAudioData(data, ok, fail); });
    }).then(function (b) {
      buffer = b;
      apply();
    }).catch(function () { loading = null; });
    return loading;
  }

  function start() {
    if (source || !buffer) { return; }
    source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.loopStart = LOOP_START;
    source.loopEnd = Math.min(LOOP_END, buffer.duration - 0.05);
    source.connect(gain._in);
    source.start(0, LOOP_START);
  }

  function ramp(to, seconds) {
    var g = gain.gain, now = ctx.currentTime;
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(to, now + seconds);
  }

  var pauseTimer = null;
  function apply() {
    if (!ctx || !gain) { return; }
    clearTimeout(pauseTimer);
    if (on && !blocked()) {
      if (ctx.state !== 'running' && ctx.resume) {
        ctx.resume().then(function () { check(); if (ctx.state !== 'running') { arm(); } }, arm);
      }
      if (!buffer) { load(); return; }
      start();
      ramp(VOL, gain.gain.value < 0.05 ? 2.5 : 1.2);
    } else {
      ramp(0, 0.7);
      if (document.hidden) {
        pauseTimer = setTimeout(function () { if (document.hidden && ctx.suspend) { ctx.suspend(); } }, 800);
      }
    }
  }

  /* Primer gesto del visitante */
  var EVENTS = ['pointerdown', 'pointerup', 'touchend', 'keydown', 'click'];
  var armed = false;
  function onGesture(e) {
    if (btn.contains(e.target)) { return; }
    if (e.type === 'keydown' && (e.key === 'Escape' || e.ctrlKey || e.metaKey || e.altKey)) { return; }
    if (!auto && !on) { disarm(); return; }
    var first = !on;
    on = true;
    render();
    unlock();
    apply();
    // La leyenda no se muestra si el aviso de idioma ocupa ese mismo rincón de la cabecera.
    var aviso = document.querySelector('#sbga-lang.on');
    var enCabecera = btn.classList.contains('borde') || btn.classList.contains('arriba');
    if (first && !blocked() && !(aviso && enCabecera)) { showTip(6000); }
  }
  function arm() {
    if (armed) { return; }
    armed = true;
    for (var i = 0; i < EVENTS.length; i++) { window.addEventListener(EVENTS[i], onGesture, { capture: true, passive: true }); }
  }
  function disarm() {
    if (!armed) { return; }
    armed = false;
    for (var i = 0; i < EVENTS.length; i++) { window.removeEventListener(EVENTS[i], onGesture, { capture: true, passive: true }); }
  }
  function check() {
    if (ctx && ctx.state === 'running' && on) { disarm(); }
  }

  btn.addEventListener('click', function () {
    hideTip();
    on = !on;
    auto = on;
    setPref(on ? 'on' : 'off');
    render();
    if (on) { unlock(); } else { disarm(); }
    apply();
  });

  if (auto) { arm(); }

  // Film abierto o cerrado, pestaña oculta o visible.
  if (film && window.MutationObserver) {
    new MutationObserver(apply).observe(film, { attributes: true, attributeFilter: ['open'] });
  }
  var fv = document.getElementById('filmVideo');
  if (fv) { fv.addEventListener('play', apply); }
  document.addEventListener('visibilitychange', function () {
    apply();
    if (!document.hidden && on && ctx && ctx.state !== 'running') { arm(); }
  });

  // Descarga anticipada del archivo en conexiones buenas, sin decodificar ni sonar.
  if (auto && !conn.saveData && !/(^|-)2g$/.test(conn.effectiveType || '')) {
    window.addEventListener('load', function () {
      setTimeout(function () { try { fetch(SRC, { cache: 'force-cache' }).catch(function () {}); } catch (e) {} }, 3500);
    });
  }
})();
