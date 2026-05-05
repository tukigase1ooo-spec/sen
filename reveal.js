(function () {
  if (!window.IntersectionObserver) return;

  var io;

  function initReveal() {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.dataset.revealDelay || '0', 10);
        setTimeout(function () { el.classList.add('revealed'); }, delay);
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('[data-reveal]:not(.revealed)').forEach(function (el) {
      io.observe(el);
    });
  }

  window.initReveal = initReveal;

  var intro = document.getElementById('piano-intro');
  if (intro) {
    var mo = new MutationObserver(function () {
      if (!document.getElementById('piano-intro')) {
        mo.disconnect();
        initReveal();
      }
    });
    mo.observe(document.body, { childList: true });
  } else {
    initReveal();
  }
}());
