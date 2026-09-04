/* ===========================================================================
   RICCO Construtora — motor de movimento
   Escrito contra a especificacao `sistema-de-movimento.md` da skill
   (a pasta motion/ de la e de geracao anterior e nao responde aos atributos
   do doc). Zero dependencia externa.

   Nada na pagina depende de animacao para existir: o gate html[data-motion]
   e removido se o motor nao puder rodar, e um timer de panico libera tudo.

   Cenas: reveals em 3 camadas, split de titulo por palavra, GALERIA
   HORIZONTAL TRAVADA (pin + scrub), parallax de fundo, contadores, tilt,
   cursor-bolha, cortina do diptico, janelas que acendem, lerp de roda.
   =========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (REDUCE.matches) {
    html.removeAttribute('data-motion');
    lightStatics();
    return;
  }

  /* Rede de seguranca: se algo estourar antes dos observers subirem, um timer
     revela tudo. Conteudo nunca fica invisivel por falha de script. */
  var panic = setTimeout(function () { html.removeAttribute('data-motion'); }, 3200);

  var HEADER_OFF = 80;
  var DESK = function () { return window.innerWidth >= 901 && window.innerHeight >= 560; };

  /* Estados finais para quando o movimento esta desligado. */
  function lightStatics() {
    var j = document.querySelector('.janelas');
    if (j) j.setAttribute('data-on', 'true');
    document.querySelectorAll('.grow-x').forEach(function (e) { e.setAttribute('data-seen', 'true'); });
  }

  /* ======================================================== 1. SPLIT DE TITULO
     h1/h2 de TEXTO PURO viram palavra por palavra. Titulos com <strong>,
     <br> ou icone dentro sao ignorados de proposito (nao quebrar marcacao).
     &nbsp; e preservado: quebramos so em espaco normal. */
  function splitTitles() {
    document.querySelectorAll('h1, h2').forEach(function (h) {
      if (h.hasAttribute('data-nosplit') || h.children.length) return;
      var txt = h.textContent;
      if (!txt || !txt.trim()) return;

      var words = txt.trim().split(/ +/);
      h.textContent = '';
      words.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'rw';
        var it = document.createElement('i');
        it.textContent = w;
        it.style.transitionDelay = (i * 42) + 'ms';
        span.appendChild(it);
        h.appendChild(span);
        if (i < words.length - 1) h.appendChild(document.createTextNode(' '));
      });

      /* O bloco em volta so faz fade: o texto e que carrega o movimento. */
      var block = h.closest('[data-reveal]');
      if (block) block.setAttribute('data-reveal', 'soft');
    });
  }

  /* ============================================================= 2. REVEALS
     Stagger automatico: irmaos diretos com [data-reveal] no mesmo pai
     recebem indice x 80ms, teto de 6 (480ms). Nao escreva delay na mao. */
  function prepStagger() {
    var parents = new Set();
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      if (el.parentElement) parents.add(el.parentElement);
    });
    parents.forEach(function (p) {
      var sibs = Array.prototype.filter.call(p.children, function (c) {
        return c.hasAttribute && c.hasAttribute('data-reveal');
      });
      if (sibs.length < 2) return;
      sibs.forEach(function (c, i) {
        if (c.style.transitionDelay) return;
        c.style.transitionDelay = (Math.min(i, 6) * 80) + 'ms';
      });
    });
  }

  function show(el, animate) {
    if (el.getAttribute('data-in') === 'true') return;
    if (!animate) {
      el.style.transition = 'none';
      el.querySelectorAll('.rw i').forEach(function (k) { k.style.transition = 'none'; });
    }
    el.setAttribute('data-in', 'true');
    el.setAttribute('data-seen', 'true');
  }

  var io = null;
  var TARGETS = '[data-reveal],[data-curtain]';

  function mountReveals() {
    var targets = document.querySelectorAll(TARGETS);
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { show(el, false); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target, true); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* Camada 1: primeira tela. IntersectionObserver nao dispara em documento
     oculto e rAF nao roda em aba de fundo, entao usamos tambem um timer. */
  function firstScreen() {
    var vh = window.innerHeight;
    document.querySelectorAll(TARGETS).forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.height > 0 && r.top < vh * 0.94 && r.bottom > 0) {
        show(el, true);
        if (io) io.unobserve(el);
      }
    });
  }

  /* Camada 3: saltos (ancora, hash, arraste da barra). Sem isso um bloco
     "pulado" ficaria invisivel para sempre. */
  function flushJumped() {
    var lim = window.innerHeight * 0.3;
    document.querySelectorAll(TARGETS).forEach(function (el) {
      if (el.getAttribute('data-in') === 'true') return;
      var r = el.getBoundingClientRect();
      if (r.height > 0 && r.bottom < lim) {
        show(el, false);
        if (io) io.unobserve(el);
      }
    });
  }

  /* ================================ 3. GALERIA HORIZONTAL TRAVADA (pin+scrub)
     A trilha anda no eixo X conforme o progresso da rolagem, entao seis
     obras grandes cabem em UMA tela. Altura da cena = 100vh + span, e o
     span e recalculado em todo resize (armadilha 6 do doc).

     Regra de ouro: o wrapper sticky NAO pode ter `position` inline, senao o
     estilo inline vence a stylesheet e o pin morre em silencio. O
     position:sticky vive no CSS, atras de [data-pin="on"]. */
  var gal = null;

  function measureGal() {
    var scene = document.querySelector('.gal-scene');
    if (!scene) { gal = null; return; }
    var sticky = scene.querySelector('.gal-sticky');
    var track = scene.querySelector('.gal-track');
    var vp = scene.querySelector('.gal-viewport');
    var rule = scene.querySelector('.gal-rule i');
    if (!sticky || !track || !vp) { gal = null; return; }

    if (!DESK()) {
      scene.removeAttribute('data-pin');
      scene.style.height = '';
      track.style.transform = '';
      gal = null;
      return;
    }

    scene.setAttribute('data-pin', 'on');
    track.style.transform = '';                 // mede sem deslocamento
    var span = Math.max(0, track.scrollWidth - vp.clientWidth);
    scene.style.height = (window.innerHeight + span) + 'px';
    gal = { scene: scene, track: track, rule: rule, span: span };

    /* valida o pin de verdade, em vez de confiar na altura da cena */
    if (getComputedStyle(sticky).position !== 'sticky') {
      console.warn('[motion] pin da galeria nao aplicou: position =',
                   getComputedStyle(sticky).position);
    }
  }

  function scrubGal() {
    if (!gal || !gal.span) return;
    var r = gal.scene.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, -r.top / gal.span));
    gal.track.style.transform = 'translate3d(' + (-gal.span * p).toFixed(1) + 'px,0,0)';
    if (gal.rule) gal.rule.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }

  /* ============================================ 4. PARALLAX, CONTADORES, CENAS */
  var pbgs = [], counters = [], grows = [], janelas = null;

  function collect() {
    pbgs = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    grows = Array.prototype.slice.call(document.querySelectorAll('.grow-x'));
    janelas = document.querySelector('.janelas');

    /* stagger dos 9 modulos de cada janela, via custom property */
    document.querySelectorAll('.janela').forEach(function (j, ji) {
      j.querySelectorAll('.mod i').forEach(function (m, mi) {
        m.style.setProperty('--k', mi);
        m.style.setProperty('--d', (0.28 + ji * 0.2) + 's');
      });
    });
  }

  function parallax() {
    var vh = window.innerHeight;
    pbgs.forEach(function (bg) {
      var host = bg.parentElement || bg;
      var r = host.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;   /* -1 .. 1 */
      bg.style.transform = 'translate3d(0,' + (p * 0.10 * r.height).toFixed(1) + 'px,0)';
    });
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runCounter(el) {
    if (el.getAttribute('data-done') === 'true') return;
    el.setAttribute('data-done', 'true');
    var goal = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var t0 = performance.now(), dur = 1600;

    /* Rede de seguranca: requestAnimationFrame para de rodar em aba de fundo
       e sob throttling, e o contador congelaria um passo antes do valor
       real. Este timer garante o numero final independente do rAF. */
    setTimeout(function () { el.textContent = goal + suffix; }, dur + 140);

    (function step(now) {
      var t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(goal * easeOutCubic(t)) + suffix;
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = goal + suffix;
    })(t0);
  }

  function sceneScan() {
    var vh = window.innerHeight;
    parallax();
    scrubGal();

    counters.forEach(function (el, i) {
      if (el.getAttribute('data-done') === 'true') return;
      if (el.getBoundingClientRect().top < vh * 0.88) {
        setTimeout(function () { runCounter(el); }, i * 180);
      }
    });

    /* observer proprio para os filetes que ficam FORA de [data-reveal] */
    grows.forEach(function (el) {
      if (el.getAttribute('data-seen') === 'true') return;
      if (el.getBoundingClientRect().top < vh * 0.9) el.setAttribute('data-seen', 'true');
    });

    if (janelas && janelas.getAttribute('data-on') !== 'true') {
      if (janelas.getBoundingClientRect().top < vh * 0.72) janelas.setAttribute('data-on', 'true');
    }
  }

  /* ==================================================== 5. HEADER + LEITURA */
  var header = document.querySelector('.site-header');
  var prog = document.querySelector('.progress');
  var lastY = 0;

  function chrome() {
    var y = window.scrollY || window.pageYOffset;
    if (header) {
      header.setAttribute('data-solid', y > 40 ? 'true' : 'false');
      var overlay = document.body.style.overflow === 'hidden';
      if (!overlay && y > 260) {
        if (y > lastY + 4) header.setAttribute('data-hidden', 'true');
        else if (y < lastY - 4) header.setAttribute('data-hidden', 'false');
      } else if (y <= 260) {
        header.setAttribute('data-hidden', 'false');
      }
    }
    if (prog) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    lastY = y;
  }

  /* ================================================= 6. TILT + CURSOR-BOLHA
     Tilt de no maximo 2.4 graus, e nunca antes do reveal do card. */
  function tilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.obra').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (card.getAttribute('data-in') !== 'true') return;
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -2.4;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 2.4;
        card.style.transform = 'perspective(900px) rotateX(' + rx.toFixed(2) +
                               'deg) rotateY(' + ry.toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }

  function zoomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var vp = document.querySelector('.gal-viewport');
    var cur = document.querySelector('.zoomcur');
    if (!vp || !cur) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false, raf = 0;

    function loop() {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cur.style.translate = cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px';
      if (on || Math.abs(tx - cx) > 0.5) raf = requestAnimationFrame(loop);
      else raf = 0;
    }
    vp.addEventListener('pointerenter', function (e) {
      on = true; tx = cx = e.clientX; ty = cy = e.clientY;
      cur.classList.add('on');
      if (!raf) raf = requestAnimationFrame(loop);
    });
    vp.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; });
    vp.addEventListener('pointerleave', function () { on = false; cur.classList.remove('on'); });
  }

  /* ========================================================= 7. SCROLL SUAVE
     Lerp proprio, sem biblioteca. Usa o scroll real da janela, entao
     position:sticky (o pin da galeria), :target e a barra do navegador
     continuam funcionando. So em ponteiro fino; no touch fica o nativo. */
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)');
  var lerpOn = FINE.matches;
  var target = window.scrollY || 0, current = target, running = false;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function scrollableUnder(node) {
    var n = node, i = 0;
    while (n && n !== document.body && i < 8) {
      if (n.scrollHeight - n.clientHeight > 6) {
        var ov = getComputedStyle(n).overflowY;
        if (ov === 'auto' || ov === 'scroll') return true;
      }
      n = n.parentElement; i++;
    }
    return false;
  }

  function loop() {
    current += (target - current) * 0.10;
    if (Math.abs(target - current) < 0.4) { current = target; running = false; }
    window.scrollTo({ top: current, behavior: 'instant' });
    if (running) requestAnimationFrame(loop);
  }

  function kick() { if (!running) { running = true; requestAnimationFrame(loop); } }

  function onWheel(e) {
    if (!lerpOn) return;
    if (document.body.style.overflow === 'hidden') return;    /* overlay aberto */
    if (e.ctrlKey) return;                                     /* zoom */
    if (scrollableUnder(e.target)) return;
    e.preventDefault();
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
    kick();
  }

  function onKey(e) {
    if (!lerpOn) return;
    /* Se um componente da pagina ja tratou a tecla, o motor nao rola. Sem
       isto o tablist das frentes navegava E arrastava a pagina junto, porque
       o handler do botao roda antes deste (bubble) mas nao impedia o scroll. */
    if (e.defaultPrevented) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (t && t.isContentEditable) return;
    if (t && t.closest && t.closest('[role="tablist"],[role="tab"]')) return;
    if (document.body.style.overflow === 'hidden') return;
    var vh = window.innerHeight, d = null;
    switch (e.key) {
      case 'PageDown': d = vh * 0.86; break;
      case 'PageUp': d = -vh * 0.86; break;
      case ' ': d = e.shiftKey ? -vh * 0.86 : vh * 0.86; break;
      case 'ArrowDown': d = 90; break;
      case 'ArrowUp': d = -90; break;
      case 'Home': target = 0; kick(); e.preventDefault(); return;
      case 'End': target = maxScroll(); kick(); e.preventDefault(); return;
      default: return;
    }
    e.preventDefault();
    target = Math.max(0, Math.min(maxScroll(), target + d));
    kick();
  }

  /* Ancoras ficam com o motor (por isso html{scroll-behavior:auto} no CSS).
     Misturar os dois deixa a rolagem elastica. */
  function goTo(y, delay) {
    y = Math.max(0, Math.min(maxScroll(), y));
    setTimeout(function () {
      if (lerpOn) { target = y; kick(); }
      else window.scrollTo({ top: y, behavior: 'smooth' });
      setTimeout(flushJumped, 60);
    }, delay || 0);
  }

  function anchors() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var dest = document.querySelector(id);
      if (!dest) return;
      e.preventDefault();
      var fromDrawer = !!a.closest('.drawer');
      if (fromDrawer && window.RICCO && window.RICCO.closeDrawer) window.RICCO.closeDrawer();
      var y = dest.getBoundingClientRect().top + (window.scrollY || 0) - HEADER_OFF;
      goTo(y, fromDrawer ? 420 : 80);
      history.replaceState(null, '', id);
    });
  }

  /* ==================================================== 8. SCROLLSPY (nav) */
  function spy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
    if (!links.length) return function () {};
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    return function () {
      var mid = window.innerHeight * 0.34, best = -1;
      secs.forEach(function (s, i) {
        if (!s) return;
        var r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) best = i;
      });
      links.forEach(function (a, i) {
        if (i === best) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
  }

  /* ================================================================ 9. BOOT */
  function boot() {
    splitTitles();
    prepStagger();
    collect();
    measureGal();
    mountReveals();
    tilt();
    zoomCursor();

    var spyTick = spy();

    function tickAll() { chrome(); sceneScan(); spyTick(); }

    /* Camada 1 em duas vias (rAF nao roda em aba de fundo). */
    requestAnimationFrame(function () { firstScreen(); tickAll(); });
    setTimeout(function () { firstScreen(); tickAll(); }, 140);
    /* imagens de fundo mudam a altura da cena: remede quando tudo carregar */
    window.addEventListener('load', function () { measureGal(); tickAll(); });

    var queued = false;
    /* O listener de scroll nao pode reescrever target enquanto o lerp roda,
       senao o proprio loop se cancela no primeiro frame. */
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (!running) { target = window.scrollY || 0; current = target; }
        tickAll(); flushJumped();
      });
    }, { passive: true });

    var rz = null;
    window.addEventListener('resize', function () {
      lerpOn = FINE.matches;
      target = current = window.scrollY || 0;
      clearTimeout(rz);
      rz = setTimeout(function () {
        measureGal();
        /* blocos escondidos por media query nao intersectam enquanto
           display:none, e o observer nunca dispara. Sem este flush, quem
           redimensiona desktop -> mobile ficaria com bloco preso invisivel. */
        firstScreen(); flushJumped(); tickAll();
      }, 120);
    });

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    anchors();

    if (location.hash) {
      var d = document.querySelector(location.hash);
      if (d) goTo(d.getBoundingClientRect().top + (window.scrollY || 0) - HEADER_OFF, 220);
    }

    clearTimeout(panic);
    window.RICCO = window.RICCO || {};
    window.RICCO.goTo = goTo;
    window.RICCO.flush = flushJumped;
    window.RICCO.remeasure = function () { measureGal(); sceneScan(); };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
