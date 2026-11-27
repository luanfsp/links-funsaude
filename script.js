
(() => {
  const searchInput = document.getElementById('search-input');
  const filterButtons = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.service-card')];
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');

  let activeFilter = 'Todos';

  function updateCards() {
    const term = searchInput.value.trim().toLocaleLowerCase('pt-BR');
    let visible = 0;

    cards.forEach(card => {
      const matchesCategory =
        activeFilter === 'Todos' ||
        card.dataset.category === activeFilter;

      const searchable =
        `${card.dataset.search} ${card.innerText}`
          .toLocaleLowerCase('pt-BR');

      const matchesSearch =
        !term || searchable.includes(term);

      const show = matchesCategory && matchesSearch;

      card.hidden = !show;

      if (show) visible++;
    });

    resultCount.textContent =
      `${visible} ${visible === 1 ? 'serviço' : 'serviços'}`;

    emptyState.hidden = visible !== 0;
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;

      filterButtons.forEach(item => {
        const active = item === button;

        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });

      updateCards();
    });
  });

  searchInput.addEventListener('input', updateCards);

  document.addEventListener('keydown', event => {
    if (
      event.key === '/' &&
      !['INPUT', 'TEXTAREA'].includes(
        document.activeElement.tagName
      )
    ) {
      event.preventDefault();
      searchInput.focus();
    }

    if (
      event.key === 'Escape' &&
      document.activeElement === searchInput
    ) {
      searchInput.value = '';
      updateCards();
      searchInput.blur();
    }
  });
})();
