const Storage = (() => {
  const DEFAULT_DATA = {
    bookmarks: [],
    folders: [
      { id: 'default', name: 'بدون دسته‌بندی', color: '#94a3b8', order: 0, isDefault: true }
    ],
    notes: [],
    activeFolderId: 'default',
    selectedDay: null,
    settings: {
      theme: 'light',
      colorMode: 'light',
      bgType: 'color',
      bgGradient: 'sky',
      bgColor: '#C7E2F7',
      bgImage: '',
      bgBlur: 0,
      bgOverlay: 20,
      showClock: true,
      compactBookmarks: false,
      bookmarkSize: 'medium',
      notesBlurred: false,
      language: 'fa'
    }
  };

  let cache = null;

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  async function load() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['personalStartPage'], (result) => {
        if (result.personalStartPage) {
          cache = mergeDefaults(result.personalStartPage);
        } else {
          cache = structuredClone(DEFAULT_DATA);
        }
        resolve(cache);
      });
    });
  }

  function mergeDefaults(data) {
    const merged = structuredClone(DEFAULT_DATA);
    if (data.bookmarks) merged.bookmarks = data.bookmarks;
    if (data.folders) {
      merged.folders = data.folders;
      const def = merged.folders.find((f) => f.isDefault);
      if (def && def.name === 'همه') def.name = 'بدون دسته‌بندی';
    }
    if (data.notes) merged.notes = data.notes;
    if (data.activeFolderId) merged.activeFolderId = data.activeFolderId;
    if (data.selectedDay) merged.selectedDay = data.selectedDay;
    if (data.settings) merged.settings = { ...merged.settings, ...data.settings };
    return merged;
  }

  async function save() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ personalStartPage: cache }, resolve);
    });
  }

  function getData() {
    return cache;
  }

  function getSettings() {
    return cache.settings;
  }

  async function updateSettings(partial) {
    cache.settings = { ...cache.settings, ...partial };
    await save();
  }

  function getSelectedDay() {
    if (cache.selectedDay) return cache.selectedDay;
    const t = Jalali.today();
    return { year: t.year, month: t.month, day: t.day };
  }

  async function setSelectedDay(year, month, day) {
    cache.selectedDay = { year, month, day };
    await save();
  }

  function getBookmarks(folderId) {
    const id = folderId || cache.activeFolderId || 'default';
    return cache.bookmarks
      .filter((b) => b.folderId === id)
      .sort((a, b) => a.order - b.order);
  }

  function getFolders() {
    return cache.folders.sort((a, b) => a.order - b.order);
  }

  function getVisibleFolders() {
    return getFolders();
  }

  function getEffectiveActiveFolderId() {
    const folders = getFolders();
    if (folders.find((f) => f.id === cache.activeFolderId)) {
      return cache.activeFolderId;
    }
    return folders[0]?.id || 'default';
  }

  function getNotes() {
    return cache.notes.sort((a, b) => b.createdAt - a.createdAt);
  }

  async function addNote(text) {
    const note = {
      id: generateId(),
      text,
      createdAt: Date.now()
    };
    cache.notes.unshift(note);
    await save();
    return note;
  }

  async function deleteNote(id) {
    cache.notes = cache.notes.filter((n) => n.id !== id);
    await save();
  }

  async function addBookmark({ title, url, folderId }) {
    const bookmark = {
      id: generateId(),
      title,
      url,
      folderId: folderId || 'default',
      order: cache.bookmarks.length,
      createdAt: Date.now()
    };
    cache.bookmarks.push(bookmark);
    await save();
    return bookmark;
  }

  async function updateBookmark(id, updates) {
    const idx = cache.bookmarks.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    cache.bookmarks[idx] = { ...cache.bookmarks[idx], ...updates };
    await save();
    return cache.bookmarks[idx];
  }

  async function deleteBookmark(id) {
    cache.bookmarks = cache.bookmarks.filter((b) => b.id !== id);
    await save();
  }

  async function addFolder({ name, color, order }) {
    const folder = {
      id: generateId(),
      name,
      color: color || '#6366f1',
      order: order ?? cache.folders.length,
      isDefault: false
    };
    cache.folders.push(folder);
    await save();
    return folder;
  }

  async function updateFolder(id, updates) {
    const idx = cache.folders.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    if (cache.folders[idx].isDefault && updates.name) {
      updates.name = cache.folders[idx].name;
    }
    cache.folders[idx] = { ...cache.folders[idx], ...updates };
    await save();
    return cache.folders[idx];
  }

  async function deleteFolder(id) {
    const folder = cache.folders.find((f) => f.id === id);
    if (!folder || folder.isDefault) return false;
    cache.bookmarks.forEach((b) => {
      if (b.folderId === id) b.folderId = 'default';
    });
    cache.folders = cache.folders.filter((f) => f.id !== id);
    if (cache.activeFolderId === id) cache.activeFolderId = 'default';
    await save();
    return true;
  }

  async function setActiveFolder(id) {
    cache.activeFolderId = id;
    await save();
  }

  async function importBookmarks(items, folderId) {
    const targetFolder = folderId || cache.activeFolderId;
    let order = cache.bookmarks.length;
    for (const item of items) {
      const exists = cache.bookmarks.some((b) => b.url === item.url);
      if (!exists) {
        cache.bookmarks.push({
          id: generateId(),
          title: item.title,
          url: item.url,
          folderId: targetFolder,
          order: order++,
          createdAt: Date.now()
        });
      }
    }
    await save();
  }

  async function importBookmarkTree(nodes, parentFolderId) {
    let order = cache.bookmarks.length;
    let folderOrder = cache.folders.length;
    const skipTitles = ['Bookmarks bar', 'Other bookmarks', 'Mobile bookmarks', 'نوار بوکمارک', 'بوکمارک‌های دیگر'];

    async function processNode(node, parentId) {
      if (node.url) {
        const exists = cache.bookmarks.some((b) => b.url === node.url);
        if (!exists) {
          cache.bookmarks.push({
            id: generateId(),
            title: node.title || node.url,
            url: node.url,
            folderId: parentId,
            order: order++,
            createdAt: Date.now()
          });
        }
        return;
      }

      if (!node.children) return;

      let folderId = parentId;
      if (node.title && !skipTitles.includes(node.title)) {
        const existing = cache.folders.find((f) => f.name === node.title && !f.isDefault);
        if (existing) {
          folderId = existing.id;
        } else {
          const folder = {
            id: generateId(),
            name: node.title,
            color: getRandomColor(),
            order: folderOrder++,
            isDefault: false
          };
          cache.folders.push(folder);
          folderId = folder.id;
        }
      }

      for (const child of node.children) {
        await processNode(child, folderId);
      }
    }

    for (const node of nodes) {
      await processNode(node, parentFolderId || 'default');
    }
    await finalizeAfterImport();
    await save();
  }

  async function finalizeAfterImport() {
    const custom = cache.folders.filter((f) => !f.isDefault);
    if (custom.length > 0) {
      if (!custom.find((f) => f.id === cache.activeFolderId)) {
        cache.activeFolderId = custom[0].id;
      }
    } else {
      cache.activeFolderId = 'default';
    }
  }

  function getRandomColor() {
    const colors = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#22c55e'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  async function resetAll() {
    cache = structuredClone(DEFAULT_DATA);
    await save();
  }

  async function importAllData(data) {
    cache = mergeDefaults(data);
    await save();
  }

  function exportAllData() {
    return structuredClone(cache);
  }

  return {
    load,
    save,
    getData,
    getSettings,
    updateSettings,
    getSelectedDay,
    setSelectedDay,
    getBookmarks,
    getFolders,
    getVisibleFolders,
    getEffectiveActiveFolderId,
    getNotes,
    addNote,
    deleteNote,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    addFolder,
    updateFolder,
    deleteFolder,
    setActiveFolder,
    importBookmarks,
    importBookmarkTree,
    resetAll,
    importAllData,
    exportAllData,
    generateId
  };
})();
