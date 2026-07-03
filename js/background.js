chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== 'FETCH_WALLPAPER') return;

  fetch(msg.url, {
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
      for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
      }
      sendResponse({
        ok: true,
        base64: btoa(binary),
        mime: response.headers.get('content-type') || 'image/jpeg'
      });
    })
    .catch((err) => sendResponse({ ok: false, error: err.message }));

  return true;
});
