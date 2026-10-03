// ── Shared Chrome API helpers ─────────────────────────────────────────────
function chromeBookmarksCall(method, ...args) {
  return new Promise((resolve, reject) => {
    if (!chrome.bookmarks?.[method]) {
      reject(new Error('Chrome bookmarks API is unavailable'));
      return;
    }
    try {
      chrome.bookmarks[method](...args, (result) => {
        const error = chrome.runtime.lastError;
        if (error) reject(new Error(error.message || String(error)));
        else resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  });
}

function getPersonalStartPage() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['personalStartPage'], (result) => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message || String(error)));
      else resolve(result.personalStartPage || {});
    });
  });
}

function savePersonalStartPage(data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ personalStartPage: data }, () => {
      const error = chrome.runtime.lastError;
      if (error) reject(new Error(error.message || String(error)));
      else resolve();
    });
  });
}

function broadcastBookmarksChanged(action = 'changed') {
  try {
    chrome.runtime.sendMessage({ type: 'TABYAR_BOOKMARKS_CHANGED', action }, () => {
      void chrome.runtime.lastError;
    });
  } catch { /* No dashboard tab is open. */ }
}

function normalizeTabyarUrl(value) {
  try {
    const parsed = new URL(value);
    parsed.hash = '';
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    return parsed.href.toLowerCase();
  } catch {
    return String(value || '').toLowerCase();
  }
}

function colorForChromeFolder(chromeId) {
  const palette = ['#6366f1', '#0ea5e9', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#8b5cf6'];
  const hash = String(chromeId).split('').reduce((value, char) => (value * 31 + char.charCodeAt(0)) >>> 0, 7);
  return palette[hash % palette.length];
}

function syncTreeToTabyar(tree, data) {
  const oldFolders = Array.isArray(data.folders) ? data.folders : [];
  const oldFoldersByChromeId = new Map(
    oldFolders.filter((folder) => folder.chromeId != null).map((folder) => [String(folder.chromeId), folder])
  );
  const defaultFolder = oldFolders.find((folder) => folder.isDefault || folder.id === 'default') || {
    id: 'default', name: 'صفحه اصلی', color: '#94a3b8', order: 0, isDefault: true
  };
  const folders = [{ ...defaultFolder, id: 'default', isDefault: true }];
  const bookmarks = [];
  const root = Array.isArray(tree) ? tree[0] : null;
  let fallbackOrder = 0;

  function visit(node, parentFolderId, isChromeRoot = false) {
    const order = Number.isInteger(node.index) ? node.index : fallbackOrder++;
    if (node.url) {
      bookmarks.push({
        id: `chrome-${node.id}`,
        chromeId: String(node.id),
        title: String(node.title || node.url),
        url: String(node.url),
        folderId: parentFolderId,
        order,
        createdAt: Number(node.dateAdded) || Date.now()
      });
      return;
    }

    const id = `chrome-${node.id}`;
    const oldFolder = oldFoldersByChromeId.get(String(node.id));
    const folder = {
      id,
      chromeId: String(node.id),
      name: String(node.title || ''),
      color: oldFolder?.color || colorForChromeFolder(node.id),
      parentId: parentFolderId,
      order,
      createdAt: Number(node.dateAdded) || oldFolder?.createdAt || Date.now(),
      isDefault: false,
      ...(isChromeRoot ? { isChromeRoot: true } : {})
    };
    folders.push(folder);
    (Array.isArray(node.children) ? node.children : []).forEach((child) => visit(child, id, false));
  }

  (Array.isArray(root?.children) ? root.children : []).forEach((child) => visit(child, 'default', true));

  data.bookmarks = bookmarks;
  data.folders = folders;
  if (!folders.some((folder) => folder.id === data.activeFolderId)) data.activeFolderId = 'default';
  data.settings = {
    ...(data.settings || {}),
    followChromeBookmarks: true,
    chromeBookmarkSyncInitialized: true
  };
  return data;
}

let chromeSyncInFlight = null;
let chromeSyncQueued = false;
async function syncChromeBookmarks({ force = false } = {}) {
  if (chromeSyncInFlight) {
    const pending = chromeSyncInFlight;
    chromeSyncQueued = true;
    const previousResult = await pending;
    if (!chromeSyncQueued) return previousResult;
    chromeSyncQueued = false;
    return syncChromeBookmarks({ force });
  }
  const currentSync = (async () => {
    const before = await getPersonalStartPage();
    if (!force && !before.settings?.followChromeBookmarks) {
      return { ok: false, error: 'sync-disabled' };
    }

    const tree = await chromeBookmarksCall('getTree');
    // Re-read after getTree so a concurrent settings change or regular-data
    // update is not overwritten by the bookmark mirror.
    const latest = await getPersonalStartPage();
    if (!force && !latest.settings?.followChromeBookmarks) {
      return { ok: false, error: 'sync-disabled' };
    }

    const mapped = syncTreeToTabyar(tree, latest);
    await savePersonalStartPage(mapped);
    broadcastBookmarksChanged('chrome-sync');
    return {
      ok: true,
      bookmarkCount: mapped.bookmarks.length,
      folderCount: Math.max(0, mapped.folders.length - 1)
    };
  })();
  chromeSyncInFlight = currentSync;

  try {
    return await currentSync;
  } finally {
    if (chromeSyncInFlight === currentSync) chromeSyncInFlight = null;
  }
}

let chromeSyncTimer = null;
function scheduleChromeBookmarkSync() {
  if (chromeSyncTimer) clearTimeout(chromeSyncTimer);
  chromeSyncTimer = setTimeout(() => {
    chromeSyncTimer = null;
    syncChromeBookmarks().catch((error) => {
      console.error('Tabyar: Chrome bookmark sync failed', error);
    });
  }, 120);
}

if (chrome.bookmarks?.onCreated) chrome.bookmarks.onCreated.addListener(scheduleChromeBookmarkSync);
if (chrome.bookmarks?.onRemoved) chrome.bookmarks.onRemoved.addListener(scheduleChromeBookmarkSync);
if (chrome.bookmarks?.onChanged) chrome.bookmarks.onChanged.addListener(scheduleChromeBookmarkSync);
if (chrome.bookmarks?.onMoved) chrome.bookmarks.onMoved.addListener(scheduleChromeBookmarkSync);
if (chrome.bookmarks?.onChildrenReordered) chrome.bookmarks.onChildrenReordered.addListener(scheduleChromeBookmarkSync);
if (chrome.bookmarks?.onImportEnded) chrome.bookmarks.onImportEnded.addListener(scheduleChromeBookmarkSync);

// ── Floating bookmark button and extension messages ────────────────────────
async function saveCurrentPageBookmark(message, sender) {
  let pageUrl;
  try { pageUrl = new URL(sender.url || ''); } catch { pageUrl = null; }
  if (!pageUrl || !['http:', 'https:', 'file:'].includes(pageUrl.protocol)) {
    return { ok: false, reason: 'unsupported' };
  }

  // Use the browser-provided sender URL rather than trusting page-supplied data.
  const url = pageUrl.href;
  const normalizedUrl = normalizeTabyarUrl(url);
  let data = await getPersonalStartPage();
  data.bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
  data.folders = Array.isArray(data.folders) ? data.folders : [];
  if (!data.folders.some((folder) => folder.id === 'default' || folder.isDefault)) {
    data.folders.unshift({ id: 'default', name: 'صفحه اصلی', color: '#94a3b8', order: 0, isDefault: true });
  }

  const followsChrome = Boolean(data.settings?.followChromeBookmarks);
  if (followsChrome) {
    await syncChromeBookmarks();
    data = await getPersonalStartPage();
    data.bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
    data.folders = Array.isArray(data.folders) ? data.folders : [];
  }

  const matches = data.bookmarks.filter((item) => normalizeTabyarUrl(item.url) === normalizedUrl);
  let action;
  let title;
  let folderId = null;
  let folderName = '';
  let folderIsDefault = false;

  if (matches.length) {
    title = matches[0].title;
    if (followsChrome) {
      const chromeIds = [...new Set(matches.map((item) => item.chromeId).filter((id) => id != null).map(String))];
      if (!chromeIds.length) return { ok: false, reason: 'sync-state' };
      await Promise.all(chromeIds.map((id) => chromeBookmarksCall('remove', id)));
      await syncChromeBookmarks();
    } else {
      data.bookmarks = data.bookmarks.filter((item) => normalizeTabyarUrl(item.url) !== normalizedUrl);
      await savePersonalStartPage(data);
      broadcastBookmarksChanged('removed');
    }
    action = 'removed';
  } else {
    const fallbackTitle = pageUrl.hostname || pageUrl.pathname.split('/').filter(Boolean).pop() || 'Local file';
    title = String(message.title || fallbackTitle).replace(/[\u0000-\u001f]/g, '').trim().slice(0, 180) || fallbackTitle;

    if (followsChrome) {
      const tree = await chromeBookmarksCall('getTree');
      const rootChildren = Array.isArray(tree?.[0]?.children) ? tree[0].children : [];
      const bookmarksBar = rootChildren.find((node) => String(node.id) === '1') || rootChildren[0];
      if (!bookmarksBar) return { ok: false, reason: 'chrome-folder' };
      const children = Array.isArray(bookmarksBar.children) ? bookmarksBar.children : [];
      const created = await chromeBookmarksCall('create', {
        parentId: String(bookmarksBar.id),
        index: children.length,
        title,
        url
      });
      folderId = `chrome-${bookmarksBar.id}`;
      const destination = data.folders.find((folder) => String(folder.chromeId) === String(bookmarksBar.id));
      folderName = destination?.name || String(bookmarksBar.title || 'Bookmarks bar');
      await syncChromeBookmarks();
      // The created id is stable even if a concurrent Chrome event syncs first.
      if (!data.bookmarks.some((item) => String(item.chromeId) === String(created.id))) {
        data = await getPersonalStartPage();
      }
    } else {
      const rootBookmarks = data.bookmarks.filter((item) => (item.folderId || 'default') === 'default');
      const nextOrder = rootBookmarks.reduce((max, item) => Math.max(max, Number(item.order) || 0), -1) + 1;
      const newBookmark = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
        title,
        url,
        folderId: 'default',
        order: nextOrder,
        createdAt: Date.now()
      };
      data.bookmarks.push(newBookmark);
      await savePersonalStartPage(data);
      broadcastBookmarksChanged('added');
      folderId = 'default';
      const defaultFolder = data.folders.find((folder) => folder.id === 'default' || folder.isDefault);
      folderName = defaultFolder?.name || '';
      folderIsDefault = true;
    }
    action = 'added';
  }

  return {
    ok: true,
    action,
    saved: action === 'added',
    title,
    folderId: action === 'added' ? folderId : null,
    folderName: action === 'added' ? folderName : '',
    folderIsDefault: action === 'added' ? folderIsDefault : false
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return;

  if (message.type === 'FETCH_WALLPAPER') {
    fetch(message.url, {
      referrer: 'https://4kwallpapers.com/',
      credentials: 'omit',
      cache: 'default'
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength < 512) throw new Error('Empty image');
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
        sendResponse({
          ok: true,
          base64: btoa(binary),
          mime: response.headers.get('content-type') || 'image/jpeg'
        });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'TABYAR_ENABLE_CHROME_BOOKMARK_SYNC') {
    if (message.confirmed !== true) {
      sendResponse({ ok: false, error: 'confirmation-required' });
      return;
    }
    syncChromeBookmarks({ force: true })
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'TABYAR_SYNC_CHROME_BOOKMARKS_NOW') {
    syncChromeBookmarks()
      .then(sendResponse)
      .catch((error) => sendResponse({ ok: false, error: error.message }));
    return true;
  }

  if (message.type === 'TABYAR_SAVE_PAGE') {
    saveCurrentPageBookmark(message, sender)
      .then(sendResponse)
      .catch((error) => {
        console.error('Tabyar: floating bookmark action failed', error);
        sendResponse({ ok: false, reason: 'storage', error: error.message });
      });
    return true;
  }
});
