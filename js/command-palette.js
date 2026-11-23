const CommandPaletteUI = (() => {
  const els = {};
  let items = [];
  let activeIndex = 0;

  function init() {
    els.modal = document.getElementById('modal-command-palette');
    els.input = document.getElementById('command-palette-input');
    els.list = document.getElementById('command-palette-results');
    if (!els.modal) return;
    els.input.addEventListener('input', () => { activeIndex = 0; render(); });
    els.input.addEventListener('keydown', handleKeydown);
    els.list.addEventListener('click', (event) => {
      const result = event.target.closest('[data-command-index]');
      if (result) run(Number(result.dataset.commandIndex));
    });
    els.modal.addEventListener('click', (event) => {
      if (event.target === els.modal) close();
    });
    document.querySelectorAll('[data-close="modal-command-palette"]').forEach((button) => button.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        open();
      } else if (event.key === 'Escape' && !els.modal.classList.contains('hidden')) {
        close();
      }
    });
  }

  function open() {
    TabyarUI.openModal('modal-command-palette');
    els.input.value = '';
    render();
    setTimeout(() => els.input.focus(), 0);
  }

  function close() {
    TabyarUI.closeModal('modal-command-palette');
  }

  function baseCommands(query) {
    const q = query.trim();
    const commands = [
      { title: I18n.t('commandNewTask'), subtitle: I18n.t('commandNewTaskHint'), icon: '✓', kind: 'task', action: () => { close(); TasksUI.focusInput(); } },
      { title: I18n.t('commandPersonalEvent'), subtitle: I18n.t('commandPersonalEventHint'), icon: '✦', kind: 'event', action: () => { close(); PersonalEventsUI.open(); } },
      { title: I18n.t('commandFocus'), subtitle: I18n.t('commandFocusHint'), icon: '◷', kind: 'focus', action: () => { close(); TasksUI.toggleFocus(); } },
      { title: I18n.t('commandPrivacy'), subtitle: I18n.t('commandPrivacyHint'), icon: '◉', kind: 'privacy', action: () => { close(); PrivacyUI.toggle(); } },
      { title: I18n.t('settings'), subtitle: I18n.t('commandSettingsHint'), icon: '⚙', kind: 'settings', action: () => { close(); document.getElementById('btn-settings')?.click(); } },
      { title: I18n.t('commandToday'), subtitle: I18n.t('commandTodayHint'), icon: '▦', kind: 'today', action: () => { close(); document.getElementById('cal-go-today')?.click(); } }
    ];
    if (q) {
      commands.unshift({ title: `${I18n.t('commandAddTask')}: ${q}`, subtitle: I18n.t('commandCreateTaskHint'), icon: '+', kind: 'create-task', action: async () => { await TasksUI.createTask(q); close(); TabyarUI.alert(I18n.t('taskAdded'), { type: 'success' }); } });
      commands.unshift({ title: `${I18n.t('commandSearchGoogle')}: ${q}`, subtitle: I18n.t('commandSearchGoogleHint'), icon: '⌕', kind: 'search', action: async () => {
        await Storage.addSearchHistory(q);
        close();
        chrome.tabs.create({ url: `https://www.google.com/search?q=${encodeURIComponent(q)}` });
      } });
      commands.unshift({ title: `${I18n.t('commandAddNote')}: ${q}`, subtitle: I18n.t('commandCreateNoteHint'), icon: '✎', kind: 'create-note', action: async () => {
        await Storage.addNote(q);
        NotesUI.render();
        close();
        TabyarUI.alert(I18n.t('noteAdded'), { type: 'success' });
      } });
    }
    return commands;
  }

  function score(label, query) {
    const text = String(label || '').toLocaleLowerCase();
    const q = query.toLocaleLowerCase();
    if (!q) return 1;
    if (text.startsWith(q)) return 100 + q.length;
    const idx = text.indexOf(q);
    if (idx >= 0) return 80 - idx;
    let cursor = 0;
    for (const char of q) {
      cursor = text.indexOf(char, cursor);
      if (cursor < 0) return 0;
      cursor += 1;
    }
    return 30;
  }

  function getItems(query) {
    const items = baseCommands(query);
    const normalized = query.trim();
    if (PrivacyUI.isActive()) {
      const safeCommands = items.filter((item) => ['privacy', 'settings', 'today', 'focus', 'search'].includes(item.kind));
      return safeCommands.slice(0, 12);
    }
    const bookmarks = Storage.getBookmarks().map((bookmark) => ({
      title: bookmark.title,
      subtitle: bookmark.url,
      icon: '☆',
      kind: 'bookmark',
      action: () => {
        close();
        const safe = TabyarUI.safeUrl(bookmark.url, { allowFile: true, allowMailto: true });
        if (safe) chrome.tabs.create({ url: safe });
      }
    }));
    const enabled = new Set(GoogleServicesUI.getEnabledServices());
    const services = GoogleServicesUI.getServices().filter((service) => enabled.has(service.id)).map((service) => ({
      title: I18n.t(service.nameKey),
      subtitle: service.url,
      icon: '↗',
      kind: 'service',
      action: () => { close(); chrome.tabs.create({ url: service.url }); }
    }));
    const tasks = Storage.getTasks().filter((task) => !task.done).map((task) => ({
      title: task.title,
      subtitle: I18n.t('commandTaskSubtitle'),
      icon: '☐',
      kind: 'task-result',
      action: () => { close(); document.getElementById('tasks-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); TasksUI.focusTask(task.id); }
    }));
    const searchable = [...items, ...bookmarks, ...services, ...tasks];
    const filtered = searchable.map((item) => ({ item, rank: score(`${item.title} ${item.subtitle}`, normalized) }))
      .filter(({ rank }) => !normalized || rank > 0)
      .sort((a, b) => b.rank - a.rank)
      .map(({ item }) => item);
    return filtered.slice(0, 12);
  }

  function render() {
    const query = els.input.value;
    items = getItems(query);
    activeIndex = Math.min(activeIndex, Math.max(0, items.length - 1));
    if (!items.length) {
      els.list.innerHTML = `<li class="command-empty">${I18n.t('commandNoResults')}</li>`;
      return;
    }
    els.list.innerHTML = items.map((item, index) => `
      <li><button type="button" class="command-result${index === activeIndex ? ' active' : ''}" data-command-index="${index}">
        <span class="command-result-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
        <span class="command-result-copy"><b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.subtitle)}</small></span>
        <span class="command-result-enter" aria-hidden="true">↵</span>
      </button></li>`).join('');
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!items.length) return;
      activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      render();
      els.list.querySelector(`[data-command-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' });
    } else if (event.key === 'Enter') {
      event.preventDefault();
      run(activeIndex);
    }
  }

  function run(index) {
    items[index]?.action?.();
  }

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  }

  return { init, open, close };
})();
