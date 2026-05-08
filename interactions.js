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

  // ── フィルムグレイン ─────────────────────────────── (ギャラリー系ページを除く)
  if (!/illustration|works/.test(window.location.pathname)) {
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
  }

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

  // ── インクドロップ ＋ リプル ─────────────────────── (全デバイス)
  document.addEventListener('click', function (e) {
    var drop = document.createElement('div');
    drop.className = 'ink-drop';
    drop.style.left = e.clientX + 'px';
    drop.style.top  = e.clientY + 'px';
    document.body.appendChild(drop);
    setTimeout(function () { drop.remove(); }, 700);

    [80, 160, 260].forEach(function (size, i) {
      setTimeout(function () {
        var r = document.createElement('div');
        r.className    = 'ink-ripple';
        r.style.left   = e.clientX + 'px';
        r.style.top    = e.clientY + 'px';
        r.style.width  = size + 'px';
        r.style.height = size + 'px';
        document.body.appendChild(r);
        setTimeout(function () { r.remove(); }, 950);
      }, i * 70);
    });
  });

  // ── マーキーストリップ ────────────────────────────────
  (function () {
    var anchor = document.querySelector('.hero, .page-hero');
    if (!anchor) return;
    var words = ['Illustration', 'Design', 'Music', 'Web', 'Creative', 'Original'];
    var inner = words.map(function (w) {
      return '<span class="marquee-item">' + w + '<span class="marquee-sep"></span></span>';
    }).join('');
    var track = document.createElement('div');
    track.className = 'marquee-track';
    track.innerHTML = inner + inner;
    var strip = document.createElement('div');
    strip.className = 'marquee-strip';
    strip.appendChild(track);
    anchor.insertAdjacentElement('afterend', strip);
  }());

  if (window.initReveal) window.initReveal();

  // ── ヒーロータイトル文字分解 ──────────────────────────
  (function () {
    var titleEl = document.querySelector('.hero-title');
    if (!titleEl) return;
    var idx = 0;
    titleEl.querySelectorAll('.t-word').forEach(function (wordEl) {
      wordEl.style.opacity    = '1';
      wordEl.style.transform  = 'none';
      wordEl.style.animation  = 'none';
      var txt = wordEl.textContent;
      wordEl.textContent = '';
      txt.split('').forEach(function (ch) {
        if (ch === ' ') {
          wordEl.appendChild(document.createTextNode(' '));
        } else {
          var s = document.createElement('span');
          s.className = 't-char';
          s.textContent = ch;
          s.style.transitionDelay = (idx * 0.04) + 's';
          wordEl.appendChild(s);
          idx++;
        }
      });
    });
    if (!document.getElementById('piano-intro')) {
      setTimeout(function () { titleEl.classList.add('title-revealed'); }, 300);
    }
  }());

  // ── 画像パーallax セットアップ ────────────────────────
  var scaleMap    = new WeakMap();
  var parallaxArr = [];

  function scanImgs() {
    document.querySelectorAll('.masonry-item img, .work-item img').forEach(function (img) {
      if (scaleMap.has(img)) return;
      var state = { scaleCur: 1, scaleTgt: 1 };
      scaleMap.set(img, state);
      parallaxArr.push(img);
      img.parentElement.addEventListener('mouseenter', function () { state.scaleTgt = 1.05; });
      img.parentElement.addEventListener('mouseleave', function () { state.scaleTgt = 1;    });
    });
  }

  scanImgs();
  setTimeout(scanImgs, 1500);
  setTimeout(scanImgs, 4000);
  window.scanParallaxImgs = scanImgs;

  // ── ピアノ鍵盤 ───────────────────────────────────────
  (function () {
    var B_POS = [0.67, 1.67, 3.67, 4.67, 5.67];

    function makePiano(wrap, ww, octaves, keyH) {
      var bw = Math.round(ww * 0.6);
      var bh = Math.round(keyH * 0.62);
      var whites = [], blacks = [];
      for (var i = 0; i < 7 * octaves; i++) {
        var wk = document.createElement('div');
        wk.className = 'piano-key-w';
        wk.style.width  = ww + 'px';
        wk.style.height = keyH + 'px';
        wrap.appendChild(wk);
        whites.push(wk);
      }
      for (var o = 0; o < octaves; o++) {
        B_POS.forEach(function (p) {
          var bk = document.createElement('div');
          bk.className = 'piano-key-b';
          bk.style.width  = bw + 'px';
          bk.style.height = bh + 'px';
          bk.style.left = ((o * 7 + p) * ww + (ww - bw) / 2) + 'px';
          wrap.appendChild(bk);
          blacks.push(bk);
        });
      }
      whites.concat(blacks).forEach(function (k) {
        k.addEventListener('mouseenter', function () { k.classList.add('pressed'); });
        k.addEventListener('mouseleave', function () { k.classList.remove('pressed'); });
      });
      return { whites: whites, blacks: blacks };
    }

    function playMelody(whites, pattern, interval) {
      pattern.forEach(function (idx, i) {
        setTimeout(function () {
          var k = whites[Math.min(idx, whites.length - 1)];
          if (!k) return;
          k.classList.add('pressed');
          setTimeout(function () { k.classList.remove('pressed'); }, 160);
        }, i * interval);
      });
    }

    // ヒーロー鍵盤（4オクターブ・全幅）
    var heroEl = document.querySelector('.hero');
    if (heroEl) {
      var hWrap = document.createElement('div');
      hWrap.className = 'hero-piano';
      heroEl.appendChild(hWrap);
      var hOct = 5;
      var hWW  = window.innerWidth / (7 * hOct);
      var hPiano = makePiano(hWrap, hWW, hOct, 58);
      setTimeout(function () {
        playMelody(hPiano.whites, [0,1,2,3,4,5,6,7,8,9,10,11,13,11,9,7,5,3,1,0], 95);
      }, 900);
    }

    // セクションセパレーター（ホームページのみ）
    var aboutEl = document.querySelector('.about-strip');
    if (aboutEl) {
      var sep = document.createElement('div');
      sep.className = 'piano-sep';
      var sWrap = document.createElement('div');
      sWrap.className = 'piano-sep-inner';
      sep.appendChild(sWrap);
      aboutEl.insertAdjacentElement('afterend', sep);
      var sOct = 5;
      var sWW  = window.innerWidth / (7 * sOct);
      var sPiano = makePiano(sWrap, sWW, sOct, 80);
      var sepObs = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        sepObs.disconnect();
        playMelody(sPiano.whites, [0,2,4,6,7,9,11,13,11,9,7,6,4,2,0], 90);
      }, { threshold: 0.4 });
      sepObs.observe(sep);
    }
  }());

  // ── 音符フロート ──────────────────────────────────────
  (function () {
    var NOTES = ['♩', '♪', '♫', '♬'];

    function isDarkBg(x, y) {
      var el = document.elementFromPoint(x, y);
      while (el && el !== document.documentElement) {
        var bg = window.getComputedStyle(el).backgroundColor;
        var m  = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/);
        if (m && (m[4] === undefined || parseFloat(m[4]) > 0.1)) {
          return (0.299 * +m[1] + 0.587 * +m[2] + 0.114 * +m[3]) < 100;
        }
        el = el.parentElement;
      }
      return false;
    }

    function spawnNote(x, y, small, light) {
      var n = document.createElement('div');
      n.className = 'float-note' + (small ? ' float-note-sm' : '') + (light ? ' float-note-light' : '');
      n.textContent = NOTES[Math.floor(Math.random() * NOTES.length)];
      n.style.left = x + 'px';
      n.style.top  = y + 'px';
      document.body.appendChild(n);
      setTimeout(function () { n.remove(); }, small ? 1700 : 1200);
    }

    // クリック時に音符を3つ発生
    document.addEventListener('click', function (e) {
      var light = isDarkBg(e.clientX, e.clientY);
      [0, 85, 170].forEach(function (d) {
        setTimeout(function () {
          spawnNote(
            e.clientX + (Math.random() - 0.5) * 50,
            e.clientY - Math.random() * 10,
            false,
            light
          );
        }, d);
      });
    });

    // ヒーロー内でアンビエント音符が定期的に舞い上がる
    var heroEl2 = document.querySelector('.hero');
    if (heroEl2) {
      setInterval(function () {
        var rect = heroEl2.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        spawnNote(
          rect.left + Math.random() * rect.width,
          rect.top  + rect.height * (0.45 + Math.random() * 0.35),
          true
        );
      }, 2400);
    }
  }());

  // ── Universal RAF（パーallax、全デバイス）──────────────
  (function uTick() {
    if (parallaxArr.length) {
      var wh = window.innerHeight;
      var i = parallaxArr.length;
      while (i--) {
        var img   = parallaxArr[i];
        var state = scaleMap.get(img);
        if (!img.isConnected) { scaleMap.delete(img); parallaxArr.splice(i, 1); continue; }
        var rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > wh) continue;
        var prog = (wh - rect.top) / (wh + rect.height);
        var py   = (prog - 0.5) * 40;
        state.scaleCur += (state.scaleTgt - state.scaleCur) * 0.1;
        img.style.transform =
          'translateY(' + py.toFixed(2) + 'px) scale(' + state.scaleCur.toFixed(4) + ')';
      }
    }

    requestAnimationFrame(uTick);
  }());

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

  // ── カーソルインクトレイル ────────────────────────────
  var TRAIL_N  = 10;
  var trailDots = [];
  for (var ti = 0; ti < TRAIL_N; ti++) {
    var td = document.createElement('div');
    td.className = 'cursor-trail';
    var sz = Math.max(1.5, 4.2 - ti * 0.24);
    td.style.width  = sz + 'px';
    td.style.height = sz + 'px';
    document.body.appendChild(td);
    trailDots.push({ el: td, x: -200, y: -200 });
  }

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

    var tx = mx, ty = my;
    for (var ti = 0; ti < trailDots.length; ti++) {
      var td = trailDots[ti];
      var lf = 0.38 - ti * 0.025;
      td.x += (tx - td.x) * lf;
      td.y += (ty - td.y) * lf;
      td.el.style.opacity   = (1 - ti / trailDots.length) * 0.4;
      td.el.style.transform = 'translate(' + td.x + 'px,' + td.y + 'px) translate(-50%,-50%)';
      tx = td.x; ty = td.y;
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

}());
