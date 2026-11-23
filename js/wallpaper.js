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

  const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12 MB — wallpapers are photos

  function looksLikeImageBytes(h) {
    if (h.length < 12) return false;
    // PNG
    if (h[0] === 0x89 && h[1] === 0x50 && h[2] === 0x4e && h[3] === 0x47) return true;
    // JPEG
    if (h[0] === 0xff && h[1] === 0xd8 && h[2] === 0xff) return true;
    // GIF
    if (h[0] === 0x47 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x38) return true;
    // BMP
    if (h[0] === 0x42 && h[1] === 0x4d) return true;
    // WebP: RIFF....WEBP
    if (h[0] === 0x52 && h[1] === 0x49 && h[2] === 0x46 && h[3] === 0x46 &&
        h[8] === 0x57 && h[9] === 0x45 && h[10] === 0x42 && h[11] === 0x50) return true;
    // SVG: starts with optional BOM + <?xml … <svg
    const text = new TextDecoder('utf-8').decode(h.slice(0, 48));
    if (/^\uFEFF?\s*(<\?xml[^?>]*\?>\s*)?<svg/i.test(text)) return true;
    return false;
  }

  async function isImageBlob(blob) {
    if (!blob || blob.size < 512) return false;
    if (blob.size > MAX_IMAGE_BYTES) return false;
    if ((blob.type || '').startsWith('image/')) return true;
    // Unknown content type — sniff the first bytes instead of trusting the type.
    const header = new Uint8Array(await blob.slice(0, 48).arrayBuffer());
    return looksLikeImageBytes(header);
  }

  async function readCappedBlob(response) {
    if (!response.body) return response.blob();
    const reader = response.body.getReader();
    const chunks = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_IMAGE_BYTES) {
        await reader.cancel().catch(() => {});
        throw new Error('Image too large');
      }
      chunks.push(value);
    }
    return new Blob(chunks, { type: response.headers.get('content-type') || '' });
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

  /** Only public https pages may be fetched — identical SSRF rules as the
      background fallback, so the page-side path admits no more than it does. */
  function isAllowedUrl(rawUrl) {
    let parsed;
    try { parsed = new URL(String(rawUrl || '').trim()); } catch { return null; }
    if (parsed.protocol !== 'https:') return null;
    if (parsed.username || parsed.password) return null;
    const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') ||
        hostname === '::1' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return null;
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|169\.254\.|fe80:|fc|fd|::1$)/i.test(hostname)) return null;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      const parts = hostname.split('.').map((p) => Number(p));
      if (parts.every((p) => Number.isInteger(p) && p >= 0 && p <= 255)) {
        const [a, b] = parts;
        if (a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a === 0) return null;
      }
    }
    return parsed;
  }

  async function fetchRemote(url) {
    const guarded = isAllowedUrl(url);
    if (!guarded) {
      // Non-public/http URLs are never fetched by the page either.
      const blob = await fetchViaBackground(url);
      if (!(await isImageBlob(blob))) {
        throw new Error('Not an image');
      }
      return blob;
    }
    try {
      const response = await fetch(guarded.href, {
        credentials: 'omit',
        cache: 'default'
      });

      if (response.ok) {
        const blob = await readCappedBlob(response);
        if (await isImageBlob(blob)) return blob;
      }
    } catch (_) {
      /* fall through to background fetch */
    }

    const blob = await fetchViaBackground(url);
    if (!(await isImageBlob(blob))) {
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
