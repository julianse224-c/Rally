/* ═══════════════════════════════════════════════════════════
   RALLY INGENIERÍA AUTOMOTRIZ · script.js
═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Elements ─────────────────────────────────────────── */
  const loader        = document.getElementById('page-loader');
  const transition    = document.getElementById('page-transition');
  const menuToggle    = document.getElementById('menuToggle');
  const sidebar       = document.getElementById('sidebar');
  const overlay       = document.getElementById('sidebarOverlay');
  const navLinks      = document.querySelectorAll('.nav-link');
  const sections      = document.querySelectorAll('.section');
  const serviceTabs   = document.querySelectorAll('.stab');
  const servicePanels = document.querySelectorAll('.spanel');
  const navLinkBtns   = document.querySelectorAll('.nav-link-btn');

  let currentSection  = 'inicio';
  let isTransitioning = false;

  /* ── 1. Initial Loader ────────────────────────────────── */
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      // Trigger hero reveal animations after loader
      document.querySelectorAll('.reveal-up').forEach(el => {
        el.style.animationPlayState = 'running';
      });
    }, 2600);
  });

  /* ── 2. Sidebar open / close ──────────────────────────── */
  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);

  /* ── 3. Section navigation with gear transition ───────── */
  function navigateTo(sectionId) {
    if (sectionId === currentSection || isTransitioning) return;
    isTransitioning = true;

    // Show transition overlay
    transition.classList.add('active');

    setTimeout(() => {
      // Hide all sections, show target
      sections.forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
      });

      const target = document.getElementById(sectionId);
      if (target) {
        target.classList.remove('hidden');
        target.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });
      }

      currentSection = sectionId;
      updateActiveNavLink(sectionId);

      // Remove transition overlay
      setTimeout(() => {
        transition.classList.remove('active');
        isTransitioning = false;
      }, 350);

    }, 380);
  }

  function updateActiveNavLink(sectionId) {
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      }
    });
  }

  /* ── 4. Nav link clicks ───────────────────────────────── */
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const section = link.dataset.section;
      // Solo prevenir default si es navegación por secciones internas
      if (section) {
        e.preventDefault();
        closeSidebar();
        setTimeout(() => navigateTo(section), 160);
      } else {
        // Permitir navegación normal a otras páginas
        closeSidebar();
      }
    });
  });

  /* ── 5. Inline nav-link-btn (hero "Ver Servicios") ─────── */
  navLinkBtns.forEach(btn => {
    const href = btn.getAttribute('href');
    if (href) {
      btn.addEventListener('click', () => {
        window.location.href = href;
      });
    } else {
      btn.addEventListener('click', () => {
        navigateTo(btn.dataset.section);
      });
    }
  });

  /* ── 6. Service tabs ──────────────────────────────────── */
  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      serviceTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      servicePanels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `tab-${target}`) {
          panel.classList.add('active');
        }
      });
    });
  });

  /* ── 7. Keyboard accessibility ────────────────────────── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });

  /* ── 8. Stats counter animation ──────────────────────── */
  function animateCounter(el) {
    const target  = el.textContent;
    const isPlus  = target.startsWith('+');
    const isPct   = target.endsWith('%');
    const num     = parseInt(target.replace(/\D/g, ''), 10);
    if (isNaN(num)) return;

    let current  = 0;
    const step   = Math.ceil(num / 40);
    const ticker = setInterval(() => {
      current = Math.min(current + step, num);
      el.textContent = (isPlus ? '+' : '') + current + (isPct ? '%' : '');
      if (current >= num) clearInterval(ticker);
    }, 28);
  }

  // Observe about section to trigger counters
  const aboutSection = document.getElementById('nosotros');
  let countersTriggered = false;

  const sectionObserver = new MutationObserver(() => {
    if (!countersTriggered && aboutSection && aboutSection.classList.contains('active')) {
      countersTriggered = true;
      document.querySelectorAll('.stat-num').forEach(el => {
        setTimeout(() => animateCounter(el), 200);
      });
    }
  });

  if (aboutSection) {
    sectionObserver.observe(aboutSection, { attributes: true, attributeFilter: ['class'] });
  }

  /* ── 9. Scroll-reveal within sections ────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  function setupRevealItems(section) {
    const items = section.querySelectorAll(
      '.srv-card, .part-cat, .ventaja-card, .card-info, .contact-card, .about-stat'
    );
    items.forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = `opacity .5s ease ${i * 0.07}s, transform .5s ease ${i * 0.07}s`;
      revealObserver.observe(item);
    });
  }

  // Run once on sections that are already visible
  sections.forEach(s => {
    if (s.classList.contains('active')) setupRevealItems(s);
  });

  // Also run when section becomes active (via navigateTo)
  const activationObserver = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.type === 'attributes' && m.attributeName === 'class') {
        const el = m.target;
        if (el.classList.contains('active')) {
          setTimeout(() => setupRevealItems(el), 50);
        }
      }
    });
  });

  sections.forEach(s => {
    activationObserver.observe(s, { attributes: true, attributeFilter: ['class'] });
  });

  /* ── 10. Rally Bot Modal ──────────────────────────────── */
  const rallyBotBtn   = document.getElementById('rallyBotBtn');
  const rallyBotModal = document.getElementById('rallyBotModal');
  const rallyBotClose = document.getElementById('rallyBotClose');

  console.log('Rally Bot Elements:', { rallyBotBtn, rallyBotModal, rallyBotClose });

  if (rallyBotBtn && rallyBotModal) {
    rallyBotBtn.addEventListener('click', () => {
      console.log('Rally Bot Button Clicked');
      rallyBotModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });

    rallyBotClose.addEventListener('click', () => {
      console.log('Rally Bot Close Clicked');
      rallyBotModal.classList.remove('open');
      document.body.style.overflow = '';
    });

    // Close modal when clicking outside
    rallyBotModal.addEventListener('click', (e) => {
      if (e.target === rallyBotModal) {
        console.log('Rally Bot Modal Outside Click');
        rallyBotModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && rallyBotModal.classList.contains('open')) {
        console.log('Rally Bot Escape Pressed');
        rallyBotModal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  } else {
    console.error('Rally Bot elements not found!');
  }

  /* ── 11. Active highlight on initial load ─────────────── */
  updateActiveNavLink('inicio');

});