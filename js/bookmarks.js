const BookmarksUI = (() => {
  let contextTarget = null;
  let editingBookmarkId = null;
  let editingFolderId = null;

  const els = {};

  function init() {
    els.grid = document.getElementById('bookmarks-grid');
    els.folderTabs = document.getElementById('folder-tabs');
    els.emptyState = document.getElementById('empty-bookmarks');
    els.contextMenu = document.getElementById('context-menu');

    document.getElementById('btn-add-bookmark').addEventListener('click', openAddChoice);
    document.getElementById('btn-empty-add').addEventListener('click', openAddChoice);
    document.getElementById('btn-import-all').addEventListener('click', importAllFromChrome);
    document.getElementById('form-bookmark').addEventListener('submit', handleBookmarkSubmit);
    document.getElementById('form-folder').addEventListener('submit', handleFolderSubmit);
    document.getElementById('btn-choice-link').addEventListener('click', () => {
      closeModal('modal-add-choice');
      openBookmarkModal();
    });
    document.getElementById('btn-choice-group').addEventListener('click', () => {
      closeModal('modal-add-choice');
      openFolderModal();
    });

    setupColorPicker();
    setupModalClose();
    setupContextMenu();
    document.addEventListener('click', () => hideContextMenu());

    syncActiveFolder().then(() => render());
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

  function openAddChoice() {
    openModal('modal-add-choice');
  }

  function showContextMenu(x, y, target) {
    contextTarget = target;
    NotesUI.clearContext?.();
    els.contextMenu.style.left = x + 'px';
    els.contextMenu.style.top = y + 'px';

    const isBookmark = target.type === 'bookmark';
    els.contextMenu.querySelectorAll('.ctx-bookmark-only').forEach((btn) => {
      btn.classList.toggle('hidden', !isBookmark);
    });
    els.contextMenu.querySelectorAll('.ctx-note-only').forEach((btn) => {
      btn.classList.add('hidden');
    });
    els.contextMenu.querySelectorAll('.ctx-trash-only').forEach((btn) => {
      btn.classList.add('hidden');
    });

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
          showContextMenu(e.clientX, e.clientY, { type: 'folder', id: folderId });
        });
      }
    });
  }

  function renderBookmarks() {
    const activeId = Storage.getEffectiveActiveFolderId();
    const bookmarks = Storage.getBookmarks(activeId);

    els.emptyState.classList.add('hidden');

    const itemsHtml = bookmarks.map((bm) => `
      <a href="${escapeHtml(bm.url)}" class="bookmark-item" data-id="${bm.id}" title="${escapeHtml(bm.title)}">
        <div class="bookmark-icon">
          <img src="${getFaviconUrl(bm.url)}" alt="" loading="lazy"
               onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span class="bookmark-fallback">${escapeHtml(bm.title.charAt(0))}</span>
        </div>
        <span class="bookmark-title">${escapeHtml(bm.title)}</span>
      </a>
    `).join('');

    els.grid.innerHTML = itemsHtml + `
      <button type="button" class="bookmark-item bookmark-add-tile" id="btn-add-tile" title="${I18n.t('add')}">
        <div class="bookmark-icon bookmark-icon-add">+</div>
        <span class="bookmark-title">${I18n.t('add')}</span>
      </button>
    `;

    document.getElementById('btn-add-tile').addEventListener('click', openAddChoice);

    els.grid.querySelectorAll('a.bookmark-item').forEach((item) => {
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e.clientX, e.clientY, { type: 'bookmark', id: item.dataset.id });
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

  return { init, render, openBookmarkModal, openAddChoice, hideContextMenu };
})();
