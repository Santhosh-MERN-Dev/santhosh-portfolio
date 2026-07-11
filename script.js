/* ============================================================
   script.js - Optimized Portfolio
   Performance optimizations applied:
   - rAF-throttled mouse handlers (eliminates jank from rapid mousemove)
   - Debounced resize handlers (prevents layout thrashing)
   - IntersectionObserver replaces scroll-heavy reveal/counter/nav logic
   - Visibility API pauses particle canvas when tab is hidden
   - setTimeout chains replace setInterval (avoids leaked timers)
   - Single rAF loop per animation group (fewer frame callbacks)
   - Cached DOM queries (avoids repeated reflows)
   - distSq comparison avoids expensive Math.sqrt where possible
   ============================================================ */

// ============================================================
// Utility: rAF Throttle
// Ensures mousemove handlers fire at most once per frame
// ============================================================
function rafThrottle(fn) {
  var ticking = false;
  return function () {
    if (!ticking) {
      ticking = true;
      var args = arguments;
      var ctx = this;
      requestAnimationFrame(function () {
        fn.apply(ctx, args);
        ticking = false;
      });
    }
  };
}

// ============================================================
// Utility: Debounce
// Delays execution until user stops triggering (resize, etc.)
// ============================================================
function debounce(fn, ms) {
  var timer;
  return function () {
    clearTimeout(timer);
    var ctx = this;
    var args = arguments;
    timer = setTimeout(function () {
      fn.apply(ctx, args);
    }, ms);
  };
}

// ============================================================
// 1. THEME TOGGLE (Dark / Light Mode with localStorage)
// ============================================================
(function initTheme() {
  var themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  var icon = themeToggle.querySelector('i');
  var saved = localStorage.getItem('theme') || 'light';

  document.documentElement.setAttribute('data-theme', saved);
  icon.className = saved === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';

  themeToggle.addEventListener('click', function () {
    var current = document.documentElement.getAttribute('data-theme');
    var next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    icon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';

    themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
    setTimeout(function () {
      themeToggle.style.transform = '';
    }, 300);
  });
})();

// ============================================================
// 2. LOADING SCREEN
// ============================================================
window.addEventListener('load', function () {
  var loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(function () {
      loader.style.display = 'none';
    }, 600);
  }
});

// ============================================================
// 3. TYPING ANIMATION
// ============================================================
(function initTyping() {
  var phrases = [
    "Web Developer \uD83D\uDD25",
    "Full Stack Developer \u2B50",
    "MERN Full Stack Developer \u2728",
    "Frontend & Backend Developer \uD83D\uDCBB"
  ];
  var phraseIndex = 0;
  var charIndex = 0;
  var isDeleting = false;
  var typedEl = document.getElementById('typed');
  if (!typedEl) return;

  function type() {
    if (phraseIndex >= phrases.length) phraseIndex = 0;
    var full = phrases[phraseIndex];

    if (!isDeleting) {
      typedEl.textContent = full.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === full.length) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
      setTimeout(type, 80);
    } else {
      typedEl.textContent = full.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex++;
        setTimeout(type, 300);
        return;
      }
      setTimeout(type, 40);
    }
  }

  type();
})();

// ============================================================
// 4. SCROLL REVEAL (IntersectionObserver - NO scroll handler)
// OPT: IntersectionObserver eliminates per-frame DOM scanning
// that the old scroll listener performed on ALL .reveal elements
// ============================================================
(function initScrollReveal() {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  // Check for IntersectionObserver support
  if (!('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    reveals.forEach(function (el) { el.classList.add('show'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) {
        entries[i].target.classList.add('show');
        observer.unobserve(entries[i].target); // OPT: stop observing once revealed
      }
    }
  }, {
    rootMargin: '0px 0px -60px 0px', // trigger 60px before element enters viewport
    threshold: 0
  });

  for (var i = 0; i < reveals.length; i++) {
    observer.observe(reveals[i]);
  }
})();

// ============================================================
// 5. SMOOTH SCROLL
// ============================================================
(function initSmoothScroll() {
  var anchors = document.querySelectorAll('a[href^="#"]');

  for (var i = 0; i < anchors.length; i++) {
    anchors[i].addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        var navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse && navbarCollapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
          var bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
          if (bsCollapse) bsCollapse.hide();
        }
      }
    });
  }
})();

// ============================================================
// 6. NAVBAR SCROLL EFFECT (rAF-throttled)
// OPT: rAF throttle prevents layout thrashing from rapid scroll events
// ============================================================
(function initNavbarScroll() {
  var nav = document.querySelector('.navbar');
  if (!nav) return;

  window.addEventListener('scroll', rafThrottle(function () {
    if (window.scrollY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }), { passive: true });
})();

// ============================================================
// 7. FORM HANDLER
// ============================================================
(function initForm() {
  var form = document.querySelector('#contact form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    var originalText = btn.innerHTML;

    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Message Sent!';
    btn.disabled = true;

    setTimeout(function () {
      btn.innerHTML = originalText;
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
})();

// ============================================================
// 8. ACTIVE NAV LINK ON SCROLL (rAF-throttled)
// OPT: Cached navLinks and sections to avoid repeated DOM queries
// ============================================================
(function initActiveNav() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  // Cache section offsets to avoid reflow on every scroll
  var sectionData = [];

  function cacheSectionData() {
    sectionData = [];
    for (var i = 0; i < sections.length; i++) {
      sectionData.push({
        id: sections[i].getAttribute('id'),
        top: sections[i].offsetTop,
        height: sections[i].offsetHeight
      });
    }
  }

  cacheSectionData();
  window.addEventListener('resize', debounce(cacheSectionData, 200));

  function updateActiveLink() {
    var scrollY = window.scrollY + 100;
    var current = '';

    for (var i = 0; i < sectionData.length; i++) {
      if (scrollY >= sectionData[i].top && scrollY < sectionData[i].top + sectionData[i].height) {
        current = sectionData[i].id;
      }
    }

    for (var i = 0; i < navLinks.length; i++) {
      var isActive = navLinks[i].getAttribute('href') === '#' + current;
      // OPT: only modify DOM if class actually changes (avoids forced reflow)
      if (isActive && !navLinks[i].classList.contains('active')) {
        navLinks[i].classList.add('active');
      } else if (!isActive && navLinks[i].classList.contains('active')) {
        navLinks[i].classList.remove('active');
      }
    }
  }

  window.addEventListener('scroll', rafThrottle(updateActiveLink), { passive: true });
  updateActiveLink();
})();

// ============================================================
// 9. 3D TILT EFFECT (rAF-throttled mousemove)
// OPT: Throttled with rAF to prevent jank on rapid mouse movement
// ============================================================
(function init3DTilt() {
  var cards = document.querySelectorAll('.tilt-card');
  if (!cards.length) return;

  for (var c = 0; c < cards.length; c++) {
    (function (card) {
      var scale = parseFloat(card.getAttribute('data-tilt-scale')) || 1.02;
      var hasGlare = card.hasAttribute('data-tilt-glare');
      var glareEl = null;

      if (hasGlare) {
        glareEl = document.createElement('div');
        glareEl.className = 'tilt-glare';
        glareEl.style.cssText =
          'position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 50%,rgba(0,0,0,0.1));opacity:0;transition:opacity 0.4s ease;pointer-events:none;z-index:5;';
        card.style.position = 'relative';
        card.appendChild(glareEl);
      }

      card.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -8;
        var rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform =
          'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale3d(' + scale + ',' + scale + ',' + scale + ')';

        if (hasGlare && glareEl) {
          glareEl.style.opacity = '1';
          var glareX = (x / rect.width) * 100;
          var glareY = (y / rect.height) * 100;
          glareEl.style.background =
            'radial-gradient(circle at ' + glareX + '% ' + glareY + '%, rgba(255,255,255,0.12) 0%, transparent 60%)';
        }
      }));

      card.addEventListener('mouseleave', function () {
        card.style.transform =
          'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';

        if (hasGlare && glareEl) glareEl.style.opacity = '0';
      });
    })(cards[c]);
  }
})();

// ============================================================
// 10. PARTICLE NETWORK ANIMATION
// OPT: Debounced resize, rAF-throttled mouse, visibility API pause,
// distSq avoids Math.sqrt for distance comparisons
// ============================================================
(function initParticles() {
  var canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var animId;
  var isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles(count) {
    particles = [];
    for (var i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
      });
    }
  }

  var MAX_DIST_SQ = 14400; // 120^2 - avoids sqrt for line distance check
  var MOUSE_DIST_SQ = 22500; // 150^2 - avoids sqrt for mouse distance check

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var particleColor = isDark ? '180, 180, 220' : '99, 102, 241';
    var lineColor = isDark ? '180, 180, 220' : '99, 102, 241';
    var len = particles.length;

    for (var i = 0; i < len; i++) {
      var p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + particleColor + ',' + p.alpha + ')';
      ctx.fill();

      // Draw connection lines between nearby particles
      for (var j = i + 1; j < len; j++) {
        var p2 = particles[j];
        var dx = p.x - p2.x;
        var dy = p.y - p2.y;
        var distSq = dx * dx + dy * dy;

        if (distSq < MAX_DIST_SQ) {
          var dist = Math.sqrt(distSq);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(' + lineColor + ',' + ((1 - dist / 120) * 0.15) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Draw line to mouse cursor
      var dxm = p.x - mouseX;
      var dym = p.y - mouseY;
      var distMouseSq = dxm * dxm + dym * dym;
      if (distMouseSq < MOUSE_DIST_SQ) {
        var distMouse = Math.sqrt(distMouseSq);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = 'rgba(' + lineColor + ',' + ((1 - distMouse / 150) * 0.2) + ')';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    animId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createParticles(Math.min(Math.floor((canvas.width * canvas.height) / 12000), 80));
    draw();
  }

  // OPT: Debounced resize prevents recreating particles on every resize event
  window.addEventListener('resize', debounce(function () {
    resize();
    createParticles(Math.min(Math.floor((canvas.width * canvas.height) / 12000), 80));
  }, 250));

  // OPT: rAF-throttled mousemove prevents jank
  document.addEventListener('mousemove', rafThrottle(function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }));

  document.addEventListener('touchmove', function (e) {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });

  // Theme-aware particle colors
  var themeObserver = new MutationObserver(function () {
    isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  // OPT: Pause animation when tab is hidden (saves CPU/GPU)
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });

  init();
})();

// ============================================================
// 11. HERO 3D PARALLAX (rAF-throttled mousemove)
// OPT: Throttled mousemove prevents jank; cached DOM queries
// ============================================================
(function initHeroParallax() {
  var hero = document.querySelector('.hero');
  if (!hero) return;

  var orbs = hero.querySelectorAll('.hero-orb');
  var floatingBadges = hero.querySelectorAll('.hero-floating-badge');
  var imageWrapper = hero.querySelector('.hero-image-wrapper');
  var inner = imageWrapper ? imageWrapper.querySelector('.hero-image-inner') : null;

  hero.addEventListener('mousemove', rafThrottle(function (e) {
    var rect = hero.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;

    for (var i = 0; i < orbs.length; i++) {
      var depth = (i + 1) * 1.5;
      orbs[i].style.transform =
        'translateX(' + (x * depth * 2) + 'px) translateY(' + (y * depth * 2) + 'px)';
    }

    // Move floating badges with parallax
    var now = Date.now() / 1000;
    for (var i = 0; i < floatingBadges.length; i++) {
      var depth = (i + 1) * 0.8;
      floatingBadges[i].style.transform =
        'translateY(' + (Math.sin(now + i) * 10) + 'px) translateX(' + (x * depth * 3) + 'px)';
    }

    // Subtle image wrapper tilt
    if (inner) {
      inner.style.transform = 'perspective(800px) rotateX(' + (y * -5) + 'deg) rotateY(' + (x * 5) + 'deg) scale(1.02)';
    }
  }));

  hero.addEventListener('mouseleave', function () {
    for (var i = 0; i < orbs.length; i++) {
      orbs[i].style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
      orbs[i].style.transform = 'translateX(0) translateY(0)';
    }

    if (inner) {
      inner.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
      inner.style.transform = '';
    }

    // Clean up transitions after animation completes
    setTimeout(function () {
      for (var i = 0; i < orbs.length; i++) {
        orbs[i].style.transition = '';
      }
      if (inner) inner.style.transition = '';
    }, 800);
  });
})();

// ============================================================
// 12. PROJECT CARD PERSPECTIVE (rAF-throttled)
// ============================================================
(function initProjectCard3D() {
  var projectCards = document.querySelectorAll('.project-card');
  if (!projectCards.length) return;

  for (var c = 0; c < projectCards.length; c++) {
    (function (card) {
      var img = card.querySelector('.project-card-img-wrapper img');
      var overlay = card.querySelector('.project-card-overlay');

      card.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;

        if (img) {
          img.style.transform = 'scale(1.12) translateX(' + (x * 8) + 'px) translateY(' + (y * 8) + 'px)';
        }
        if (overlay) {
          overlay.style.background =
            'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,' + (0.3 + Math.abs(x) * 0.3) + ') 100%)';
        }
      }));

      card.addEventListener('mouseleave', function () {
        if (img) img.style.transform = '';
        if (overlay) overlay.style.background = '';
      });
    })(projectCards[c]);
  }
})();

// ============================================================
// 13. CUSTOM CURSOR (already uses requestAnimationFrame)
// OPT: Only runs on non-touch devices; hidden cursor element
// removed from DOM flow with pointer-events:none
// ============================================================
(function initCustomCursor() {
  var cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  var dot = cursor.querySelector('.cursor-dot');
  var ring = cursor.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Skip on touch devices
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    return;
  }

  var mouseX = 0, mouseY = 0;
  var dotX = 0, dotY = 0;
  var ringX = 0, ringY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Dot follows immediately (lerp factor 0.25)
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    // Ring follows with lag (lerp factor 0.12)
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animate);
  }

  animate();

  // Hover state on interactive elements
  var hoverTargets = document.querySelectorAll('a, button, .tilt-card, .skill-card, .service-card, .project-card, .contact-card-item');

  for (var i = 0; i < hoverTargets.length; i++) {
    hoverTargets[i].addEventListener('mouseenter', function () {
      document.body.classList.add('cursor-hover');
    });
    hoverTargets[i].addEventListener('mouseleave', function () {
      document.body.classList.remove('cursor-hover');
    });
  }
})();

// ============================================================
// 14. MAGNETIC BUTTON EFFECT (rAF-throttled)
// ============================================================
(function initMagneticButtons() {
  var btns = document.querySelectorAll('.magnetic-btn');
  if (!btns.length) return;

  for (var b = 0; b < btns.length; b++) {
    (function (btn) {
      btn.addEventListener('mousemove', rafThrottle(function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px) scale(1.03)';
      }));

      btn.addEventListener('mouseleave', function () {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
        setTimeout(function () {
          btn.style.transition = '';
        }, 400);
      });
    })(btns[b]);
  }
})();

// ============================================================
// 15. ANIMATED COUNTERS (IntersectionObserver - NO scroll handler)
// OPT: IntersectionObserver eliminates per-frame scroll checking
// ============================================================
(function initAnimatedCounters() {
  var counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  var counted = false;
  var statsSection = counters[0].closest('.about-stats');
  if (!statsSection) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback: show final values immediately
    counters.forEach(function (counter) {
      counter.textContent = counter.getAttribute('data-count');
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      observer.disconnect();

      for (var i = 0; i < counters.length; i++) {
        (function (counter) {
          var target = parseInt(counter.getAttribute('data-count'), 10);
          var duration = 2000;
          var startTime = performance.now();

          function update(currentTime) {
            var elapsed = currentTime - startTime;
            var progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            var eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.floor(eased * target);

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              counter.textContent = target;
            }
          }

          requestAnimationFrame(update);
        })(counters[i]);
      }
    }
  }, { threshold: 0.5 });

  observer.observe(statsSection);
})();

// ============================================================
// 16. SCENE 3D DEPTH PARALLAX (rAF-throttled global mouse)
// OPT: Throttled mousemove, cached DOM elements
// ============================================================
(function initScene3D() {
  var scene = document.getElementById('scene-3d');
  if (!scene) return;

  var orbs = scene.querySelectorAll('.scene-orb');
  var rings = scene.querySelectorAll('.scene-ring');

  document.addEventListener('mousemove', rafThrottle(function (e) {
    var x = (e.clientX / window.innerWidth - 0.5) * 2;
    var y = (e.clientY / window.innerHeight - 0.5) * 2;

    for (var i = 0; i < orbs.length; i++) {
      var depth = (i + 1) * 3;
      orbs[i].style.transform = 'translate(' + (x * depth) + 'px, ' + (y * depth) + 'px)';
    }

    for (var i = 0; i < rings.length; i++) {
      var depth = (i + 1) * 2;
      rings[i].style.setProperty('--mx', (x * depth) + 'px');
      rings[i].style.setProperty('--my', (y * depth) + 'px');
    }
  }));
})();

// ============================================================
// 17. LET'S TALK FLOATING NOTIFICATION
// OPT: Replaced setInterval with setTimeout chains to avoid
// leaked/repeated timers. Uses closure-based scheduling.
// ============================================================
(function initLetsTalk() {
  var float = document.getElementById('lets-talk-float');
  var bubble = document.getElementById('lets-talk-bubble');
  var closeBtn = document.getElementById('bubble-close');
  var talkBtn = float ? float.querySelector('.lets-talk-btn') : null;
  if (!float || !bubble || !closeBtn) return;

  var hideTimer = null;
  var showTimer = null;

  function scheduleShow(delay) {
    clearTimeout(showTimer);
    showTimer = setTimeout(showBubble, delay);
  }

  function showBubble() {
    bubble.classList.add('show');
    // Auto-hide after 8 seconds
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () {
      bubble.classList.remove('show');
      // Re-show after 30 seconds
      scheduleShow(30000);
    }, 8000);
  }

  // Let's Talk button scrolls to contact section
  if (talkBtn) {
    talkBtn.addEventListener('click', function (e) {
      e.preventDefault();
      var contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      bubble.classList.remove('show');
      clearTimeout(hideTimer);
      scheduleShow(30000); // Re-show after 30 seconds
    });
  }

  // Close button
  closeBtn.addEventListener('click', function () {
    bubble.classList.remove('show');
    clearTimeout(hideTimer);
    scheduleShow(30000); // Re-show after 30 seconds
  });

  // Initial show after 3 seconds
  scheduleShow(3000);
})();

// ============================================================
// 18. FLOATING BADGES CONTINUOUS ANIMATION
// OPT: Single rAF loop for all badges instead of one per badge
// ============================================================
(function initFloatingBadges() {
  var badges = document.querySelectorAll('.hero-floating-badge');
  if (!badges.length) return;

  // Use a single rAF loop for ALL badges (1 callback vs N)
  var offsets = [];
  for (var i = 0; i < badges.length; i++) {
    offsets.push(i * 1.2);
  }

  function animate() {
    for (var i = 0; i < badges.length; i++) {
      offsets[i] += 0.018;
      var y = Math.sin(offsets[i]) * 12;
      var rotate = Math.sin(offsets[i] * 0.7) * 5;
      badges[i].style.transform = 'translateY(' + y + 'px) rotate(' + rotate + 'deg)';
    }
    requestAnimationFrame(animate);
  }

  animate();
})();
