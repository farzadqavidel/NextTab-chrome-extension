const NotesUI = (() => {
  const els = {};

  function init() {
    els.list = document.getElementById('notes-list');
    els.content = document.getElementById('notes-content');
    els.input = document.getElementById('note-input');
    els.blurBtn = document.getElementById('btn-notes-blur');

    document.getElementById('form-note').addEventListener('submit', handleAddNote);
    els.blurBtn.addEventListener('click', toggleBlur);

    render();
  }

  async function toggleBlur() {
    const settings = Storage.getSettings();
    const blurred = !settings.notesBlurred;
    await Storage.updateSettings({ notesBlurred: blurred });
    applyBlur(blurred);
  }

  function applyBlur(blurred) {
    els.content.classList.toggle('blurred', blurred);
    els.blurBtn.classList.toggle('active', blurred);
    els.blurBtn.querySelector('.icon-show').classList.toggle('hidden', blurred);
    els.blurBtn.querySelector('.icon-hide').classList.toggle('hidden', !blurred);
    els.blurBtn.title = blurred ? I18n.t('showNotes') : I18n.t('hideNotes');
  }

  async function handleAddNote(e) {
    e.preventDefault();
    const text = els.input.value.trim();
    if (!text) return;
    await Storage.addNote(text);
    els.input.value = '';
    render();
  }

  async function deleteNote(id) {
    await Storage.deleteNote(id);
    render();
  }

  function render() {
    const notes = Storage.getNotes();
    const settings = Storage.getSettings();
    applyBlur(settings.notesBlurred);

    if (notes.length === 0) {
      els.list.innerHTML = `
        <div class="notes-empty-state">
          <div class="notes-empty-icon">✓</div>
          <p class="notes-empty-title">${I18n.t('notesEmptyTitle')}</p>
          <p class="notes-empty-hint">${I18n.t('notesEmptyHint')}</p>
        </div>`;
      return;
    }

    els.list.innerHTML = notes.map((note) => `
      <div class="note-item" data-id="${note.id}">
        <p class="note-text">${escapeHtml(note.text)}</p>
        <button class="note-delete" data-id="${note.id}" title="${I18n.t('delete')}" aria-label="${I18n.t('delete')}">&times;</button>
      </div>
    `).join('');

    els.list.querySelectorAll('.note-delete').forEach((btn) => {
      btn.addEventListener('click', () => deleteNote(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  return { init, render };
})();
