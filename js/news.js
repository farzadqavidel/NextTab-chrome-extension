/**
 * NewsUI — Persian news section below the dashboard.
 * Merges public RSS feeds (direct fetch; extension host_permissions bypass CORS)
 * with an rss2json fallback, groups them into categories and caches results.
 */
const NewsUI = (() => {
  const CACHE_KEY = 'tabyarNewsCacheV1';
  const TTL_MS = 10 * 60 * 1000;
  const MAX_PER_FEED = 25;

  const CATS = ['all', 'economy', 'tech', 'world', 'culture', 'lifestyle', 'sports'];

  const SOURCES = {
    zoomit: { fa: 'زومیت', en: 'Zoomit', domain: 'zoomit.ir' },
    digiato: { fa: 'دیجیاتو', en: 'Digiato', domain: 'digiato.com' },
    varzesh3: { fa: 'ورزش۳', en: 'Varzesh3', domain: 'varzesh3.com' },
    tejaratnews: { fa: 'تجارت‌نیوز', en: 'Tejarat News', domain: 'tejaratnews.com' },
    isna: { fa: 'ایسنا', en: 'ISNA', domain: 'isna.ir' },
    mehr: { fa: 'خبرگزاری مهر', en: 'Mehr News', domain: 'mehrnews.com' },
    bbc: { fa: 'بی‌بی‌سی فارسی', en: 'BBC Persian', domain: 'bbc.co.uk' },
    digikalamag: { fa: 'دیجی‌کالا مگ', en: 'Digikala Mag', domain: 'digikala.com' }
  };

  const FEEDS = [
    { cat: 'tech', source: 'zoomit', url: 'https://www.zoomit.ir/feed' },
    { cat: 'tech', source: 'digiato', url: 'https://digiato.com/feed' },
    { cat: 'sports', source: 'varzesh3', url: 'https://www.varzesh3.com/rss' },
    { cat: 'economy', source: 'tejaratnews', url: 'https://www.tejaratnews.com/rss' },
    { cat: 'economy', source: 'bbc', url: 'https://feeds.bbci.co.uk/persian/business/rss.xml' },
    { cat: 'world', source: 'bbc', url: 'https://feeds.bbci.co.uk/persian/rss.xml' },
    { cat: 'world', source: 'isna', url: 'https://www.isna.ir/rss' },
    { cat: 'world', source: 'mehr', url: 'https://www.mehrnews.com/rss' },
    { cat: 'culture', source: 'bbc', url: 'https://feeds.bbci.co.uk/persian/arts/rss.xml' },
    { cat: 'lifestyle', source: 'digikalamag', url: 'https://www.digikala.com/mag/feed/' }
  ];

  let items = [];
  let activeCat = 'all';
  let visible = 0;
  let loading = false;
  let loadedAt = 0;
  let timer = null;

  const gridEl = () => document.getElementById('news-grid');

  function lang() {
    return Feeds.settings().language || 'fa';
  }

  function sourceName(key) {
    const src = SOURCES[key] || { fa: key, en: key };
    return lang() === 'en' ? src.en : src.fa;
  }


  function rowSize() {
    const grid = gridEl();
    if (!grid) return 4;
    const cols = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
    return Math.max(1, cols);
  }

  function ensureVisible() {
    if (!visible) visible = rowSize();
  }

  function catLabel(cat) {
    const map = { all: 'catAll', economy: 'catEconomy', tech: 'catTech', world: 'catWorld', culture: 'catCulture', lifestyle: 'catLifestyle', sports: 'catSports' };
    return I18n.t(map[cat] || 'catAll');
  }

  /* ─────────────── parsing ─────────────── */

  function childText(node, name) {
    for (const child of node.children) {
      if (child.tagName.toLowerCase() === name) return child.textContent || '';
    }
    return '';
  }

  function pickImage(node, rawHtml) {
    const mediaContent = node.getElementsByTagName('media:content');
    for (const el of mediaContent) {
      const type = el.getAttribute('type') || '';
      const url = el.getAttribute('url');
      if (url && (!type || type.startsWith('image'))) return url;
    }
    const thumbs = node.getElementsByTagName('media:thumbnail');
    if (thumbs.length && thumbs[0].getAttribute('url')) return thumbs[0].getAttribute('url');
    const enclosures = node.getElementsByTagName('enclosure');
    for (const el of enclosures) {
      const type = el.getAttribute('type') || '';
      const url = el.getAttribute('url');
      if (url && type.startsWith('image')) return url;
    }
    const match = String(rawHtml || '').match(/<img[^>]+src=["']([^"']+)["']/i);
    return match ? match[1] : '';
  }

  function parseXml(text, cat, source) {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('bad xml');
    const nodes = doc.querySelectorAll('item').length
      ? doc.querySelectorAll('item')
      : doc.querySelectorAll('entry');
    const out = [];
    nodes.forEach((node) => {
      if (out.length >= MAX_PER_FEED) return;
      let link = childText(node, 'link').trim();
      if (!link) {
        const links = node.getElementsByTagName('link');
        for (const el of links) {
          const href = el.getAttribute('href');
          if (href) { link = href; break; }
        }
      }
      const title = Feeds.stripHtml(childText(node, 'title'));
      if (!title || !link) return;
      const rawDesc = childText(node, 'description') || childText(node, 'summary') || childText(node, 'content');
      const dateStr = childText(node, 'pubdate') || childText(node, 'date') || childText(node, 'updated') || childText(node, 'published');
      out.push({
        id: link,
        title,
        desc: Feeds.stripHtml(rawDesc).slice(0, 220),
        link,
        image: pickImage(node, rawDesc),
        date: dateStr ? new Date(dateStr).getTime() || 0 : 0,
        cat,
        source
      });
    });
    return out;
  }

  function parseRss2Json(json, cat, source) {
    const list = Array.isArray(json && json.items) ? json.items : [];
    return list.slice(0, MAX_PER_FEED).map((item) => ({
      id: item.link,
      title: Feeds.stripHtml(item.title || ''),
      desc: Feeds.stripHtml(item.description || '').slice(0, 220),
      link: item.link || '',
      image: item.thumbnail || (item.enclosure && item.enclosure[0] && item.enclosure[0].link) || '',
      date: item.pubDate ? new Date(item.pubDate).getTime() || 0 : 0,
      cat,
      source
    })).filter((item) => item.title && item.link);
  }

  async function fetchFeed(feed) {
    try {
      const res = await Feeds.fetchWithTimeout(feed.url, 8000);
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith('<')) {
          const parsed = parseXml(text, feed.cat, feed.source);
          if (parsed.length) return parsed;
        }
      }
    } catch (e) {
      // fall through to proxy
    }
    const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
    const res = await Feeds.fetchWithTimeout(proxy, 8000);
    if (!res.ok) throw new Error(`feed failed: ${feed.url}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(`feed failed: ${feed.url}`);
    return parseRss2Json(json, feed.cat, feed.source);
  }

  /* ─────────────── cache ─────────────── */

  function hasChromeStorage() {
    return typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local;
  }

  async function readCache() {
    if (!hasChromeStorage()) return null;
    try {
      const stored = await chrome.storage.local.get(CACHE_KEY);
      const entry = stored && stored[CACHE_KEY];
      if (entry && Array.isArray(entry.items)) return entry;
    } catch (e) { /* ignore */ }
    return null;
  }

  async function writeCache() {
    if (!hasChromeStorage()) return;
    try {
      await chrome.storage.local.set({ [CACHE_KEY]: { t: Date.now(), items } });
    } catch (e) { /* ignore */ }
  }

  /* ─────────────── render ─────────────── */

  function renderCats() {
    const wrap = document.getElementById('news-cats');
    if (!wrap) return;
    wrap.innerHTML = CATS.map((cat) => `
      <button type="button" class="news-cat-btn ${cat === activeCat ? 'active' : ''}" data-cat="${cat}" role="tab" aria-selected="${cat === activeCat}">${catLabel(cat)}</button>
    `).join('');
    wrap.querySelectorAll('.news-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.cat === activeCat) return;
        activeCat = btn.dataset.cat;
        visible = rowSize();
        renderCats();
        renderGrid();
      });
    });
  }

  function skeletonHtml() {
    return `
      <div class="news-item news-skeleton" aria-hidden="true">
        <div class="news-thumb sk"></div>
        <div class="news-copy">
          <div class="sk sk-line w80"></div>
          <div class="sk sk-line w100"></div>
          <div class="sk sk-line w60"></div>
        </div>
        <div class="news-meta"><div class="sk sk-line w40"></div></div>
      </div>`;
  }

  function safeCat(cat) {
    return CATS.includes(cat) ? cat : 'all';
  }

  function itemHtml(item) {
    const src = SOURCES[item.source] || { domain: '' };
    const favicon = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(src.domain)}&sz=64`;
    // Untrusted feed URLs — only http(s) survives, anything else is dropped.
    const safeLink = typeof TabyarUI !== 'undefined' ? TabyarUI.safeUrl(item.link) : null;
    const safeImage = typeof TabyarUI !== 'undefined' ? TabyarUI.safeUrl(item.image) : null;
    const thumb = safeImage
      ? `<img src="${Feeds.escapeHtml(safeImage)}" alt="" loading="lazy">`
      : '';
    const inner = `
      <div class="news-thumb" data-cat="${safeCat(item.cat)}">
        ${thumb}
        <span class="news-cat">${catLabel(safeCat(item.cat))}</span>
      </div>
      <div class="news-copy">
        <h4 class="news-item-title">${Feeds.escapeHtml(item.title)}</h4>
        ${item.desc ? `<p class="news-item-desc">${Feeds.escapeHtml(item.desc)}</p>` : ''}
      </div>
      <div class="news-meta">
        <img class="news-src-fav" src="${favicon}" alt="" loading="lazy">
        <span class="news-source">${Feeds.escapeHtml(sourceName(item.source))}</span>
        <span class="news-time">${Feeds.timeAgo(new Date(item.date))}</span>
      </div>`;
    if (safeLink) {
      return `<a class="news-item" href="${Feeds.escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }
    return `<div class="news-item news-item-static" role="article">${inner}</div>`;
  }

  function filtered() {
    const list = activeCat === 'all' ? items : items.filter((item) => item.cat === activeCat);
    return list;
  }

  function renderGrid() {
    const el = gridEl();
    if (!el) return;
    ensureVisible();
    if (loading && !items.length) {
      el.innerHTML = Array.from({ length: rowSize() }, skeletonHtml).join('');
    } else {
      const list = filtered();
      visible = Math.max(rowSize(), Math.min(visible, Math.max(list.length, rowSize())));
      el.innerHTML = list.slice(0, visible).map(itemHtml).join('');
      el.querySelectorAll('.news-thumb > img').forEach((img) => {
        img.addEventListener('error', () => img.remove(), { once: true });
      });
    }
    const list = filtered();
    const empty = document.getElementById('news-empty');
    if (empty) empty.classList.toggle('hidden', loading || list.length > 0);
    const error = document.getElementById('news-error');
    if (error) error.classList.toggle('hidden', loading || list.length > 0 || items.length > 0);
    const more = document.getElementById('btn-news-more');
    if (more) {
      if (list.length > visible) {
        more.classList.remove('hidden');
        more.textContent = I18n.t('newsMore');
      } else if (visible > rowSize()) {
        more.classList.remove('hidden');
        more.textContent = I18n.t('newsLess');
      } else {
        more.classList.add('hidden');
      }
    }
    const updated = document.getElementById('news-updated');
    if (updated) updated.textContent = loadedAt ? I18n.t('newsUpdated', { time: Feeds.clockNow() }) : '';
  }

  /* ─────────────── load ─────────────── */

  async function load(force = false) {
    if (loading) return;
    if (!force && items.length && Date.now() - loadedAt < TTL_MS) return;
    loading = true;
    const hadItems = items.length > 0;
    const btn = document.getElementById('btn-news-refresh');
    if (btn) btn.classList.add('is-loading');
    if (!hadItems) renderGrid(); // skeleton only on a cold start

    // Progressive: paint as soon as each feed arrives so one slow source
    // never holds the whole section hostage.
    const merged = [];
    const seen = new Set();
    const tasks = FEEDS.map((feed) => fetchFeed(feed).then((list) => {
      list.forEach((item) => {
        if (seen.has(item.id)) return;
        seen.add(item.id);
        merged.push(item);
      });
      merged.sort((a, b) => b.date - a.date);
      if (!hadItems) {
        items = merged.slice();
        renderGrid();
      }
    }).catch(() => {}));
    await Promise.allSettled(tasks);

    loading = false;
    if (btn) btn.classList.remove('is-loading');
    if (merged.length) {
      items = merged;
      loadedAt = Date.now();
      writeCache();
    }
    renderGrid();
  }

  async function init() {
    document.addEventListener('tabyar:language-changed', rerender);
    window.addEventListener('resize', onResize);
    lastRow = rowSize();
    const btn = document.getElementById('btn-news-refresh');
    if (btn) btn.addEventListener('click', () => load(true));
    const retry = document.getElementById('btn-news-retry');
    if (retry) retry.addEventListener('click', () => load(true));
    const more = document.getElementById('btn-news-more');
    if (more) more.addEventListener('click', () => {
      const list = filtered();
      if (visible > rowSize()) {
        visible = rowSize();
      } else {
        visible = Math.min(list.length, visible + rowSize());
      }
      renderGrid();
    });

    renderCats();
    renderGrid();

    const cached = await readCache();
    if (cached && Array.isArray(cached.items) && cached.items.length) {
      items = cached.items;
      loadedAt = cached.t || 0;
      renderGrid();
      if (Date.now() - (cached.t || 0) < TTL_MS) {
        schedule();
        return;
      }
    }

    load(true);
    schedule();
  }

  let lastRow = 0;
  function onResize() {
    const rs = rowSize();
    if (rs !== lastRow) {
      lastRow = rs;
      visible = rs;
      renderGrid();
    }
  }

  function schedule() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      const s = Feeds.settings();
      if (s.newsVisible === false) return;
      load(false);
    }, TTL_MS);
  }

  function rerender() {
    renderCats();
    renderGrid();
  }

  return { init, load, render: rerender };
})();
