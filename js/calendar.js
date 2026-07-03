const CalendarUI = (() => {
  let viewYear, viewMonth;
  let clockInterval = null;

  const els = {};

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

    const t = Jalali.today();
    viewYear = t.year;
    viewMonth = t.month;

    els.prev.addEventListener('click', () => navigate(-1));
    els.next.addEventListener('click', () => navigate(1));
    els.goToday.addEventListener('click', goToToday);

    render();
    startClock();
  }

  function navigate(delta) {
    viewMonth += delta;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear++;
    } else if (viewMonth < 1) {
      viewMonth = 12;
      viewYear--;
    }
    render();
  }

  async function goToToday() {
    const t = Jalali.today();
    viewYear = t.year;
    viewMonth = t.month;
    await Storage.setSelectedDay(t.year, t.month, t.day);
    render();
  }

  async function selectDay(year, month, day) {
    await Storage.setSelectedDay(year, month, day);
    renderDayInfo(year, month, day);
    renderCalendarDays();
    renderOtherDates(year, month, day);
  }

  function renderDayInfo(year, month, day) {
    const g = Jalali.jalaliToGregorian(year, month, day);
    const date = new Date(g.year, g.month - 1, g.day);
    const weekday = I18n.getWeekdayName(date.getDay());

    els.dayDate.textContent = I18n.getLang() === 'fa'
      ? Jalali.formatDate(year, month, day)
      : `${day} ${I18n.getMonthName(month - 1)} ${year}`;
    els.dayWeekday.textContent = weekday;

    const events = PersianEvents.getEvents(year, month, day);
    if (events.length === 0) {
      els.eventsList.innerHTML = `<li class="no-events">${I18n.t('noOccasion')}</li>`;
    } else {
      els.eventsList.innerHTML = events.map((e) =>
        `<li class="event-item ${e.type}">${e.title}</li>`
      ).join('');
    }
  }

  function renderOtherDates(year, month, day) {
    if (!els.otherDates) return;
    const greg = PersianEvents.formatGregorian(year, month, day);
    const hijri = PersianEvents.formatHijri(year, month, day);
    els.otherDates.innerHTML = `
      <span><strong>${I18n.t('gregorian')}:</strong> ${greg}</span>
      <span><strong>${I18n.t('hijri')}:</strong> ${hijri}</span>
    `;
  }

  function renderCalendarDays() {
    const todayJ = Jalali.today();
    const selected = Storage.getSelectedDay();
    const monthDays = Jalali.getMonthDays(viewYear, viewMonth);
    const firstWeekday = monthDays[0].weekday;
    const offset = (firstWeekday + 1) % 7;

    let html = '';
    for (let i = 0; i < offset; i++) {
      html += '<span class="cal-day empty"></span>';
    }

    for (const { day } of monthDays) {
      const isToday = viewYear === todayJ.year && viewMonth === todayJ.month && day === todayJ.day;
      const isSelected = viewYear === selected.year && viewMonth === selected.month && day === selected.day;
      const isFriday = Jalali.getWeekday(viewYear, viewMonth, day) === 5;
      const isHoliday = PersianEvents.isHoliday(viewYear, viewMonth, day);
      const hasEvent = PersianEvents.hasEvents(viewYear, viewMonth, day);

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
        selectDay(viewYear, viewMonth, parseInt(btn.dataset.day, 10));
      });
    });
  }

  function render() {
    els.monthName.textContent = I18n.getMonthName(viewMonth - 1);
    els.year.textContent = I18n.formatDigits(viewYear);

    const selected = Storage.getSelectedDay();
    renderDayInfo(selected.year, selected.month, selected.day);
    renderOtherDates(selected.year, selected.month, selected.day);
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
    render();
    updateClock();
  }

  return { init, refresh };
})();
