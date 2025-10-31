// 🌗 Theme Toggle: Handles dark/light mode switching with localStorage and system preference
(function () {
  const btn = document.getElementById('theme-toggle');
  const storageKey = 'theme';

  function setTheme(mode) {
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem(storageKey, mode);
  }

  btn?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });

  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener?.('change', (e) => {
    if (!localStorage.getItem(storageKey)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();

// 📱 Mobile Menu Accessibility: Toggles menu visibility and handles ARIA attributes, Escape key, and outside clicks
(function () {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const nav = document.getElementById('primary-navigation');

  function openMenu() {
    menu.classList.remove('hidden');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close main menu');
    const firstLink = nav.querySelector('a');
    firstLink && firstLink.focus();
  }

  function closeMenu() {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open main menu');
    btn.focus();
  }

  function toggleMenu() {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    expanded ? closeMenu() : openMenu();
  }

  btn.addEventListener('click', toggleMenu);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });

  document.addEventListener('click', (e) => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      closeMenu();
    }
  });

  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (target.tagName === 'A' && window.matchMedia('(max-width: 767px)').matches) {
      closeMenu();
    }
  });
})();

// 📂 Accordion Controls: Toggles visibility of content panels with ARIA support and Escape key handling
(function () {
  function setupAccordionButton(btnId, panelId) {
    const btn = document.getElementById(btnId);
    const panel = document.getElementById(panelId);
    if (!btn || !panel) return;

    function setState(expanded) {
      btn.setAttribute('aria-expanded', String(expanded));
      panel.classList.toggle('hidden', !expanded);
    }

    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      setState(!expanded);
    });

    panel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setState(false);
    });
  }

  setupAccordionButton('wordBtn', 'wordPanel');
  setupAccordionButton('excelBtn', 'excelPanel');
  setupAccordionButton('htmlBtn', 'htmlPanel');
  setupAccordionButton('moreBtn', 'morePanel');
})();
