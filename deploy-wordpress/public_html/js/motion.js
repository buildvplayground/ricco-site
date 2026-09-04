/* ===========================================================================
   RICCO Construtora — motor de movimento
   Escrito contra ../../..//skills/gerar-frontend/sistema-de-movimento.md
   Zero dependencia externa. Nada na pagina depende de animacao para existir:
   o gate html[data-motion] e removido se o motor nao puder rodar.
   =========================================================================== */
(function () {
  'use strict';

  var html = document.documentElement;
  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* Se o usuario pediu menos movimento, desliga o motor inteiro e libera o
     conteudo. O CSS ja neutraliza os estados iniciais, mas tirar o gate
     garante que nada fique preso invisivel. */
  if (REDUCE.matches) {
    html.removeAttribute('data-motion');
    return;
  }

  /* Rede de seguranca: se algo estourar antes dos observers subirem, um timer
     revela tudo. Conteudo nunca fica invisivel por falha de script. */
  var panic = setTimeout(function () { html.removeAttribute('data-motion'); }, 3200);

  var HEADER_OFF = 84;

  /* ======================================================== 1. SPLIT DE TITULO
     h1/h2 de TEXTO PURO viram palavra por palavra. Titulos com <strong>,
     <br> ou icone dentro sao ignorados de proposito (nao quebrar marcacao).
     &nbsp; ( ) e preservado: quebramos so em espaco normal. */
  function splitTitles() {
    var nodes = document.querySelectorAll('h1, h2');
    Array.prototype.forEach.call(nodes, function (h) {
      if (h.hasAttribute('data-nosplit')) return;
      if (h.children.length) return;                    // tem markup dentro
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
     Stagger automatico: irmaos diretos com [data-reveal] no mesmo pai recebem
     indice x 80ms, teto de 6 (480ms). Nao escreva delay na mao. */
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
      var kids = el.querySelectorAll('.rw i');
      Array.prototype.forEach.call(kids, function (k) { k.style.transition = 'none'; });
    }
    el.setAttribute('data-in', 'true');
    el.setAttribute('data-seen', 'true');
  }

  var io = null;
  function mountReveals() {
    var targets = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (el) { show(el, false); });
      return;
    }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { show(e.target, true); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* Camada 1: primeira tela. IntersectionObserver nao dispara em documento
     oculto e rAF nao roda em aba de fundo, entao usamos tambem um timer. */
  function firstScreen() {
    var vh = window.innerHeight;
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh * 0.94 && r.bottom > 0) {
        show(el, true);
        if (io) io.unobserve(el);
      }
    });
  }

  /* Camada 3: saltos (ancora, hash, arraste da barra). Sem isso, um bloco
     "pulado" ficaria invisivel para sempre. */
  function flushJumped() {
    var lim = window.innerHeight * 0.3;
    document.querySelectorAll('[data-reveal]:not([data-in="true"])').forEach(function (el) {
      if (el.getBoundingClientRect().bottom < lim) {
        show(el, false);
        if (io) io.unobserve(el);
      }
    });
  }

  /* ================================================ 3. CENAS POR SCROLL
     Parallax das faixas (<= 0.12), contadores, filetes que crescem,
     coluna do CTA e modulos de janela que acendem. */
  var bands = [], counters = [], grows = [], pav = null;

  function collectScenes() {
    bands = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));
    grows = Array.prototype.slice.call(document.querySelectorAll('.grow-x'));
    pav = document.querySelector('.pav');
  }

  function parallax() {
    var vh = window.innerHeight;
    bands.forEach(function (band) {
      var media = band.querySelector('.band-media');
      if (!media) return;
      var r = band.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh;     // -1 .. 1
      media.style.transform = 'translate3d(0,' + (p * 0.10 * r.height).toFixed(1) + 'px,0)';
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
       e sob throttling, e o contador congelaria um passo antes do valor real.
       Este timer garante o numero final independente do rAF. */
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

    counters.forEach(function (el, i) {
      if (el.getAttribute('data-done') === 'true') return;
      if (el.getBoundingClientRect().top < vh * 0.86) {
        setTimeout(function () { runCounter(el); }, i * 180);
      }
    });

    /* observer proprio para os filetes que ficam FORA de [data-reveal] */
    grows.forEach(function (el) {
      if (el.getAttribute('data-seen') === 'true') return;
      if (el.getBoundingClientRect().top < vh * 0.9) el.setAttribute('data-seen', 'true');
    });

    if (pav && pav.getAttribute('data-on') !== 'true') {
      if (pav.getBoundingClientRect().top < vh * 0.78) pav.setAttribute('data-on', 'true');
    }
  }

  /* ==================================================== 4. HEADER + LEITURA */
  var header = document.querySelector('.site-header');
  var prog = document.querySelector('.progress');
  var lastY = 0;

  function chrome() {
    var y = window.scrollY || window.pageYOffset;
    if (header) {
      header.setAttribute('data-solid', y > 40 ? 'true' : 'false');
      var overlay = document.body.style.overflow === 'hidden';
      if (!overlay && y > 260) {
        header.setAttribute('data-hidden', y > lastY + 4 ? 'true' : (y < lastY - 4 ? 'false' : header.getAttribute('data-hidden') || 'false'));
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

  /* ========================================================= 5. SCROLL SUAVE
     Lerp proprio, ~40 linhas, sem biblioteca. Usa o scroll real da janela,
     entao position:sticky, :target e a barra do navegador continuam valendo.
     So em ponteiro fino: no touch fica o momentum nativo. */
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)');
  var lerpOn = FINE.matches;
  var target = window.scrollY || 0, current = target, running = false;

  function maxScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function scrollableUnder(node) {
    /* checagem de ate 8 ancestrais: carrossel, modal com overflow, etc. */
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

  function kick() {
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function onWheel(e) {
    if (!lerpOn) return;
    if (document.body.style.overflow === 'hidden') return;   // overlay aberto
    if (e.ctrlKey) return;                                    // zoom
    if (scrollableUnder(e.target)) return;
    e.preventDefault();
    target = Math.max(0, Math.min(maxScroll(), target + e.deltaY));
    kick();
  }

  function onKey(e) {
    if (!lerpOn) return;
    var t = e.target;
    if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
    if (t && t.isContentEditable) return;
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

  /* ==================================================== 6. SCROLLSPY (nav) */
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

  /* ============================================================== 7. BOOT */
  function boot() {
    splitTitles();
    prepStagger();
    collectScenes();
    mountReveals();

    var spyTick = spy();

    /* Camada 1 em duas vias (rAF nao roda em aba de fundo). */
    requestAnimationFrame(function () { firstScreen(); sceneScan(); chrome(); spyTick(); });
    setTimeout(function () { firstScreen(); sceneScan(); chrome(); spyTick(); }, 140);

    var queued = false;

    /* O listener de scroll nao pode reescrever target enquanto o lerp roda,
       senao o proprio loop se cancela no primeiro frame. */
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        if (!running) { target = window.scrollY || 0; current = target; }
        chrome(); sceneScan(); spyTick(); flushJumped();
      });
    }, { passive: true });

    window.addEventListener('resize', function () {
      lerpOn = FINE.matches;
      target = current = window.scrollY || 0;
      /* firstScreen de novo: blocos escondidos por media query (o retrato
         unico do hero mobile) nao intersectam enquanto display:none, e o
         observer nunca dispara. Sem isto, quem redimensiona desktop -> mobile
         ficaria com aquele bloco preso invisivel. */
      firstScreen(); flushJumped(); sceneScan(); chrome();
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
