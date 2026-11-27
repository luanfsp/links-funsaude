(() => {
  const searchInput = document.getElementById('search-input');
  const filterButtons = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.service-card')];
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');
  const themeToggle = document.getElementById('theme-toggle');
  const clock = document.getElementById('clock');
  const today = document.getElementById('today');

  const FAVORITES_KEY = 'funsaude-portal-favorites';
  const THEME_KEY = 'funsaude-portal-theme';
  let activeFilter = 'Todos';
  let favorites = readStorage(FAVORITES_KEY, []);

  function readStorage(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento indisponível */ }
  }

  function updateFavoriteButtons() {
    cards.forEach(card => {
      const button = card.querySelector('.favorite-button');
      if (!button) return;
      const selected = favorites.includes(card.dataset.id);
      button.classList.toggle('is-favorite', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', `${selected ? 'Remover' : 'Adicionar'} ${card.querySelector('.service-info strong').textContent} ${selected ? 'dos' : 'aos'} favoritos`);
      button.textContent = selected ? '★' : '☆';
    });
  }

  function updateCards() {
    const term = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    let visible = 0;

    cards.forEach(card => {
      const matchesCategory = activeFilter === 'Todos' ||
        (activeFilter === 'Favoritos' ? favorites.includes(card.dataset.id) : card.dataset.category === activeFilter);
      const searchable = `${card.dataset.search} ${card.innerText}`.toLocaleLowerCase('pt-BR');
      const show = matchesCategory && (!term || searchable.includes(term));
      card.hidden = !show;
      if (show) visible++;
    });

    resultCount.textContent = `${visible} ${visible === 1 ? 'serviço' : 'serviços'}`;
    emptyState.hidden = visible !== 0;
  }

  filterButtons.forEach(button => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateCards();
  }));

  document.querySelectorAll('.favorite-button').forEach(button => button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const id = button.closest('.service-card').dataset.id;
    favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    saveStorage(FAVORITES_KEY, favorites);
    updateFavoriteButtons();
    updateCards();
  }));

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#111322' : '#10145c';
  }

  const savedTheme = (() => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  })();
  const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(savedTheme || preferredTheme);

  themeToggle.addEventListener('click', () => {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    try { localStorage.setItem(THEME_KEY, nextTheme); } catch { /* armazenamento indisponível */ }
  });

  function updateDateTime() {
    const now = new Date();
    clock.textContent = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(now);
    today.textContent = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    }).format(now);
  }

  searchInput.addEventListener('input', updateCards);
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      updateCards();
      searchInput.blur();
    }
  });

  updateFavoriteButtons();
  updateCards();
  updateDateTime();
  window.setInterval(updateDateTime, 1000);
})();
