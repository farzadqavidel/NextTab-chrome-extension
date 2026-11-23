/**
 * Feeds — shared helpers for the below-the-fold sections (market prices + news).
 * Also coordinates section visibility and the page scroll mode.
 */
const Feeds = (() => {
  function settings() {
    return typeof Storage !== 'undefined' ? Storage.getSettings() : {};
  }

  function usePersianDigits() {
    return false;
  }

  function digits(value) {
    return String(value);
  }

  function group(number, fraction = 0) {
    const formatted = Number(number).toLocaleString('en-US', {
      maximumFractionDigits: fraction,
      minimumFractionDigits: 0
    });
    return digits(formatted);
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripHtml(html) {
    // DOMParser keeps the markup out of the live document tree — no detached-img
    // network fetches, no scripts — so feed HTML can be parsed safely.
    const text = String(html == null ? '' : html);
    try {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      return (doc.body ? doc.body.textContent : '').replace(/\s+/g, ' ').trim();
    } catch {
      const div = document.createElement('div');
      div.textContent = text;
      return div.textContent.replace(/\s+/g, ' ').trim();
    }
  }

  async function fetchWithTimeout(url, ms = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
      return await fetch(url, { signal: controller.signal, redirect: 'follow' });
    } finally {
      clearTimeout(timer);
    }
  }

  function timeAgo(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '';
    const minutes = Math.round((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return I18n.t('feedJustNow');
    if (minutes < 60) return I18n.t('feedMinutesAgo', { n: digits(minutes) });
    const hours = Math.round(minutes / 60);
    if (hours < 24) return I18n.t('feedHoursAgo', { n: digits(hours) });
    const days = Math.round(hours / 24);
    return I18n.t('feedDaysAgo', { n: digits(days) });
  }

  function clockNow() {
    try {
      return Locale.formatClock(new Date());
    } catch (e) {
      return digits(new Date().toTimeString().slice(0, 5));
    }
  }

  /** Shows/hides the three feed sections and switches the page into scroll mode. */
  function applyVisibility() {
    const s = settings();
    const newsOn = s.newsVisible !== false;
    const pricesOn = s.pricesVisible !== false;
    const sitesOn = s.sitesVisible !== false;
    const newsEl = document.getElementById('news-section');
    const pricesEl = document.getElementById('prices-section');
    const sitesEl = document.getElementById('sites-section');
    if (newsEl) newsEl.classList.toggle('hidden', !newsOn);
    if (pricesEl) pricesEl.classList.toggle('hidden', !pricesOn);
    if (sitesEl) sitesEl.classList.toggle('hidden', !sitesOn);
    const wrapEl = document.getElementById('feed-sections');
    if (wrapEl) wrapEl.classList.toggle('hidden', !(newsOn || pricesOn || sitesOn));
    document.documentElement.classList.toggle('feed-scroll', newsOn || pricesOn || sitesOn);
  }

  return {
    settings,
    usePersianDigits,
    digits,
    group,
    escapeHtml,
    stripHtml,
    fetchWithTimeout,
    timeAgo,
    clockNow,
    applyVisibility
  };
})();
