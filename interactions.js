(function () {
  'use strict';

  // ── スクロール進捗ライン ──────────────────────────── (全デバイス)
  var progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', function () {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }, { passive: true });

  // ── ページトランジション ─────────────────────────── (全デバイス)
  var curtain = document.createElement('div');
  curtain.className       = 'page-curtain';
  curtain.style.transform = 'translateY(0)';
  document.body.appendChild(curtain);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      curtain.style.transition = 'transform 0.75s cubic-bezier(0.76, 0, 0.24, 1)';
      curtain.style.transform  = 'translateY(-100%)';
    });
  });

  function isInternalNav(e, a) {
    if (!a || a.tagName !== 'A' || !a.href) return false;
    if (a.target === '_blank') return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    var attr = a.getAttribute('href') || '';
    if (attr.startsWith('#') || attr.startsWith('mailto:') || attr.startsWith('tel:')) return false;
    try {
      var url = new URL(a.href);
      if (url.origin !== window.location.origin) return false;
      if (url.pathname === window.location.pathname) return false;
    } catch (err) { return false; }
    return true;
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!isInternalNav(e, a)) return;
    e.preventDefault();
    var dest = a.href;
    curtain.style.transition = 'none';
    curtain.style.transform  = 'translateY(100%)';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        curtain.style.transition = 'transform 0.55s cubic-bezier(0.76, 0, 0.24, 1)';
        curtain.style.transform  = 'translateY(0)';
        setTimeout(function () { window.location.href = dest; }, 580);
      });
    });
  });

  // ── フィルムグレイン ─────────────────────────────── (全デバイス)
  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = 180;
  var ctx = canvas.getContext('2d');
  var imageData = ctx.createImageData(180, 180);
  for (var i = 0; i < imageData.data.length; i += 4) {
    var v = Math.random() * 255 | 0;
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  var grain = document.createElement('div');
  grain.className = 'grain-overlay';
  grain.style.backgroundImage = 'url(' + canvas.toDataURL() + ')';
  document.body.appendChild(grain);

  // ── ヘッダースクロールガラス効果 ─────────────────── (全デバイス)
  var header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  // ── モバイルナビゲーション ───────────────────────── (全デバイス)
  var navToggle = document.createElement('button');
  navToggle.className = 'nav-toggle';
  navToggle.setAttribute('aria-label', 'メニュー');
  navToggle.innerHTML = '<span></span><span></span>';
  document.body.appendChild(navToggle);

  var navOverlay = document.createElement('div');
  navOverlay.className = 'nav-overlay';
  var srcNav = document.querySelector('nav ul');
  if (srcNav) {
    var overlayUl = srcNav.cloneNode(true);
    navOverlay.appendChild(overlayUl);
  }
  var overlayTag = document.createElement('p');
  overlayTag.className = 'nav-overlay-tagline';
  overlayTag.textContent = 'Illustration · Design · Music · Web';
  navOverlay.appendChild(overlayTag);
  document.body.appendChild(navOverlay);

  function closeNav() {
    navOverlay.classList.remove('open');
    navToggle.classList.remove('open');
    document.body.style.overflow = '';
  }

  navToggle.addEventListener('click', function () {
    var isOpen = navOverlay.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navOverlay.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  // ── 著作権年を動的更新 ──────────────────────────── (全デバイス)
  document.querySelectorAll('.copyright-year').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ── トップへ戻るボタン ───────────────────────────── (全デバイス)
  var backTop = document.createElement('button');
  backTop.className = 'back-to-top';
  backTop.setAttribute('aria-label', 'ページトップへ');
  backTop.textContent = '↑';
  document.body.appendChild(backTop);

  window.addEventListener('scroll', function () {
    backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── ヒーローインクスプラッター ──────────────────────── (全デバイス)
  (function () {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    var NS = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'hero-ink');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 1000 600');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    // フィルター定義（3段階の歪み強度）
    var defs = document.createElementNS(NS, 'defs');
    [
      ['ink-a', '0.020 0.038', '50', '3'],
      ['ink-b', '0.028 0.046', '36', '9'],
      ['ink-c', '0.038 0.060', '22', '15'],
    ].forEach(function (f) {
      var filter = document.createElementNS(NS, 'filter');
      filter.id = f[0];
      filter.setAttribute('x', '-50%'); filter.setAttribute('y', '-50%');
      filter.setAttribute('width', '200%'); filter.setAttribute('height', '200%');
      var turb = document.createElementNS(NS, 'feTurbulence');
      turb.setAttribute('type', 'fractalNoise');
      turb.setAttribute('baseFrequency', f[1]);
      turb.setAttribute('numOctaves', '4');
      turb.setAttribute('seed', f[3]);
      turb.setAttribute('result', 'n');
      var disp = document.createElementNS(NS, 'feDisplacementMap');
      disp.setAttribute('in', 'SourceGraphic');
      disp.setAttribute('in2', 'n');
      disp.setAttribute('xChannelSelector', 'R');
      disp.setAttribute('yChannelSelector', 'G');
      disp.setAttribute('scale', f[2]);
      filter.append(turb, disp);
      defs.appendChild(filter);
    });
    svg.appendChild(defs);

    // cx, cy, rx, ry, filter, animationDelay(s)
    var shapes = [
      // 大きなインク塊（3個）
      [58,  50,  78, 60, 'ink-a', 0.00],
      [944, 548, 82, 64, 'ink-a', 0.14],
      [36,  308, 56, 44, 'ink-a', 0.30],
      // 中サイズ（4個）
      [872, 58,  38, 28, 'ink-b', 0.10],
      [218, 192, 34, 25, 'ink-b', 0.26],
      [518, 566, 38, 27, 'ink-b', 0.20],
      [778, 398, 32, 24, 'ink-b', 0.38],
      // 小さな飛び散り（5個）
      [158, 80,   8,  5, 'ink-c', 0.46],
      [818, 148,  6,  4, 'ink-c', 0.40],
      [288, 518,  7,  5, 'ink-c', 0.56],
      [682, 46,   5,  4, 'ink-c', 0.50],
      [104, 448,  6,  4, 'ink-c', 0.62],
    ];

    shapes.forEach(function (s) {
      var el = document.createElementNS(NS, 'ellipse');
      el.setAttribute('cx', s[0]);
      el.setAttribute('cy', s[1]);
      el.setAttribute('rx', s[2]);
      el.setAttribute('ry', s[3]);
      el.setAttribute('fill', '#0a0a0a');
      el.setAttribute('filter', 'url(#' + s[4] + ')');
      el.setAttribute('class', 'ink-blob');
      el.style.animationDelay = s[5] + 's';
      svg.appendChild(el);
    });

    // hero-bg と hero-content の間に挿入
    hero.insertBefore(svg, hero.querySelector('.hero-content'));

    // タイトルが revealed になったらインクを表示
    var titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;

    function activateInk() {
      setTimeout(function () { svg.classList.add('ink-active'); }, 200);
    }

    if (titleEl.classList.contains('title-revealed')) {
      activateInk();
    } else {
      var inkMo = new MutationObserver(function () {
        if (titleEl.classList.contains('title-revealed')) {
          inkMo.disconnect();
          activateInk();
        }
      });
      inkMo.observe(titleEl, { attributes: true, attributeFilter: ['class'] });
    }
  }());

  // ── インクドロップ ────────────────────────────────── (全デバイス)
  document.addEventListener('click', function (e) {
    var drop = document.createElement('div');
    drop.className    = 'ink-drop';
    drop.style.left   = e.clientX + 'px';
    drop.style.top    = e.clientY + 'px';
    document.body.appendChild(drop);
    setTimeout(function () { drop.remove(); }, 700);
  });

  // ── マウス専用エフェクト ─────────────────────────── (pointer: fine のみ)
  if (!window.matchMedia('(pointer: fine)').matches) return;

  // ── カスタムカーソル ──────────────────────────────
  var dot  = document.createElement('div');
  var ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  var mx = -200, my = -200;
  var rx = -200, ry = -200;
  var ringScale = 1, targetScale = 1;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = 'translate(' + (mx - 3) + 'px,' + (my - 3) + 'px)';
  });

  document.addEventListener('mouseleave', function () {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', function () {
    dot.style.opacity  = '';
    ring.style.opacity = '';
  });

  var hoverSel = 'a, button, .btn, summary, .work-item, .masonry-item, .filter-btn, .social-link';
  document.querySelectorAll(hoverSel).forEach(function (el) {
    el.addEventListener('mouseenter', function () { targetScale = 1.7; });
    el.addEventListener('mouseleave', function () { targetScale = 1;   });
  });

  // ── ヒーローパーララックス ─────────────────────────
  var hero        = document.querySelector('.hero');
  var heroBg      = hero && hero.querySelector('.hero-bg');
  var heroContent = hero && hero.querySelector('.hero-content');
  var tbx = 0, tby = 0, tcx = 0, tcy = 0;
  var bx  = 0, by  = 0, cx  = 0, cy  = 0;

  if (hero) {
    hero.addEventListener('mousemove', function (e) {
      var r  = hero.getBoundingClientRect();
      var nx = (e.clientX - r.left) / r.width  - 0.5;
      var ny = (e.clientY - r.top)  / r.height - 0.5;
      tbx = nx * 24;  tby = ny * 24;
      tcx = nx * -8;  tcy = ny * -8;
    });
    hero.addEventListener('mouseleave', function () {
      tbx = tby = tcx = tcy = 0;
    });
  }

  // ── マグネティックボタン ──────────────────────────
  document.querySelectorAll('.btn').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var r  = btn.getBoundingClientRect();
      var ox = (e.clientX - r.left - r.width  / 2) * 0.22;
      var oy = (e.clientY - r.top  - r.height / 2) * 0.22;
      btn.style.transition = 'background .3s,color .3s,border-color .3s,box-shadow .3s';
      btn.style.transform  = 'translate(' + ox + 'px,' + oy + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transition = '';
      btn.style.transform  = '';
    });
  });

  // ── 3Dカードチルト＋シャイン ──────────────────────
  document.querySelectorAll('.work-item, .masonry-item').forEach(function (card) {
    var shine = document.createElement('div');
    shine.className = 'card-shine';
    var overlay = card.querySelector('.work-overlay, .masonry-overlay');
    if (overlay) card.insertBefore(shine, overlay);
    else card.appendChild(shine);

    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width  - 0.5;
      var y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = 'box-shadow 0.2s ease';
      card.style.transform  = 'perspective(700px) rotateY(' + (x * 10) + 'deg) rotateX(' + (-y * 10) + 'deg) scale(1.02)';
      card.style.zIndex     = '2';
      card.style.boxShadow  = '0 24px 48px rgba(0,0,0,0.22)';
      shine.style.background =
        'radial-gradient(circle at ' +
        ((x + 0.5) * 100) + '% ' + ((y + 0.5) * 100) +
        '%, rgba(255,255,255,0.13) 0%, transparent 65%)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transition  = 'transform 0.5s ease, box-shadow 0.5s ease';
      card.style.transform   = '';
      card.style.zIndex      = '';
      card.style.boxShadow   = '';
      shine.style.background = '';
    });
  });

  // ── RAFメインループ ───────────────────────────────
  function tick() {
    var ease = 0.1;

    rx += (mx - rx) * ease;
    ry += (my - ry) * ease;
    ringScale += (targetScale - ringScale) * ease;
    ring.style.transform = 'translate(' + (rx - 16) + 'px,' + (ry - 16) + 'px) scale(' + ringScale + ')';

    bx += (tbx - bx) * 0.06;
    by += (tby - by) * 0.06;
    cx += (tcx - cx) * 0.06;
    cy += (tcy - cy) * 0.06;
    if (heroBg)      heroBg.style.transform      = 'translate(' + bx + 'px,' + by + 'px) scale(1.07)';
    if (heroContent) heroContent.style.transform = 'translate(' + cx + 'px,' + cy + 'px)';

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

}());
