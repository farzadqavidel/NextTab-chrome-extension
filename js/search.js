const SearchUI = (() => {
  let els = {};
  let visible = false;

  function init() {
    els.wrapper = document.querySelector('.search-wrapper');
    els.input = document.getElementById('search-input');
    els.form = document.getElementById('search-form');
    els.panel = document.getElementById('search-history');
    els.list = document.getElementById('search-history-list');
    els.ctxMenu = document.getElementById('search-context-menu');

    els.form.addEventListener('submit', handleSubmit);
    els.input.addEventListener('focus', showPanel);
    els.input.addEventListener('input', renderList);
    els.input.addEventListener('contextmenu', showContextMenu);

    els.ctxMenu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleContextAction(btn.dataset.action);
        hideContextMenu();
      });
    });

    els.panel.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      showContextMenu(e);
    });

    document.addEventListener('click', (e) => {
      if (!els.wrapper.contains(e.target)) hidePanel();
      if (!els.ctxMenu.contains(e.target)) hideContextMenu();
    });

    renderList();
  }

  async function handleSubmit() {
    const query = els.input.value.trim();
    if (query) await Storage.addSearchHistory(query);
  }

  function showPanel() {
    renderList();
    if (Storage.getSearchHistory().length === 0) return;
    visible = true;
    els.panel.classList.remove('hidden');
  }

  function hidePanel() {
    visible = false;
    els.panel.classList.add('hidden');
    hideContextMenu();
  }

  function renderList() {
    const history = Storage.getSearchHistory();
    const filter = els.input.value.trim().toLowerCase();
    const items = filter
      ? history.filter((q) => q.toLowerCase().includes(filter))
      : history;

    if (items.length === 0) {
      els.list.innerHTML = '';
      if (visible) els.panel.classList.add('hidden');
      return;
    }

    els.list.innerHTML = items.map((query) => `
      <li class="search-history-item">
        <button type="button" class="search-history-query">${escapeHtml(query)}</button>
        <button type="button" class="search-history-remove" aria-label="${escapeAttr(I18n.t('delete'))}">&times;</button>
      </li>
    `).join('');

    els.list.querySelectorAll('.search-history-item').forEach((item, i) => {
      const query = items[i];
      item.querySelector('.search-history-query').dataset.query = query;
      item.querySelector('.search-history-remove').dataset.query = query;
    });

    els.list.querySelectorAll('.search-history-query').forEach((btn) => {
      btn.addEventListener('click', () => {
        els.input.value = btn.dataset.query;
        els.form.submit();
      });
    });

    els.list.querySelectorAll('.search-history-remove').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await Storage.removeSearchHistory(btn.dataset.query);
        renderList();
      });
    });

    els.list.querySelectorAll('.search-history-item').forEach((item) => {
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e);
      });
    });
  }

  function showContextMenu(e) {
    BookmarksUI.hideContextMenu?.();
    NotesUI.clearContext?.();
    els.ctxMenu.style.left = e.clientX + 'px';
    els.ctxMenu.style.top = e.clientY + 'px';
    els.ctxMenu.classList.remove('hidden');
    showPanel();
  }

  function hideContextMenu() {
    els.ctxMenu.classList.add('hidden');
  }

  function handleContextAction(action) {
    if (action === 'show-history') {
      showPanel();
      els.input.focus();
      return;
    }
    if (action === 'clear-history') {
      if (confirm(I18n.t('clearSearchHistoryConfirm'))) {
        Storage.clearSearchHistory().then(renderList);
      }
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  function refresh() {
    renderList();
  }

  return { init, refresh };
})();
