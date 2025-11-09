// 🌗 Theme Toggle: dark/light with localStorage + system fallback and change listener
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

  btn && btn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'light' : 'dark');
  });

  // System preference change: standard and legacy listeners
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const onChange = (e) => {
    if (!localStorage.getItem(storageKey)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  };
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', onChange);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(onChange);
  }
})();


// 📱 Mobile Menu Accessibility: ARIA, Escape, outside clicks
(function () {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const nav = document.getElementById('primary-navigation');
  if (!btn || !menu || !nav) return;

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
    if (target && target.tagName === 'A' && window.matchMedia('(max-width: 767px)').matches) {
      closeMenu();
    }
  });
})();


// 📂 Accordion Controls: ARIA + Escape
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

  setupAccordionButton('noteBtn', 'notePanel');
  setupAccordionButton('wordBtn', 'wordPanel');
  setupAccordionButton('excelBtn', 'excelPanel');
  setupAccordionButton('htmlBtn', 'htmlPanel');
  setupAccordionButton('moreBtn', 'morePanel');
})();


// 🔎 New search logic (instant filter + highlight)
(function () {
  const q = document.getElementById('searchInput');
  if (!q) return;

  // Groups: Note cards and assignment lists
  const groups = [
    { container: document.querySelector('#three-months ol'), items: () => Array.from(document.querySelectorAll('#three-months ol > li.card')) },
    { container: document.querySelector('#six-months ol'),  items: () => Array.from(document.querySelectorAll('#six-months ol > li.card')) },
    { container: document.querySelector('#one-year ol'),    items: () => Array.from(document.querySelectorAll('#one-year ol > li.card')) },
    { container: document.querySelector('#stenography ol'), items: () => Array.from(document.querySelectorAll('#stenography ol > li.card')) },

    { container: document.getElementById('notePanel'), items: () => Array.from(document.querySelectorAll('#notePanel ul li')) },
    { container: document.getElementById('wordPanel'), items: () => Array.from(document.querySelectorAll('#wordPanel ul li')) },
    { container: document.getElementById('excelPanel'), items: () => Array.from(document.querySelectorAll('#excelPanel ul li')) },
    { container: document.getElementById('htmlPanel'), items: () => Array.from(document.querySelectorAll('#htmlPanel ul li')) },
    { container: document.getElementById('morePanel'), items: () => Array.from(document.querySelectorAll('#morePanel')) },
  ].filter(g => g.container);

  const norm = s => (s || '').toLowerCase().replace(/\s+/g, ' ').trim();

  function clearHighlights(el) {
    el.querySelectorAll('mark.search-hit').forEach(m => {
      const parent = m.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  function highlightMatch(el, query) {
    if (!query) return;
    const textNodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement && node.parentElement.tagName;
        if (p === 'SCRIPT' || p === 'STYLE') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    const re = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig');
    textNodes.forEach(tn => {
      const txt = tn.nodeValue;
      if (!re.test(txt)) return;
      re.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0, m;
      while ((m = re.exec(txt)) !== null) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        const mark = document.createElement('mark');
        mark.className = 'search-hit';
        mark.textContent = m[0];
        frag.appendChild(mark);
        last = re.lastIndex;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  function getEmptyBadge(container) {
    let badge = container.querySelector('.empty-note');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'empty-note text-sm text-gray-500 dark:text-gray-400 mt-2';
      badge.style.display = 'none';
      badge.textContent = 'No results here';
      container.appendChild(badge);
    }
    return badge;
  }

  function ensureOpenDuringSearch(open) {
    const pairs = [
      ['noteBtn','notePanel'],
      ['wordBtn','wordPanel'],
      ['excelBtn','excelPanel'],
      ['htmlBtn','htmlPanel'],
      ['moreBtn','morePanel'],
    ];
    pairs.forEach(([btnId, panelId]) => {
      const btn = document.getElementById(btnId);
      const panel = document.getElementById(panelId);
      if (!btn || !panel) return;
      if (open) {
        panel.classList.remove('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  let lastQuery = '';
  q.addEventListener('input', () => {
    const raw = q.value;
    const query = norm(raw);
    if (query === lastQuery) return;
    lastQuery = query;

    // Clear previous highlights only within participating containers
    groups.forEach(({ container }) => clearHighlights(container));

    // Auto open panels while searching
    ensureOpenDuringSearch(!!query);

    // Filter and highlight
    groups.forEach(({ container, items }) => {
      const children = items();
      let visibleCount = 0;

      children.forEach(item => {
        let text = '';
        const h4 = item.querySelector && item.querySelector('h4');
        if (h4) text += ' ' + h4.textContent;
        const a = (item.querySelector && (item.querySelector('a.dl-btn') || item.querySelector('a')));
        if (a) {
          text += ' ' + a.textContent + ' ' + (a.getAttribute('href') || '');
        }
        if (!text.trim()) text = item.textContent || '';

        const match = !query || norm(text).includes(query);
        item.style.display = match ? '' : 'none';
        if (match) {
          visibleCount++;
          highlightMatch(item, query);
        }
      });

      const badge = getEmptyBadge(container);
      badge.style.display = query && visibleCount === 0 ? '' : 'none';
    });

    // Reset visibility on clear
    if (!query) {
      groups.forEach(({ items }) => items().forEach(item => item.style.display = ''));
    }
  });
})();

