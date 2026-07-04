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

  function formatGregorianDisplay(g) {
    if (I18n.getLang() === 'fa') {
      return PersianEvents.formatGregorianFromGregorian(g.year, g.month, g.day);
    }
    const monthName = I18n.getGregorianMonthName(g.month - 1);
    return `${g.day} ${monthName} ${g.year}`;
  }

  function formatJalaliDisplay(j) {
    if (I18n.getLang() === 'fa') {
      return Jalali.formatDate(j.year, j.month, j.day);
    }
    return `${j.day} ${I18n.getMonthName(j.month - 1)} ${j.year}`;
  }

  function renderDayInfo(g) {
    const primary = gregorianToPrimary(g);
    const date = new Date(g.year, g.month - 1, g.day);
    const weekday = I18n.getWeekdayName(date.getDay());
    const type = getCalendarType();

    if (type === 'jalali') {
      els.dayDate.textContent = formatJalaliDisplay(primary);
    } else if (type === 'hijri') {
      els.dayDate.textContent = Hijri.format(primary.year, primary.month, primary.day);
    } else {
      els.dayDate.textContent = formatGregorianDisplay(g);
    }
    els.dayWeekday.textContent = weekday;

    const j = Jalali.gregorianToJalali(g.year, g.month, g.day);
    const events = PersianEvents.getEvents(j.year, j.month, j.day);
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
      hijri: Hijri.format(h.year, h.month, h.day)
    };
    const labels = {
      jalali: I18n.t('solar'),
      gregorian: I18n.t('gregorian'),
      hijri: I18n.t('hijri')
    };

    const others = ['jalali', 'gregorian', 'hijri'].filter((item) => item !== type);
    els.otherDates.innerHTML = others.map((item) =>
      `<span><strong>${labels[item]}:</strong> ${formats[item]}</span>`
    ).join('');
  }

  function getWeekdayOffset(firstWeekday) {
    const mondayStart = RegionHelper.weekStartsOnMonday(getCalendarType(), getCountryCode());
    if (mondayStart) return (firstWeekday + 6) % 7;
    return (firstWeekday + 1) % 7;
  }

  function renderWeekdays() {
    if (!els.weekdays) return;
    const labels = I18n.getCalendarWeekdays(getCalendarType(), getCountryCode());
    els.weekdays.innerHTML = labels.map((label) => `<span>${label}</span>`).join('');
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
      const j = Jalali.gregorianToJalali(g.year, g.month, g.day);
      const isToday = viewYear === today.year && viewMonth === today.month && day === today.day;
      const isSelected = viewYear === selectedPrimary.year &&
        viewMonth === selectedPrimary.month &&
        day === selectedPrimary.day;
      const weekday = new Date(g.year, g.month - 1, g.day).getDay();
      const isFriday = weekday === 5;
      const isHoliday = PersianEvents.isHoliday(j.year, j.month, j.day);
      const hasEvent = PersianEvents.hasEvents(j.year, j.month, j.day);

      const classes = ['cal-day'];
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');
      if (isFriday) classes.push('friday');
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
      els.monthName.textContent = I18n.getMonthName(viewMonth - 1);
    } else if (type === 'hijri') {
      els.monthName.textContent = I18n.getHijriMonthName(viewMonth - 1);
    } else {
      els.monthName.textContent = I18n.getGregorianMonthName(viewMonth - 1);
    }
    els.year.textContent = I18n.formatDigits(viewYear);
  }

  function render() {
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
