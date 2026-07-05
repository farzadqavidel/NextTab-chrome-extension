const CalendarUI = (() => {
  let viewYear;
  let viewMonth;
  let clockInterval = null;

  const els = {};

  function getCalendarType() {
    return Storage.getSettings().calendarType || 'jalali';
  }

  function getCountryCode() {
    return Storage.getSettings().countryCode || '';
  }

  function getLang() {
    return I18n.getLang();
  }

  function getRegionalLang() {
    return I18n.getRegionalLang();
  }

  function gregorianToPrimary(g) {
    const type = getCalendarType();
    if (type === 'jalali') return Jalali.gregorianToJalali(g.year, g.month, g.day);
    if (type === 'hijri') return Hijri.gregorianToHijri(g.year, g.month, g.day);
    return { year: g.year, month: g.month, day: g.day };
  }

  function primaryToGregorian(y, m, d) {
    const type = getCalendarType();
    if (type === 'jalali') return Jalali.jalaliToGregorian(y, m, d);
    if (type === 'hijri') return Hijri.hijriToGregorian(y, m, d);
    return { year: y, month: m, day: d };
  }

  function todayPrimary() {
    return gregorianToPrimary(Storage.getTodayGregorian());
  }

  function initViewFromSelected() {
    const selected = gregorianToPrimary(Storage.getSelectedGregorian());
    viewYear = selected.year;
    viewMonth = selected.month;
  }

  function init() {
    els.monthName = document.getElementById('cal-month-name');
    els.year = document.getElementById('cal-year');
    els.days = document.getElementById('cal-days');
    els.prev = document.getElementById('cal-prev');
    els.next = document.getElementById('cal-next');
    els.goToday = document.getElementById('cal-go-today');
    els.dayClock = document.getElementById('day-clock');
    els.dayDate = document.getElementById('day-date');
    els.dayWeekday = document.getElementById('day-weekday');
    els.eventsList = document.getElementById('day-events-list');
    els.otherDates = document.getElementById('cal-other-dates');
    els.weekdays = document.querySelector('.cal-weekdays');

    initViewFromSelected();

    els.prev.addEventListener('click', () => navigate(-1));
    els.next.addEventListener('click', () => navigate(1));
    els.goToday.addEventListener('click', goToToday);

    render();
    startClock();
  }

  function getMonthLength(year, month) {
    const type = getCalendarType();
    if (type === 'jalali') return Jalali.daysInJalaliMonth(year, month);
    if (type === 'hijri') return Hijri.daysInHijriMonth(year, month);
    return Jalali.daysInGregorianMonth(year, month);
  }

  function getMonthDays(year, month) {
    const type = getCalendarType();
    if (type === 'jalali') return Jalali.getMonthDays(year, month);
    if (type === 'hijri') return Hijri.getMonthDays(year, month);
    return Jalali.getGregorianMonthDays(year, month);
  }

  function navigate(delta) {
    viewMonth += delta;
    const maxMonth = getCalendarType() === 'gregorian' ? 12 : 12;
    if (viewMonth > maxMonth) {
      viewMonth = 1;
      viewYear++;
    } else if (viewMonth < 1) {
      viewMonth = maxMonth;
      viewYear--;
    }
    renderCalendarDays();
    updateHeader();
  }

  async function goToToday() {
    const today = todayPrimary();
    viewYear = today.year;
    viewMonth = today.month;
    const g = Storage.getTodayGregorian();
    await Storage.setSelectedGregorian(g.year, g.month, g.day);
    render();
  }

  async function selectPrimaryDay(year, month, day) {
    const g = primaryToGregorian(year, month, day);
    await Storage.setSelectedGregorian(g.year, g.month, g.day);
    renderDayInfo(g);
    renderCalendarDays();
    renderOtherDates(g);
  }

  function formatNativeScriptDate(day, monthName, year) {
    const d = I18n.formatDigits(day);
    const y = I18n.formatDigits(year);
    return `\u2066${d}\u2069 ${monthName} \u2066${y}\u2069`;
  }

  function formatGregorianDisplay(g) {
    if (getLang() === 'fa') {
      return PersianEvents.formatGregorianFromGregorian(g.year, g.month, g.day);
    }
    const monthName = I18n.getGregorianMonthName(g.month - 1);
    return `${g.day} ${monthName} ${g.year}`;
  }

  function formatJalaliDisplay(j) {
    const month = Jalali.PERSIAN_MONTHS[j.month - 1];
    return formatNativeScriptDate(j.day, month, j.year);
  }

  function formatHijriDisplay(h) {
    const month = Hijri.MONTHS[h.month - 1];
    return formatNativeScriptDate(h.day, month, h.year);
  }

  function getEventsForDate(g) {
    const type = getCalendarType();
    const lang = getRegionalLang();

    if (type === 'gregorian') {
      return PersianEvents.getGregorianEvents(g.year, g.month, g.day, lang);
    }
    if (type === 'hijri') {
      const h = Hijri.gregorianToHijri(g.year, g.month, g.day);
      return PersianEvents.getHijriEvents(h.year, h.month, h.day, lang);
    }
    const j = Jalali.gregorianToJalali(g.year, g.month, g.day);
    return PersianEvents.getEvents(j.year, j.month, j.day, lang);
  }

  function getDayFlags(g) {
    const type = getCalendarType();
    const lang = getRegionalLang();
    const weekday = new Date(g.year, g.month - 1, g.day).getDay();

    let weekendClass = '';
    if (type === 'gregorian' && weekday === 0) {
      weekendClass = 'sunday';
    } else if (type !== 'gregorian' && weekday === 5) {
      weekendClass = 'friday';
    }

    let isHoliday = false;
    let hasEvent = false;

    if (type === 'gregorian') {
      isHoliday = weekday === 0 || PersianEvents.isGregorianHoliday(g.year, g.month, g.day, lang);
      hasEvent = PersianEvents.hasGregorianEvents(g.year, g.month, g.day, lang);
    } else if (type === 'hijri') {
      const h = Hijri.gregorianToHijri(g.year, g.month, g.day);
      isHoliday = weekday === 5 || PersianEvents.isHijriHoliday(h.year, h.month, h.day, lang);
      hasEvent = PersianEvents.hasHijriEvents(h.year, h.month, h.day, lang);
    } else {
      const j = Jalali.gregorianToJalali(g.year, g.month, g.day);
      isHoliday = weekday === 5 || PersianEvents.isHoliday(j.year, j.month, j.day, lang);
      hasEvent = PersianEvents.hasEvents(j.year, j.month, j.day, lang);
    }

    return { weekendClass, isHoliday, hasEvent };
  }

  function renderDayInfo(g) {
    const primary = gregorianToPrimary(g);
    const date = new Date(g.year, g.month - 1, g.day);
    const weekday = I18n.getWeekdayName(date.getDay());
    const type = getCalendarType();

    if (type === 'jalali') {
      els.dayDate.textContent = formatJalaliDisplay(primary);
    } else if (type === 'hijri') {
      els.dayDate.textContent = formatHijriDisplay(primary);
    } else {
      els.dayDate.textContent = formatGregorianDisplay(g);
    }
    els.dayWeekday.textContent = weekday;

    let events = getEventsForDate(g);
    if (type === 'gregorian' && date.getDay() === 0) {
      events = [{ title: I18n.getRegionalHolidayLabel('sundayHoliday'), type: 'holiday' }, ...events];
    } else if (type !== 'gregorian' && date.getDay() === 5) {
      events = [{ title: I18n.getRegionalHolidayLabel('fridayHoliday'), type: 'holiday' }, ...events];
    }
    if (events.length === 0) {
      els.eventsList.innerHTML = `<li class="no-events">${I18n.t('noOccasion')}</li>`;
    } else {
      els.eventsList.innerHTML = events.map((e) =>
        `<li class="event-item ${e.type}">${e.title}</li>`
      ).join('');
    }
  }

  function renderOtherDates(g) {
    if (!els.otherDates) return;

    const j = Jalali.gregorianToJalali(g.year, g.month, g.day);
    const h = Hijri.gregorianToHijri(g.year, g.month, g.day);
    const type = getCalendarType();

    const formats = {
      jalali: formatJalaliDisplay(j),
      gregorian: formatGregorianDisplay(g),
      hijri: formatHijriDisplay(h)
    };
    const labels = {
      jalali: I18n.t('solar'),
      gregorian: I18n.t('gregorian'),
      hijri: I18n.t('hijri')
    };

    const others = ['jalali', 'gregorian', 'hijri'].filter((item) => item !== type);
    els.otherDates.innerHTML = others.map((item) =>
      `<span><strong>${labels[item]}:</strong> <bdi class="alt-date">${formats[item]}</bdi></span>`
    ).join('');
  }

  function applyCalendarDirection() {
    const card = document.querySelector('.calendar-card');
    if (!card) return;
    card.dir = getCalendarType() === 'gregorian' ? 'ltr' : 'rtl';
  }

  function getWeekdayOffset(firstWeekday) {
    const mondayStart = RegionHelper.weekStartsOnMonday(getCalendarType(), getCountryCode());
    if (mondayStart) return (firstWeekday + 6) % 7;
    return (firstWeekday + 1) % 7;
  }

  function getWeekendColumnIndex() {
    const type = getCalendarType();
    const mondayStart = RegionHelper.weekStartsOnMonday(type, getCountryCode());
    if (type === 'gregorian') return mondayStart ? 6 : 0;
    return mondayStart ? 4 : 6;
  }

  function renderWeekdays() {
    if (!els.weekdays) return;
    const labels = I18n.getCalendarWeekdays(getCalendarType(), getCountryCode());
    const weekendIdx = getWeekendColumnIndex();
    els.weekdays.innerHTML = labels.map((label, i) =>
      `<span${i === weekendIdx ? ' class="weekend"' : ''}>${label}</span>`
    ).join('');
  }

  function renderCalendarDays() {
    const today = todayPrimary();
    const selectedG = Storage.getSelectedGregorian();
    const selectedPrimary = gregorianToPrimary(selectedG);
    const monthDays = getMonthDays(viewYear, viewMonth);
    const offset = getWeekdayOffset(monthDays[0].weekday);

    let html = '';
    for (let i = 0; i < offset; i++) {
      html += '<span class="cal-day empty"></span>';
    }

    for (const { day } of monthDays) {
      const g = primaryToGregorian(viewYear, viewMonth, day);
      const isToday = viewYear === today.year && viewMonth === today.month && day === today.day;
      const isSelected = viewYear === selectedPrimary.year &&
        viewMonth === selectedPrimary.month &&
        day === selectedPrimary.day;
      const { weekendClass, isHoliday, hasEvent } = getDayFlags(g);

      const classes = ['cal-day'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (weekendClass) classes.push(weekendClass);
      if (isHoliday) classes.push('holiday');
      if (hasEvent && !isHoliday) classes.push('has-event');

      html += `<button type="button" class="${classes.join(' ')}" data-day="${day}">${I18n.formatDigits(day)}</button>`;
    }

    els.days.innerHTML = html;
    els.days.querySelectorAll('.cal-day:not(.empty)').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectPrimaryDay(viewYear, viewMonth, parseInt(btn.dataset.day, 10));
      });
    });
  }

  function updateHeader() {
    const type = getCalendarType();
    if (type === 'jalali') {
      els.monthName.textContent = Jalali.PERSIAN_MONTHS[viewMonth - 1];
    } else if (type === 'hijri') {
      els.monthName.textContent = Hijri.MONTHS[viewMonth - 1];
    } else {
      els.monthName.textContent = I18n.getGregorianMonthName(viewMonth - 1);
    }
    els.year.textContent = I18n.formatDigits(viewYear);
  }

  function render() {
    applyCalendarDirection();
    renderWeekdays();
    updateHeader();
    const selectedG = Storage.getSelectedGregorian();
    renderDayInfo(selectedG);
    renderOtherDates(selectedG);
    renderCalendarDays();
  }

  function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  function updateClock() {
    els.dayClock.textContent = Locale.formatClock(new Date());
  }

  function refresh() {
    initViewFromSelected();
    render();
    updateClock();
  }

  return { init, refresh };
})();
