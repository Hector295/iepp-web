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

      const heroCarousel = document.querySelector('[data-hero-carousel]');
      if (heroCarousel) {
        const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
        const dots = [...heroCarousel.querySelectorAll('[data-hero-dot]')];
        const prevBtn = heroCarousel.querySelector('[data-hero-prev]');
        const nextBtn = heroCarousel.querySelector('[data-hero-next]');
        const count = heroCarousel.querySelector('[data-hero-count]');
        const DURATION = 7500;
        let index = 0;
        let timer = null;
        let heroVisible = true;
        let hovered = false;

        function show(next) {
          index = (next + slides.length) % slides.length;
          slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
          dots.forEach(dot => dot.classList.remove('is-active'));
          dots.forEach((dot, i) => dot.setAttribute('aria-selected', String(i === index)));
          void dots[index].offsetWidth;
          dots[index].classList.add('is-active');
          count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
        }
        function schedule() {
          clearTimeout(timer);
          if (hovered || motion.matches || document.hidden || !heroVisible) return;
          timer = setTimeout(() => { show(index + 1); schedule(); }, DURATION);
        }
        function goTo(next) { show(next); schedule(); }

        prevBtn.addEventListener('click', () => goTo(index - 1));
        nextBtn.addEventListener('click', () => goTo(index + 1));
        dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
        heroCarousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
        heroCarousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
        heroCarousel.addEventListener('focusin', () => { hovered = true; schedule(); });
        heroCarousel.addEventListener('focusout', () => { hovered = false; schedule(); });
        document.addEventListener('visibilitychange', schedule);
        motion.addEventListener('change', schedule);
        new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; schedule(); }, {threshold: .2}).observe(heroCarousel);

        schedule();
      }

      const journey = document.querySelector('[data-journey]');
      const journeyVideo = document.querySelector('[data-journey-video]');
      let ticking = false;
      function syncJourney() {
        ticking = false;
        if (!journey || !journeyVideo || motion.matches) return;
        const headerHeight = document.querySelector('[data-header]').offsetHeight;
        const distance = Math.max(1, journey.offsetHeight - innerHeight + headerHeight);
        const progress = Math.max(0, Math.min(1, (headerHeight - journey.getBoundingClientRect().top) / distance));
        if (Number.isFinite(journeyVideo.duration) && journeyVideo.duration > 0) {
          const time = progress * Math.max(0, journeyVideo.duration - 1 / 24);
          if (Math.abs(journeyVideo.currentTime - time) > 1 / 48) journeyVideo.currentTime = time;
        }
      }
      function requestSync() {
        if (!ticking) { ticking = true; requestAnimationFrame(syncJourney); }
      }
      if (journeyVideo) journeyVideo.addEventListener('loadedmetadata', requestSync);
      window.addEventListener('scroll', requestSync, {passive: true});
      window.addEventListener('resize', requestSync);
      motion.addEventListener('change', requestSync);
      syncJourney();

      const faithTrack = document.querySelector('.faith-carousel-track');
      if (faithTrack) {
        const carousel = document.querySelector('[data-faith-carousel]');
        const cards = [...faithTrack.querySelectorAll('.faith-article')];
        const prev = document.querySelector('[data-faith-prev]');
        const next = document.querySelector('[data-faith-next]');
        const step = () => faithTrack.querySelector('.faith-article').getBoundingClientRect().width + 24;
        const updateButtons = () => {
          const max = faithTrack.scrollWidth - faithTrack.clientWidth - 1;
          prev.disabled = faithTrack.scrollLeft <= 0;
          next.disabled = faithTrack.scrollLeft >= max;
        };
        prev.addEventListener('click', () => faithTrack.scrollBy({left: -step(), behavior: motion.matches ? 'instant' : 'smooth'}));
        next.addEventListener('click', () => faithTrack.scrollBy({left: step(), behavior: motion.matches ? 'instant' : 'smooth'}));
        faithTrack.addEventListener('scroll', updateButtons, {passive: true});
        new ResizeObserver(updateButtons).observe(faithTrack);
        updateButtons();

        carousel.classList.add('js-ready');
        const revealObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-revealed');
            revealObserver.unobserve(entry.target);
          });
        }, {root: faithTrack, rootMargin: '0px 200px', threshold: .1});
        cards.forEach(card => revealObserver.observe(card));

        const activeObserver = new IntersectionObserver(entries => {
          entries.forEach(entry => entry.target.classList.toggle('is-active', entry.intersectionRatio > .65));
        }, {root: faithTrack, threshold: [0, .65, 1]});
        cards.forEach(card => activeObserver.observe(card));
      }
