(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Current year in footer ------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Mobile navigation ----------------------------------------------------- */
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.nav-toggle');
  const list = document.getElementById('primary-nav');

  if (toggle && list) {
    // Clone the header call/book CTAs into the menu so phone + booking stay
    // reachable on phones (the desktop CTA cluster is hidden at < 880px).
    const cta = document.querySelector('.nav-cta');
    if (cta && !list.querySelector('.nav-mobile-cta')) {
      const li = document.createElement('li');
      li.className = 'nav-mobile-cta';
      cta.querySelectorAll('a').forEach((a) => li.appendChild(a.cloneNode(true)));
      if (li.children.length) list.appendChild(li);
    }

    const setOpen = (open) => {
      list.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    };
    const closeMenu = () => setOpen(false);

    toggle.addEventListener('click', () => setOpen(!list.classList.contains('is-open')));

    // Close after choosing a destination
    list.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && list.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    // Close when tapping outside the header
    document.addEventListener('click', (e) => {
      if (list.classList.contains('is-open') && header && !header.contains(e.target)) closeMenu();
    });

    // Reset when resizing up to the desktop layout
    window.addEventListener('resize', () => {
      if (window.innerWidth > 880 && list.classList.contains('is-open')) closeMenu();
    });
  }

  /* Scroll-aware header shadow ------------------------------------------- */
  if (header) {
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* Reveal on scroll ------------------------------------------------------ */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  /* Animated stat counters ------------------------------------------------ */
  const statNums = document.querySelectorAll('.stat .num');
  if (statNums.length) {
    const animateCount = (el) => {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)(.*)$/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const suffix = match[2] || '';
      if (reduceMotion || !('requestAnimationFrame' in window)) {
        el.textContent = target + suffix;
        return;
      }
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
        el.textContent = Math.round(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    if ('IntersectionObserver' in window) {
      const sio = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              sio.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      statNums.forEach((el) => sio.observe(el));
    } else {
      statNums.forEach(animateCount);
    }
  }

  /* FAQ accordion (close others when one opens) -------------------------- */
  const accItems = document.querySelectorAll('.faq-list .faq-item');
  accItems.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        accItems.forEach((other) => {
          if (other !== d) other.open = false;
        });
      }
    });
  });

  /* Back-to-top button ---------------------------------------------------- */
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
  document.body.appendChild(toTop);

  const onTopScroll = () => toTop.classList.toggle('show', window.scrollY > 600);
  onTopScroll();
  window.addEventListener('scroll', onTopScroll, { passive: true });
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
})();
