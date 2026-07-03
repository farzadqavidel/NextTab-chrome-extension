const BookmarksUI = (() => {
  const GRID_COLS = 4;
  const MIN_SLOTS = 8;

  let contextTarget = null;
  let editingBookmarkId = null;
  let editingFolderId = null;
  let activePickerTile = null;

  const els = {};

  const PICKER_SVG = {
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M12 11v6M9 14h6"/></svg>'
  };

  function init() {
    els.grid = document.getElementById('bookmarks-grid');
    els.folderTabs = document.getElementById('folder-tabs');
    els.emptyState = document.getElementById('empty-bookmarks');
    els.contextMenu = document.getElementById('context-menu');

    document.getElementById('btn-add-bookmark').addEventListener('click', () => openFirstAddPicker());
    document.getElementById('btn-empty-add').addEventListener('click', () => openFirstAddPicker());
    document.getElementById('btn-import-all').addEventListener('click', importAllFromChrome);
    document.getElementById('form-bookmark').addEventListener('submit', handleBookmarkSubmit);
    document.getElementById('form-folder').addEventListener('submit', handleFolderSubmit);

    setupColorPicker();
    setupModalClose();
    setupContextMenu();
    document.addEventListener('click', handleDocumentClick);

    syncActiveFolder().then(() => render());
  }

  function handleDocumentClick() {
    hideContextMenu();
    closeAddPicker();
  }

  async function syncActiveFolder() {
    const effective = Storage.getEffectiveActiveFolderId();
    if (Storage.getData().activeFolderId !== effective) {
      await Storage.setActiveFolder(effective);
    }
  }

  function setupColorPicker() {
    document.querySelectorAll('#folder-color-picker .color-swatch').forEach((swatch) => {
      swatch.addEventListener('click', () => {
        document.querySelectorAll('#folder-color-picker .color-swatch').forEach((s) => s.classList.remove('active'));
        swatch.classList.add('active');
        document.getElementById('folder-color').value = swatch.dataset.color;
      });
    });
  }

  function setupModalClose() {
    document.querySelectorAll('[data-close]').forEach((btn) => {
      btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });
  }

  function setupContextMenu() {
    els.contextMenu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (!contextTarget) return;
        if (contextTarget.type === 'bookmark') {
          if (action === 'open-new-tab') openBookmarkInNewTab(contextTarget.id);
          if (action === 'edit') openBookmarkModal(contextTarget.id);
          if (action === 'delete') deleteBookmark(contextTarget.id);
        } else if (contextTarget.type === 'folder') {
          if (action === 'edit') openFolderModal(contextTarget.id);
          if (action === 'delete') deleteFolder(contextTarget.id);
        }
        hideContextMenu();
      });
    });
  }

  function openBookmarkInNewTab(id) {
    const bm = Storage.getData().bookmarks.find((b) => b.id === id);
    if (bm) window.open(bm.url, '_blank');
  }

  async function deleteFolder(folderId) {
    const folder = Storage.getFolders().find((f) => f.id === folderId);
    if (!folder || folder.isDefault) return;

    const bookmarkCount = Storage.getData().bookmarks.filter((b) => b.folderId === folderId).length;
    let deleteBookmarks = false;

    if (bookmarkCount > 0) {
      deleteBookmarks = confirm(I18n.t('deleteGroupWithBookmarksConfirm'));
    } else if (!confirm(I18n.t('deleteGroupConfirm'))) {
      return;
    }

    await Storage.deleteFolder(folderId, deleteBookmarks);
    render();
  }

  function openModal(id) {
    document.getElementById(id).classList.remove('hidden');
  }

  function closeModal(id) {
    document.getElementById(id).classList.add('hidden');
    if (id === 'modal-bookmark') editingBookmarkId = null;
    if (id === 'modal-folder') editingFolderId = null;
  }

  function openFirstAddPicker() {
    const tile = els.grid.querySelector('.bm-tile-add');
    if (tile) openAddPicker(tile);
  }

  function closeAddPicker() {
    if (!activePickerTile) return;
    activePickerTile.classList.remove('bm-tile-picker-open');
    activePickerTile.innerHTML = '<span class="bm-tile-plus" aria-hidden="true">+</span>';
    activePickerTile = null;
  }

  function openAddPicker(tile) {
    closeAddPicker();
    activePickerTile = tile;
    tile.classList.add('bm-tile-picker-open');
    tile.innerHTML = `
      <div class="bm-tile-picker">
        <button type="button" class="bm-pick-btn" data-pick="link">
          <span>${I18n.t('bookmark')}</span>
          ${PICKER_SVG.link}
        </button>
        <button type="button" class="bm-pick-btn" data-pick="folder">
          <span>${I18n.t('folder')}</span>
          ${PICKER_SVG.folder}
        </button>
      </div>
    `;

    tile.querySelector('[data-pick="link"]').addEventListener('click', (e) => {
      e.stopPropagation();
      closeAddPicker();
      openBookmarkModal();
    });
    tile.querySelector('[data-pick="folder"]').addEventListener('click', (e) => {
      e.stopPropagation();
      closeAddPicker();
      openFolderModal();
    });
  }

  function showContextMenu(x, y, target) {
    contextTarget = target;
    NotesUI.clearContext?.();
    els.contextMenu.style.left = x + 'px';
    els.contextMenu.style.top = y + 'px';

    const isBookmark = target.type === 'bookmark';
    const isFolder = target.type === 'folder';

    els.contextMenu.querySelectorAll('.ctx-bookmark-only').forEach((btn) => {
      btn.classList.toggle('hidden', !isBookmark);
    });
    els.contextMenu.querySelectorAll('.ctx-edit').forEach((btn) => {
      btn.classList.remove('hidden');
    });
    els.contextMenu.querySelectorAll('.ctx-note-only').forEach((btn) => {
      btn.classList.add('hidden');
    });
    els.contextMenu.querySelectorAll('.ctx-trash-only').forEach((btn) => {
      btn.classList.add('hidden');
    });
    els.contextMenu.querySelector('[data-action="delete"]')?.classList.remove('hidden');

    els.contextMenu.classList.remove('hidden');
  }

  function hideContextMenu() {
    els.contextMenu.classList.add('hidden');
    contextTarget = null;
  }

  function populateFolderSelect(selectEl, selectedId) {
    const folders = Storage.getFolders();
    selectEl.innerHTML = '';
    folders.forEach((f) => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = I18n.getFolderName(f);
      if (f.id === selectedId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function openBookmarkModal(bookmarkId) {
    editingBookmarkId = bookmarkId || null;
    const title = document.getElementById('modal-bookmark-title');
    const activeFolder = Storage.getEffectiveActiveFolderId();

    populateFolderSelect(document.getElementById('bookmark-folder'), activeFolder);

    if (bookmarkId) {
      title.textContent = I18n.t('editBookmark');
      const bm = Storage.getData().bookmarks.find((b) => b.id === bookmarkId);
      if (bm) {
        document.getElementById('bookmark-id').value = bm.id;
        document.getElementById('bookmark-title').value = bm.title;
        document.getElementById('bookmark-url').value = bm.url;
        document.getElementById('bookmark-folder').value = bm.folderId;
      }
    } else {
      title.textContent = I18n.t('addBookmark');
      document.getElementById('form-bookmark').reset();
      document.getElementById('bookmark-id').value = '';
      document.getElementById('bookmark-folder').value = activeFolder;
    }

    openModal('modal-bookmark');
  }

  function openFolderModal(folderId) {
    editingFolderId = folderId || null;
    const titleEl = document.getElementById('modal-folder-title');
    const submitBtn = document.getElementById('btn-folder-submit');

    if (folderId) {
      const folder = Storage.getFolders().find((f) => f.id === folderId);
      if (!folder || folder.isDefault) return;
      titleEl.textContent = I18n.t('editGroup');
      submitBtn.textContent = I18n.t('save');
      document.getElementById('folder-id').value = folder.id;
      document.getElementById('folder-name').value = folder.name;
      document.getElementById('folder-color').value = folder.color;
      document.querySelectorAll('#folder-color-picker .color-swatch').forEach((s) => {
        s.classList.toggle('active', s.dataset.color === folder.color);
      });
    } else {
      titleEl.textContent = I18n.t('newGroup');
      submitBtn.textContent = I18n.t('createGroup');
      document.getElementById('form-folder').reset();
      document.getElementById('folder-id').value = '';
      document.getElementById('folder-color').value = '#6366f1';
      document.querySelectorAll('#folder-color-picker .color-swatch').forEach((s) => {
        s.classList.toggle('active', s.dataset.color === '#6366f1');
      });
    }

    openModal('modal-folder');
  }

  async function handleBookmarkSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('bookmark-title').value.trim();
    const url = document.getElementById('bookmark-url').value.trim();
    const folderId = document.getElementById('bookmark-folder').value || 'default';

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      alert(I18n.t('invalidUrl'));
      return;
    }

    if (editingBookmarkId) {
      await Storage.updateBookmark(editingBookmarkId, { title, url, folderId });
    } else {
      await Storage.addBookmark({ title, url, folderId });
    }

    closeModal('modal-bookmark');
    render();
  }

  async function handleFolderSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('folder-name').value.trim();
    const color = document.getElementById('folder-color').value;
    if (!name) return;

    if (editingFolderId) {
      await Storage.updateFolder(editingFolderId, { name, color });
    } else {
      const folder = await Storage.addFolder({ name, color });
      await Storage.setActiveFolder(folder.id);
    }

    closeModal('modal-folder');
    render();
  }

  async function deleteBookmark(id) {
    if (confirm(I18n.t('deleteBookmarkConfirm'))) {
      await Storage.deleteBookmark(id);
      render();
    }
  }

  function importAllFromChrome() {
    if (!confirm(I18n.t('importChromeConfirm'))) return;

    chrome.bookmarks.getTree(async (tree) => {
      await Storage.importBookmarkTree(tree, 'default');
      render();
      alert(I18n.t('importSuccess'));
    });
  }

  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return '';
    }
  }

  function renderFolderTabs() {
    const folders = Storage.getVisibleFolders();
    const activeId = Storage.getEffectiveActiveFolderId();

    els.folderTabs.innerHTML = folders.map((f) => {
      const isActive = f.id === activeId;
      return `
        <div class="folder-tab-item ${isActive ? 'active' : ''}" style="--folder-color: ${f.color}"
             data-folder-id="${f.id}">
          <button type="button" class="folder-tab"
                  data-folder-id="${f.id}">
            ${escapeHtml(I18n.getFolderName(f))}
          </button>
        </div>
      `;
    }).join('');

    els.folderTabs.querySelectorAll('.folder-tab').forEach((tab) => {
      tab.addEventListener('click', async () => {
        await Storage.setActiveFolder(tab.dataset.folderId);
        render();
      });
    });

    els.folderTabs.querySelectorAll('.folder-tab-item').forEach((item) => {
      const folderId = item.dataset.folderId;
      const folder = Storage.getFolders().find((f) => f.id === folderId);
      if (folder && !folder.isDefault) {
        item.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showContextMenu(e.clientX, e.clientY, { type: 'folder', id: folderId });
        });
      }
    });
  }

  function buildAddTileHtml() {
    return `
      <button type="button" class="bm-tile bm-tile-add" title="${I18n.t('add')}">
        <span class="bm-tile-plus" aria-hidden="true">+</span>
      </button>
    `;
  }

  function buildBookmarkTileHtml(bm) {
    return `
      <a href="${escapeHtml(bm.url)}" class="bm-tile bm-tile-link" data-id="${bm.id}" title="${escapeHtml(bm.title)}">
        <div class="bm-tile-icon">
          <img src="${getFaviconUrl(bm.url)}" alt="" loading="lazy">
          <span class="bm-tile-fallback">${escapeHtml(bm.title.charAt(0))}</span>
        </div>
        <span class="bm-tile-label">${escapeHtml(bm.title)}</span>
      </a>
    `;
  }

  function renderBookmarks() {
    const activeId = Storage.getEffectiveActiveFolderId();
    const bookmarks = Storage.getBookmarks(activeId);

    els.emptyState.classList.add('hidden');
    closeAddPicker();

    const filledCount = bookmarks.length;
    const totalSlots = Math.max(MIN_SLOTS, Math.ceil((filledCount + 1) / GRID_COLS) * GRID_COLS);
    const emptyCount = totalSlots - filledCount;

    const bookmarksHtml = bookmarks.map(buildBookmarkTileHtml).join('');
    const addTilesHtml = Array.from({ length: emptyCount }, () => buildAddTileHtml()).join('');

    els.grid.innerHTML = bookmarksHtml + addTilesHtml;

    els.grid.querySelectorAll('.bm-tile-link img').forEach((img) => {
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const fallback = img.nextElementSibling;
        if (fallback) fallback.style.display = 'flex';
      });
    });

    els.grid.querySelectorAll('.bm-tile-link').forEach((item) => {
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, { type: 'bookmark', id: item.dataset.id });
      });
    });

    els.grid.querySelectorAll('.bm-tile-add').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tile.classList.contains('bm-tile-picker-open')) return;
        openAddPicker(tile);
      });
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    renderFolderTabs();
    renderBookmarks();
  }

  return { init, render, openBookmarkModal, openFirstAddPicker, hideContextMenu };
})();
