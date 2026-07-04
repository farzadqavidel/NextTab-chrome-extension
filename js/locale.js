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

  function getTimeLocale() {
    const uiLang = typeof I18n !== 'undefined' ? I18n.getLang() : 'fa';
    if (uiLang === 'fa') return 'fa-IR';
    const sys = getSystemLocale();
    return sys.startsWith('en') ? sys : 'en-US';
  }

  function formatDateISO(date, timeZone) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || getTimezone(),
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date || new Date());
  }

  function formatClock(date) {
    const formatted = new Intl.DateTimeFormat(getTimeLocale(), {
      timeZone: getTimezone(),
      hour: '2-digit',
      minute: '2-digit'
    }).format(date || new Date());

    if (typeof I18n !== 'undefined' && I18n.getLang() === 'fa') {
      return Jalali.toPersianDigits(formatted);
    }
    return formatted;
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
    getTimeLocale,
    formatDateISO,
    formatClock,
    offsetDateISO,
    timezoneLabel
  };
})();
