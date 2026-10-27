/**
 * PricesUI — live market & prices card (currency, gold, coin, crypto).
 * Source: priceto.day public API (mirrors tgju.org, CORS enabled, no key).
 * Prices with base `irr` are quoted in rial and displayed in toman.
 */
const PricesUI = (() => {
  const API_BASE = 'https://api.priceto.day/v1';
  const REFRESH_MS = 10 * 60 * 1000;

  const ICONS = {
    banknote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
    euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10h12"/><path d="M4 14h9"/><path d="M19 6a7.5 7.5 0 1 0 0 12"/></svg>',
    gem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9Z"/><path d="M2 9h20"/><path d="M12 21 8 9l3-6"/><path d="m16 3 3 6-4 12"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z"/></svg>',
    coin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M12 3.5v2m0 13v2M3.5 12h2m13 0h2"/></svg>',
    btc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 7.5h4a2.25 2.25 0 0 1 0 4.5h-4z"/><path d="M9.5 12h4.75a2.25 2.25 0 0 1 0 4.5H9.5z"/><path d="M10.5 5.5v2m3-2v2m-3 11v2m3-2v2"/></svg>'
  };

  const TILES = [
    { id: 'usd', base: 'irr', symbol: 'usd', icon: ICONS.banknote, labelKey: 'priceUsd', unitKey: 'priceUnitToman' },
    { id: 'euro', base: 'irr', symbol: 'euro', icon: ICONS.euro, labelKey: 'priceEuro', unitKey: 'priceUnitToman' },
    { id: 'tether', base: 'irr', symbol: 'tether', icon: ICONS.gem, labelKey: 'priceTether', unitKey: 'priceUnitToman' },
    { id: 'gold18', base: 'irr', symbol: 'gold-18k', icon: ICONS.spark, labelKey: 'priceGold18', unitKey: 'priceUnitTomanGram' },
    { id: 'coin', base: 'irr', symbol: 'coin-emami', icon: ICONS.coin, labelKey: 'priceCoin', unitKey: 'priceUnitToman', compact: true },
    { id: 'btc', base: 'irr', symbol: 'bitcoin', icon: ICONS.btc, labelKey: 'priceBtc', unitKey: 'priceUnitToman', compact: true }
  ];

  let data = {};
  let timer = null;
  let loading = false;

  function grid() { return document.getElementById('prices-grid'); }

  function formatValue(tile, value) {
    if (tile.base === 'usd') return `$${Feeds.group(value, 0)}`;
    if (tile.compact) {
      if (value >= 1e9) return `${Feeds.group(value / 1e9, 2)} ${I18n.t('unitBillion')}`;
      if (value >= 1e6) return `${Feeds.group(value / 1e6, 1)} ${I18n.t('unitMillion')}`;
    }
    return Feeds.group(value, 0);
  }

  function changeBadge(percent) {
    if (percent == null || isNaN(percent)) return '<span class="price-change flat">—</span>';
    const rounded = Math.round(percent * 10) / 10;
    if (rounded > 0) {
      return `<span class="price-change up">▲ ${Feeds.group(Math.abs(rounded), 1)}٪</span>`;
    }
    if (rounded < 0) {
      return `<span class="price-change down">▼ ${Feeds.group(Math.abs(rounded), 1)}٪</span>`;
    }
    return `<span class="price-change flat">● ${Feeds.digits(0)}٪</span>`;
  }

  function tileHtml(tile) {
    const item = data[tile.id];
    const value = item ? formatValue(tile, item.value) : '…';
    const badge = item ? changeBadge(item.changePercent) : '<span class="price-change flat">—</span>';
    return `
      <div class="price-tile ${item ? '' : 'is-empty'}" data-price-tile="${tile.id}">
        <div class="price-tile-top">
          <span class="price-tile-icon" aria-hidden="true">${tile.icon}</span>
          <span class="price-tile-label">${I18n.t(tile.labelKey)}</span>
        </div>
        <div class="price-value-row">
          <span class="price-value" dir="ltr">${value}</span>
          <span class="price-unit">${I18n.t(tile.unitKey)}</span>
        </div>
        ${badge}
      </div>`;
  }

  function render() {
    const el = grid();
    if (!el) return;
    el.innerHTML = TILES.map(tileHtml).join('');
    const updated = document.getElementById('prices-updated');
    if (updated) {
      updated.textContent = Object.keys(data).length
        ? I18n.t('pricesUpdated', { time: Feeds.clockNow() })
        : '';
    }
    const error = document.getElementById('prices-error');
    if (error) error.classList.toggle('hidden', Object.keys(data).length > 0);
  }

  async function fetchTile(tile) {
    const endpoints = [
      `${API_BASE}/change/${tile.base}/${tile.symbol}`,
      `${API_BASE}/latest/${tile.base}/${tile.symbol}`
    ];
    for (const url of endpoints) {
      try {
        const res = await Feeds.fetchWithTimeout(url, 10000);
        if (!res.ok) continue;
        const json = await res.json();
        if (!json || json.success !== true || typeof json.price !== 'number') continue;
        const day = Array.isArray(json.changes) ? json.changes.find((c) => c.period === '1d') : null;
        const raw = json.price;
        return {
          value: tile.base === 'irr' ? raw / 10 : raw,
          changePercent: day && typeof day.changePercent === 'number' ? day.changePercent : null,
          time: json.time || null
        };
      } catch (e) {
        // try next endpoint
      }
    }
    return null;
  }

  async function load() {
    if (loading) return;
    loading = true;
    const btn = document.getElementById('btn-prices-refresh');
    if (btn) btn.classList.add('is-loading');
    const results = await Promise.allSettled(TILES.map((tile) => fetchTile(tile)));
    const next = {};
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) next[TILES[index].id] = result.value;
    });
    if (Object.keys(next).length) data = next;
    loading = false;
    if (btn) btn.classList.remove('is-loading');
    render();
  }

  function init() {
    document.addEventListener('tabyar:language-changed', render);
    const btn = document.getElementById('btn-prices-refresh');
    if (btn) btn.addEventListener('click', () => load());
    const retry = document.getElementById('btn-prices-retry');
    if (retry) retry.addEventListener('click', () => load());
    render();
    load();
    timer = setInterval(() => {
      const s = Feeds.settings();
      if (s.pricesVisible === false) return;
      load();
    }, REFRESH_MS);
  }

  return { init, load, render };
})();
