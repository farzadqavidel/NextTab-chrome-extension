const PrivacyUI = (() => {
  let active = false;
  let button;

  function init() {
    button = document.getElementById('btn-privacy-mode');
    button?.addEventListener('click', toggle);
    document.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        toggle();
      }
    });
    updateButton();
  }

  function toggle() {
    active = !active;
    document.body.classList.toggle('privacy-mode', active);
    if (active) {
      ['modal-notes', 'modal-note-edit', 'modal-personal-events', 'modal-bookmark', 'modal-folder', 'search-history', 'search-context-menu', 'top-sites-context-menu', 'context-menu'].forEach((id) => {
        document.getElementById(id)?.classList.add('hidden');
      });
      SearchUI.hidePanel?.();
      const searchInput = document.getElementById('search-input');
      if (searchInput) { searchInput.value = ''; searchInput.blur(); }
    }
    updateButton();
    if (active) TabyarUI.alert(I18n.t('privacyEnabled'), { type: 'info' });
    else TabyarUI.alert(I18n.t('privacyDisabled'), { type: 'success' });
  }

  function updateButton() {
    if (!button) return;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    button.title = I18n.t(active ? 'privacyDisable' : 'privacyEnable');
    button.setAttribute('aria-label', button.title);
    const eventsButton = document.getElementById('btn-manage-personal-events');
    if (eventsButton) eventsButton.disabled = active;
  }

  function isActive() { return active; }

  return { init, toggle, isActive, refresh: updateButton };
})();
