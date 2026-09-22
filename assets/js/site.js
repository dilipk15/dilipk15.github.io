(function () {
  // Mobile menu (the site works without JavaScript; this only adds the toggle)
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    // Close the menu after tapping an in-page link such as "Work"
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a') && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Services dropdown for keyboard and touch on desktop
  document.querySelectorAll('.sub-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.has-sub');
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      item.classList.toggle('is-open', !open);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.has-sub.is-open').forEach(function (item) {
      item.classList.remove('is-open');
      var b = item.querySelector('.sub-toggle');
      if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); }
    });
  });

  // Project filters on the home page
  var filters = document.querySelector('.filters');
  var grid = document.getElementById('work-grid');
  if (filters && grid) {
    var cards = grid.querySelectorAll('.work-card');
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var value = btn.getAttribute('data-filter');
      filters.querySelectorAll('[data-filter]').forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      cards.forEach(function (card) {
        var show = value === 'all' || card.getAttribute('data-category') === value;
        card.hidden = !show;
        if (show) { card.style.animation = 'none'; void card.offsetWidth; card.style.animation = ''; }
      });
    });
  }

  // Copy email button
  document.querySelectorAll('.js-copy').forEach(function (btn) {
    if (!navigator.clipboard) return;
    btn.hidden = false;
    var label = btn.querySelector('span');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () {
        label.textContent = 'Copied';
        setTimeout(function () { label.textContent = 'Copy address'; }, 2000);
      });
    });
  });
})();

// Enquiry form: no server, so it opens the visitor's email app with the message filled in
(function () {
  document.querySelectorAll('.js-mailto').forEach(function (form) {
    var error = form.querySelector('.form-error');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      var required = [f.name, f.email, f.message];
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim());
      var ok = true;
      required.forEach(function (el) {
        var bad = !el.value.trim() || (el === f.email && !emailOk);
        el.setAttribute('aria-invalid', String(bad));
        if (bad && ok) { el.focus(); ok = false; }
      });
      error.hidden = ok;
      if (!ok) return;
      var subject = 'Project enquiry: ' + f.service.value + (f.business.value.trim() ? ' (' + f.business.value.trim() + ')' : '');
      var body = 'Hi Dilip,\n\n' + f.message.value.trim() + '\n\nName: ' + f.name.value.trim() + '\nEmail: ' + f.email.value.trim() +
        (f.business.value.trim() ? '\nBusiness: ' + f.business.value.trim() : '') + '\nService: ' + f.service.value;
      window.location.href = 'mailto:' + form.getAttribute('data-email') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });
})();

// Hero background: a small connected-dots network. Skipped for reduced motion; paused when off-screen.
(function () {
  var canvas = document.getElementById('hero-net');
  if (!canvas || !canvas.getContext) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var ctx = canvas.getContext('2d');
  var dots = [], w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), running = true, last = 0;

  function size() {
    var r = canvas.getBoundingClientRect();
    w = r.width; h = r.height;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var count = Math.max(14, Math.min(32, Math.round(w * h / 30000)));
    dots = [];
    for (var i = 0; i < count; i++) {
      dots.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22, r: Math.random() * 1.6 + 1 });
    }
  }

  function frame(t) {
    if (!running) return;
    requestAnimationFrame(frame);
    if (t - last < 33) return;
    last = t;
    ctx.clearRect(0, 0, w, h);
    var max = w < 700 ? 110 : 150;
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > w) d.vx *= -1;
      if (d.y < 0 || d.y > h) d.vy *= -1;
      for (var j = i + 1; j < dots.length; j++) {
        var e = dots[j], dx = d.x - e.x, dy = d.y - e.y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < max) {
          ctx.strokeStyle = 'rgba(125,170,255,' + (0.3 * (1 - dist / max)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(e.x, e.y); ctx.stroke();
        }
      }
      ctx.fillStyle = 'rgba(160,195,255,.75)';
      ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.283); ctx.fill();
    }
  }

  // Start only once the page has finished loading, so it never competes with first paint
  function start() { size(); requestAnimationFrame(frame); }
  if (document.readyState === 'complete') setTimeout(start, 600);
  else window.addEventListener('load', function () { setTimeout(start, 600); });
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 200); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      var visible = entries[0].isIntersecting;
      var wasRunning = running;
      running = visible;
      if (visible && !wasRunning) requestAnimationFrame(frame);
    }).observe(canvas);
  }
})();

// Project tabs: one panel at a time (all panels stay visible without JavaScript)
(function () {
  var list = document.querySelector('.ptab-list');
  if (!list) return;
  var tabs = [].slice.call(list.querySelectorAll('.ptab'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

  function show(i, focus) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[n]) {
        if (on) panels[n].removeAttribute('data-secondary');
        else panels[n].setAttribute('data-secondary', '');
      }
    });
    if (focus) tabs[i].focus();
  }

  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.ptab');
    if (btn) show(tabs.indexOf(btn));
  });
  list.addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      show((i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length, true);
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      show(e.key === 'Home' ? 0 : tabs.length - 1, true);
    }
  });
  show(0);
})();
