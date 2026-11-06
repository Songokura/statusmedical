/* Status Medical Center - общий скрипт трёх страниц */
(function () {
  'use strict';
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  var root = document.body.getAttribute('data-root') || '';
  var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || '';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- плавная прокрутка ---------- */
  var lenis = null;
  if (hasGsap && typeof Lenis !== 'undefined' && !reduced) {
    gsap.registerPlugin(ScrollTrigger);
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    gsap.defaults({ ease: 'power3.out' });
    CustomEaseFallback();
  } else if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
  }
  function CustomEaseFallback() { /* одна кривая на сайт: cubic-bezier(.2,.7,.2,1) ~ power3.out */ }

  function hdrH() { var h = $('.hdr'); return h ? h.getBoundingClientRect().height : 70; }
  function scrollTo(target, offset) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    var y = el.getBoundingClientRect().top + window.scrollY - (offset == null ? hdrH() + 16 : offset);
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }

  /* якоря */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var el = document.getElementById(id.slice(1));
    if (!el) return;
    e.preventDefault();
    closeMenu();
    scrollTo(el);
    history.replaceState(null, '', id);
  });

  /* ---------- шапка ---------- */
  var burger = $('.burger');
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    if (lenis) lenis.start();
  }
  if (burger) burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (lenis) open ? lenis.stop() : lenis.start();
  });
  $$('.menu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  /* переход с другой страницы по ссылке с хэшем: доводим цель под шапку */
  if (location.hash.length > 1) {
    window.addEventListener('load', function () {
      var t = document.getElementById(location.hash.slice(1));
      if (t) setTimeout(function () { window.scrollTo(0, t.getBoundingClientRect().top + window.scrollY - hdrH() - 16); if (lenis) lenis.scrollTo(window.scrollY, { immediate: true }); }, 60);
    });
  }

  /* ---------- WhatsApp ---------- */
  var WA = 'https://wa.me/77052221462?text=';
  $$('[data-wa]').forEach(function (a) { a.setAttribute('href', WA + encodeURIComponent(a.getAttribute('data-wa'))); if (!a.target) { a.target = '_blank'; a.rel = 'noopener'; } });
  $$('form[data-tpl]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var tpl = f.getAttribute('data-tpl');
      var d = {};
      $$('input,select', f).forEach(function (i) { d[i.name] = i.value.trim(); });
      var text = tpl.replace(/\{(\w+)\}/g, function (_, k) { return d[k] || ''; });
      window.open(WA + encodeURIComponent(text), '_blank', 'noopener');
      var note = $('small', f);
      if (note) { note.classList.add('thanks'); note.textContent = (document.documentElement.lang === 'kk' && KK && KK['form.thanks']) || 'Спасибо! Открылся WhatsApp - отправьте сообщение.'; }
    });
  });

  /* ---------- длинный состав чек-апа: первые пункты, остальное по кнопке ---------- */
  $$('ul.compose').forEach(function (ul) {
    var n = ul.children.length;
    if (n <= 8) return;
    ul.classList.add('clip');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'compose-more'; b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span data-i18n="c.more">Весь состав</span> <span class="num">(' + n + ')</span>';
    ul.insertAdjacentElement('afterend', b);
    b.addEventListener('click', function () {
      ul.classList.remove('clip');
      b.setAttribute('aria-expanded', 'true');
      b.hidden = true;
      if (hasGsap) ScrollTrigger.refresh();
    });
  });

  /* ---------- появление блоков ---------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); en.target.classList.add('on'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('.rv, .route-list li, .step, .sc, .month').forEach(function (el) { io.observe(el); });

  /* линия маршрута в списке */
  $$('.route-list').forEach(function (list) {
    var ln = $('.ln', list);
    if (!ln || !hasGsap) return;
    ScrollTrigger.create({ trigger: list, start: 'top 75%', end: 'bottom 60%', scrub: 0.6, onUpdate: function (st) { ln.style.height = (st.progress * (list.offsetHeight - 28)) + 'px'; } });
  });

  /* ---------- заголовок героя по строкам ---------- */
  if (hasGsap && typeof SplitText !== 'undefined' && !reduced) {
    document.fonts.ready.then(function () {
      $$('h1.split').forEach(function (h) {
        var split = new SplitText(h, { type: 'lines', linesClass: 'line', reduceWhiteSpace: false });
        gsap.from(split.lines, { yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.08, ease: 'power3.out', delay: 0.1 });
      });
      gsap.from('.hero-text .kicker, .hero-text .lead, .hero-btns, .hero-offer, .hero-ig', { y: 18, opacity: 0, duration: 0.9, stagger: 0.08, delay: 0.35 });
    });
  }

  /* ---------- сцена главной: разрез здания ---------- */
  var scene = $('#scene');
  if (scene) {
    var layers = $$('.layer', scene);
    var mainSvg = $('#sceneMain');
    var mq = window.matchMedia('(max-width: 860px)');
    var MVB = [110, 300, 990, 460]; /* мобильная композиция: два уровня разреза крупно */
    var layerMain = $('.layer-main', scene);
    var navBtns = $$('.scene-nav button');
    function navState() {
      if (!navBtns.length) return;
      var max = scene.scrollWidth - scene.clientWidth;
      navBtns[0].disabled = scene.scrollLeft <= 2;
      navBtns[1].disabled = scene.scrollLeft >= max - 2;
      navBtns.forEach(function (b) { b.hidden = max <= 1; });
    }
    function setViewBox() {
      mainSvg.setAttribute('viewBox', mq.matches ? MVB.join(' ') : '0 0 1200 820');
      if (mq.matches) {
        layerMain.style.width = Math.round(scene.clientHeight * MVB[2] / MVB[3]) + 'px';
      } else layerMain.style.width = '';
      sizeTags(); navState();
    }
    /* подложки подписей кабинетов - по длине текста (казахские подписи длиннее) */
    function sizeTags() {
      $$('.room', scene).forEach(function (r) {
        var tag = $('rect.tag', r), t = $('text', r);
        if (!tag || !t || !t.getComputedTextLength) return;
        var w = t.getComputedTextLength();
        if (!w) return;
        var pad = parseFloat(t.getAttribute('x')) - parseFloat(tag.getAttribute('x'));
        tag.setAttribute('width', Math.round(w + pad * 2));
        var fs = parseFloat(getComputedStyle(t).fontSize) || 13;
        var h = Math.round(fs * 1.75);
        tag.setAttribute('height', h);
        tag.setAttribute('rx', h / 2);
        tag.setAttribute('y', parseFloat(t.getAttribute('y')) - fs * 1.18);
      });
    }
    window.__sizeTags = sizeTags;
    var lastW = window.innerWidth;
    window.addEventListener('resize', function () { if (window.innerWidth === lastW) return; lastW = window.innerWidth; setViewBox(); });
    scene.addEventListener('scroll', navState, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setViewBox);
    window.addEventListener('load', setViewBox);
    setViewBox();
    mq.addEventListener ? mq.addEventListener('change', setViewBox) : mq.addListener(setViewBox);
    if (hasGsap && !reduced) {
      gsap.fromTo(scene, { opacity: 0, y: 40, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'power3.out', delay: .2 });
    }
    /* пауза вне экрана */
    new IntersectionObserver(function (es) { es.forEach(function (en) { scene.classList.toggle('paused', !en.isIntersecting); }); }, { threshold: 0.05 }).observe(scene);

    /* листание сцены на телефоне */
    $$('.scene-nav button').forEach(function (b) {
      b.addEventListener('click', function () { scene.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * Math.round(scene.clientWidth * .8), behavior: reduced ? 'auto' : 'smooth' }); });
    });

    /* «Чек-ап за один день»: маршрут по кабинетам пакета «Здоровое сердце» */
    var dayBtn = $('#dayBtn'), route = $('#route'), walker = $('#walker'), stats = $$('#dayStats span');
    var rooms = { reg: $('[data-room="reg"]', scene), priem: $('[data-room="priem"]', scene), uzi: $('[data-room="uzi"]', scene), ekg: $('[data-room="ekg"]', scene) };
    var playing = false;
    if (dayBtn && route && hasGsap) {
      var len = route.getTotalLength();
      route.style.strokeDasharray = len;
      route.style.strokeDashoffset = len;
      dayBtn.addEventListener('click', function () {
        if (playing) return;
        playing = true;
        if (mq.matches) scene.scrollTo({ left: 0, behavior: 'smooth' });
        Object.keys(rooms).forEach(function (k) { rooms[k] && rooms[k].classList.remove('lit'); });
        var tl = gsap.timeline({ onComplete: function () { playing = false; } });
        tl.set(route, { opacity: 1 }).set(walker, { opacity: 1 })
          .set(stats, { opacity: 0, y: 8 })
          .to(route, { strokeDashoffset: 0, duration: 3.2, ease: 'power2.inOut' }, 0)
          .to({ p: 0 }, { p: 1, duration: 3.2, ease: 'power2.inOut', onUpdate: function () {
            var pt = route.getPointAtLength(this.targets()[0].p * len);
            walker.setAttribute('cx', pt.x); walker.setAttribute('cy', pt.y);
            var x = pt.x;
            if (x > 200 && rooms.reg) rooms.reg.classList.add('lit');
            if (x > 380 && rooms.priem) rooms.priem.classList.add('lit');
            if (x > 530 && rooms.uzi) rooms.uzi.classList.add('lit');
            if (x > 690 && rooms.ekg) rooms.ekg.classList.add('lit');
          } }, 0)
          .to(stats[0], { opacity: 1, y: 0, duration: .4 }, 1.1)
          .to(stats[1], { opacity: 1, y: 0, duration: .4 }, 1.9)
          .to(stats[2], { opacity: 1, y: 0, duration: .4 }, 2.7)
          .to([stats[3], stats[4]], { opacity: 1, y: 0, duration: .4, stagger: .15 }, 3.2)
          .to(walker, { scale: 1.8, transformOrigin: 'center', repeat: 1, yoyo: true, duration: .35 }, 3.3);
      });
    }
  }

  /* ---------- живые сцены на паузе вне экрана ---------- */
  var pio = new IntersectionObserver(function (es) { es.forEach(function (en) { en.target.classList.toggle('paused', !en.isIntersecting); }); }, { threshold: 0 });
  $$('.ward, .city, .corridor, .ride, .facts, .wall-cols').forEach(function (el) { pio.observe(el); });


  /* ---------- карточки-комнаты: стена отъезжает ---------- */
  if (hasGsap && !reduced) {
    $$('.room-card .wall, .photo .wall').forEach(function (wall) {
      gsap.to(wall, { xPercent: -102, duration: 1.1, ease: 'power3.inOut', scrollTrigger: { trigger: wall.parentElement, start: 'top 85%' } });
    });
  } else { $$('.wall').forEach(function (w) { w.style.display = 'none'; }); }

  /* ---------- проезд по оборудованию ---------- */
  var ride = $('#rideTrack');
  if (ride) {
    var rideSec = ride.closest('.ride');
    var nav = $$('.ride-nav button', rideSec);
    {
      var upd = function () { nav[0].disabled = ride.scrollLeft <= 2; nav[1].disabled = ride.scrollLeft + ride.clientWidth >= ride.scrollWidth - 2; };
      nav.forEach(function (b) { b.addEventListener('click', function () { ride.scrollBy({ left: parseInt(b.getAttribute('data-dir'), 10) * ($('.ride-card', ride).getBoundingClientRect().width + (parseFloat(getComputedStyle(ride).columnGap) || 20)), behavior: reduced ? 'auto' : 'smooth' }); }); });
      ride.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    }
  }

  /* ---------- врачи: первые 8 карточек, остальные по кнопке ---------- */
  var docsBox = $('#docs'), docsMore = null;
  function docsOpen() { if (!docsBox) return; docsBox.classList.remove('clip'); if (docsMore) docsMore.hidden = true; if (hasGsap) ScrollTrigger.refresh(); }
  if (docsBox && $$('.doc', docsBox).length > 8) {
    docsBox.classList.add('clip');
    docsMore = document.createElement('p');
    docsMore.className = 'docs-more';
    docsMore.innerHTML = '<button type="button" class="btn ghost"><span data-i18n="v.more">Все врачи центра</span> <span class="num">(' + $$('.doc', docsBox).length + ')</span></button>';
    docsBox.insertAdjacentElement('afterend', docsMore);
    $('button', docsMore).addEventListener('click', docsOpen);
  }

  /* ---------- врачи: фильтр ---------- */
  var filters = $$('.filters button');
  if (filters.length) {
    filters.forEach(function (b) { b.addEventListener('click', function () {
      filters.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var f = b.getAttribute('data-f');
      $$('#docs .doc').forEach(function (d) { d.classList.toggle('hidden', f !== 'all' && (d.getAttribute('data-cat') || '').split(' ').indexOf(f) < 0); });
      if (f !== 'all') docsOpen();
      if (hasGsap) { gsap.from('#docs .doc:not(.hidden)', { y: 16, opacity: 0, duration: .5, stagger: .03, clearProps: 'all' }); ScrollTrigger.refresh(); }
    }); });
    if (hasGsap && !reduced) gsap.from('#docs .doc', { y: 30, opacity: 0, duration: .8, stagger: .04, scrollTrigger: { trigger: '#docs', start: 'top 80%' }, clearProps: 'transform,opacity' });
  }

  /* ---------- пластика: фото зон и группы операций ---------- */
  var face = $('#face');
  if (face) {
    var zones = $$('.zone', face), figs = $$('.zone-ph, .zp', face), groups = $$('.op-group[data-zone]');
    var cur = '';
    function on(z) {
      if (z === cur) return; cur = z;
      zones.forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-zone') === z ? 'true' : 'false'); });
      figs.forEach(function (x) { x.classList.toggle('on', x.getAttribute('data-zone') === z); });
      groups.forEach(function (g) { g.classList.toggle('on', g.getAttribute('data-zone') === z); });
    }
    /* подписи-пилюли на фото по длине текста */
    function sizePills() {
      $$('.zp', face).forEach(function (g) {
        var t = $('text', g), r = $('rect.pill', g); if (!t || !r || !t.getComputedTextLength) return;
        var w = Math.round(t.getComputedTextLength() + 32);
        r.setAttribute('width', w);
        if (r.getAttribute('data-anchor') === 'middle') r.setAttribute('x', Math.round(parseFloat(t.getAttribute('x')) - w / 2));
      });
    }
    window.__sizePills = sizePills;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizePills);
    sizePills();
    $$('.zp', face).forEach(function (g) { g.addEventListener('click', function () { on(g.getAttribute('data-zone')); scrollTo($('.op-group[data-zone="' + g.getAttribute('data-zone') + '"]'), hdrH() + 24); }); });
    zones.forEach(function (z) {
      z.addEventListener('click', function () { on(z.getAttribute('data-zone')); scrollTo($('.op-group[data-zone="' + z.getAttribute('data-zone') + '"]'), hdrH() + 24); });
    });
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      groups.forEach(function (g) { g.addEventListener('mouseenter', function () { on(g.getAttribute('data-zone')); }); });
    }
    /* зона на фото - у группы, ближайшей к середине экрана */
    var ops = face.closest('.ops'), zt = false;
    function nearest() {
      zt = false;
      var r = ops.getBoundingClientRect(), mid = window.innerHeight / 2;
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var best = null, bd = 1e9;
      groups.forEach(function (g) { var b = g.getBoundingClientRect(), d = Math.abs((b.top + b.bottom) / 2 - mid); if (d < bd) { bd = d; best = g; } });
      if (best) on(best.getAttribute('data-zone'));
    }
    window.addEventListener('scroll', function () { if (!zt) { zt = true; requestAnimationFrame(nearest); } }, { passive: true });
    on('eyes');
  }
  var pLine = $('.portrait .line path');
  if (pLine && hasGsap && !reduced) { var pl = pLine.getTotalLength(); gsap.fromTo(pLine, { strokeDasharray: pl, strokeDashoffset: pl }, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', delay: .4 }); gsap.from('.portrait .tag', { scale: .8, opacity: 0, duration: .7, stagger: .15, delay: 1.2, ease: 'back.out(1.6)' }); gsap.from('.portrait .frame, .portrait .back', { y: 40, opacity: 0, duration: 1.2, delay: .15, ease: 'power3.out' }); }

  /* ---------- похудение: лента этапов и три двери ---------- */
  var tl = $('#tlPath');
  if (tl && hasGsap && !reduced) {
    var tlen = tl.getTotalLength();
    gsap.set(tl, { strokeDasharray: tlen, strokeDashoffset: tlen });
    gsap.to(tl, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.timeline', start: 'top 80%', end: 'bottom 40%', scrub: .5 } });
    gsap.from('.timeline circle, .timeline text', { opacity: 0, scale: .6, transformOrigin: 'center', stagger: .05, duration: .6, scrollTrigger: { trigger: '.timeline', start: 'top 75%' } });
  }
  var doors = $$('.corridor .door');
  if (doors.length) {
    var cards = $$('.door-card'), tabs = $$('.door-tabs button');
    /* створка открывается внутрь кабинета: дальний край сужается к косяку, всё внутри проёма */
    function leafPts(x, t) {
      var w = 170 - 118 * t, dy = 16 * t;
      return [x, 120, x + w, 120 + dy, x + w, 400 - dy, x, 400].map(function (v) { return Math.round(v * 10) / 10; });
    }
    function ptsStr(a) { return a[0] + ',' + a[1] + ' ' + a[2] + ',' + a[3] + ' ' + a[4] + ',' + a[5] + ' ' + a[6] + ',' + a[7]; }
    function setLeaf(d, open) {
      var g = $('.leaf-g', d); if (!g) return;
      var x = parseFloat(g.getAttribute('data-x')), leaf = $('.leaf', g), knob = $('.knob', g);
      var from = { t: g.__t || 0 }, to = open ? 1 : 0;
      if (from.t === to) return;
      var draw = function () {
        leaf.setAttribute('points', ptsStr(leafPts(x, from.t)));
        knob.setAttribute('cx', (x + (170 - 118 * from.t) - 18 * (1 - from.t * .6)).toFixed(1));
        g.__t = from.t;
      };
      if (hasGsap && !reduced) gsap.to(from, { t: to, duration: .9, ease: 'power3.inOut', onUpdate: draw });
      else { from.t = to; draw(); }
    }
    /* таблички по длине подписи (казахские длиннее) */
    function sizePlates() {
      doors.forEach(function (d) {
        var t = $('text', d), r = $('rect.plate', d);
        if (!t || !r || !t.getComputedTextLength) return;
        var w = Math.round(t.getComputedTextLength() + 32), cx = parseFloat(t.getAttribute('x'));
        r.setAttribute('width', w); r.setAttribute('x', Math.round(cx - w / 2));
      });
    }
    window.__sizePlates = sizePlates;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizePlates);
    sizePlates();
    function openDoor(k) {
      doors.forEach(function (d) { var o = d.getAttribute('data-door') === k; d.classList.toggle('open', o); setLeaf(d, o); });
      cards.forEach(function (c) { c.classList.toggle('on', c.getAttribute('data-door') === k); });
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-door') === k ? 'true' : 'false'); });
    }
    doors.forEach(function (d) { d.addEventListener('click', function () { openDoor(d.getAttribute('data-door')); }); });
    tabs.forEach(function (t) { t.addEventListener('click', function () { openDoor(t.getAttribute('data-door')); }); });
    openDoor('endo');
  }
  /* лента этапов: подписи по длине текста, сбоку от узла с зазором */
  function sizeLbls() {
    $$('.city .lbl').forEach(function (g) {
      var t = $('text', g), r = $('rect', g); if (!t || !r || !t.getComputedTextLength) return;
      var w = Math.round(t.getComputedTextLength() + 28), nx = parseFloat(g.getAttribute('data-nx')), gap = 22;
      var x = g.getAttribute('data-side') === 'r' ? nx + gap : nx - gap - w;
      r.setAttribute('width', w); r.setAttribute('x', x); t.setAttribute('x', x + 14);
    });
  }
  window.__sizeLbls = sizeLbls;
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeLbls);
  sizeLbls();
  var city = $('.city');
  if (city && hasGsap && !reduced) {
    $$('.layer', city).forEach(function (l) { gsap.to(l, { yPercent: parseFloat(l.getAttribute('data-depth') || 0) * 50, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } }); });
    var rib = $('#ribbon');
    if (rib) { var rl = rib.getTotalLength(); gsap.fromTo(rib, { strokeDasharray: rl, strokeDashoffset: rl }, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', delay: .5 }); gsap.from('.city .node, .city .lbl', { opacity: 0, scale: .5, transformOrigin: 'center', stagger: .25, duration: .6, delay: 1.3, ease: 'back.out(1.6)' }); }
    gsap.from('.city .doc-frame, .city .doc-cap', { y: 40, opacity: 0, duration: 1.2, stagger: .15, delay: .3 });
  }

  /* ---------- языки: RU в разметке, казахский словарь грузится только по выбору KZ или ?lang=kk ---------- */
  var KK = null, LKEY = 'statusmed-lang';
  var i18nEls = $$('[data-i18n]');
  i18nEls.forEach(function (el) { el.__ru = el.innerHTML; });
  function loadKK(done) {
    if (KK) return done();
    var s = document.createElement('script');
    s.src = root + 'assets/lang/' + (document.body.getAttribute('data-kk') || 'kk') + '.js' + (ASSET_V ? '?v=' + ASSET_V : '');
    s.onload = function () { KK = window.SITE_KK || null; done(); };
    s.onerror = function () { done(); };
    document.head.appendChild(s);
  }
  function applyLang(lang) {
    if (lang === 'kk' && !KK) lang = 'ru';
    i18nEls.forEach(function (el) {
      var k = el.getAttribute('data-i18n');
      var v = lang === 'kk' && KK[k] != null ? KK[k] : el.__ru;
      if (el.innerHTML !== v) el.innerHTML = v;
    });
    document.documentElement.lang = lang;
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    try { localStorage.setItem(LKEY, lang); } catch (e) {}
    if (window.__sizeTags) window.__sizeTags();
    if (window.__sizePlates) window.__sizePlates();
    if (window.__sizePills) window.__sizePills();
    if (window.__sizeLbls) window.__sizeLbls();
    if (hasGsap) ScrollTrigger.refresh();
  }
  function setLang(lang) { if (lang === 'kk') loadKK(function () { applyLang('kk'); }); else applyLang('ru'); }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  (function () {
    /* ?lang= в адресе главнее сохранённого выбора: реклама ведёт на ?lang=ru */
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var saved = null;
    try { saved = localStorage.getItem(LKEY); } catch (e) {}
    var want = forced || saved || 'ru';
    if (want === 'kk') setLang('kk');
    else if (forced === 'ru') { try { localStorage.setItem(LKEY, 'ru'); } catch (e) {} }
  })();

  /* липкая панель: после 55% первого экрана, на контактах прячется */
  (function () {
    var bar = $('.sticky-bar'); if (!bar) return;
    var ct = document.getElementById('kontakty') || $('footer');
    var tick = false;
    function upd() {
      tick = false;
      var past = window.scrollY > window.innerHeight * 0.55;
      var atCt = ct ? ct.getBoundingClientRect().top < window.innerHeight * 0.6 && ct.getBoundingClientRect().bottom > 0 : false;
      bar.classList.toggle('show', past && !atCt);
    }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  })();

  if (hasGsap) window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
