const WallpaperLoader = (() => {
  const DB_NAME = 'tabyarWallpapers';
  const STORE = 'images';
  const urlCache = new Map();

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function readBlob(url) {
    return openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, 'readonly');
          const req = tx.objectStore(STORE).get(url);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        })
    );
  }

  function writeBlob(url, blob) {
    return openDb().then(
      (db) =>
        new Promise((resolve, reject) => {
          const tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(blob, url);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        })
    );
  }

  function isImageBlob(blob) {
    if (!blob || blob.size < 512) return false;
    if (blob.type.startsWith('image/')) return true;
    return (
      blob.type === '' ||
      blob.type === 'application/octet-stream' ||
      blob.type.includes('binary') ||
      blob.type.includes('octet')
    );
  }

  function base64ToBlob(base64, mime) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime || 'image/jpeg' });
  }

  function fetchViaBackground(url) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: 'FETCH_WALLPAPER', url }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!response?.ok) {
          reject(new Error(response?.error || 'Background fetch failed'));
          return;
        }
        resolve(base64ToBlob(response.base64, response.mime));
      });
    });
  }

  async function fetchRemote(url) {
    try {
      const response = await fetch(url, {
        credentials: 'omit',
        cache: 'default'
      });

      if (response.ok) {
        const blob = await response.blob();
        if (isImageBlob(blob)) return blob;
      }
    } catch (_) {
      /* fall through to background fetch */
    }

    const blob = await fetchViaBackground(url);
    if (!isImageBlob(blob)) {
      throw new Error('Not an image');
    }
    return blob;
  }

  async function resolve(url) {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }

    // Local extension assets (e.g. bundled wallpapers): no network, no cache.
    if (!/^https?:\/\//i.test(url)) {
      return url;
    }

    if (urlCache.has(url)) {
      return urlCache.get(url);
    }

    const cached = await readBlob(url);
    if (cached) {
      const objectUrl = URL.createObjectURL(cached);
      urlCache.set(url, objectUrl);
      return objectUrl;
    }

    const blob = await fetchRemote(url);
    await writeBlob(url, blob);
    const objectUrl = URL.createObjectURL(blob);
    urlCache.set(url, objectUrl);
    return objectUrl;
  }

  return { resolve };
})();
