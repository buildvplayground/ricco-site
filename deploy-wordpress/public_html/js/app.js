/* ===========================================================================
   RICCO Construtora — comportamento da pagina
   Independente do motor de movimento: se motion.js cair, tudo aqui continua.
   =========================================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------- WhatsApp centralizado
     Numero confirmado em duas pecas do proprio cliente: a peca de portfolio
     e o rodape do site anterior. */
  var WA = '5585988898000';

  function waHref(msg) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  var WA_TXT = {
    header:     'Ola! Vim pelo site da RICCO Construtora e gostaria de falar com um engenheiro.',
    hero:       'Ola! Vim pelo site da RICCO. Quero conversar sobre uma obra.',
    frentes:    'Ola! Vim pelo site da RICCO. Quero saber mais sobre as frentes de atuacao de voces.',
    obras:      'Ola! Vi as obras no site da RICCO e quero falar sobre um projeto parecido.',
    retrofit:   'Ola! Vim pelo site da RICCO. Tenho interesse em retrofit de fachada.',
    metodo:     'Ola! Vim pelo site da RICCO. Quero entender como funciona a execucao da obra.',
    duvidas:    'Ola! Vim pelo site da RICCO e ficou uma duvida que nao estava na pagina.',
    orcamento:  'Ola! Vim pelo site da RICCO e quero solicitar um orcamento. Tipo de obra: ',
    trabalhe:   'Ola! Vim pelo site da RICCO e gostaria de enviar meu curriculo.',
    fornecedor: 'Ola! Vim pelo site da RICCO. Sou fornecedor e gostaria de me cadastrar.',
    rodape:     'Ola! Vim pelo site da RICCO Construtora.',
    lancamento: 'Ola! Vim pelo site da RICCO e quero saber mais sobre o Loteamento Park Ville, em Maracanau.'
  };

  /* Cada CTA leva o texto da secao de origem: poupa a primeira pergunta e
     identifica de onde o lead veio. */
  document.querySelectorAll('[data-wa-btn]').forEach(function (el) {
    var key = el.getAttribute('data-wa-btn');
    el.setAttribute('href', waHref(WA_TXT[key] || WA_TXT.rodape));
    el.setAttribute('rel', 'noopener');
    el.setAttribute('target', '_blank');
  });

  /* ------------------------------------------------------------ menu mobile */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  var scrim  = document.querySelector('.scrim');

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add('open');
    if (scrim) scrim.classList.add('on');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var first = drawer.querySelector('a');
    if (first) first.focus({ preventScroll: true });
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('open');
    if (scrim) scrim.classList.remove('on');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.lb.open')) document.body.style.overflow = '';
  }

  if (burger) {
    burger.addEventListener('click', function () {
      if (drawer && drawer.classList.contains('open')) closeDrawer();
      else openDrawer();
    });
  }
  if (scrim) scrim.addEventListener('click', closeDrawer);

  window.RICCO = window.RICCO || {};
  window.RICCO.closeDrawer = closeDrawer;

  /* ============================================= FRENTES DE ATUACAO (tablist)
     Seis frentes numa lista; a foto grande e o texto trocam por clique,
     hover ou teclado. Padrao ARIA de tablist com selecao manual. */
  (function frentes() {
    var list = document.querySelector('.frentes-list');
    var fig = document.querySelector('.fr-fig');
    var cap = document.querySelector('.fr-cap');
    if (!list || !fig || !cap) return;

    var btns = Array.prototype.slice.call(list.querySelectorAll('.fr-btn'));
    var imgs = Array.prototype.slice.call(fig.querySelectorAll('img'));
    var caps = Array.prototype.slice.call(cap.querySelectorAll('p'));
    var cur = 0;
    var hoverTimer = null;

    /* Avisa o CSS que o JS assumiu. Antes disso a primeira foto e a primeira
       legenda ficam visiveis por regra propria, para a secao nao aparecer
       vazia sem JavaScript. */
    fig.setAttribute('data-tabs', 'on');
    cap.setAttribute('data-tabs', 'on');

    function select(i, focus) {
      if (i < 0 || i >= btns.length) return;
      cur = i;
      btns.forEach(function (b, k) {
        b.setAttribute('aria-selected', k === i ? 'true' : 'false');
        b.setAttribute('tabindex', k === i ? '0' : '-1');
      });
      imgs.forEach(function (m, k) {
        if (k === i) m.setAttribute('data-on', 'true');
        else m.removeAttribute('data-on');
      });
      caps.forEach(function (p, k) {
        if (k === i) p.setAttribute('data-on', 'true');
        else p.removeAttribute('data-on');
      });
      if (focus) btns[i].focus({ preventScroll: true });
    }

    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { select(i); });
      /* hover com atraso curto: passar o mouse pela lista nao dispara as 6 */
      b.addEventListener('pointerenter', function () {
        if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(function () { select(i); }, 90);
      });
      b.addEventListener('pointerleave', function () { clearTimeout(hoverTimer); });
      b.addEventListener('keydown', function (e) {
        /* O passo sai do indice do botao QUE ESTA COM O FOCO, nao de `cur`.
           Se o foco chegar num botao nao selecionado (foco programatico,
           leitor de tela), partir de `cur` faz a seta pular para o lugar
           errado. */
        var from = btns.indexOf(e.currentTarget);
        if (from < 0) from = cur;
        var n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (from + 1) % btns.length;
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (from - 1 + btns.length) % btns.length;
        else if (e.key === 'Home') n = 0;
        else if (e.key === 'End') n = btns.length - 1;
        else return;
        e.preventDefault();
        select(n, true);
      });
    });

    select(0);
  })();

  /* ================================================= LIGHTBOX DE GALERIA
     Um card = uma obra. Clicar abre TODAS as fotos daquela obra, com
     navegacao, teclado, swipe e contador. Setas somem se a obra tem 1 foto. */
  var lb = document.querySelector('.lb');
  if (lb) {
    var lbImg   = lb.querySelector('.lb-stage img');
    var lbTitle = lb.querySelector('.lb-title');
    var lbCount = lb.querySelector('.lb-count');
    var lbFoot  = lb.querySelector('.lb-foot');
    var lbPrev  = lb.querySelector('.lb-prev');
    var lbNext  = lb.querySelector('.lb-next');
    var lbClose = lb.querySelector('.lb-close');

    var shots = [], idx = 0, title = '', opener = null;

    function paint() {
      lbImg.setAttribute('src', shots[idx]);
      lbImg.setAttribute('alt', title + ', foto ' + (idx + 1) + ' de ' + shots.length);
      lbCount.textContent = (idx + 1) + ' / ' + shots.length;
      var many = shots.length > 1;
      lbPrev.hidden = !many;
      lbNext.hidden = !many;
      lbFoot.textContent = many ? 'Use as setas do teclado para navegar. Esc fecha.' : 'Esc fecha.';
    }

    function open(btn) {
      var list = (btn.getAttribute('data-gallery') || '').split('|').filter(Boolean);
      if (!list.length) return;
      shots = list;
      title = btn.getAttribute('data-title') || 'Obra da RICCO';
      idx = 0;
      opener = btn;
      lbTitle.textContent = title;
      paint();
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus({ preventScroll: true });
    }

    function close() {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      if (!drawer || !drawer.classList.contains('open')) document.body.style.overflow = '';
      if (opener) opener.focus({ preventScroll: true });
    }

    function step(d) {
      if (shots.length < 2) return;
      idx = (idx + d + shots.length) % shots.length;
      paint();
    }

    document.querySelectorAll('.obra').forEach(function (btn) {
      btn.addEventListener('click', function () { open(btn); });
    });

    lbPrev.addEventListener('click', function () { step(-1); });
    lbNext.addEventListener('click', function () { step(1); });
    lbClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-stage')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (drawer && drawer.classList.contains('open') && e.key === 'Escape') { closeDrawer(); return; }
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      else if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
      else if (e.key === 'Tab') {
        /* foco preso dentro do lightbox */
        var f = Array.prototype.filter.call(lb.querySelectorAll('button'),
                                            function (b) { return !b.hidden; });
        if (!f.length) return;
        var i = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    /* swipe */
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 46) step(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  /* ============================================ ANTES E DEPOIS (comparador)
     Alca que arrasta e revela o "antes" sobre o "depois". Ponteiro (mouse e
     touch) e teclado (setas). Sem este script o corte fica em 50% pelo CSS,
     entao a secao nunca depende dele para existir. */
  (function beforeAfter() {
    var root = document.querySelector('[data-ba]');
    if (!root) return;
    var frames = Array.prototype.slice.call(root.querySelectorAll('.ba-frame'));
    if (!frames.length) return;

    /* Um comparador por frame: cada par guarda seu proprio corte em --pos. */
    frames.forEach(function (frame) {
      var handle = frame.querySelector('.ba-handle');
      var pos = 50, dragging = false;
      function apply() {
        frame.style.setProperty('--pos', pos + '%');
        if (handle) handle.setAttribute('aria-valuenow', Math.round(pos));
      }
      function setFromX(x) {
        var r = frame.getBoundingClientRect();
        if (r.width <= 0) return;
        pos = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
        apply();
      }
      frame.addEventListener('pointerdown', function (e) {
        dragging = true;
        if (frame.setPointerCapture) { try { frame.setPointerCapture(e.pointerId); } catch (err) {} }
        setFromX(e.clientX);
        e.preventDefault();
      });
      frame.addEventListener('pointermove', function (e) { if (dragging) setFromX(e.clientX); });
      function endp(e) {
        if (!dragging) return;
        dragging = false;
        if (frame.releasePointerCapture && e.pointerId != null) {
          try { frame.releasePointerCapture(e.pointerId); } catch (err) {}
        }
      }
      frame.addEventListener('pointerup', endp);
      frame.addEventListener('pointercancel', endp);
      if (handle) handle.addEventListener('keydown', function (e) {
        var st = e.shiftKey ? 10 : 2;
        switch (e.key) {
          case 'ArrowLeft': case 'ArrowDown': pos = Math.max(0, pos - st); break;
          case 'ArrowRight': case 'ArrowUp': pos = Math.min(100, pos + st); break;
          case 'Home': pos = 0; break;
          case 'End': pos = 100; break;
          default: return;
        }
        apply();
        e.preventDefault();
      });
      apply();
    });

    /* Carrossel: mostra um par por vez, com setas, pontos e regiao viva.
       Acessivel por teclado (botoes) e sem sequestrar as setas, que ficam
       reservadas para a alca do comparador em foco. */
    var slides = Array.prototype.slice.call(root.querySelectorAll('.ba-slide'));
    var prev = root.querySelector('.ba-arrow--prev');
    var next = root.querySelector('.ba-arrow--next');
    var dots = Array.prototype.slice.call(root.querySelectorAll('.ba-dot'));
    var live = root.querySelector('[data-ba-live]');
    if (slides.length < 2) return;
    var cur = 0;
    function show(i, focusDot) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        if (k === cur) s.removeAttribute('hidden');
        else s.setAttribute('hidden', '');
      });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
      if (live) {
        var lbl = slides[cur].getAttribute('data-ba-label') || '';
        live.textContent = 'Par ' + (cur + 1) + ' de ' + slides.length + (lbl ? ': ' + lbl : '');
      }
      if (focusDot && dots[cur]) dots[cur].focus();
    }
    if (prev) prev.addEventListener('click', function () { show(cur - 1); });
    if (next) next.addEventListener('click', function () { show(cur + 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); }); });
    show(0);
  })();

  /* ============================================================== COOKIES
     LGPD: o consentimento emite evento no dataLayer, para que qualquer tag
     instalada depois respeite a escolha do usuario. */
  var KEY = 'ricco-consent-v1';
  var cookie = document.querySelector('.cookie');

  window.dataLayer = window.dataLayer || [];

  function consent(value) {
    try { localStorage.setItem(KEY, value); } catch (err) {}
    window.dataLayer.push({ event: 'consent_update', consent_state: value });
    if (cookie) cookie.classList.remove('show');
  }

  if (cookie) {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (err) {}
    if (!saved) {
      /* nao aparece no carregamento: espera o usuario ter contexto */
      setTimeout(function () { cookie.classList.add('show'); }, 1400);
    } else {
      window.dataLayer.push({ event: 'consent_update', consent_state: saved });
    }
    var ok = cookie.querySelector('[data-consent="accept"]');
    var no = cookie.querySelector('[data-consent="reject"]');
    if (ok) ok.addEventListener('click', function () { consent('granted'); });
    if (no) no.addEventListener('click', function () { consent('denied'); });
  }

  /* ------------------------------------------------- ano corrente no rodape */
  var yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
