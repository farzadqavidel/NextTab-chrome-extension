/**
 * NextTab favicon helper.
 *
 * Why this exists:
 * Google's s2 favicon endpoint answers with HTTP 404 for domains that have no
 * icon, but the *body* is still a valid 16x16 PNG (a generic grey globe).
 * An <img> therefore loads it successfully and the `error` handler never runs,
 * which is why every icon-less site used to show the same default globe.
 *
 * We detect that placeholder by its size (real icons are requested at 64px and
 * come back 32px or larger) and swap in a generated monogram instead.
 */
const Favicon = (() => {
  // Palette used for generated monograms. Picked for good contrast on dark
  // backgrounds while still being distinguishable from each other.
  const COLORS = [
    '#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee',
    '#60a5fa', '#818cf8', '#a78bfa', '#e879f9', '#f472b6', '#2dd4bf'
  ];

  // Anything this size or smaller from the s2 endpoint is the fallback globe.
  const PLACEHOLDER_MAX_PX = 16;

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  /** Local files have no remote favicon to fetch, so they get their own glyph. */
  function isFileUrl(url) {
    return /^file:\/\//i.test((url || '').trim());
  }

  /** Last path segment of a file URL, e.g. "calendar_simple.html". */
  function fileName(url) {
    try {
      const path = decodeURIComponent(new URL(url).pathname);
      return path.split('/').filter(Boolean).pop() || '';
    } catch {
      return '';
    }
  }

  /** Document glyph used for file:// bookmarks. Transparent background. */
  function fileSvg(url) {
    const color = pickColor(fileName(url) || 'file');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="64" height="64"
      fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/>
      <line x1="8" y1="17" x2="13" y2="17"/>
    </svg>`;
  }

  function fileDataUri(url) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(fileSvg(url));
  }

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h << 5) - h + str.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function pickColor(seed) {
    return COLORS[hash(seed || 'x') % COLORS.length];
  }

  /**
   * Choose the character shown in the monogram: prefer the first meaningful
   * letter of the user's own title, fall back to the domain.
   */
  function currentLang() {
    try {
      return I18n.getLang() === 'en' ? 'en' : 'fa';
    } catch {
      return 'fa';
    }
  }

  function isLatin(ch) {
    return /[A-Za-z0-9]/.test(ch);
  }

  function firstLetterOf(text) {
    const match = (text || '').match(/[\p{L}\p{N}]/u);
    return match ? match[0] : '';
  }

  /** First Latin/digit character in a string, if any. */
  function firstLatinOf(text) {
    const match = (text || '').match(/[A-Za-z0-9]/);
    return match ? match[0] : '';
  }

  /**
   * Pick the monogram character.
   *
   * In English mode we prefer a Latin glyph so the icons stay visually
   * consistent with the rest of the UI: try the title, then the domain
   * (which is virtually always ASCII), before falling back to the raw
   * first character.
   */
  function pickLetter(title, url) {
    const cleanTitle = (title || '').trim();
    const domain = getDomain(url);

    if (currentLang() === 'en') {
      const latin = firstLatinOf(cleanTitle) || firstLatinOf(domain);
      if (latin) return latin.toUpperCase();
    }

    const letter = firstLetterOf(cleanTitle) || firstLetterOf(domain);
    return letter ? letter.toUpperCase() : '?';
  }

  /**
   * Transparent-background monogram. No plate/circle behind the glyph so it
   * sits on the tile exactly like a real transparent favicon does.
   */
  function monogramSvg(title, url) {
    const letter = pickLetter(title, url);
    const color = pickColor(getDomain(url) || title || '');
    const safe = letter.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
      <text x="32" y="34" text-anchor="middle" dominant-baseline="central"
            font-family="Vazirmatn, Segoe UI, system-ui, sans-serif"
            font-size="42" font-weight="700" fill="${color}">${safe}</text>
    </svg>`;
  }

  function monogramDataUri(title, url) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(monogramSvg(title, url));
  }

  function sourceUrl(url) {
    if (isFileUrl(url)) return fileDataUri(url);
    const domain = getDomain(url);
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
  }

  function applyMonogram(img) {
    if (img.dataset.monogramApplied === 'true') return;
    img.dataset.monogramApplied = 'true';
    img.src = monogramDataUri(img.dataset.faviconTitle || '', img.dataset.faviconUrl || '');
    img.classList.add('is-monogram');
  }

  /** True when the loaded bitmap is Google's generic placeholder. */
  function isPlaceholder(img) {
    return img.naturalWidth > 0 && img.naturalWidth <= PLACEHOLDER_MAX_PX;
  }

  function check(img) {
    if (img.dataset.monogramApplied === 'true') return;
    // The inline file glyph is intentional, never replace it.
    if (isFileUrl(img.dataset.faviconUrl)) return;
    if (isPlaceholder(img)) applyMonogram(img);
  }

  /**
   * Wire up an <img> so it degrades to a monogram both when the request fails
   * outright and when it "succeeds" with the placeholder globe.
   */
  function bind(img) {
    if (!img || img.dataset.faviconBound === 'true') return;
    img.dataset.faviconBound = 'true';

    img.addEventListener('error', () => applyMonogram(img));
    img.addEventListener('load', () => check(img));

    // Cached images can finish loading before listeners attach.
    if (img.complete) {
      if (img.naturalWidth === 0) applyMonogram(img);
      else check(img);
    }
  }

  function bindAll(root, selector) {
    (root || document).querySelectorAll(selector || 'img[data-favicon-url]').forEach(bind);
  }

  /** Markup for a favicon <img> that knows how to fall back to a monogram. */
  function imgHtml(url, title, attrs) {
    const src = sourceUrl(url);
    const escape = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const fallbackSrc = src || monogramDataUri(title, url);
    const flat = (src === '' || isFileUrl(url)) ? ' class="is-monogram"' : '';
    return `<img src="${escape(fallbackSrc)}" alt="" loading="lazy"${flat} ${attrs || ''}
      data-favicon-url="${escape(url)}" data-favicon-title="${escape(title)}">`;
  }

  /**
   * Icon chain for "popular sites" tiles: tries the site's best-known favicon
   * endpoint first (Google's 128px s2 service), then the site's own
   * /favicon.ico, and only then falls back to a generated monogram.
   * Placeholders returned by Google's service are treated as misses so the
   * chain keeps moving instead of locking in the generic grey globe.
   */
  function candidateUrls(url) {
    const domain = getDomain(url);
    if (!domain) return [];
    return [
      'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=128',
      'https://' + domain + '/favicon.ico'
    ];
  }

  function siteIconHtml(url, title, attrs) {
    const candidates = candidateUrls(url);
    const escape = (s) => String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    if (!candidates.length) {
      return `<img src="${escape(monogramDataUri(title, url))}" alt="" loading="lazy" class="is-monogram" ${attrs || ''} data-favicon-url="${escape(url)}" data-favicon-title="${escape(title)}">`;
    }
    return `<img src="${escape(candidates[0])}" alt="" loading="lazy"${attrs ? ' ' + attrs : ''} data-favicon-url="${escape(url)}" data-favicon-title="${escape(title)}" data-favicon-chain="1">`;
  }

  function bindChain(img) {
    if (!img || img.dataset.faviconBound === 'true') return;
    img.dataset.faviconBound = 'true';
    const candidates = candidateUrls(img.dataset.faviconUrl || '');
    if (!candidates.length) { applyMonogram(img); return; }

    let idx = 0;
    let done = false;
    const finish = () => { if (!done) { done = true; applyMonogram(img); } };
    const advance = () => {
      if (done) return;
      idx += 1;
      if (idx >= candidates.length) { finish(); return; }
      img.src = candidates[idx];
    };

    // Ignore the placeholder check when we already gave up (monogram set).
    const isGoogleChain = () => img.src.indexOf('s2/favicons') !== -1;

    img.addEventListener('error', () => advance());
    img.addEventListener('load', () => {
      if (done) return;
      if (isGoogleChain() && isPlaceholder(img)) advance();
      else done = true;
    });

    // Cached images can finish loading before listeners attach.
    if (img.complete) {
      if (img.naturalWidth === 0) advance();
      else if (isGoogleChain() && isPlaceholder(img)) advance();
      else done = true;
    }
  }

  return { bind, bindAll, bindChain, imgHtml, siteIconHtml, monogramDataUri, sourceUrl, candidateUrls, getDomain, isFileUrl, fileName };
})();
