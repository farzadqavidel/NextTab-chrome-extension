const Storage = (() => {
  // Fallback lists. The real source of truth is SettingsUI (js/settings.js),
  // which is queried at runtime so newly added themes never get reset on reload.
  const FALLBACK_THEMES = ['midnight', 'ocean', 'forest', 'lavender', 'sunset', 'crimson',
    'amber', 'emerald', 'rose', 'slate', 'coffee', 'cyberpunk'];
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
      theme: 'midnight',
      colorMode: 'glass',
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
      floatingBookmarkButton: true,
      widgetOrder: ['day-info-card', 'calendar-card', 'bookmarks-card', 'notes-card', 'tasks-card'],
      feedOrder: ['sites-section', 'prices-section', 'news-section'],
      hiddenWidgets: [],
      focusState: { phase: 'focus', remainingMs: 1500000, endAt: 0, running: false },
      focusDurations: { focusMs: 1500000, breakMs: 300000 },
      font: 'vazir',
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

  /**
   * Strict shape validation for imported / stored data. Anything coming from a
   * backup file, a corrupted chrome.storage entry, or an older build passes
   * through here before it can reach the DOM or be re-saved: ids are constrained
   * to safe characters, texts are length-capped, URLs are size-capped, enum/
   * numeric fields are range-checked, and collections are length-capped.
   * User content (bookmark urls, note texts, search history) is preserved — the
   * render layer is responsible for deciding which protocols may become href.
   */
  function sanitizeImportData(input) {
    const src = input && typeof input === 'object' && !Array.isArray(input) ? input : {};

    const str = (value, max = 500) => (typeof value === 'string' ? value.slice(0, max) : '');
    const id = (value) => {
      if (typeof value !== 'string') return '';
      const trimmed = value.trim().slice(0, 64);
      return /^[A-Za-z0-9_:.-]{1,64}$/.test(trimmed) ? trimmed : '';
    };
    const num = (value, fallback = 0) => { const n = Number(value); return Number.isFinite(n) ? n : fallback; };
    const hexColor = (value, fallback) => (typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim()) ? value.trim() : fallback);
    const clampNum = (value, min, max, fallback) => { const n = Number(value); return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback; };
    const strList = (value, maxItems, maxLen) => (Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string').map((item) => item.slice(0, maxLen)).filter(Boolean))].slice(0, maxItems) : []);

    const bookmarks = Array.isArray(src.bookmarks) ? src.bookmarks.slice(0, 500).map((b) => {
      if (!b || typeof b !== 'object') return null;
      const url = str(b.url, 2048).trim();
      if (!url) return null;
      const bookmark = {
        id: id(b.id) || generateId(),
        title: str(b.title, 180) || url,
        url,
        folderId: id(b.folderId) || 'default',
        order: num(b.order, 0),
        createdAt: num(b.createdAt, Date.now())
      };
      if (b.chromeId != null) bookmark.chromeId = String(b.chromeId).slice(0, 64);
      if (b.isOutline) bookmark.isOutline = true;
      return bookmark;
    }).filter(Boolean) : [];

    let folders = Array.isArray(src.folders) ? src.folders.slice(0, 200).map((f) => {
      if (!f || typeof f !== 'object') return null;
      const folderId = id(f.id);
      if (!folderId) return null;
      const folder = {
        id: folderId,
        name: str(f.name, 80) || 'Folder',
        color: hexColor(f.color, '#94a3b8'),
        order: num(f.order, 0),
        parentId: id(f.parentId) ? id(f.parentId) : 'default',
        isDefault: Boolean(f.isDefault),
        isChromeRoot: Boolean(f.isChromeRoot),
        createdAt: num(f.createdAt, Date.now())
      };
      if (f.chromeId != null) folder.chromeId = String(f.chromeId).slice(0, 64);
      return folder;
    }).filter(Boolean) : [];
    if (!folders.some((f) => f.isDefault || f.id === 'default')) {
      folders.unshift({ id: 'default', name: 'صفحه اصلی', color: '#94a3b8', order: 0, isDefault: true });
    }

    const cleanNote = (n) => {
      if (!n || typeof n !== 'object') return null;
      const text = str(n.text, 2000);
      const note = {
        id: id(n.id) || generateId(),
        text,
        done: Boolean(n.done),
        createdAt: num(n.createdAt, Date.now())
      };
      if (n.deletedAt != null && Number.isFinite(Number(n.deletedAt))) note.deletedAt = Number(n.deletedAt);
      return note;
    };
    const notes = Array.isArray(src.notes) ? src.notes.slice(0, 500).map(cleanNote).filter(Boolean) : [];
    const trashedNotes = Array.isArray(src.trashedNotes) ? src.trashedNotes.slice(0, 500).map(cleanNote).filter(Boolean) : [];

    const tasks = Array.isArray(src.tasks) ? src.tasks.slice(0, 500).map((t) => {
      if (!t || typeof t !== 'object') return null;
      const task = {
        id: id(t.id) || generateId(),
        title: str(t.title || t.text, 180).trim(),
        dueDate: /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate || '') ? t.dueDate : '',
        done: Boolean(t.done),
        createdAt: num(t.createdAt, Date.now())
      };
      if (!task.title) return null;
      return task;
    }).filter(Boolean) : [];

    const personalEvents = Array.isArray(src.personalEvents) ? src.personalEvents.slice(0, 200).map((e) => {
      if (!e || typeof e !== 'object') return null;
      const title = str(e.title, 120).trim();
      if (!title) return null;
      return {
        id: id(e.id) || generateId(),
        title,
        calendarType: ['jalali', 'gregorian', 'hijri'].includes(e.calendarType) ? e.calendarType : 'jalali',
        year: Math.max(1, Math.min(9999, Math.round(num(e.year, 1)))),
        month: Math.max(1, Math.min(12, Math.round(num(e.month, 1)))),
        day: Math.max(1, Math.min(31, Math.round(num(e.day, 1)))),
        annually: Boolean(e.annually),
        createdAt: num(e.createdAt, Date.now())
      };
    }).filter(Boolean) : [];

    const focusSessions = Array.isArray(src.focusSessions)
      ? [...new Set(src.focusSessions.map((v) => Number(v)).filter((v) => Number.isFinite(v) && v > 0))].slice(-1000)
      : [];

    const searchHistory = strList(src.searchHistory, 20, 200);

    let selectedDay = null;
    if (src.selectedDay && typeof src.selectedDay === 'object') {
      // Current shape stores GREGORIAN values in gy/gm/gd; very old data
      // stored JALALI values in year/month/day. Keep whichever exists as-is.
      const gy = Math.round(num(src.selectedDay.gy, 0));
      const gm = Math.round(num(src.selectedDay.gm, 0));
      const gd = Math.round(num(src.selectedDay.gd, 0));
      const legacyYear = Math.round(num(src.selectedDay.year, 0));
      const legacyMonth = Math.round(num(src.selectedDay.month, 0));
      const legacyDay = Math.round(num(src.selectedDay.day, 0));
      const so = typeof src.selectedDay.selectedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(src.selectedDay.selectedOn) ? src.selectedDay.selectedOn : null;
      if (gy >= 1 && gm >= 1 && gm <= 12 && gd >= 1 && gd <= 31) {
        selectedDay = so ? { gy, gm, gd, selectedOn: so } : { gy, gm, gd };
      } else if (legacyYear >= 1 && legacyMonth >= 1 && legacyMonth <= 12 && legacyDay >= 1 && legacyDay <= 31) {
        selectedDay = so ? { year: legacyYear, month: legacyMonth, day: legacyDay, selectedOn: so } : { year: legacyYear, month: legacyMonth, day: legacyDay };
      }
    }

    const activeFolderId = (() => {
      const raw = id(src.activeFolderId);
      if (raw && folders.some((f) => f.id === raw)) return raw;
      return 'default';
    })();

    // ── Settings ────────────────────────────────────────────────────────
    const s = src.settings && typeof src.settings === 'object' ? src.settings : {};
    const settings = structuredClone(DEFAULT_DATA.settings);

    const strSettings = (key, max) => { if (typeof s[key] === 'string') settings[key] = s[key].slice(0, max); };
    const boolSettings = (key) => { if (typeof s[key] === 'boolean') settings[key] = s[key]; };
    const enumSettings = (key, list) => { if (list.includes(s[key])) settings[key] = s[key]; };
    const rawNumSettings = (key, transform) => {
      const n = Number(s[key]);
      if (Number.isFinite(n)) settings[key] = transform(n);
    };

    // Legacy glassMode flag is kept so the legacy migration in mergeDefaults works.
    if (typeof s.glassMode === 'boolean') settings.glassMode = s.glassMode;
    strSettings('theme', 40);
    enumSettings('colorMode', ['light', 'dark', 'glass']);
    enumSettings('bgType', ['gradient', 'color', 'image']);
    strSettings('bgGradient', 40);
    rawNumSettings('bgBlur', (n) => clampNum(n, 0, 30, 0));
    rawNumSettings('bgOverlay', (n) => clampNum(n, 0, 100, 20));
    strSettings('bgColor', 40);
    if (!hexColor(settings.bgColor, '')) settings.bgColor = '#000000';
    boolSettings('showClock'); boolSettings('compactBookmarks'); boolSettings('notesBlurred');
    boolSettings('privacyMode'); boolSettings('floatingBookmarkButton');
    enumSettings('bookmarkSize', ['small', 'medium', 'large']);
    boolSettings('googleServicesVisible'); boolSettings('topSitesVisible');
    boolSettings('sitesVisible'); boolSettings('pricesVisible'); boolSettings('newsVisible');
    boolSettings('followChromeBookmarks'); boolSettings('chromeBookmarkSyncInitialized');
    boolSettings('welcomeShown'); boolSettings('onboardingComplete');
    enumSettings('font', ['system', 'vazir', 'lalezar', 'estedad', 'noto', 'naskh', 'amiri', 'scheherazade', 'markazi']);
    enumSettings('language', ['fa', 'en']);
    enumSettings('calendarType', ['jalali', 'gregorian', 'hijri']);
    strSettings('country', 100); strSettings('city', 120); strSettings('countryCode', 8);
    strSettings('timezone', 40);
    strSettings('secondCity', 120); strSettings('secondCountry', 100);
    strSettings('secondCountryCode', 8); strSettings('secondTimezone', 40);
    rawNumSettings('googleServicesVersion', (n) => Math.max(0, Math.round(n)));
    rawNumSettings('sitesVersion', (n) => Math.max(0, Math.round(n)));

    const latBound = (v) => {
      // Explicit absence is a real state — keep it null; only real numbers are validated.
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= -90 && n <= 90 ? n : null;
    };
    const lonBound = (v) => {
      if (v == null || v === '') return null;
      const n = Number(v);
      return Number.isFinite(n) && n >= -180 && n <= 180 ? n : null;
    };
    settings.locationLat = latBound(s.locationLat);
    settings.locationLon = lonBound(s.locationLon);
    settings.secondLocationLat = latBound(s.secondLocationLat);
    settings.secondLocationLon = lonBound(s.secondLocationLon);

    // bgImage: http(s) url, data:image/..., or a bundled local wallpaper asset.
    const rawBgImage = typeof s.bgImage === 'string' ? s.bgImage.trim().slice(0, 200000) : '';
    let bgImage = '';
    if (rawBgImage) {
      if (rawBgImage.startsWith('data:') && /^data:image\//i.test(rawBgImage)) {
        // Keep only sane-sized data URLs — anything bigger is dropped outright.
        if (rawBgImage.length <= 1500000) bgImage = rawBgImage;
      } else if (/^https?:\/\//i.test(rawBgImage)) {
        try { const u = new URL(rawBgImage); if (u.protocol === 'https:' || u.protocol === 'http:') bgImage = u.href; } catch { /* drop */ }
      } else if (/^assets\/wallpapers\/[A-Za-z0-9_.-]+$/i.test(rawBgImage)) {
        bgImage = rawBgImage;
      }
    }
    settings.bgImage = bgImage;
    if (settings.bgType === 'image' && !settings.bgImage) settings.bgType = 'gradient';

    // hiddenWidgets: only known widget/feed ids.
    const KNOWN_WIDGET_IDS = ['day-info-card', 'calendar-card', 'bookmarks-card', 'notes-card', 'tasks-card', 'sites-section', 'prices-section', 'news-section'];
    settings.hiddenWidgets = Array.isArray(s.hiddenWidgets) ? [...new Set(s.hiddenWidgets.filter((w) => KNOWN_WIDGET_IDS.includes(w)))] : [];

    const widgetOrder = Array.isArray(s.widgetOrder) ? [...new Set(s.widgetOrder.filter((w) => KNOWN_WIDGET_IDS.includes(w) && w !== 'sites-section' && w !== 'prices-section' && w !== 'news-section'))] : [];
    settings.widgetOrder = widgetOrder.length ? [...new Set([...widgetOrder, 'day-info-card', 'calendar-card', 'bookmarks-card', 'notes-card', 'tasks-card'])] : [...DEFAULT_DATA.settings.widgetOrder];
    const feedOrder = Array.isArray(s.feedOrder) ? [...new Set(s.feedOrder.filter((w) => ['sites-section', 'prices-section', 'news-section'].includes(w)))] : [];
    settings.feedOrder = feedOrder.length ? [...new Set([...feedOrder, 'sites-section', 'prices-section', 'news-section'])] : [...DEFAULT_DATA.settings.feedOrder];

    // Top-sites block list: keep only plausible domain/host keys, drop junk.
    settings.hiddenTopSites = Array.isArray(s.hiddenTopSites)
      ? [...new Set(s.hiddenTopSites
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim().toLowerCase())
        .filter((item) => /^[a-z0-9][a-z0-9.-]{0,99}$/i.test(item) && item.includes('.')))].slice(0, 100)
      : [];
    settings.enabledGoogleServices = Array.isArray(s.enabledGoogleServices)
      ? [...new Set(s.enabledGoogleServices.filter((id) => ['gmail', 'drive', 'meet', 'maps', 'youtube', 'translate', 'calendar', 'photos'].includes(id)))]
      : [...DEFAULT_DATA.settings.enabledGoogleServices];

    // Iranian sites: keep only entries that would survive iranian-sites' own
    // normalization (http(s) url, known cat, capped name).
    const SITE_CATS = ['video', 'taxi', 'shop', 'news', 'directions', 'famous'];
    if (Array.isArray(s.iranianSites)) {
      settings.iranianSites = s.iranianSites.slice(0, 100).map((site) => {
        if (!site || typeof site !== 'object') return null;
        const cat = SITE_CATS.includes(site.cat) ? site.cat : null;
        if (!cat) return null;
        const url = str(site.url, 2048).trim();
        let valid = false;
        try { const u = new URL(url); valid = (u.protocol === 'https:' || u.protocol === 'http:') && u.hostname.includes('.'); } catch { /* drop */ }
        if (!valid) return null;
        return {
          id: id(site.id) || 'site-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          name: str(site.name, 80).trim() || 'Site',
          url,
          cat
        };
      }).filter(Boolean);
    }

    settings.focusState = (s.focusState && typeof s.focusState === 'object') ? s.focusState : structuredClone(DEFAULT_DATA.settings.focusState);
    settings.focusDurations = (s.focusDurations && typeof s.focusDurations === 'object') ? s.focusDurations : structuredClone(DEFAULT_DATA.settings.focusDurations);

    return {
      bookmarks, folders, notes, trashedNotes, tasks, personalEvents, focusSessions,
      activeFolderId, selectedDay, searchHistory, settings
    };
  }

  function mergeDefaults(data) {
    const src = data && typeof data === 'object' ? data : {};
    const clean = sanitizeImportData(src);

    const def = clean.folders.find((f) => f.isDefault);
    if (def && (def.name === 'همه' || def.name === 'بدون دسته‌بندی')) def.name = 'صفحه اصلی';

    if (clean.settings.theme === 'glass') {
      clean.settings.theme = 'midnight';
      clean.settings.glassMode = true;
    }
    if (clean.settings.glassMode === true) {
      clean.settings.colorMode = 'glass';
    }
    if (!['light', 'dark', 'glass'].includes(clean.settings.colorMode)) {
      clean.settings.colorMode = 'dark';
    }
    delete clean.settings.glassMode;
    if (!['system', 'vazir', 'lalezar', 'estedad', 'noto', 'naskh', 'amiri', 'scheherazade', 'markazi'].includes(clean.settings.font)) clean.settings.font = 'vazir';

    if (!['focus', 'break'].includes(clean.settings.focusState?.phase)) {
      clean.settings.focusState = structuredClone(DEFAULT_DATA.settings.focusState);
    } else {
      clean.settings.focusState = { ...DEFAULT_DATA.settings.focusState, ...(clean.settings.focusState || {}) };
    }
    const savedFocusDurations = clean.settings.focusDurations || {};
    const normalizeFocusDuration = (value, fallback) => {
      const duration = Number(value);
      return Number.isSafeInteger(duration) && duration >= 60000 && duration <= MAX_FOCUS_DURATION_MS && duration % 60000 === 0
        ? duration
        : fallback;
    };
    clean.settings.focusDurations = {
      focusMs: normalizeFocusDuration(savedFocusDurations.focusMs, DEFAULT_DATA.settings.focusDurations.focusMs),
      breakMs: normalizeFocusDuration(savedFocusDurations.breakMs, DEFAULT_DATA.settings.focusDurations.breakMs)
    };

    // Add newly introduced Google services to existing profiles exactly once.
    // This keeps an explicit user choice (including disabling Meet later)
    // intact on all subsequent loads.
    const savedGoogleServices = src.settings && typeof src.settings === 'object' ? src.settings.enabledGoogleServices : undefined;
    const savedGoogleServicesVersion = src.settings && typeof src.settings === 'object' ? Number(src.settings.googleServicesVersion || 0) : 0;
    if (Array.isArray(savedGoogleServices) && savedGoogleServicesVersion < 2) {
      clean.settings.enabledGoogleServices = [...new Set([...savedGoogleServices.filter((id) => ['gmail', 'drive', 'meet', 'maps', 'youtube', 'translate', 'calendar', 'photos'].includes(id)), 'meet'])];
      clean.settings.googleServicesVersion = 2;
    }

    if (clean.settings.theme === 'light' || !validThemes().has(clean.settings.theme)) {
      clean.settings.theme = DEFAULT_DATA.settings.theme;
    }
    if (!validGradients().has(clean.settings.bgGradient)) {
      clean.settings.bgGradient = DEFAULT_DATA.settings.bgGradient || 'midnight';
    }
    if (clean.settings.bgImage && /4kwallpapers\.com/i.test(clean.settings.bgImage)) {
      clean.settings.bgImage = '';
      if (clean.settings.bgType === 'image') {
        clean.settings.bgType = 'gradient';
        clean.settings.bgGradient = clean.settings.bgGradient || 'midnight';
      }
    }
    // The AI Assistant was removed: drop its settings from the stored profile
    // so the stale secret never re-appears in an export or on import.
    delete clean.settings.assistantBaseUrl;
    delete clean.settings.assistantToken;
    delete clean.settings.assistantModel;

    return clean;
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
    // A Chrome import lands on the main page with the real folders on top.
    cache.activeFolderId = 'default';
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
