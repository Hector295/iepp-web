      document.querySelector('[data-current-year]').textContent = String(new Date().getFullYear());
      const menu = document.querySelector('[data-menu]');
      const nav = document.querySelector('[data-nav]');
      const mobile = matchMedia('(max-width: 1200px)');
      const motion = matchMedia('(prefers-reduced-motion: reduce)');
      function setMenu(open) {
        menu.setAttribute('aria-expanded', String(open));
        menu.querySelector('.sr-only').textContent = open ? 'Cerrar menú' : 'Abrir menú';
        nav.classList.toggle('is-open', open);
        nav.inert = mobile.matches && !open;
        document.body.classList.toggle('menu-open', open);
      }
      menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
      nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', e => {
        if (menu.getAttribute('aria-expanded') !== 'true') return;
        if (e.key === 'Escape') { setMenu(false); menu.focus(); }
        if (e.key === 'Tab') {
          const last = nav.querySelector('a:last-child');
          if (e.shiftKey && document.activeElement === menu) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); menu.focus(); }
        }
      });
      mobile.addEventListener('change', () => setMenu(false));
      setMenu(false);

      const heroVideo = document.querySelector('.hero-video');
      let heroVisible = true;
      function updateHero() {
        if (motion.matches || !heroVisible || document.hidden) heroVideo.pause();
        else heroVideo.play().catch(() => {});
      }
      new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; updateHero(); }).observe(heroVideo);
      document.addEventListener('visibilitychange', updateHero);
      motion.addEventListener('change', () => { updateHero(); requestSync(); });
      updateHero();

      const journey = document.querySelector('[data-journey]');
      const journeyVideo = document.querySelector('[data-journey-video]');
      let ticking = false;
      function syncJourney() {
        ticking = false;
        if (motion.matches) return;
        const distance = Math.max(1, journey.offsetHeight - innerHeight);
        const progress = Math.max(0, Math.min(1, -journey.getBoundingClientRect().top / distance));
        if (Number.isFinite(journeyVideo.duration) && journeyVideo.duration > 0) {
          const time = progress * Math.max(0, journeyVideo.duration - 1 / 24);
          if (Math.abs(journeyVideo.currentTime - time) > 1 / 48) journeyVideo.currentTime = time;
        }
      }
      function requestSync() {
        if (!ticking) { ticking = true; requestAnimationFrame(syncJourney); }
      }
      journeyVideo.addEventListener('loadedmetadata', requestSync);
      window.addEventListener('scroll', requestSync, {passive: true});
      window.addEventListener('resize', requestSync);
      syncJourney();
