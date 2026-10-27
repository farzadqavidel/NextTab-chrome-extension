/**
 * Feeds — shared helpers for the below-the-fold sections (market prices + news).
 * Also coordinates section visibility and the page scroll mode.
 */
const Feeds = (() => {
  function settings() {
    return typeof Storage !== 'undefined' ? Storage.getSettings() : {};
  }

  function usePersianDigits() {
    if (typeof Locale !== 'undefined' && typeof Locale.shouldUsePersianDigits === 'function') {
      return Locale.shouldUsePersianDigits();
    }
    const s = settings();
    const style = s.persianDigits || 'auto';
    if (style === 'persian') return true;
    if (style === 'latin') return false;
    const code = (s.countryCode || '').toUpperCase();
    if (code === 'IR' || code === 'AF') return true;
    return s.calendarType === 'jalali' || s.calendarType === 'hijri';
  }

  function digits(value) {
    const str = String(value);
    if (!usePersianDigits()) return str;
    if (typeof Jalali !== 'undefined' && Jalali.toPersianDigits) return Jalali.toPersianDigits(str);
    return str.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
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
    const div = document.createElement('div');
    div.innerHTML = String(html == null ? '' : html);
    return (div.textContent || '').replace(/\s+/g, ' ').trim();
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

  /** Shows/hides the two feed sections and switches the page into scroll mode. */
  function applyVisibility() {
    const s = settings();
    const newsOn = s.newsVisible !== false;
    const pricesOn = s.pricesVisible !== false;
    const newsEl = document.getElementById('news-section');
    const pricesEl = document.getElementById('prices-section');
    if (newsEl) newsEl.classList.toggle('hidden', !newsOn);
    if (pricesEl) pricesEl.classList.toggle('hidden', !pricesOn);
    const wrapEl = document.getElementById('feed-sections');
    if (wrapEl) wrapEl.classList.toggle('hidden', !(newsOn || pricesOn));
    document.documentElement.classList.toggle('feed-scroll', newsOn || pricesOn);
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
