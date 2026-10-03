const Storage = (() => {
  // Fallback lists. The real source of truth is SettingsUI (js/settings.js),
  // which is queried at runtime so newly added themes never get reset on reload.
  const FALLBACK_THEMES = ['midnight', 'ocean', 'forest', 'lavender', 'sunset', 'crimson',
    'amber', 'emerald', 'rose', 'slate', 'coffee', 'cyberpunk', 'glass'];
  const FALLBACK_GRADIENTS = ['midnight', 'ocean', 'aurora', 'sunset', 'forest', 'lavender',
    'crimson', 'amber', 'emerald', 'rose', 'slate', 'coffee', 'cyberpunk', 'mono', 'night'];
  const MAX_FOCUS_DURATION_MS = (((999 * 24) + 23) * 60 + 59) * 60 * 1000;

  function validThemes() {
    try {
      const keys = SettingsUI.getThemeKeys();
      if (Array.isArray(keys) && keys.length) return new Set(keys);
    } catch (err) { /* SettingsUI not ready yet */ }
    return new Set(FALLBACK_THEMES);
  }

  function validGradients() {
    try {
      const keys = SettingsUI.getGradientKeys();
      if (Array.isArray(keys) && keys.length) return new Set(keys);
    } catch (err) { /* SettingsUI not ready yet */ }
    return new Set(FALLBACK_GRADIENTS);
  }

  const DEFAULT_DATA = {
    bookmarks: [],
    tasks: [],
    personalEvents: [],
    focusSessions: [],
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
      privacyMode: false,
      persianDigits: 'auto',
      floatingBookmarkButton: true,
      widgetOrder: ['day-info-card', 'calendar-card', 'bookmarks-card', 'notes-card', 'tasks-card'],
      hiddenWidgets: [],
      focusState: { phase: 'focus', remainingMs: 1500000, endAt: 0, running: false },
      focusDurations: { focusMs: 1500000, breakMs: 300000 },
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
      topSitesVisible: true,
      hiddenTopSites: [],
      followChromeBookmarks: false,
      chromeBookmarkSyncInitialized: false,
      // Bumped when a new service is added so existing profiles receive it
      // once without re-enabling services they later disable themselves.
      googleServicesVersion: 2,
      enabledGoogleServices: ['gmail', 'drive', 'meet', 'maps', 'youtube', 'translate', 'calendar', 'photos']
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

        // Keep the persisted calendar marker aligned with the current local
        // date before the first render. The next save will persist the
        // migration, but the UI is corrected immediately as well.
        normalizeSelectedDay();
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
    if (Array.isArray(data.tasks)) merged.tasks = data.tasks;
    if (Array.isArray(data.personalEvents)) merged.personalEvents = data.personalEvents;
    if (Array.isArray(data.focusSessions)) merged.focusSessions = data.focusSessions;
    if (data.activeFolderId) merged.activeFolderId = data.activeFolderId;
    if (data.selectedDay) merged.selectedDay = data.selectedDay;
    if (Array.isArray(data.searchHistory)) merged.searchHistory = data.searchHistory;
    if (data.settings) {
      merged.settings = { ...merged.settings, ...data.settings };
      if (!Array.isArray(merged.settings.hiddenWidgets)) merged.settings.hiddenWidgets = [];
      if (!Array.isArray(merged.settings.widgetOrder)) merged.settings.widgetOrder = [...DEFAULT_DATA.settings.widgetOrder];
      if (!['auto', 'persian', 'latin'].includes(merged.settings.persianDigits)) merged.settings.persianDigits = 'auto';
      if (!['focus', 'break'].includes(merged.settings.focusState?.phase)) {
        merged.settings.focusState = structuredClone(DEFAULT_DATA.settings.focusState);
      } else {
        merged.settings.focusState = { ...DEFAULT_DATA.settings.focusState, ...(merged.settings.focusState || {}) };
      }
      const savedFocusDurations = merged.settings.focusDurations || {};
      const normalizeFocusDuration = (value, fallback) => {
        const duration = Number(value);
        return Number.isSafeInteger(duration) && duration >= 60000 && duration <= MAX_FOCUS_DURATION_MS && duration % 60000 === 0
          ? duration
          : fallback;
      };
      merged.settings.focusDurations = {
        focusMs: normalizeFocusDuration(savedFocusDurations.focusMs, DEFAULT_DATA.settings.focusDurations.focusMs),
        breakMs: normalizeFocusDuration(savedFocusDurations.breakMs, DEFAULT_DATA.settings.focusDurations.breakMs)
      };

      // Add newly introduced Google services to existing profiles exactly once.
      // This keeps an explicit user choice (including disabling Meet later)
      // intact on all subsequent loads.
      const savedGoogleServices = data.settings.enabledGoogleServices;
      const savedGoogleServicesVersion = Number(data.settings.googleServicesVersion || 0);
      if (Array.isArray(savedGoogleServices) && savedGoogleServicesVersion < 2) {
        merged.settings.enabledGoogleServices = [...new Set([...savedGoogleServices, 'meet'])];
        merged.settings.googleServicesVersion = 2;
      }

      if (merged.settings.theme === 'light' || !validThemes().has(merged.settings.theme)) {
        merged.settings.theme = DEFAULT_DATA.settings.theme;
      }
      merged.settings.colorMode = 'dark';
      if (!validGradients().has(merged.settings.bgGradient)) {
        merged.settings.bgGradient = DEFAULT_DATA.settings.bgGradient || 'midnight';
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

  function followsChromeBookmarks() {
    return Boolean(cache?.settings?.followChromeBookmarks);
  }

  function chromeBookmarksCall(method, ...args) {
    return new Promise((resolve, reject) => {
      if (typeof chrome === 'undefined' || !chrome.bookmarks?.[method]) {
        reject(new Error('Chrome bookmarks API is unavailable'));
        return;
      }
      try {
        chrome.bookmarks[method](...args, (result) => {
          const error = chrome.runtime?.lastError;
          if (error) reject(new Error(error.message || String(error)));
          else resolve(result);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  function getChromeFolderId(folderId) {
    const id = folderId || 'default';
    if (id === 'default') {
      const bookmarksBar = cache.folders.find((folder) => folder.isChromeRoot && String(folder.chromeId) === '1');
      return String(bookmarksBar?.chromeId || '1');
    }
    const folder = cache.folders.find((item) => item.id === id);
    return folder?.chromeId == null ? null : String(folder.chromeId);
  }

  function getBookmarkChildren(parentFolderId) {
    const parentId = parentFolderId || 'default';
    const folders = cache.folders
      .filter((folder) => !folder.isDefault && (folder.parentId || 'default') === parentId)
      .map((item) => ({ type: 'folder', item }));
    const bookmarks = cache.bookmarks
      .filter((bookmark) => (bookmark.folderId || 'default') === parentId)
      .map((item) => ({ type: 'bookmark', item }));
    return [...folders, ...bookmarks].sort((a, b) =>
      (Number(a.item.order) || 0) - (Number(b.item.order) || 0) ||
      (Number(a.item.createdAt) || 0) - (Number(b.item.createdAt) || 0)
    );
  }

  function applyOrderedChildren(parentFolderId, type, orderedItems) {
    const queue = [...orderedItems];
    return getBookmarkChildren(parentFolderId).map((entry) => {
      if (entry.type !== type || entry.item.isChromeRoot) return entry;
      const item = queue.shift();
      return item ? { type, item } : entry;
    });
  }

  async function moveChromeChildren(parentFolderId, children) {
    const chromeParentId = getChromeFolderId(parentFolderId);
    if (!chromeParentId) throw new Error('Chrome bookmark parent folder is missing');
    for (let index = 0; index < children.length; index += 1) {
      const { item } = children[index];
      if (!item.chromeId || item.isChromeRoot) continue;
      await chromeBookmarksCall('move', String(item.chromeId), { parentId: chromeParentId, index });
    }
  }

  async function syncChromeAfterMutation() {
    await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'TABYAR_SYNC_CHROME_BOOKMARKS_NOW' }, (response) => {
        const error = chrome.runtime.lastError;
        if (error) reject(new Error(error.message || String(error)));
        else if (!response?.ok) reject(new Error(response?.error || 'Chrome bookmark sync failed'));
        else resolve(response);
      });
    });
    await load();
  }

  function getData() {
    return cache;
  }

  function getSettings() {
    return cache.settings;
  }

  function dateKey(g) {
    return [g.year, g.month, g.day]
      .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
      .join('-');
  }

  /**
   * A selected day is useful while browsing, but it must not remain selected
   * after the calendar rolls into a new day. `selectedOn` records the day on
   * which the user made the selection, so an intentionally selected past/future
   * date still survives reloads during that same day.
   */
  function normalizeSelectedDay() {
    if (!cache?.selectedDay) return false;

    const today = getTodayGregorian();
    const todayKey = dateKey(today);
    const selected = getSelectedGregorian();
    const selectedKey = dateKey(selected);
    const selectedOn = cache.selectedDay.selectedOn;

    if (selectedOn && selectedOn !== todayKey) {
      cache.selectedDay = { gy: today.year, gm: today.month, gd: today.day, selectedOn: todayKey };
      return true;
    }

    // Migrate old saved selections that did not have `selectedOn`. If the old
    // selection is no longer today's date, it is the stale marker users saw on
    // the previous day, so move it to today.
    if (!selectedOn && selectedKey !== todayKey) {
      cache.selectedDay = { gy: today.year, gm: today.month, gd: today.day, selectedOn: todayKey };
      return true;
    }

    if (!selectedOn) {
      cache.selectedDay.selectedOn = todayKey;
      return true;
    }

    return false;
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
    return getTodayGregorian();
  }

  async function setSelectedDay(year, month, day) {
    const g = Jalali.jalaliToGregorian(year, month, day);
    const today = getTodayGregorian();
    cache.selectedDay = {
      gy: g.year,
      gm: g.month,
      gd: g.day,
      selectedOn: dateKey(today)
    };
    await save();
  }

  async function setSelectedGregorian(year, month, day) {
    const today = getTodayGregorian();
    cache.selectedDay = {
      gy: year,
      gm: month,
      gd: day,
      selectedOn: dateKey(today)
    };
    await save();
  }

  function getTodayGregorian() {
    const tz = cache.settings.timezone || undefined;
    const iso = Locale.formatDateISO(new Date(), tz);
    const [year, month, day] = iso.split('-').map(Number);
    return { year, month, day };
  }

  function syncSelectedDay() {
    return normalizeSelectedDay();
  }

  function getBookmarks(folderId) {
    const id = folderId || cache.activeFolderId || 'default';
    return cache.bookmarks
      .filter((b) => (b.folderId || 'default') === id)
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0) || (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0));
  }

  function normalizeBookmarkOrder(items) {
    items.forEach((bookmark, index) => { bookmark.order = index; });
  }

  async function reorderBookmarks(folderId, orderedIds) {
    const id = folderId || 'default';
    const current = getBookmarks(id);
    const byId = new Map(current.map((bookmark) => [bookmark.id, bookmark]));
    const ordered = [];
    const seen = new Set();
    (Array.isArray(orderedIds) ? orderedIds : []).forEach((bookmarkId) => {
      const bookmark = byId.get(bookmarkId);
      if (bookmark && !seen.has(bookmarkId)) {
        ordered.push(bookmark);
        seen.add(bookmarkId);
      }
    });
    current.forEach((bookmark) => {
      if (!seen.has(bookmark.id)) ordered.push(bookmark);
    });

    if (followsChromeBookmarks()) {
      const children = applyOrderedChildren(id, 'bookmark', ordered);
      await moveChromeChildren(id, children);
      await syncChromeAfterMutation();
      return getBookmarks(id);
    }

    normalizeBookmarkOrder(ordered);
    await save();
    return ordered;
  }

  async function reorderChildItems(parentFolderId, orderedEntries) {
    if (!followsChromeBookmarks()) return null;
    const parentId = parentFolderId || 'default';
    const current = getBookmarkChildren(parentId);
    const byKey = new Map(current.map((entry) => [`${entry.type}:${entry.item.id}`, entry]));
    const ordered = [];
    const seen = new Set();
    (Array.isArray(orderedEntries) ? orderedEntries : []).forEach((entry) => {
      const key = `${entry?.type}:${entry?.id}`;
      const found = byKey.get(key);
      if (found && !seen.has(key)) {
        ordered.push(found);
        seen.add(key);
      }
    });
    current.forEach((entry) => {
      const key = `${entry.type}:${entry.item.id}`;
      if (!seen.has(key)) ordered.push(entry);
    });
    await moveChromeChildren(parentId, ordered);
    await syncChromeAfterMutation();
    return getBookmarkChildren(parentId);
  }

  async function moveBookmark(bookmarkId, targetFolderId, targetIndex = null) {
    const bookmark = cache.bookmarks.find((item) => item.id === bookmarkId);
    const destinationId = targetFolderId || 'default';
    if (!bookmark || !cache.folders.some((folder) => folder.id === destinationId)) return null;
    const sourceId = bookmark.folderId || 'default';

    if (followsChromeBookmarks()) {
      const chromeParentId = getChromeFolderId(destinationId);
      if (!bookmark.chromeId || !chromeParentId) return null;
      const destinationChildren = getBookmarkChildren(destinationId).filter((entry) => entry.item.id !== bookmarkId);
      const defaultIndex = destinationChildren.length;
      const index = Number.isInteger(targetIndex) ? Math.max(0, Math.min(targetIndex, destinationChildren.length)) : defaultIndex;
      await chromeBookmarksCall('move', String(bookmark.chromeId), { parentId: chromeParentId, index });
      await syncChromeAfterMutation();
      return cache.bookmarks.find((item) => String(item.chromeId) === String(bookmark.chromeId)) || null;
    }

    if (sourceId === destinationId) {
      const ordered = getBookmarks(sourceId);
      const oldIndex = ordered.findIndex((item) => item.id === bookmarkId);
      if (oldIndex < 0) return null;
      ordered.splice(oldIndex, 1);
      const index = Number.isInteger(targetIndex) ? Math.max(0, Math.min(targetIndex, ordered.length)) : ordered.length;
      ordered.splice(index, 0, bookmark);
      normalizeBookmarkOrder(ordered);
    } else {
      const sourceItems = getBookmarks(sourceId).filter((item) => item.id !== bookmarkId);
      bookmark.folderId = destinationId;
      const destinationItems = getBookmarks(destinationId).filter((item) => item.id !== bookmarkId);
      const index = Number.isInteger(targetIndex) ? Math.max(0, Math.min(targetIndex, destinationItems.length)) : destinationItems.length;
      destinationItems.splice(index, 0, bookmark);
      normalizeBookmarkOrder(sourceItems);
      normalizeBookmarkOrder(destinationItems);
    }

    await save();
    return bookmark;
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

  function getTasks() {
    return Array.isArray(cache.tasks) ? cache.tasks : [];
  }

  async function addTask({ title, text, dueDate = '' }) {
    const taskTitle = String(title ?? text ?? '').trim();
    if (!taskTitle) return null;
    const task = {
      id: generateId(),
      title: taskTitle.slice(0, 180),
      dueDate: /^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : '',
      done: false,
      createdAt: Date.now(),
      completedAt: null
    };
    cache.tasks = getTasks();
    cache.tasks.unshift(task);
    await save();
    return task;
  }

  async function updateTask(id, updates) {
    const idx = getTasks().findIndex((task) => task.id === id);
    if (idx === -1) return null;
    const safeUpdates = { ...updates };
    if (safeUpdates.title != null) safeUpdates.title = String(safeUpdates.title).trim().slice(0, 180);
    if (safeUpdates.dueDate != null && !/^\d{4}-\d{2}-\d{2}$/.test(safeUpdates.dueDate)) safeUpdates.dueDate = '';
    cache.tasks[idx] = { ...cache.tasks[idx], ...safeUpdates };
    await save();
    return cache.tasks[idx];
  }

  async function deleteTask(id) {
    cache.tasks = getTasks().filter((task) => task.id !== id);
    await save();
  }

  function getPersonalEvents() {
    return Array.isArray(cache.personalEvents) ? cache.personalEvents : [];
  }

  async function addPersonalEvent(event) {
    const item = {
      id: generateId(),
      title: String(event.title || '').trim().slice(0, 120),
      calendarType: ['jalali', 'gregorian', 'hijri'].includes(event.calendarType) ? event.calendarType : 'jalali',
      year: Math.max(1, Number(event.year) || 1),
      month: Math.max(1, Number(event.month) || 1),
      day: Math.max(1, Number(event.day) || 1),
      annually: Boolean(event.annually),
      createdAt: Date.now()
    };
    if (!item.title) return null;
    cache.personalEvents = getPersonalEvents();
    cache.personalEvents.push(item);
    await save();
    return item;
  }

  async function updatePersonalEvent(id, updates) {
    const idx = getPersonalEvents().findIndex((event) => event.id === id);
    if (idx === -1) return null;
    const previous = cache.personalEvents[idx];
    cache.personalEvents[idx] = {
      ...previous,
      ...updates,
      title: String(updates.title ?? previous.title).trim().slice(0, 120),
      calendarType: ['jalali', 'gregorian', 'hijri'].includes(updates.calendarType ?? previous.calendarType)
        ? (updates.calendarType ?? previous.calendarType) : previous.calendarType,
      year: Math.max(1, Number(updates.year ?? previous.year) || previous.year),
      month: Math.max(1, Number(updates.month ?? previous.month) || previous.month),
      day: Math.max(1, Number(updates.day ?? previous.day) || previous.day),
      annually: Boolean(updates.annually ?? previous.annually)
    };
    await save();
    return cache.personalEvents[idx];
  }

  async function deletePersonalEvent(id) {
    cache.personalEvents = getPersonalEvents().filter((event) => event.id !== id);
    await save();
  }

  function getFocusSessions() {
    return Array.isArray(cache.focusSessions) ? cache.focusSessions : [];
  }

  async function addFocusSession(completedAt = Date.now()) {
    cache.focusSessions = [...getFocusSessions(), Number(completedAt) || Date.now()].slice(-1000);
    await save();
  }

  async function addBookmark({ title, url, folderId }) {
    const targetFolderId = folderId || 'default';
    if (followsChromeBookmarks()) {
      const chromeParentId = getChromeFolderId(targetFolderId);
      if (!chromeParentId) throw new Error('Chrome bookmark parent folder is missing');
      const created = await chromeBookmarksCall('create', {
        parentId: chromeParentId,
        index: getBookmarkChildren(targetFolderId).length,
        title: String(title || '').trim(),
        url: String(url || '').trim()
      });
      await syncChromeAfterMutation();
      return cache.bookmarks.find((bookmark) => String(bookmark.chromeId) === String(created.id)) || null;
    }

    const existing = getBookmarks(targetFolderId);
    const bookmark = {
      id: generateId(),
      title,
      url,
      folderId: targetFolderId,
      order: existing.length ? (Number(existing[existing.length - 1].order) || 0) + 1 : 0,
      createdAt: Date.now()
    };
    cache.bookmarks.push(bookmark);
    await save();
    return bookmark;
  }

  async function updateBookmark(id, updates) {
    const idx = cache.bookmarks.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    const previous = cache.bookmarks[idx];
    const previousFolderId = previous.folderId || 'default';
    const updated = { ...previous, ...updates, folderId: updates.folderId || previousFolderId };
    if (!cache.folders.some((folder) => folder.id === updated.folderId)) return null;

    if (followsChromeBookmarks()) {
      if (!previous.chromeId) return null;
      if (previousFolderId !== updated.folderId) {
        const chromeParentId = getChromeFolderId(updated.folderId);
        if (!chromeParentId) return null;
        await chromeBookmarksCall('move', String(previous.chromeId), {
          parentId: chromeParentId,
          index: getBookmarkChildren(updated.folderId).length
        });
      }
      const chromeUpdates = {};
      if (Object.prototype.hasOwnProperty.call(updates, 'title')) chromeUpdates.title = String(updates.title || '').trim();
      if (Object.prototype.hasOwnProperty.call(updates, 'url')) chromeUpdates.url = String(updates.url || '').trim();
      if (Object.keys(chromeUpdates).length) {
        await chromeBookmarksCall('update', String(previous.chromeId), chromeUpdates);
      }
      await syncChromeAfterMutation();
      return cache.bookmarks.find((bookmark) => String(bookmark.chromeId) === String(previous.chromeId)) || null;
    }

    cache.bookmarks[idx] = updated;
    if (previousFolderId !== updated.folderId) {
      const sourceItems = getBookmarks(previousFolderId).filter((item) => item.id !== id);
      const destinationItems = getBookmarks(updated.folderId).filter((item) => item.id !== id);
      destinationItems.push(updated);
      normalizeBookmarkOrder(sourceItems);
      normalizeBookmarkOrder(destinationItems);
    }
    await save();
    return updated;
  }

  async function deleteBookmark(id) {
    const bookmark = cache.bookmarks.find((item) => item.id === id);
    if (followsChromeBookmarks()) {
      if (!bookmark?.chromeId) return false;
      await chromeBookmarksCall('remove', String(bookmark.chromeId));
      await syncChromeAfterMutation();
      return true;
    }
    cache.bookmarks = cache.bookmarks.filter((b) => b.id !== id);
    await save();
    return true;
  }

  async function addFolder({ name, color, order, parentId }) {
    const targetParentId = parentId || 'default';
    if (followsChromeBookmarks()) {
      const chromeParentId = getChromeFolderId(targetParentId);
      if (!chromeParentId) throw new Error('Chrome bookmark parent folder is missing');
      const created = await chromeBookmarksCall('create', {
        parentId: chromeParentId,
        index: getBookmarkChildren(targetParentId).length,
        title: String(name || '').trim()
      });
      if (color) {
        cache.folders.push({
          id: `chrome-${created.id}`,
          chromeId: String(created.id),
          parentId: targetParentId,
          name: created.title,
          color,
          order: created.index || 0,
          createdAt: created.dateAdded || Date.now(),
          isDefault: false
        });
        await save();
      }
      await syncChromeAfterMutation();
      return cache.folders.find((folder) => String(folder.chromeId) === String(created.id)) || null;
    }

    const siblings = cache.folders.filter((folder) => !folder.isDefault && (folder.parentId || 'default') === targetParentId);
    const folder = {
      id: generateId(),
      name,
      color: color || '#6366f1',
      parentId: targetParentId,
      order: order ?? siblings.length,
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
    if (followsChromeBookmarks()) {
      const folder = cache.folders[idx];
      if (folder.isChromeRoot || !folder.chromeId) return null;
      if (Object.prototype.hasOwnProperty.call(updates, 'color')) {
        cache.folders[idx] = { ...folder, color: updates.color };
        await save();
      }
      if (Object.prototype.hasOwnProperty.call(updates, 'name')) {
        await chromeBookmarksCall('update', String(folder.chromeId), { title: String(updates.name || '').trim() });
      }
      await syncChromeAfterMutation();
      return cache.folders.find((item) => String(item.chromeId) === String(folder.chromeId)) || null;
    }
    cache.folders[idx] = { ...cache.folders[idx], ...updates };
    await save();
    return cache.folders[idx];
  }

  async function reorderFolders(parentFolderId, orderedIds) {
    if (Array.isArray(parentFolderId)) {
      orderedIds = parentFolderId;
      parentFolderId = 'default';
    }
    const parentId = parentFolderId || 'default';
    const folders = cache.folders.filter((folder) =>
      !folder.isDefault && !folder.isChromeRoot && (folder.parentId || 'default') === parentId
    );
    const byId = new Map(folders.map((folder) => [folder.id, folder]));
    const ordered = [];
    const seen = new Set();
    (Array.isArray(orderedIds) ? orderedIds : []).forEach((folderId) => {
      const folder = byId.get(folderId);
      if (folder && !seen.has(folderId)) {
        ordered.push(folder);
        seen.add(folderId);
      }
    });
    folders.forEach((folder) => {
      if (!seen.has(folder.id)) ordered.push(folder);
    });

    if (followsChromeBookmarks()) {
      const children = applyOrderedChildren(parentId, 'folder', ordered);
      await moveChromeChildren(parentId, children);
      await syncChromeAfterMutation();
      return cache.folders.filter((folder) =>
        !folder.isDefault && !folder.isChromeRoot && (folder.parentId || 'default') === parentId
      );
    }

    ordered.forEach((folder, index) => { folder.order = index + 1; });
    await save();
    return ordered;
  }

  async function deleteFolder(id, deleteBookmarks = false) {
    const folder = cache.folders.find((item) => item.id === id);
    if (!folder || folder.isDefault || folder.isChromeRoot) return false;
    const parentId = folder.parentId || 'default';

    if (followsChromeBookmarks()) {
      if (!folder.chromeId) return false;
      if (deleteBookmarks) {
        await chromeBookmarksCall('removeTree', String(folder.chromeId));
      } else {
        const parentChromeId = getChromeFolderId(parentId);
        if (!parentChromeId) return false;
        const children = getBookmarkChildren(id);
        let index = getBookmarkChildren(parentId).length;
        for (const child of children) {
          if (!child.item.chromeId) continue;
          await chromeBookmarksCall('move', String(child.item.chromeId), { parentId: parentChromeId, index });
          index += 1;
        }
        await chromeBookmarksCall('remove', String(folder.chromeId));
      }
      await syncChromeAfterMutation();
      return true;
    }

    const subtreeIds = new Set([id]);
    let added = true;
    while (added) {
      added = false;
      cache.folders.forEach((item) => {
        if (!item.isDefault && subtreeIds.has(item.parentId || 'default') && !subtreeIds.has(item.id)) {
          subtreeIds.add(item.id);
          added = true;
        }
      });
    }
    if (deleteBookmarks) {
      cache.bookmarks = cache.bookmarks.filter((bookmark) => !subtreeIds.has(bookmark.folderId || 'default'));
      cache.folders = cache.folders.filter((item) => !subtreeIds.has(item.id));
    } else {
      const parentChildren = getBookmarkChildren(parentId);
      const nextOrder = parentChildren.length;
      cache.bookmarks.forEach((bookmark) => {
        if (bookmark.folderId === id) {
          bookmark.folderId = parentId;
          bookmark.order = nextOrder + (Number(bookmark.order) || 0);
        }
      });
      cache.folders.forEach((item) => {
        if (item.parentId === id) {
          item.parentId = parentId;
          item.order = nextOrder + (Number(item.order) || 0);
        }
      });
      cache.folders = cache.folders.filter((item) => item.id !== id);
    }
    if (subtreeIds.has(cache.activeFolderId)) cache.activeFolderId = parentId;
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
    async function processNode(node, parentId) {
      if (node.url) {
        const exists = cache.bookmarks.some((bookmark) => bookmark.url === node.url && (bookmark.folderId || 'default') === parentId);
        if (!exists) {
          cache.bookmarks.push({
            id: generateId(),
            title: node.title || node.url,
            url: node.url,
            folderId: parentId,
            order: Number.isInteger(node.index) ? node.index : order++,
            createdAt: Date.now()
          });
        }
        return;
      }

      if (!node.children) return;

      let folderId = parentId;
      if (node.title) {
        const existing = cache.folders.find((f) => f.name === node.title && !f.isDefault && (f.parentId || 'default') === parentId);
        if (existing) {
          folderId = existing.id;
        } else {
          const folder = {
            id: generateId(),
            name: node.title,
            color: getRandomColor(),
            parentId,
            order: Number.isInteger(node.index) ? node.index : folderOrder++,
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
    const followChrome = followsChromeBookmarks();
    const chromeBookmarks = followChrome ? cache.bookmarks : null;
    const chromeFolders = followChrome ? cache.folders : null;
    const syncInitialized = Boolean(cache?.settings?.chromeBookmarkSyncInitialized);
    cache = mergeDefaults(data);
    cache.settings.followChromeBookmarks = followChrome;
    cache.settings.chromeBookmarkSyncInitialized = syncInitialized;
    if (followChrome) {
      cache.bookmarks = chromeBookmarks;
      cache.folders = chromeFolders;
      if (!cache.folders.some((folder) => folder.id === cache.activeFolderId)) cache.activeFolderId = 'default';
    }
    await save();
  }

  function exportAllData() {
    return structuredClone(cache);
  }

  /**
   * chrome.topSites is read-only, so "removing" an entry means remembering it
   * in a local block list that the renderer filters against.
   */
  function getHiddenTopSites() {
    const list = getSettings().hiddenTopSites;
    return Array.isArray(list) ? list : [];
  }

  /** Normalised key for comparing top sites (scheme/www/trailing slash agnostic). */
  function topSiteKey(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, '');
      const path = u.pathname.replace(/\/$/, '');
      return (host + path).toLowerCase();
    } catch {
      return String(url || '').trim().toLowerCase();
    }
  }

  async function hideTopSite(url) {
    const key = topSiteKey(url);
    if (!key) return;
    const hidden = getHiddenTopSites();
    if (hidden.includes(key)) return;
    await updateSettings({ hiddenTopSites: [...hidden, key] });
  }

  async function clearHiddenTopSites() {
    await updateSettings({ hiddenTopSites: [] });
  }

  function isTopSiteHidden(url) {
    return getHiddenTopSites().includes(topSiteKey(url));
  }

  return {
    load,
    save,
    getData,
    getHiddenTopSites,
    hideTopSite,
    clearHiddenTopSites,
    isTopSiteHidden,
    topSiteKey,
    getSettings,
    updateSettings,
    getSelectedDay,
    getSelectedGregorian,
    syncSelectedDay,
    setSelectedDay,
    setSelectedGregorian,
    getTodayGregorian,
    getBookmarks,
    getFolders,
    getVisibleFolders,
    getEffectiveActiveFolderId,
    getNotes,
    getTrashedNotes,
    getTasks,
    addTask,
    updateTask,
    deleteTask,
    getPersonalEvents,
    addPersonalEvent,
    updatePersonalEvent,
    deletePersonalEvent,
    getFocusSessions,
    addFocusSession,
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
    moveBookmark,
    reorderBookmarks,
    reorderChildItems,
    deleteBookmark,
    addFolder,
    updateFolder,
    reorderFolders,
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
