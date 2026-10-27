const Locale = (() => {
  function getTimezone() {
    const saved = typeof Storage !== 'undefined' ? Storage.getSettings().timezone : '';
    if (saved) return saved;
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }

  function getSystemLocale() {
    return navigator.language || 'en-US';
  }

  function getRegionalLocale(countryCode) {
    const code = ((countryCode != null ? countryCode : (typeof Storage !== 'undefined' ? Storage.getSettings().countryCode : '')) || '').toUpperCase();
    if (code === 'IR' || code === 'AF') return 'fa-IR';
    const cal = typeof Storage !== 'undefined' ? Storage.getSettings().calendarType : '';
    if (!countryCode && (cal === 'jalali' || cal === 'hijri')) return 'fa-IR';
    try {
      const sys = navigator.language || 'en-US';
      return sys.startsWith('en') ? sys : 'en-US';
    } catch {
      return 'en-US';
    }
  }

  function getTimeLocale(countryCode) {
    return getRegionalLocale(countryCode);
  }

  function shouldUsePersianDigits(countryCode) {
    const style = typeof Storage !== 'undefined' ? Storage.getSettings().persianDigits : 'auto';
    if (style === 'persian') return true;
    if (style === 'latin') return false;
    const code = ((countryCode != null ? countryCode : (typeof Storage !== 'undefined' ? Storage.getSettings().countryCode : '')) || '').toUpperCase();
    if (code === 'IR' || code === 'AF') return true;
    const cal = typeof Storage !== 'undefined' ? Storage.getSettings().calendarType : '';
    return cal === 'jalali' || cal === 'hijri';
  }

  function formatClockForZone(date, timezone, countryCode) {
    const digitStyle = typeof Storage !== 'undefined' ? Storage.getSettings().persianDigits : 'auto';
    const formatted = new Intl.DateTimeFormat(getTimeLocale(countryCode), {
      timeZone: timezone || getTimezone(),
      hour: '2-digit',
      minute: '2-digit',
      numberingSystem: digitStyle === 'latin' ? 'latn' : undefined
    }).format(date || new Date());

    if (shouldUsePersianDigits(countryCode) && typeof Jalali !== 'undefined') {
      return Jalali.toPersianDigits(formatted);
    }
    return formatted;
  }

  function formatClock(date) {
    return formatClockForZone(date, getTimezone());
  }

  function formatDateISO(date, timeZone) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || getTimezone(),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date || new Date());
  }

  function offsetDateISO(isoDate, days) {
    const [y, m, d] = isoDate.split('-').map(Number);
    const date = new Date(y, m - 1, d + days);
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
  }

  function timezoneLabel() {
    return getTimezone().split('/').pop().replace(/_/g, ' ');
  }

  return {
    getTimezone,
    getSystemLocale,
    getRegionalLocale,
    getTimeLocale,
    shouldUsePersianDigits,
    formatDateISO,
    formatClock,
    formatClockForZone,
    offsetDateISO,
    timezoneLabel
  };
})();
