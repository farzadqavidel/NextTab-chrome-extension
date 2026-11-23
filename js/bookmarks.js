const BookmarksUI = (() => {
  const GRID_COLS = 5;
  const MIN_SLOTS = 5;

  let contextTarget = null;
  let editingBookmarkId = null;
  let editingFolderId = null;
  let activePickerTile = null;
  let viewFolderId = null;
  let draggedBookmark = null;
  let draggedFolder = null;
  let suppressNextBookmarkClick = false;
  let suppressBookmarkClickTimer = null;

  const els = {};

  const PICKER_SVG = {
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7-6.3-4.6L5.7 21l2.3-7-6-4.6h7.6z"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><path d="M12 11v6M9 14h6"/></svg>'
  };

  const FOLDER_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';

  function init() {
    els.grid = document.getElementById('bookmarks-grid');
    els.backBtn = document.getElementById('btn-bm-back');
    els.backLabel = document.getElementById('bm-back-label');
    els.dropHome = document.getElementById('bm-drop-home');
    els.dropHomeLabel = document.getElementById('bm-drop-home-label');
    els.title = document.getElementById('bm-title');
    els.contextMenu = document.getElementById('context-menu');

    els.backBtn.addEventListener('click', navigateBack);
    document.getElementById('form-bookmark').addEventListener('submit', handleBookmarkSubmit);
    document.getElementById('form-folder').addEventListener('submit', handleFolderSubmit);

    setupColorPicker();
    setupModalClose();
    setupContextMenu();
    setupBookmarkDragAndDrop();
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('pointerdown', clearBookmarkClickSuppression, true);
    document.addEventListener('keydown', clearBookmarkClickSuppression, true);

    render();
  }

  function handleDocumentClick() {
    hideContextMenu();
    closeAddPicker();
  }

  function armBookmarkClickSuppression() {
    suppressNextBookmarkClick = true;
    clearTimeout(suppressBookmarkClickTimer);
    suppressBookmarkClickTimer = setTimeout(clearBookmarkClickSuppression, 700);
  }

  function clearBookmarkClickSuppression() {
    if (suppressBookmarkClickTimer) clearTimeout(suppressBookmarkClickTimer);
    suppressBookmarkClickTimer = null;
    suppressNextBookmarkClick = false;
  }

  function isGroupsView() {
    return viewFolderId === null;
  }

  function navigateToFolder(folderId) {
    viewFolderId = folderId;
    closeAddPicker();
    render();
  }

  function navigateBack() {
    const folder = Storage.getFolders().find((item) => item.id === viewFolderId);
    if (Storage.getSettings().followChromeBookmarks && folder?.isChromeRoot && String(folder.chromeId) === '1') return;
    const parentId = folder?.parentId || 'default';
    viewFolderId = parentId === 'default' ? null : parentId;
    closeAddPicker();
    render();
  }

  function getFolderParentId(folderId) {
    return Storage.getFolders().find((folder) => folder.id === folderId)?.parentId || 'default';
  }

  function updateDropHomeLabel() {
    if (!els.dropHomeLabel || !viewFolderId) return;
    const parentId = getFolderParentId(viewFolderId);
    if (parentId === 'default') {
      els.dropHomeLabel.textContent = I18n.t('dropBookmarkToHome');
      return;
    }
    const parent = Storage.getFolders().find((folder) => folder.id === parentId);
    els.dropHomeLabel.textContent = I18n.t('dropBookmarkToParent', {
      folder: parent ? I18n.getFolderName(parent) : I18n.t('folder')
    });
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
          if (action === 'copy-link') copyBookmarkLink(contextTarget.id);
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

  // Schemes we allow users to bookmark. file:// is included so local pages
  // like file:///D:/app/index.html can be saved.
  const SUPPORTED_SCHEMES = ['http://', 'https://', 'file://', 'ftp://', 'chrome://', 'edge://', 'about:'];

  function isSupportedUrl(url) {
    const value = (url || '').trim().toLowerCase();
    return SUPPORTED_SCHEMES.some((scheme) => value.startsWith(scheme));
  }

  function isFileUrl(url) {
    return /^file:\/\//i.test((url || '').trim());
  }

  /**
   * Chrome blocks plain navigation from an extension page to file:// URLs, so
   * a normal <a href> click silently does nothing. chrome.tabs.create works,
   * but only when the extension has "Allow access to file URLs" enabled.
   */
  function openUrl(url, { newTab = true } = {}) {
    if (!url) return;

    if (isFileUrl(url) && typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url }, () => {
        if (chrome.runtime.lastError) {
          TabyarUI.alert(I18n.t('fileAccessNeeded'), { type: 'warning' });
        }
      });
      return;
    }

    if (newTab) window.open(url, '_blank');
    else window.location.href = url;
  }

  function openBookmarkInNewTab(id) {
    const bm = Storage.getData().bookmarks.find((b) => b.id === id);
    if (bm) openUrl(bm.url, { newTab: true });
  }

  async function copyBookmarkLink(id) {
    const bm = Storage.getData().bookmarks.find((b) => b.id === id);
    if (!bm) return;
    try {
      await navigator.clipboard.writeText(bm.url);
      TabyarUI.alert(I18n.t('linkCopied'), { type: 'success' });
    } catch {
      // Clipboard API can be unavailable; fall back to a temp textarea.
      const ta = document.createElement('textarea');
      ta.value = bm.url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        TabyarUI.alert(I18n.t('linkCopied'), { type: 'success' });
      } catch {
        TabyarUI.alert(I18n.t('copyFailed'), { type: 'error' });
      }
      document.body.removeChild(ta);
    }
  }

  async function deleteFolder(folderId) {
    const folder = Storage.getFolders().find((f) => f.id === folderId);
    if (!folder || folder.isDefault || folder.isChromeRoot) return;

    const bookmarkCount = Storage.getData().bookmarks.filter((bookmark) => (bookmark.folderId || 'default') === folderId).length;
    const childFolderCount = Storage.getFolders().filter((item) => (item.parentId || 'default') === folderId).length;
    let deleteBookmarks = false;

    if (bookmarkCount > 0 || childFolderCount > 0) {
      deleteBookmarks = await TabyarUI.confirm(I18n.t('deleteFolderWithItemsConfirm'), { danger: true });
    } else if (!(await TabyarUI.confirm(I18n.t('deleteGroupConfirm'), { danger: true }))) {
      return;
    }

    try {
      await Storage.deleteFolder(folderId, deleteBookmarks);
      if (viewFolderId === folderId) viewFolderId = null;
      render();
    } catch (error) {
      console.error('Folder delete failed:', error);
      TabyarUI.alert(I18n.t('bookmarkWriteFailed'), { type: 'error' });
    }
  }

  function openModal(id) {
    TabyarUI.openModal(id);
  }

  function closeModal(id) {
    TabyarUI.closeModal(id);
    if (id === 'modal-bookmark') editingBookmarkId = null;
    if (id === 'modal-folder') editingFolderId = null;
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

    tile.querySelector('[data-pick="link"]').addEventListener('click', (event) => {
      event.stopPropagation();
      closeAddPicker();
      openBookmarkModal();
    });
    tile.querySelector('[data-pick="folder"]').addEventListener('click', (event) => {
      event.stopPropagation();
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

  function getFolderPathLabel(folder, folders) {
    const parts = [I18n.getFolderName(folder)];
    let parentId = folder.parentId || 'default';
    const seen = new Set([folder.id]);
    while (parentId !== 'default' && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = folders.find((item) => item.id === parentId);
      if (!parent) break;
      parts.unshift(I18n.getFolderName(parent));
      parentId = parent.parentId || 'default';
    }
    return parts.join(' / ');
  }

  function getChromeBookmarksBarFolder(folders = Storage.getFolders()) {
    return folders.find((folder) => folder.isChromeRoot && String(folder.chromeId) === '1') || null;
  }

  function isInChromeBookmarksBar(folder, folders) {
    const byId = new Map(folders.map((item) => [item.id, item]));
    let current = folder;
    const seen = new Set();
    while (current && !seen.has(current.id)) {
      if (current.isChromeRoot && String(current.chromeId) === '1') return true;
      seen.add(current.id);
      current = byId.get(current.parentId);
    }
    return false;
  }

  function populateFolderSelect(selectEl, selectedId) {
    const allFolders = Storage.getFolders();
    const followChrome = Storage.getSettings().followChromeBookmarks;
    const folders = followChrome
      ? allFolders.filter((folder) => !folder.isDefault && isInChromeBookmarksBar(folder, allFolders))
      : allFolders;
    selectEl.innerHTML = '';
    folders.forEach((folder) => {
      const option = document.createElement('option');
      option.value = folder.id;
      option.textContent = getFolderPathLabel(folder, allFolders);
      if (folder.id === selectedId) option.selected = true;
      selectEl.appendChild(option);
    });
  }

  function getTargetFolderId() {
    if (viewFolderId) return viewFolderId;
    if (Storage.getSettings().followChromeBookmarks) {
      const bookmarksBar = Storage.getFolders().find((folder) => folder.isChromeRoot && String(folder.chromeId) === '1');
      if (bookmarksBar) return bookmarksBar.id;
    }
    return 'default';
  }

  function openBookmarkModal(bookmarkId) {
    editingBookmarkId = bookmarkId || null;
    const title = document.getElementById('modal-bookmark-title');
    const targetFolder = getTargetFolderId();

    populateFolderSelect(document.getElementById('bookmark-folder'), targetFolder);

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
      document.getElementById('bookmark-folder').value = targetFolder;
    }

    openModal('modal-bookmark');
  }

  function openFolderModal(folderId) {
    editingFolderId = folderId || null;
    const titleEl = document.getElementById('modal-folder-title');
    const submitBtn = document.getElementById('btn-folder-submit');

    if (folderId) {
      const folder = Storage.getFolders().find((f) => f.id === folderId);
      if (!folder || folder.isDefault || folder.isChromeRoot) return;
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

    if (!isSupportedUrl(url)) {
      TabyarUI.alert(I18n.t('invalidUrl'), { type: 'error' });
      return;
    }

    try {
      if (editingBookmarkId) {
        await Storage.updateBookmark(editingBookmarkId, { title, url, folderId });
      } else {
        await Storage.addBookmark({ title, url, folderId });
      }
      closeModal('modal-bookmark');
      render();
    } catch (error) {
      console.error('Bookmark save failed:', error);
      TabyarUI.alert(I18n.t('bookmarkWriteFailed'), { type: 'error' });
    }
  }

  async function handleFolderSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('folder-name').value.trim();
    const color = document.getElementById('folder-color').value;
    if (!name) return;

    try {
      if (editingFolderId) {
        await Storage.updateFolder(editingFolderId, { name, color });
      } else {
        await Storage.addFolder({ name, color, parentId: getTargetFolderId() });
      }
      closeModal('modal-folder');
      render();
    } catch (error) {
      console.error('Folder save failed:', error);
      TabyarUI.alert(I18n.t('bookmarkWriteFailed'), { type: 'error' });
    }
  }

  async function deleteBookmark(id) {
    if (!(await TabyarUI.confirm(I18n.t('deleteBookmarkConfirm'), { danger: true }))) return;
    try {
      await Storage.deleteBookmark(id);
      render();
    } catch (error) {
      console.error('Bookmark delete failed:', error);
      TabyarUI.alert(I18n.t('bookmarkWriteFailed'), { type: 'error' });
    }
  }

  function buildBookmarkTileHtml(bm) {
    return `
      <a href="${escapeHtml(bm.url)}" class="bm-tile bm-tile-link" data-id="${bm.id}" draggable="true" aria-grabbed="false" title="${escapeHtml(bm.title)}">
        <div class="bm-tile-icon">
          ${Favicon.imgHtml(bm.url, bm.title)}
        </div>
        <span class="bm-tile-label">${escapeHtml(bm.title)}</span>
      </a>
    `;
  }
  function buildFolderTileHtml(folder) {
    const label = I18n.getFolderName(folder);
    const title = `${label} · ${I18n.t(folder.isChromeRoot ? 'chromeSystemFolderHint' : 'folderDragHint')}`;
    const childCount = getChildItems(folder.id).length;
    const badge = childCount > 0 ? `<span class="bm-tile-badge" aria-hidden="true">${childCount}</span>` : '';
    return `
      <button type="button" class="bm-tile bm-tile-folder" data-folder-id="${folder.id}" draggable="true" aria-grabbed="false"
              style="--folder-color: ${folder.color}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}">
        ${badge}
        <span class="bm-tile-folder-icon">${FOLDER_SVG}</span>
        <span class="bm-tile-label">${escapeHtml(label)}</span>
      </button>
    `;
  }

  function buildAddTileHtml(mode) {
    return `
      <button type="button" class="bm-tile bm-tile-add" data-add-mode="${mode}" title="${I18n.t('add')}">
        <span class="bm-tile-plus" aria-hidden="true">+</span>
      </button>
    `;
  }

  function setupBookmarkDragAndDrop() {
    els.grid.addEventListener('dragstart', handleBookmarkDragStart);
    els.grid.addEventListener('dragover', handleBookmarkDragOver);
    els.grid.addEventListener('dragleave', handleBookmarkDragLeave);
    els.grid.addEventListener('drop', handleBookmarkGridDrop);
    els.grid.addEventListener('dragend', finishBookmarkDrag);
    els.dropHome?.addEventListener('dragover', handleHomeDropOver);
    els.dropHome?.addEventListener('dragleave', handleHomeDropLeave);
    els.dropHome?.addEventListener('drop', handleHomeDrop);
  }

  function handleBookmarkDragStart(event) {
    const folderTile = event.target.closest('.bm-tile-folder');
    if (folderTile) {
      const folder = Storage.getFolders().find((item) => item.id === folderTile.dataset.folderId);
      if (!folder || folder.isDefault || folder.isChromeRoot) {
        event.preventDefault();
        return;
      }
      draggedBookmark = null;
      draggedFolder = { id: folder.id, parentId: folder.parentId || 'default' };
      folderTile.setAttribute('aria-grabbed', 'true');
      folderTile.classList.add('is-dragging');
      els.grid.classList.add('is-bookmark-dragging');
      document.body.classList.add('bookmark-dragging', 'folder-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `tabyar-folder:${folder.id}`);
      try { event.dataTransfer.setDragImage(folderTile, folderTile.offsetWidth / 2, folderTile.offsetHeight / 2); } catch {}
      return;
    }

    const tile = event.target.closest('.bm-tile-link');
    if (!tile) return;
    const bookmark = Storage.getData().bookmarks.find((item) => item.id === tile.dataset.id);
    if (!bookmark) {
      event.preventDefault();
      return;
    }
    draggedBookmark = { id: bookmark.id, folderId: bookmark.folderId || 'default' };
    draggedFolder = null;
    tile.setAttribute('aria-grabbed', 'true');
    tile.classList.add('is-dragging');
    els.grid.classList.add('is-bookmark-dragging');
    document.body.classList.add('bookmark-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', bookmark.url);
    event.dataTransfer.setData('text/uri-list', bookmark.url);
    try { event.dataTransfer.setDragImage(tile, tile.offsetWidth / 2, tile.offsetHeight / 2); } catch {}

    const currentFolder = Storage.getFolders().find((folder) => folder.id === viewFolderId);
    if (!isGroupsView() && draggedBookmark.folderId === viewFolderId && !currentFolder?.isChromeRoot) {
      updateDropHomeLabel();
      els.dropHome?.classList.remove('hidden');
    }
    if (isGroupsView() && draggedBookmark.folderId === 'default') {
      els.grid.querySelectorAll('.bm-tile-folder').forEach((folderTile) => {
        folderTile.classList.add('is-drop-ready');
        folderTile.title = I18n.t('bookmarkDropToFolderHint');
      });
    }
  }

  function canDropOnTile(tile) {
    if (!tile) return false;
    if (draggedFolder) {
      const parentId = draggedFolder.parentId || 'default';
      if (tile.classList.contains('bm-tile-link') && Storage.getSettings().followChromeBookmarks) {
        const targetBookmark = Storage.getData().bookmarks.find((item) => item.id === tile.dataset.id);
        return Boolean(targetBookmark && (targetBookmark.folderId || 'default') === parentId);
      }
      const targetFolder = tile.classList.contains('bm-tile-folder')
        ? Storage.getFolders().find((folder) => folder.id === tile.dataset.folderId)
        : null;
      return Boolean(
        targetFolder &&
        !targetFolder.isChromeRoot &&
        targetFolder.id !== draggedFolder.id &&
        (targetFolder.parentId || 'default') === parentId
      );
    }
    if (!draggedBookmark) return false;
    if (tile.classList.contains('bm-tile-folder')) {
      const targetFolder = Storage.getFolders().find((folder) => folder.id === tile.dataset.folderId);
      const sourceParentId = viewFolderId || 'default';
      return Boolean(
        targetFolder &&
        !targetFolder.isChromeRoot &&
        draggedBookmark.folderId === sourceParentId &&
        (targetFolder.parentId || 'default') === sourceParentId
      );
    }
    if (tile.classList.contains('bm-tile-link')) {
      if (tile.dataset.id === draggedBookmark.id) return false;
      const target = Storage.getData().bookmarks.find((item) => item.id === tile.dataset.id);
      return Boolean(target && (target.folderId || 'default') === draggedBookmark.folderId);
    }
    return false;
  }

  function handleBookmarkDragOver(event) {
    if (!draggedBookmark && !draggedFolder) return;
    const tile = event.target.closest('.bm-tile-folder, .bm-tile-link');
    if (!canDropOnTile(tile)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    tile.classList.add('is-drop-target');
  }

  function handleBookmarkDragLeave(event) {
    const tile = event.target.closest('.bm-tile-folder, .bm-tile-link');
    if (!tile || tile.contains(event.relatedTarget)) return;
    tile.classList.remove('is-drop-target');
  }

  function isDropBeforeTile(tile, event) {
    const rect = tile.getBoundingClientRect();
    if (draggedFolder) {
      const sourceTile = [...els.grid.querySelectorAll('.bm-tile-folder')]
        .find((item) => item.dataset.folderId === draggedFolder.id);
      const sourceRect = sourceTile?.getBoundingClientRect();
      if (sourceRect && Math.abs(sourceRect.top - rect.top) > rect.height / 2) {
        return event.clientY < rect.top + rect.height / 2;
      }
    }
    const midpoint = rect.left + rect.width / 2;
    return document.documentElement.dir === 'rtl' ? event.clientX >= midpoint : event.clientX < midpoint;
  }

  async function handleBookmarkGridDrop(event) {
    if (!draggedBookmark && !draggedFolder) return;
    const tile = event.target.closest('.bm-tile-folder, .bm-tile-link');
    if (!canDropOnTile(tile)) return;
    event.preventDefault();
    const dragged = draggedBookmark ? { ...draggedBookmark } : null;
    const folderId = draggedFolder?.id || null;
    armBookmarkClickSuppression();

    try {
      if (folderId) {
        const parentId = draggedFolder.parentId || 'default';
        if (Storage.getSettings().followChromeBookmarks) {
          const previous = getChildItems(parentId);
          const sourceKey = `folder:${folderId}`;
          const targetKey = tile.classList.contains('bm-tile-folder')
            ? `folder:${tile.dataset.folderId}`
            : `bookmark:${tile.dataset.id}`;
          const sourceIndex = previous.findIndex((entry) => `${entry.type}:${entry.item.id}` === sourceKey);
          const targetIndex = previous.findIndex((entry) => `${entry.type}:${entry.item.id}` === targetKey);
          if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
          const order = [...previous];
          const [source] = order.splice(sourceIndex, 1);
          const newTargetIndex = order.findIndex((entry) => `${entry.type}:${entry.item.id}` === targetKey);
          const insertIndex = newTargetIndex + (isDropBeforeTile(tile, event) ? 0 : 1);
          order.splice(insertIndex, 0, source);
          await Storage.reorderChildItems(parentId, order.map((entry) => ({ type: entry.type, id: entry.item.id })));
        } else {
          const previousOrder = Storage.getFolders()
            .filter((folder) => !folder.isDefault && !folder.isChromeRoot && (folder.parentId || 'default') === parentId)
            .map((folder) => folder.id);
          const order = [...previousOrder];
          const sourceIndex = order.indexOf(folderId);
          const targetIndex = tile.classList.contains('bm-tile-folder') ? order.indexOf(tile.dataset.folderId) : -1;
          if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
          order.splice(sourceIndex, 1);
          const newTargetIndex = order.indexOf(tile.dataset.folderId);
          const insertIndex = newTargetIndex + (isDropBeforeTile(tile, event) ? 0 : 1);
          order.splice(insertIndex, 0, folderId);
          if (order.every((id, index) => id === previousOrder[index])) return;
          await Storage.reorderFolders(parentId, order);
        }
        render();
        TabyarUI.alert(I18n.t('folderOrderUpdated'), { type: 'success' });
        return;
      }

      if (tile.classList.contains('bm-tile-folder')) {
        const moved = await Storage.moveBookmark(dragged.id, tile.dataset.folderId);
        if (moved) {
          const folder = Storage.getFolders().find((item) => item.id === tile.dataset.folderId);
          const folderName = folder ? I18n.getFolderName(folder) : I18n.t('folder');
          render();
          TabyarUI.alert(I18n.t('bookmarkMovedToFolder', { folder: folderName }), { type: 'success' });
        }
        return;
      }

      if (Storage.getSettings().followChromeBookmarks) {
        const parentId = dragged.folderId || 'default';
        const previous = getChildItems(parentId);
        const sourceKey = `bookmark:${dragged.id}`;
        const targetKey = `bookmark:${tile.dataset.id}`;
        const sourceIndex = previous.findIndex((entry) => `${entry.type}:${entry.item.id}` === sourceKey);
        const targetIndex = previous.findIndex((entry) => `${entry.type}:${entry.item.id}` === targetKey);
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
        const order = [...previous];
        const [source] = order.splice(sourceIndex, 1);
        const newTargetIndex = order.findIndex((entry) => `${entry.type}:${entry.item.id}` === targetKey);
        const insertIndex = newTargetIndex + (isDropBeforeTile(tile, event) ? 0 : 1);
        order.splice(insertIndex, 0, source);
        await Storage.reorderChildItems(parentId, order.map((entry) => ({ type: entry.type, id: entry.item.id })));
      } else {
        const order = Storage.getBookmarks(dragged.folderId).map((item) => item.id);
        const sourceIndex = order.indexOf(dragged.id);
        const targetIndex = order.indexOf(tile.dataset.id);
        if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
        order.splice(sourceIndex, 1);
        const newTargetIndex = order.indexOf(tile.dataset.id);
        const insertIndex = newTargetIndex + (isDropBeforeTile(tile, event) ? 0 : 1);
        order.splice(insertIndex, 0, dragged.id);
        await Storage.reorderBookmarks(dragged.folderId, order);
      }
      render();
      TabyarUI.alert(I18n.t(folderId ? 'folderOrderUpdated' : 'bookmarkOrderUpdated'), { type: 'success' });
    } catch (error) {
      console.error('Bookmark drag-and-drop failed:', error);
      TabyarUI.alert(I18n.t(folderId ? 'folderOrderFailed' : 'bookmarkMoveFailed'), { type: 'error' });
    } finally {
      finishBookmarkDrag();
    }
  }

  function canDropOnHome() {
    const currentFolder = viewFolderId && Storage.getFolders().find((folder) => folder.id === viewFolderId);
    return Boolean(draggedBookmark && viewFolderId && !currentFolder?.isChromeRoot && draggedBookmark.folderId === viewFolderId);
  }

  function handleHomeDropOver(event) {
    if (!canDropOnHome()) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    els.dropHome.classList.add('is-drop-target');
  }

  function handleHomeDropLeave(event) {
    if (els.dropHome.contains(event.relatedTarget)) return;
    els.dropHome.classList.remove('is-drop-target');
  }

  async function handleHomeDrop(event) {
    if (!canDropOnHome()) return;
    event.preventDefault();
    const dragged = { ...draggedBookmark };
    const targetFolderId = getFolderParentId(dragged.folderId);
    armBookmarkClickSuppression();
    try {
      const moved = await Storage.moveBookmark(dragged.id, targetFolderId);
      if (moved) {
        const targetFolder = Storage.getFolders().find((folder) => folder.id === targetFolderId);
        render();
        TabyarUI.alert(targetFolderId === 'default'
          ? I18n.t('bookmarkMovedToHome')
          : I18n.t('bookmarkMovedToFolder', { folder: targetFolder ? I18n.getFolderName(targetFolder) : I18n.t('folder') }), { type: 'success' });
      }
    } catch (error) {
      console.error('Bookmark move-to-home failed:', error);
      TabyarUI.alert(I18n.t('bookmarkMoveFailed'), { type: 'error' });
    } finally {
      finishBookmarkDrag();
    }
  }

  function finishBookmarkDrag(event) {
    if (event?.target?.matches?.('.bm-tile-link, .bm-tile-folder')) event.target.setAttribute('aria-grabbed', 'false');
    els.grid?.classList.remove('is-bookmark-dragging');
    document.body.classList.remove('bookmark-dragging', 'folder-dragging');
    els.grid?.querySelectorAll('.is-dragging, .is-drop-target, .is-drop-ready').forEach((tile) => {
      tile.classList.remove('is-dragging', 'is-drop-target', 'is-drop-ready');
      if (tile.classList.contains('bm-tile-link') || tile.classList.contains('bm-tile-folder')) {
        tile.setAttribute('aria-grabbed', 'false');
      }
      if (tile.classList.contains('bm-tile-folder')) {
        const folder = Storage.getFolders().find((item) => item.id === tile.dataset.folderId);
        if (folder) {
          const title = `${I18n.getFolderName(folder)} · ${I18n.t('folderDragHint')}`;
          tile.title = title;
          tile.setAttribute('aria-label', title);
        }
      }
    });
    els.dropHome?.classList.remove('is-drop-target');
    if (!isGroupsView()) els.dropHome?.classList.add('hidden');
    draggedBookmark = null;
    draggedFolder = null;
  }

  function bindFolderTiles() {
    els.grid.querySelectorAll('.bm-tile-folder').forEach((tile) => {
      const folder = Storage.getFolders().find((item) => item.id === tile.dataset.folderId);
      tile.draggable = Boolean(folder && !folder.isDefault && !folder.isChromeRoot);
      tile.setAttribute('aria-grabbed', 'false');
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (suppressNextBookmarkClick) {
          e.preventDefault();
          clearBookmarkClickSuppression();
          return;
        }
        navigateToFolder(tile.dataset.folderId);
      });

      const folderId = tile.dataset.folderId;
      if (folder && !folder.isDefault && !folder.isChromeRoot) {
        tile.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          showContextMenu(e.clientX, e.clientY, { type: 'folder', id: folderId });
        });
      }
    });
  }

  function bindBookmarkTiles() {
    Favicon.bindAll(els.grid, '.bm-tile-link img');

    els.grid.querySelectorAll('.bm-tile-link').forEach((item) => {
      item.draggable = true;
      item.setAttribute('aria-grabbed', 'false');
      // file:// links can't be followed directly from an extension page.
      item.addEventListener('click', (e) => {
        if (suppressNextBookmarkClick) {
          e.preventDefault();
          clearBookmarkClickSuppression();
          return;
        }
        const href = item.getAttribute('href');
        if (!isFileUrl(href)) return;
        e.preventDefault();
        openUrl(href, { newTab: false });
      });

      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e.clientX, e.clientY, { type: 'bookmark', id: item.dataset.id });
      });
    });
  }

  function bindAddTiles(mode) {
    els.grid.querySelectorAll('.bm-tile-add').forEach((tile) => {
      tile.addEventListener('click', (e) => {
        e.stopPropagation();
        if (tile.classList.contains('bm-tile-picker-open')) return;
        openAddPicker(tile, tile.dataset.addMode || mode);
      });
    });
  }

  function padAddTiles(html, filledCount, mode) {
    const totalSlots = Math.max(MIN_SLOTS, Math.ceil((filledCount + 1) / GRID_COLS) * GRID_COLS);
    const emptyCount = totalSlots - filledCount;
    return html + Array.from({ length: emptyCount }, () => buildAddTileHtml(mode)).join('');
  }

  function getChildItems(parentFolderId) {
    const parentId = parentFolderId || 'default';
    const folderItems = Storage.getFolders()
      .filter((folder) => !folder.isDefault && (folder.parentId || 'default') === parentId)
      .map((folder) => ({ type: 'folder', item: folder }));
    const bookmarkItems = Storage.getBookmarks(parentId)
      .map((bookmark) => ({ type: 'bookmark', item: bookmark }));
    if (Storage.getSettings().followChromeBookmarks) {
      return [...folderItems, ...bookmarkItems].sort((a, b) =>
        (Number(a.item.order) || 0) - (Number(b.item.order) || 0) ||
        (Number(a.item.createdAt) || 0) - (Number(b.item.createdAt) || 0)
      );
    }
    return [...folderItems, ...bookmarkItems];
  }

  function renderChildItems(parentFolderId) {
    return getChildItems(parentFolderId).map(({ type, item }) =>
      type === 'folder' ? buildFolderTileHtml(item) : buildBookmarkTileHtml(item)
    ).join('');
  }

  function renderGroupsView() {
    els.backBtn.classList.add('hidden');
    els.title?.classList.remove('hidden');
    els.dropHome?.classList.add('hidden');
    closeAddPicker();

    const rootItems = getChildItems('default');
    let html = renderChildItems('default');
    html = padAddTiles(html, rootItems.length, 'groups');

    els.grid.innerHTML = html;
    bindFolderTiles();
    bindBookmarkTiles();
    bindAddTiles('groups');
  }

  function renderFolderView() {
    const folder = Storage.getFolders().find((f) => f.id === viewFolderId);
    if (!folder) {
      viewFolderId = null;
      renderGroupsView();
      return;
    }

    const isChromeBookmarksBar = Storage.getSettings().followChromeBookmarks &&
      folder.isChromeRoot && String(folder.chromeId) === '1';
    els.backBtn.classList.toggle('hidden', isChromeBookmarksBar);
    els.title?.classList.add('hidden');
    els.backLabel.textContent = I18n.getFolderName(folder);
    if (!draggedBookmark) els.dropHome?.classList.add('hidden');
    closeAddPicker();

    const childItems = getChildItems(viewFolderId);
    let html = renderChildItems(viewFolderId);
    html = padAddTiles(html, childItems.length, 'folder');

    els.grid.innerHTML = html;
    bindFolderTiles();
    bindBookmarkTiles();
    bindAddTiles('folder');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const folders = Storage.getFolders();
    const followChrome = Boolean(Storage.getSettings().followChromeBookmarks);
    const currentFolder = folders.find((folder) => folder.id === viewFolderId);
    if (followChrome) {
      const bookmarksBar = getChromeBookmarksBarFolder(folders);
      if (bookmarksBar && (!viewFolderId || viewFolderId === 'default' || !currentFolder ||
          (currentFolder.isChromeRoot && String(currentFolder.chromeId) !== '1'))) {
        viewFolderId = bookmarksBar.id;
      }
    } else if (currentFolder?.isChromeRoot) {
      viewFolderId = null;
    }

    if (isGroupsView()) {
      renderGroupsView();
    } else {
      renderFolderView();
    }
  }

  return { init, render, openBookmarkModal, hideContextMenu };
})();
