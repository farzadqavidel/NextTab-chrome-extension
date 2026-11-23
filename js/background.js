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
      console.error('NextTab: Chrome bookmark sync failed', error);
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
async function listChildNodes(parentId) {
  try {
    const nodes = await chromeBookmarksCall('getChildren', String(parentId));
    return Array.isArray(nodes) ? nodes : [];
  } catch {
    return [];
  }
}

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

  // Resolve the requested save destination ('default' = outside all folders).
  const requestedFolderId = message?.folderId == null || message?.folderId === '' ? 'default' : String(message.folderId);
  const customFolder = requestedFolderId === 'default'
    ? null
    : data.folders.find((folder) => String(folder.id) === requestedFolderId && !folder.isDefault);
  if (requestedFolderId !== 'default' && !customFolder) {
    return { ok: false, reason: 'folder-not-found' };
  }

  const matches = data.bookmarks.filter((item) => normalizeTabyarUrl(item.url) === normalizedUrl);
  let action;
  let title;
  let folderId = null;
  let folderName = '';
  let folderIsDefault = false;

  if (matches.length) {
    title = matches[0].title;
    const removedMatch = matches[0];
    const removedFolderId = String(removedMatch?.folderId || 'default');
    const removedFolder = data.folders.find(
      (folder) => String(folder.id) === removedFolderId || (removedFolderId === 'default' && folder.isDefault)
    );
    folderId = null;
    folderName = removedFolder?.name || '';
    folderIsDefault = removedFolderId === 'default' || Boolean(removedFolder?.isDefault);
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

      // Resolve the destination Chrome folder: root (Bookmarks bar) or a custom folder's chromeId.
      let destinationChromeParentId = String(bookmarksBar.id);
      let destinationName = String(bookmarksBar.title || 'Bookmarks bar');
      let destinationIsDefault = true;
      if (customFolder) {
        const folderChromeId = customFolder.chromeId == null ? null : String(customFolder.chromeId);
        if (!folderChromeId) return { ok: false, reason: 'chrome-folder' };
        destinationChromeParentId = folderChromeId;
        destinationName = customFolder.name || String(bookmarksBar.title || 'Folder');
        destinationIsDefault = false;
      }

      const parentChildren = await listChildNodes(destinationChromeParentId);
      const created = await chromeBookmarksCall('create', {
        parentId: destinationChromeParentId,
        index: parentChildren.length,
        title,
        url
      });
      folderId = `chrome-${destinationChromeParentId}`;
      folderName = destinationName;
      folderIsDefault = destinationIsDefault;
      await syncChromeBookmarks();
      // The created id is stable even if a concurrent Chrome event syncs first.
      if (!data.bookmarks.some((item) => String(item.chromeId) === String(created.id))) {
        data = await getPersonalStartPage();
      }
    } else {
      const targetFolderId = customFolder ? String(customFolder.id) : 'default';
      const targetBookmarks = data.bookmarks.filter((item) => (item.folderId || 'default') === targetFolderId);
      const nextOrder = targetBookmarks.reduce((max, item) => Math.max(max, Number(item.order) || 0), -1) + 1;
      const newBookmark = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 9),
        title,
        url,
        folderId: targetFolderId,
        order: nextOrder,
        createdAt: Date.now()
      };
      data.bookmarks.push(newBookmark);
      await savePersonalStartPage(data);
      broadcastBookmarksChanged('added');
      folderId = targetFolderId;
      if (targetFolderId === 'default') {
        const defaultFolder = data.folders.find((folder) => folder.id === 'default' || folder.isDefault);
        folderName = defaultFolder?.name || '';
        folderIsDefault = true;
      } else {
        folderName = customFolder?.name || '';
        folderIsDefault = false;
      }
    }
    action = 'added';
  }

  return {
    ok: true,
    action,
    saved: action === 'added',
    title,
    folderId: action === 'added' ? folderId : null,
    folderName: action === 'added' ? folderName : folderName,
    folderIsDefault: action === 'added' ? folderIsDefault : folderIsDefault,
    folderChromeMode: followsChrome
  };
}



// ── Wallpaper fetch guard ──────────────────────────────────────────────────
const WALLPAPER_MAX_BYTES = 8 * 1024 * 1024; // 8 MB — enough for a 1920x1080+ photo
const WALLPAPER_TIMEOUT_MS = 12000;

/**
 * Only http(s) URLs to public hosts may be fetched through the service worker.
 * Private/loopback/link-local addresses are refused outright (SSRF guard), and
 * the download is bounded by a size cap and a hard timeout.
 */
function isAllowedWallpaperUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || '').trim());
  } catch {
    return null;
  }
  // Strictly public https — no http (plaintext), no local addresses, no userinfo.
  if (url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!url.hostname) return null;
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1' || hostname === '0.0.0.0' || hostname === '::1') return null;
  if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|fe80:|fc|fd|::1$)/i.test(hostname)) return null;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    const parts = hostname.split('.').map((p) => Number(p));
    if (parts.every((p) => Number.isInteger(p) && p >= 0 && p <= 255)) {
      const [a, b] = parts;
      if (a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0) return null;
    }
  }
  return url;
}

async function fetchWallpaper(rawUrl) {
  const url = isAllowedWallpaperUrl(rawUrl);
  if (!url) throw new Error('URL not allowed');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WALLPAPER_TIMEOUT_MS);
  try {
    const response = await fetch(url.href, {
      referrer: '',
      credentials: 'omit',
      cache: 'default',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (!contentType.startsWith('image/')) throw new Error('Not an image');

    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength > WALLPAPER_MAX_BYTES) throw new Error('Image too large');

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 512) throw new Error('Empty image');
    if (buffer.byteLength > WALLPAPER_MAX_BYTES) throw new Error('Image too large');

    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode.apply(null, bytes.slice(i, i + 8192));
    }
    return { ok: true, base64: btoa(binary), mime: contentType };
  } finally {
    clearTimeout(timer);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message) return;

  if (message.type === 'FETCH_WALLPAPER') {
    fetchWallpaper(message.url)
      .then((response) => sendResponse(response))
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
        console.error('NextTab: floating bookmark action failed', error);
        sendResponse({ ok: false, reason: 'storage', error: error.message });
      });
    return true;
  }
});
