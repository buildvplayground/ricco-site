/* ===========================================================================
   RICCO Construtora — comportamento da pagina
   Independente do motor de movimento: se motion.js cair, tudo aqui continua.
   =========================================================================== */
(function () {
  'use strict';

  /* --------------------------------------------------- WhatsApp centralizado
     Numero confirmado em duas pecas do proprio cliente:
     a peca de portfolio e o rodape do site anterior. */
  var WA = '5585988898000';

  function waHref(msg) {
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }

  var WA_TXT = {
    header:      'Ola! Vim pelo site da RICCO Construtora e gostaria de falar com um engenheiro.',
    hero:        'Ola! Vim pelo site da RICCO. Quero conversar sobre uma obra.',
    frentes:     'Ola! Vim pelo site da RICCO. Quero saber mais sobre as frentes de atuacao de voces.',
    obras:       'Ola! Vi as obras no site da RICCO e quero falar sobre um projeto parecido.',
    retrofit:    'Ola! Vim pelo site da RICCO. Tenho interesse em retrofit de fachada.',
    metodo:      'Ola! Vim pelo site da RICCO. Quero entender como funciona a execucao da obra.',
    duvidas:     'Ola! Vim pelo site da RICCO e ficou uma duvida que nao estava na pagina.',
    orcamento:   'Ola! Vim pelo site da RICCO e quero solicitar um orcamento. Tipo de obra: ',
    trabalhe:    'Ola! Vim pelo site da RICCO e gostaria de enviar meu curriculo.',
    fornecedor:  'Ola! Vim pelo site da RICCO. Sou fornecedor e gostaria de me cadastrar.',
    rodape:      'Ola! Vim pelo site da RICCO Construtora.'
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
    if (burger) { burger.setAttribute('aria-expanded', 'false'); }
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

  /* ================================================= LIGHTBOX DE GALERIA
     Um card = uma obra. Clicar abre TODAS as fotos daquela obra, com
     navegacao, teclado, swipe e contador. Setas somem se a obra tem 1 foto. */
  var lb       = document.querySelector('.lb');
  if (lb) {
    var lbImg    = lb.querySelector('.lb-stage img');
    var lbTitle  = lb.querySelector('.lb-title');
    var lbCount  = lb.querySelector('.lb-count');
    var lbFoot   = lb.querySelector('.lb-foot');
    var lbPrev   = lb.querySelector('.lb-prev');
    var lbNext   = lb.querySelector('.lb-next');
    var lbClose  = lb.querySelector('.lb-close');

    var shots = [], idx = 0, title = '', opener = null;

    function paint() {
      var src = shots[idx];
      lbImg.setAttribute('src', src);
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
        var f = Array.prototype.filter.call(
          lb.querySelectorAll('button'), function (b) { return !b.hidden; });
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
