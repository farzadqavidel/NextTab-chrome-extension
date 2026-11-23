const NotesUI = (() => {
  let noteContextId = null;
  let noteContextArea = false;
  let editingNoteId = null;
  let viewMode = 'active';

  const els = {};

  function init() {
    els.list = document.getElementById('notes-list');
    els.content = document.getElementById('notes-content');
    els.input = document.getElementById('note-input');
    els.blurBtn = document.getElementById('btn-notes-blur');
    els.trashBtn = document.getElementById('btn-notes-trash');
    els.title = document.getElementById('notes-title');
    els.noteForm = document.getElementById('form-note');
    els.contextMenu = document.getElementById('context-menu');
    els.modalBody = document.getElementById('notes-modal-body');

    document.getElementById('form-note').addEventListener('submit', handleAddNote);
    document.getElementById('form-note-edit').addEventListener('submit', handleEditSubmit);
    els.blurBtn.addEventListener('click', toggleBlur);
    document.getElementById('btn-notes-expand').addEventListener('click', openNotesModal);
    els.trashBtn.addEventListener('click', toggleTrashView);

    els.content.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.note-item')) return;
      e.preventDefault();
      showAreaContextMenu(e.clientX, e.clientY);
    });

    document.querySelectorAll('[data-close="modal-notes"], [data-close="modal-note-edit"]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
    document.getElementById('modal-notes').addEventListener('click', (e) => {
      if (e.target.id === 'modal-notes') closeModal('modal-notes');
    });
    document.getElementById('modal-note-edit').addEventListener('click', (e) => {
      if (e.target.id === 'modal-note-edit') closeModal('modal-note-edit');
    });

    setupContextMenu();
    document.addEventListener('click', hideContextMenu);

    render();
  }

  function isTrashView() {
    return viewMode === 'trash';
  }

  function toggleTrashView() {
    viewMode = isTrashView() ? 'active' : 'trash';
    render();
  }

  async function moveAllToTrash() {
    const count = Storage.getNotes().length;
    if (count === 0) return;
    if (!(await TabyarUI.confirm(I18n.t('deleteAllNotesConfirm'), { danger: true }))) return;
    await Storage.moveAllNotesToTrash();
    render();
  }

  async function emptyTrash() {
    const count = Storage.getTrashedNotes().length;
    if (count === 0) return;
    if (!(await TabyarUI.confirm(I18n.t('emptyTrashConfirm'), { danger: true }))) return;
    await Storage.emptyTrash();
    render();
  }

  function setupContextMenu() {
    els.contextMenu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!noteContextId && !noteContextArea) return;
        const action = btn.dataset.action;
        const id = noteContextId;
        hideContextMenu();

        if (action === 'delete-all-notes') await moveAllToTrash();
        else if (action === 'empty-trash') await emptyTrash();
        else if (isTrashView()) {
          if (action === 'restore' && id) await restoreNote(id);
          if (action === 'delete' && id) await permanentlyDeleteNote(id);
        } else if (id) {
          if (action === 'toggle-done') await toggleNoteDone(id);
          if (action === 'edit') openEditModal(id);
          if (action === 'delete') await deleteNote(id);
        }
      });
    });
  }

  function configureContextMenuButtons(areaOnly) {
    const trashView = isTrashView();
    els.contextMenu.querySelectorAll('.ctx-bookmark-only').forEach((btn) => btn.classList.add('hidden'));
    els.contextMenu.querySelectorAll('.ctx-trash-only').forEach((btn) => {
      btn.classList.toggle('hidden', !trashView || (areaOnly && Storage.getTrashedNotes().length === 0));
    });
    els.contextMenu.querySelectorAll('.ctx-note-only').forEach((btn) => {
      const isBulk = btn.dataset.action === 'delete-all-notes';
      if (isBulk) {
        btn.classList.toggle('hidden', trashView || Storage.getNotes().length === 0);
      } else {
        btn.classList.toggle('hidden', trashView || areaOnly);
      }
    });
    els.contextMenu.querySelectorAll('.ctx-edit').forEach((btn) => {
      btn.classList.toggle('hidden', trashView || areaOnly);
    });
    els.contextMenu.querySelectorAll('[data-action="delete"]').forEach((btn) => {
      btn.classList.toggle('hidden', areaOnly);
    });
  }

  function showContextMenu(x, y, id) {
    noteContextId = id;
    noteContextArea = false;
    BookmarksUI.hideContextMenu?.();
    configureContextMenuButtons(false);

    if (!isTrashView()) {
      const note = Storage.getNotes().find((n) => n.id === id);
      const doneBtn = els.contextMenu.querySelector('[data-action="toggle-done"]');
      if (doneBtn && note) {
        doneBtn.textContent = note.done ? I18n.t('markUndone') : I18n.t('markDone');
      }
    }

    els.contextMenu.style.left = x + 'px';
    els.contextMenu.style.top = y + 'px';
    els.contextMenu.classList.remove('hidden');
  }

  function showAreaContextMenu(x, y) {
    noteContextId = null;
    noteContextArea = true;
    BookmarksUI.hideContextMenu?.();
    configureContextMenuButtons(true);

    els.contextMenu.style.left = x + 'px';
    els.contextMenu.style.top = y + 'px';
    els.contextMenu.classList.remove('hidden');
  }

  function hideContextMenu() {
    els.contextMenu.classList.add('hidden');
    noteContextId = null;
    noteContextArea = false;
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

  function updateToolbar() {
    const trashCount = Storage.getTrashedNotes().length;
    els.title.textContent = isTrashView() ? I18n.t('notesTrash') : I18n.t('notes');
    els.trashBtn.classList.toggle('active', isTrashView());
    els.trashBtn.title = isTrashView() ? I18n.t('backToNotes') : I18n.t('notesTrash');
    els.noteForm.classList.toggle('hidden', isTrashView());

    const badge = els.trashBtn.querySelector('.trash-badge');
    if (badge) {
      badge.textContent = trashCount > 0 ? trashCount : '';
      badge.classList.toggle('hidden', trashCount === 0);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    const text = els.input.value.trim();
    if (!text) return;
    await Storage.addNote(text);
    els.input.value = '';
    render();
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    const text = document.getElementById('note-edit-text').value.trim();
    if (!text || !editingNoteId) return;
    await Storage.updateNote(editingNoteId, { text });
    closeModal('modal-note-edit');
    render();
  }

  async function deleteNote(id) {
    if (await TabyarUI.confirm(I18n.t('deleteNoteConfirm'), { danger: true })) {
      await Storage.moveNoteToTrash(id);
      render();
    }
  }

  async function permanentlyDeleteNote(id) {
    if (await TabyarUI.confirm(I18n.t('permanentDeleteConfirm'), { danger: true })) {
      await Storage.permanentlyDeleteNote(id);
      render();
    }
  }

  async function restoreNote(id) {
    await Storage.restoreNote(id);
    render();
  }

  async function toggleNoteDone(id) {
    const note = Storage.getNotes().find((n) => n.id === id);
    if (!note) return;
    await Storage.updateNote(id, { done: !note.done });
    render();
  }

  function openEditModal(id) {
    const note = Storage.getNotes().find((n) => n.id === id);
    if (!note) return;
    editingNoteId = id;
    document.getElementById('note-edit-id').value = id;
    document.getElementById('note-edit-text').value = note.text;
    document.getElementById('modal-note-edit').classList.remove('hidden');
  }

  function openNotesModal() {
    renderModalNotes();
    TabyarUI.openModal('modal-notes');
  }

  function closeModal(id) {
    TabyarUI.closeModal(id);
    if (id === 'modal-note-edit') editingNoteId = null;
  }

  function buildNoteHtml(note, expanded) {
    const done = !!note.done;
    const doneClass = done ? ' done' : '';
    const textClass = expanded ? 'note-text note-text-lg' : 'note-text';
    const noteId = escapeAttr(note.id);
    const checkHtml = isTrashView() ? '' : `
        <button type="button" class="note-check${done ? ' checked' : ''}" data-id="${noteId}" aria-label="${done ? I18n.t('markUndone') : I18n.t('markDone')}">${done ? '✓' : ''}</button>`;
    return `
      <div class="note-item${doneClass}" data-id="${noteId}">
        ${checkHtml}
        <p class="${textClass}">${escapeHtml(note.text)}</p>
      </div>
    `;
  }

  function bindNoteInteractions(container) {
    container.querySelectorAll('.note-item').forEach((item) => {
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, item.dataset.id);
      });
    });

    container.querySelectorAll('.note-check').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await toggleNoteDone(btn.dataset.id);
      });
    });
  }

  function getCurrentNotes() {
    return isTrashView() ? Storage.getTrashedNotes() : Storage.getNotes();
  }

  function renderEmptyState() {
    if (isTrashView()) {
      return `
        <div class="notes-empty-state">
          <div class="notes-empty-icon">🗑️</div>
          <p class="notes-empty-title">${I18n.t('trashEmptyTitle')}</p>
          <p class="notes-empty-hint">${I18n.t('trashEmptyHint')}</p>
        </div>`;
    }
    return `
      <div class="notes-empty-state">
        <div class="notes-empty-icon">✓</div>
        <p class="notes-empty-title">${I18n.t('notesEmptyTitle')}</p>
        <p class="notes-empty-hint">${I18n.t('notesEmptyHint')}</p>
      </div>`;
  }

  function renderModalNotes() {
    const notes = getCurrentNotes();
    if (notes.length === 0) {
      els.modalBody.innerHTML = renderEmptyState();
      return;
    }

    els.modalBody.innerHTML = notes.map((note) => buildNoteHtml(note, true)).join('');
    bindNoteInteractions(els.modalBody);
  }

  function render() {
    const notes = getCurrentNotes();
    const settings = Storage.getSettings();
    applyBlur(settings.notesBlurred);
    updateToolbar();

    if (notes.length === 0) {
      els.list.innerHTML = renderEmptyState();
    } else {
      els.list.innerHTML = notes.map((note) => buildNoteHtml(note, false)).join('');
      bindNoteInteractions(els.list);
    }

    if (!document.getElementById('modal-notes').classList.contains('hidden')) {
      renderModalNotes();
    }
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function clearContext() {
    noteContextId = null;
    noteContextArea = false;
  }

  return { init, render, clearContext };
})();
