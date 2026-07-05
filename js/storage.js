const Storage = (() => {
  const VALID_THEMES = new Set(['midnight', 'ocean', 'forest', 'lavender', 'glass']);
  const VALID_GRADIENTS = new Set(['midnight', 'ocean', 'aurora', 'sunset', 'forest', 'lavender', 'night']);

  const DEFAULT_DATA = {
    bookmarks: [],
    folders: [
      { id: 'default', name: 'صفحه اصلی', color: '#94a3b8', order: 0, isDefault: true }
    ],
    notes: [],
    trashedNotes: [],
    activeFolderId: 'default',
    selectedDay: null,
    searchHistory: [],
    settings: {
      theme: 'glass',
      colorMode: 'dark',
      bgType: 'gradient',
      bgGradient: 'night',
      bgColor: '#000000',
      bgImage: '',
      bgBlur: 0,
      bgOverlay: 20,
      showClock: true,
      compactBookmarks: false,
      bookmarkSize: 'medium',
      notesBlurred: false,
      perfMode: 'auto',
      language: 'fa',
      welcomeShown: false,
      onboardingComplete: false,
      country: '',
      city: '',
      countryCode: '',
      timezone: '',
      calendarType: 'jalali',
      locationLat: null,
      locationLon: null,
      secondCity: '',
      secondCountry: '',
      secondCountryCode: '',
      secondTimezone: '',
      secondLocationLat: null,
      secondLocationLon: null,
      googleServicesVisible: true,
      enabledGoogleServices: ['gmail', 'drive', 'maps', 'youtube', 'translate', 'calendar', 'photos']
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
          if (result.personalStartPage.settings?.welcomeShown === undefined) {
            cache.settings.welcomeShown = true;
          }
          if (result.personalStartPage.settings?.onboardingComplete === undefined) {
            cache.settings.onboardingComplete = true;
          }
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
      if (def && (def.name === 'همه' || def.name === 'بدون دسته‌بندی')) def.name = 'صفحه اصلی';
    }
    if (data.notes) merged.notes = data.notes;
    if (data.trashedNotes) merged.trashedNotes = data.trashedNotes;
    if (data.activeFolderId) merged.activeFolderId = data.activeFolderId;
    if (data.selectedDay) merged.selectedDay = data.selectedDay;
    if (Array.isArray(data.searchHistory)) merged.searchHistory = data.searchHistory;
    if (data.settings) {
      merged.settings = { ...merged.settings, ...data.settings };
      if (merged.settings.theme === 'light' || !VALID_THEMES.has(merged.settings.theme)) {
        merged.settings.theme = 'midnight';
      }
      merged.settings.colorMode = 'dark';
      if (!VALID_GRADIENTS.has(merged.settings.bgGradient)) {
        merged.settings.bgGradient = 'midnight';
      }
      if (!['auto', 'lite', 'full'].includes(merged.settings.perfMode)) {
        merged.settings.perfMode = 'auto';
      }
      if (merged.settings.bgImage && /\/images\/wallpapers\/\d+\.jpg$/i.test(merged.settings.bgImage)) {
        merged.settings.bgImage = '';
        if (merged.settings.bgType === 'image') {
          merged.settings.bgType = 'gradient';
          merged.settings.bgGradient = merged.settings.bgGradient || 'midnight';
        }
      }
    }
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
    Object.entries(partial).forEach(([key, value]) => {
      if (value !== undefined) cache.settings[key] = value;
    });
    await save();
  }

  function getSelectedDay() {
    const g = getSelectedGregorian();
    return Jalali.gregorianToJalali(g.year, g.month, g.day);
  }

  function getSelectedGregorian() {
    if (cache.selectedDay?.gy != null) {
      return { year: cache.selectedDay.gy, month: cache.selectedDay.gm, day: cache.selectedDay.gd };
    }
    if (cache.selectedDay?.year != null && cache.selectedDay.gy == null) {
      const g = Jalali.jalaliToGregorian(
        cache.selectedDay.year,
        cache.selectedDay.month,
        cache.selectedDay.day
      );
      return { year: g.year, month: g.month, day: g.day };
    }
    return Jalali.gregorianToday();
  }

  async function setSelectedDay(year, month, day) {
    const g = Jalali.jalaliToGregorian(year, month, day);
    cache.selectedDay = { gy: g.year, gm: g.month, gd: g.day };
    await save();
  }

  async function setSelectedGregorian(year, month, day) {
    cache.selectedDay = { gy: year, gm: month, gd: day };
    await save();
  }

  function getTodayGregorian() {
    const tz = cache.settings.timezone || undefined;
    const iso = Locale.formatDateISO(new Date(), tz);
    const [year, month, day] = iso.split('-').map(Number);
    return { year, month, day };
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

  function getTrashedNotes() {
    return cache.trashedNotes.sort((a, b) => (b.deletedAt || 0) - (a.deletedAt || 0));
  }

  async function addNote(text) {
    const note = {
      id: generateId(),
      text,
      done: false,
      createdAt: Date.now()
    };
    cache.notes.unshift(note);
    await save();
    return note;
  }

  async function updateNote(id, updates) {
    const idx = cache.notes.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    cache.notes[idx] = { ...cache.notes[idx], ...updates };
    await save();
    return cache.notes[idx];
  }

  async function moveNoteToTrash(id) {
    const idx = cache.notes.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    const note = { ...cache.notes[idx], deletedAt: Date.now() };
    cache.notes.splice(idx, 1);
    cache.trashedNotes.unshift(note);
    await save();
    return true;
  }

  async function restoreNote(id) {
    const idx = cache.trashedNotes.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    const note = { ...cache.trashedNotes[idx] };
    delete note.deletedAt;
    cache.trashedNotes.splice(idx, 1);
    cache.notes.unshift(note);
    await save();
    return true;
  }

  async function permanentlyDeleteNote(id) {
    cache.trashedNotes = cache.trashedNotes.filter((n) => n.id !== id);
    await save();
  }

  async function moveAllNotesToTrash() {
    if (cache.notes.length === 0) return;
    const now = Date.now();
    cache.trashedNotes.unshift(...cache.notes.map((n) => ({ ...n, deletedAt: now })));
    cache.notes = [];
    await save();
  }

  async function emptyTrash() {
    cache.trashedNotes = [];
    await save();
  }

  async function deleteNote(id) {
    await moveNoteToTrash(id);
  }

  const SEARCH_HISTORY_MAX = 20;

  function getSearchHistory() {
    return cache.searchHistory || [];
  }

  async function addSearchHistory(query) {
    const trimmed = query.trim();
    if (!trimmed) return;
    const history = (cache.searchHistory || []).filter((item) => item !== trimmed);
    history.unshift(trimmed);
    cache.searchHistory = history.slice(0, SEARCH_HISTORY_MAX);
    await save();
  }

  async function removeSearchHistory(query) {
    cache.searchHistory = (cache.searchHistory || []).filter((item) => item !== query);
    await save();
  }

  async function clearSearchHistory() {
    cache.searchHistory = [];
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

  async function deleteFolder(id, deleteBookmarks = false) {
    const folder = cache.folders.find((f) => f.id === id);
    if (!folder || folder.isDefault) return false;
    if (deleteBookmarks) {
      cache.bookmarks = cache.bookmarks.filter((b) => b.folderId !== id);
    } else {
      cache.bookmarks.forEach((b) => {
        if (b.folderId === id) b.folderId = 'default';
      });
    }
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
    getSelectedGregorian,
    setSelectedDay,
    setSelectedGregorian,
    getTodayGregorian,
    getBookmarks,
    getFolders,
    getVisibleFolders,
    getEffectiveActiveFolderId,
    getNotes,
    getTrashedNotes,
    addNote,
    updateNote,
    deleteNote,
    moveNoteToTrash,
    restoreNote,
    permanentlyDeleteNote,
    moveAllNotesToTrash,
    emptyTrash,
    getSearchHistory,
    addSearchHistory,
    removeSearchHistory,
    clearSearchHistory,
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
