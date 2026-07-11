/* ============================================================
   script.js - Portfolio with 3D effects, particles, theme toggle,
   custom cursor, animated counters, magnetic buttons, floating badges
   ============================================================ */

// ============================================================
// 1. THEME TOGGLE (Dark / Light Mode with localStorage)
// ============================================================
(function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  const icon = themeToggle.querySelector('i');
  const saved = localStorage.getItem('theme') || 'light';

  document.documentElement.setAttribute('data-theme', saved);
  icon.className = saved === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    icon.className = next === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';

    themeToggle.style.transform = 'scale(0.8) rotate(180deg)';
    setTimeout(() => { themeToggle.style.transform = ''; }, 300);
  });
})();

// ============================================================
// 2. LOADING SCREEN
// ============================================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => { loader.style.display = 'none'; }, 600);
  }
});

// ============================================================
// 3. TYPING ANIMATION
// ============================================================
(function initTyping() {
  const phrases = [
    "Web Developer 🔥",
    "Full Stack Developer ⭐",
    "MERN Full Stack Developer ✨",
    "Frontend & Backend Developer 💻"
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typedEl = document.getElementById('typed');
  if (!typedEl) return;

  function type() {
    if (phraseIndex >= phrases.length) phraseIndex = 0;
    const full = phrases[phraseIndex];

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
// 4. SCROLL REVEAL
// ============================================================
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  function showOnScroll() {
    const windowHeight = window.innerHeight;
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < windowHeight - 60) {
        el.classList.add('show');
      }
    });
  }

  window.addEventListener('scroll', showOnScroll, { passive: true });
  window.addEventListener('load', showOnScroll);
  window.addEventListener('resize', showOnScroll);
})();

// ============================================================
// 5. SMOOTH SCROLL
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const navbarCollapse = document.getElementById('navbarNav');
      if (navbarCollapse && navbarCollapse.classList.contains('show') && typeof bootstrap !== 'undefined') {
        const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
        if (bsCollapse) bsCollapse.hide();
      }
    }
  });
});

// ============================================================
// 6. NAVBAR SCROLL EFFECT
// ============================================================
(function initNavbarScroll() {
  const nav = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }, { passive: true });
})();

// ============================================================
// 7. FORM HANDLER
// ============================================================
(function initForm() {
  const form = document.querySelector('#contact form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Message Sent!';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
})();

// ============================================================
// 8. ACTIVE NAV LINK ON SCROLL
// ============================================================
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function updateActiveLink() {
    let current = '';
    const scrollY = window.scrollY + 100;

    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  window.addEventListener('load', updateActiveLink);
})();

// ============================================================
// 9. 3D TILT EFFECT (VanillaTilt-style implementation)
// ============================================================
(function init3DTilt() {
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach((card) => {
    const scale = parseFloat(card.getAttribute('data-tilt-scale')) || 1.02;
    const glare = card.hasAttribute('data-tilt-glare');

    if (glare) {
      const glareEl = document.createElement('div');
      glareEl.className = 'tilt-glare';
      glareEl.style.cssText =
        'position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,rgba(255,255,255,0.15),transparent 50%,rgba(0,0,0,0.1));opacity:0;transition:opacity 0.4s ease;pointer-events:none;z-index:5;';
      card.style.position = 'relative';
      card.appendChild(glareEl);
    }

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

      if (glare) {
        const glareEl = card.querySelector('.tilt-glare');
        if (glareEl) {
          glareEl.style.opacity = '1';
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glareEl.style.background =
            `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
        }
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform =
        'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';

      if (glare) {
        const glareEl = card.querySelector('.tilt-glare');
        if (glareEl) glareEl.style.opacity = '0';
      }
    });
  });
})();

// ============================================================
// 10. PARTICLE NETWORK ANIMATION
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouseX = -1000;
  let mouseY = -1000;
  let animId;
  let isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
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

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particleColor = isDark ? '180, 180, 220' : '99, 102, 241';
    const lineColor = isDark ? '180, 180, 220' : '99, 102, 241';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor}, ${p.alpha})`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;

        if (dist < maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${lineColor}, ${(1 - dist / maxDist) * 0.15})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      const dxm = p.x - mouseX;
      const dym = p.y - mouseY;
      const distMouse = Math.sqrt(dxm * dxm + dym * dym);
      if (distMouse < 150) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouseX, mouseY);
        ctx.strokeStyle = `rgba(${lineColor}, ${(1 - distMouse / 150) * 0.2})`;
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

  window.addEventListener('resize', () => {
    resize();
    createParticles(Math.min(Math.floor((canvas.width * canvas.height) / 12000), 80));
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('touchmove', (e) => {
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
  }, { passive: true });

  const themeObserver = new MutationObserver(() => {
    isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  init();
})();

// ============================================================
// 11. HERO 3D PARALLAX (mouse-follow depth)
// ============================================================
(function initHeroParallax() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const orbs = hero.querySelectorAll('.hero-orb');
  const floatingBadges = hero.querySelectorAll('.hero-floating-badge');
  const imageWrapper = hero.querySelector('.hero-image-wrapper');

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 1.5;
      orb.style.transform =
        `translateX(${x * depth * 2}px) translateY(${y * depth * 2}px)`;
    });

    // Move floating badges with parallax
    floatingBadges.forEach((badge, i) => {
      const depth = (i + 1) * 0.8;
      badge.style.transform =
        `translateY(${Math.sin(Date.now() / 1000 + i) * 10}px) translateX(${x * depth * 3}px)`;
    });

    // Subtle image wrapper tilt
    if (imageWrapper) {
      const imgRotateX = y * -5;
      const imgRotateY = x * 5;
      const inner = imageWrapper.querySelector('.hero-image-inner');
      if (inner) {
        inner.style.transform = `perspective(800px) rotateX(${imgRotateX}deg) rotateY(${imgRotateY}deg) scale(1.02)`;
      }
    }
  });

  hero.addEventListener('mouseleave', () => {
    orbs.forEach((orb, i) => {
      orb.style.transition = 'transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
      orb.style.transform = `translateX(0) translateY(0)`;
      setTimeout(() => { orb.style.transition = ''; }, 800);
    });

    if (imageWrapper) {
      const inner = imageWrapper.querySelector('.hero-image-inner');
      if (inner) {
        inner.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        inner.style.transform = '';
        setTimeout(() => { inner.style.transition = ''; }, 600);
      }
    }
  });
})();

// ============================================================
// 12. PROJECT CARD PERSPECTIVE ENHANCEMENT
// ============================================================
(function initProjectCard3D() {
  const projectCards = document.querySelectorAll('.project-card');

  projectCards.forEach((card) => {
    const img = card.querySelector('.project-card-img-wrapper img');
    const overlay = card.querySelector('.project-card-overlay');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (img) {
        img.style.transform = `scale(1.12) translateX(${x * 8}px) translateY(${y * 8}px)`;
      }
      if (overlay) {
        overlay.style.background =
          `linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,${0.3 + Math.abs(x) * 0.3}) 100%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      if (img) img.style.transform = '';
      if (overlay) overlay.style.background = '';
    });
  });
})();

// ============================================================
// 13. CUSTOM CURSOR
// ============================================================
(function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor) return;

  const dot = cursor.querySelector('.cursor-dot');
  const ring = cursor.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  // Skip on touch devices
  if ('ontouchstart' in window) {
    cursor.style.display = 'none';
    return;
  }

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Dot follows immediately
    dotX += (mouseX - dotX) * 0.25;
    dotY += (mouseY - dotY) * 0.25;
    dot.style.left = dotX + 'px';
    dot.style.top = dotY + 'px';

    // Ring follows with lag
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';

    requestAnimationFrame(animate);
  }

  animate();

  // Hover state on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .skill-card, .service-card, .project-card, .contact-card-item');

  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

// ============================================================
// 14. MAGNETIC BUTTON EFFECT
// ============================================================
(function initMagneticButtons() {
  const btns = document.querySelectorAll('.magnetic-btn');

  btns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.03)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });
})();

// ============================================================
// 15. ANIMATED COUNTERS (About Stats)
// ============================================================
(function initAnimatedCounters() {
  const counters = document.querySelectorAll('.stat-number[data-count]');
  if (!counters.length) return;

  let counted = false;

  function animateCounters() {
    if (counted) return;

    const firstCounter = counters[0];
    if (!firstCounter) return;

    const rect = firstCounter.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    counted = true;

    counters.forEach((counter) => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        counter.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });
  }

  window.addEventListener('scroll', animateCounters, { passive: true });
  window.addEventListener('load', animateCounters);
})();

// ============================================================
// 16. SCENE 3D DEPTH PARALLAX (global mouse)
// ============================================================
(function initScene3D() {
  const scene = document.getElementById('scene-3d');
  if (!scene) return;

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const orbs = scene.querySelectorAll('.scene-orb');
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 3;
      orb.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });

    // Rings only translate with mouse; CSS handles rotation via JS in initSceneRings
    const rings = scene.querySelectorAll('.scene-ring');
    rings.forEach((ring, i) => {
      const depth = (i + 1) * 2;
      ring.style.setProperty('--mx', `${x * depth}px`);
      ring.style.setProperty('--my', `${y * depth}px`);
    });
  });
})();

// ============================================================
// 17. LET'S TALK FLOATING NOTIFICATION
// ============================================================
(function initLetsTalk() {
  const float = document.getElementById('lets-talk-float');
  const bubble = document.getElementById('lets-talk-bubble');
  const closeBtn = document.getElementById('bubble-close');
  const talkBtn = float ? float.querySelector('.lets-talk-btn') : null;
  if (!float || !bubble || !closeBtn) return;

  // Let's Talk button scrolls to contact section
  if (talkBtn) {
    talkBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      bubble.classList.remove('show');
    });
  }

  // Show bubble after 3 seconds
  setTimeout(() => {
    bubble.classList.add('show');
  }, 3000);

  // Hide bubble after 10 seconds if not closed
  let bubbleTimeout = setTimeout(() => {
    bubble.classList.remove('show');
  }, 13000);

  // Close button
  closeBtn.addEventListener('click', () => {
    bubble.classList.remove('show');
    clearTimeout(bubbleTimeout);
  });

  // Re-show bubble every 30 seconds if closed
  setInterval(() => {
    if (!bubble.classList.contains('show')) {
      bubble.classList.add('show');
      setTimeout(() => {
        bubble.classList.remove('show');
      }, 8000);
    }
  }, 30000);
})();

// ============================================================
// 18. FLOATING BADGES CONTINUOUS ANIMATION
// ============================================================
(function initFloatingBadges() {
  const badges = document.querySelectorAll('.hero-floating-badge');

  badges.forEach((badge, i) => {
    let offset = i * 1.2;

    function animate() {
      offset += 0.018;
      const y = Math.sin(offset) * 12;
      const rotate = Math.sin(offset * 0.7) * 5;
      badge.style.transform = `translateY(${y}px) rotate(${rotate}deg)`;
      requestAnimationFrame(animate);
    }

    animate();
  });
})();
