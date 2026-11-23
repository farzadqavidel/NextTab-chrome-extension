/**
 * IranianSitesUI — "Popular Iranian sites" section.
 * Surfaces one-tap access to the sites Iranians use most — video, taxi &
 * transport, shopping, news & media, navigation and famous sites — grouped in
 * category pills above the news section. Fully editable: users can add and
 * remove their own sites and the list persists in settings.iranianSites.
 */
const IranianSitesUI = (() => {
  const CAT_ORDER = ['all', 'video', 'taxi', 'shop', 'news', 'directions', 'famous'];
  const SITE_CATS = ['video', 'taxi', 'shop', 'news', 'directions', 'famous'];
  const MIGRATION_VERSION = 4;

  const CAT_LABEL_KEYS = {
    all: 'sitesCatAll',
    video: 'sitesCatVideo',
    taxi: 'sitesCatTaxi',
    shop: 'sitesCatShop',
    news: 'sitesCatNews',
    directions: 'sitesCatDirections',
    famous: 'sitesCatFamous'
  };

  const DEFAULT_SITES = [
    { id: 'aparat', name: 'آپارات', url: 'https://aparat.com', cat: 'video' },
    { id: 'filimo', name: 'فیلیمو', url: 'https://filimo.com', cat: 'video' },
    { id: 'namava', name: 'نماوا', url: 'https://namava.ir', cat: 'video' },
    { id: 'telewebion', name: 'تلویزیون (IRIB)', url: 'https://telewebion.com', cat: 'video' },
    { id: 'snapp', name: 'اسنپ', url: 'https://snapp.ir', cat: 'taxi' },
    { id: 'tap30', name: 'تپ‌تیس', url: 'https://tap30.ir', cat: 'taxi' },
    { id: 'carpino', name: 'کارپینو', url: 'https://carpino.ir', cat: 'taxi' },
    { id: 'digikala', name: 'دیجی‌کالا', url: 'https://digikala.com', cat: 'shop' },
    { id: 'basalam', name: 'باسلام', url: 'https://basalam.ir', cat: 'shop' },
    { id: 'irna', name: 'ایرنا', url: 'https://www.irna.ir', cat: 'news' },
    { id: 'isna', name: 'ایسنا', url: 'https://isna.ir', cat: 'news' },
    { id: 'mehr', name: 'خبرگزاری مهر', url: 'https://mehrnews.com', cat: 'news' },
    { id: 'fars', name: 'فارس', url: 'https://farsnews.ir', cat: 'news' },
    { id: 'neshan', name: 'نشان', url: 'https://neshan.org', cat: 'directions' },
    { id: 'balad', name: 'بلد', url: 'https://balad.ir', cat: 'directions' },
    { id: 'google-maps', name: 'گوگل مپ', url: 'https://maps.google.com', cat: 'directions' },
    { id: 'google', name: 'گوگل', url: 'https://google.com', cat: 'famous' },
    { id: 'youtube', name: 'یوتیوب', url: 'https://youtube.com', cat: 'famous' },
    { id: 'wikipedia', name: 'ویکی‌پدیا', url: 'https://wikipedia.org', cat: 'famous' },
    { id: 'divar', name: 'دیوار', url: 'https://divar.ir', cat: 'famous' },
    { id: 'torob', name: 'ترب', url: 'https://torob.com', cat: 'famous' }
  ];

  let activeCat = 'all';
  let formOpen = false;

  // Inline, stroke-based category icons (24px grid, currentColor).
  const CAT_ICONS = {
    all: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8.5 15 12 10 15.5 10 8.5" fill="currentColor" stroke="none"/></svg>',
    taxi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H8c-.6 0-1.2.3-1.5.8L5 11H3c-.6 0-1 .4-1 1v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>',
    shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    news: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="15" rx="2"/><path d="M7 9.5h10"/><path d="M7 13.5h10"/><path d="M7 17h5"/></svg>',
    directions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 19 21l-7-4-7 4z"/><path d="M12 18v-6"/></svg>',
    famous: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };

  function settings() {
    return typeof Storage !== 'undefined' ? Storage.getSettings() : {};
  }

  function getStored() {
    const value = settings().iranianSites;
    return Array.isArray(value) ? value : null;
  }

  function normalize(list) {
    const seen = new Set();
    return list.filter((item) => item && SITE_CATS.includes(item.cat) && item.url).map((item) => {
      let id = typeof item.id === 'string' && item.id ? item.id : '';
      if (!id || seen.has(id)) id = 'site-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      seen.add(id);
      return {
        id,
        name: String(item.name || '').trim() || Favicon.getDomain(item.url) || 'Site',
        url: String(item.url).trim(),
        cat: item.cat
      };
    });
  }

  function getList() {
    const stored = getStored();
    if (stored) return normalize(stored);
    return structuredClone(DEFAULT_SITES);
  }

  /**
   * One-shot migration for profiles that already stored a list: append any
   * new defaults whose ids are missing (never resurrects user-deleted sites).
   */
  async function migrateNewDefaults() {
    const stored = getStored();
    if (!stored) return false;
    if (Number(settings().sitesVersion || 0) >= MIGRATION_VERSION) return false;
    let changed = false;
    for (const site of DEFAULT_SITES) {
      const idx = stored.findIndex((x) => x && x.id === site.id);
      if (idx === -1) { stored.push(structuredClone(site)); changed = true; continue; }
      const cur = stored[idx];
      if (cur.name !== site.name || cur.url !== site.url || cur.cat !== site.cat) {
        stored[idx] = { ...cur, name: site.name, url: site.url, cat: site.cat };
        changed = true;
      }
    }
    if (changed) await saveList(stored);
    await Storage.updateSettings({ sitesVersion: MIGRATION_VERSION });
    return changed;
  }

  async function saveList(list) {
    await Storage.updateSettings({ iranianSites: normalize(list) });
  }

  function catLabel(cat) {
    return I18n.t(CAT_LABEL_KEYS[cat] || 'sitesCatAll');
  }

  function gridEl() { return document.getElementById('sites-grid'); }
  function catsEl() { return document.getElementById('sites-cats'); }

  function normalizeUrl(raw) {
    let u = String(raw || '').trim();
    if (!u) return '';
    if (/^(https?:|ftp:|file:)\//i.test(u)) return u;
    return 'https://' + u;
  }

  function isValidUrl(u) {
    try {
      const parsed = new URL(u);
      return /^https?:$/i.test(parsed.protocol) && parsed.hostname.includes('.');
    } catch {
      return false;
    }
  }

  function isVisible() {
    return settings().sitesVisible !== false;
  }

  /* ─────────────── render ─────────────── */

  function renderCats() {
    const wrap = catsEl();
    if (!wrap) return;
    wrap.innerHTML = CAT_ORDER.map((cat) => `
      <button type="button" class="sites-cat-btn ${cat === activeCat ? 'active' : ''}" data-cat="${cat}" role="tab" aria-selected="${cat === activeCat}">
        <span class="sites-cat-icon" aria-hidden="true">${CAT_ICONS[cat] || ''}</span>
        <span>${catLabel(cat)}</span>
      </button>
    `).join('');
    wrap.querySelectorAll('.sites-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCat = btn.dataset.cat;
        renderCats();
        renderGrid();
      });
    });
  }

  function filtered(list) {
    return activeCat === 'all' ? list : list.filter((item) => item.cat === activeCat);
  }

  function renderCount() {
    const pill = document.getElementById('sites-count');
    if (!pill) return;
    const list = getList();
    pill.textContent = I18n.t('sitesCountText', { n: Feeds.digits(list.length) });
  }

  function siteTileHtml(item) {
    const icon = Favicon.siteIconHtml(item.url, item.name, 'class="site-tile-favicon"');
    const domain = Favicon.getDomain(item.url);
    return `
      <div class="site-tile" data-id="${escapeHtml(item.id)}" data-cat="${escapeHtml(item.cat)}">
        <a class="site-tile-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(item.name)}" aria-label="${escapeHtml(item.name)}">
          <span class="site-tile-icon">${icon}</span>
          <span class="site-tile-body">
            <span class="site-tile-name">${escapeHtml(item.name)}</span>
            <span class="site-tile-domain">${escapeHtml(domain)}</span>
          </span>
        </a>
        <button type="button" class="site-tile-remove" data-remove-id="${escapeHtml(item.id)}" title="${I18n.t('sitesRemove')}" aria-label="${I18n.t('sitesRemove')} ${escapeHtml(item.name)}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>`;
  }

  function renderGrid() {
    const grid = gridEl();
    if (!grid) return;
    const list = filtered(getList());
    grid.innerHTML = list.map(siteTileHtml).join('');
    grid.querySelectorAll('img').forEach((img) => Favicon.bindChain(img));
    grid.querySelectorAll('[data-remove-id]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        removeSite(btn.dataset.removeId);
      });
    });

    const empty = document.getElementById('sites-empty');
    if (empty) empty.classList.toggle('hidden', list.length > 0);
    renderCount();
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ─────────────── add / remove / reset ─────────────── */

  async function removeSite(id) {
    if (!id) return;
    const list = getList().filter((item) => item.id !== id);
    await saveList(list);
    renderCats();
    renderGrid();
    TabyarUI.alert(I18n.t('sitesRemoved'), { type: 'success' });
  }

  async function addSite(name, url, cat) {
    const trimmedName = String(name || '').trim();
    const trimmedUrl = normalizeUrl(url);
    if (!trimmedName) {
      TabyarUI.alert(I18n.t('sitesAddError'), { type: 'warning' });
      return false;
    }
    if (!isValidUrl(trimmedUrl)) {
      TabyarUI.alert(I18n.t('sitesAddError'), { type: 'error' });
      return false;
    }
    if (!SITE_CATS.includes(cat)) cat = 'famous';
    const list = getList();
    list.push({
      id: 'site-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      name: trimmedName,
      url: trimmedUrl,
      cat
    });
    await saveList(list);
    activeCat = 'all';
    renderCats();
    renderGrid();
    TabyarUI.alert(I18n.t('sitesAdded'), { type: 'success' });
    return true;
  }

  async function resetToDefaults() {
    if (!(await TabyarUI.confirm(I18n.t('sitesResetConfirm'), { danger: true }))) return;
    await saveList(structuredClone(DEFAULT_SITES));
    activeCat = 'all';
    renderCats();
    renderGrid();
    TabyarUI.alert(I18n.t('sitesResetDone'), { type: 'success' });
  }

  /* ─────────────── add form ─────────────── */

  function renderSelectOptions() {
    const select = document.getElementById('sites-add-cat');
    if (!select) return;
    const current = select.value;
    select.innerHTML = SITE_CATS.map((cat) => `<option value="${cat}">${catLabel(cat)}</option>`).join('');
    if (current && SITE_CATS.includes(current)) select.value = current;
  }

  function setFormOpen(open) {
    formOpen = open;
    const overlay = document.getElementById('modal-sites-add');
    const btn = document.getElementById('btn-sites-add');
    if (overlay) overlay.classList.toggle('hidden', !open);
    if (btn) btn.setAttribute('aria-expanded', String(open));
    if (open) {
      renderSelectOptions();
      const nameInput = document.getElementById('sites-add-name');
      if (nameInput) nameInput.focus();
    }
  }

  /* Live favicon preview for the URL being typed */
  let previewTimer = null;
  function updatePreview() {
    const urlInput = document.getElementById('sites-add-url');
    const wrap = document.getElementById('sites-add-preview');
    const img = document.getElementById('sites-add-preview-img');
    const letter = document.getElementById('sites-add-preview-letter');
    if (!urlInput || !wrap || !img || !letter) return;

    const url = normalizeUrl(urlInput.value || '');
    const valid = isValidUrl(url);
    clearTimeout(previewTimer);
    previewTimer = setTimeout(() => {
      if (!valid) {
        wrap.classList.remove('is-active', 'has-img');
        img.style.display = 'none';
        letter.textContent = '+';
        letter.style.display = '';
        return;
      }
      const domain = Favicon.getDomain(url);
      wrap.classList.add('is-active');
      wrap.classList.remove('has-img');
      letter.textContent = (domain || '?').charAt(0).toUpperCase();
      letter.style.display = '';
      img.style.display = '';
      img.src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64';
      // If the image is slow or broken, the letter chip stays as its face.
      clearTimeout(img._pTimer);
      img._pTimer = setTimeout(() => {
        if (!img.complete || img.naturalWidth === 0) {
          wrap.classList.remove('has-img');
          img.style.display = 'none';
          letter.style.display = '';
        }
      }, 700);
    }, 240);
  }

  async function confirmAdd() {
    const name = document.getElementById('sites-add-name')?.value || '';
    const url = document.getElementById('sites-add-url')?.value || '';
    const cat = document.getElementById('sites-add-cat')?.value || 'famous';
    const ok = await addSite(name, url, cat);
    if (ok) {
      const nameInput = document.getElementById('sites-add-name');
      const urlInput = document.getElementById('sites-add-url');
      if (nameInput) nameInput.value = '';
      if (urlInput) urlInput.value = '';
      setFormOpen(false);
    }
  }

  /* ─────────────── lifecycle ─────────────── */

  function init() {
    document.addEventListener('tabyar:language-changed', rerender);

    const addBtn = document.getElementById('btn-sites-add');
    if (addBtn) addBtn.addEventListener('click', () => setFormOpen(!formOpen));

    const resetBtn = document.getElementById('btn-sites-reset');
    if (resetBtn) resetBtn.addEventListener('click', () => resetToDefaults());

    const cancelBtn = document.getElementById('btn-sites-add-cancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => setFormOpen(false));

    const closeBtn = document.getElementById('btn-sites-add-close');
    if (closeBtn) closeBtn.addEventListener('click', () => setFormOpen(false));

    const overlay = document.getElementById('modal-sites-add');
    if (overlay) {
      overlay.addEventListener('click', (event) => { if (event.target === overlay) setFormOpen(false); });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !overlay.classList.contains('hidden')) {
          setFormOpen(false);
        }
      });
    }

    const form = document.getElementById('sites-add-form');
    if (form) form.addEventListener('submit', (event) => { event.preventDefault(); confirmAdd(); });

    const urlInput = document.getElementById('sites-add-url');
    if (urlInput) {
      urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { event.preventDefault(); confirmAdd(); }
      });
      urlInput.addEventListener('input', updatePreview);
    }
    const previewImg = document.getElementById('sites-add-preview-img');
    if (previewImg) {
      previewImg.addEventListener('load', () => {
        const wrap = document.getElementById('sites-add-preview');
        const letter = document.getElementById('sites-add-preview-letter');
        if (wrap && letter) { wrap.classList.add('has-img'); letter.style.display = 'none'; }
      });
      previewImg.addEventListener('error', () => {
        const wrap = document.getElementById('sites-add-preview');
        const letter = document.getElementById('sites-add-preview-letter');
        if (wrap && letter) {
          wrap.classList.remove('has-img');
          previewImg.style.display = 'none';
          letter.style.display = '';
        }
      });
    }
    const nameInput = document.getElementById('sites-add-name');
    if (nameInput) nameInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') { event.preventDefault(); document.getElementById('sites-add-url')?.focus(); }
    });

    renderCats();
    renderGrid();
    migrateNewDefaults().then((changed) => {
      if (changed) { renderCats(); renderGrid(); }
    }).catch(() => {});
  }

  function rerender() {
    renderCats();
    renderGrid();
    renderSelectOptions();
  }

  function isEmpty() {
    return getList().length === 0;
  }

  return { init, render: rerender, isVisible, isEmpty, addSite, removeSite, resetToDefaults, getList, migrateNewDefaults };
})();
