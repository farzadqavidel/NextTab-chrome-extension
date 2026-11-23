const PersonalEventsUI = (() => {
  const els = {};
  let editingId = null;

  function init() {
    els.modal = document.getElementById('modal-personal-events');
    els.form = document.getElementById('personal-event-form');
    els.list = document.getElementById('personal-events-list');
    els.title = document.getElementById('personal-event-title');
    els.type = document.getElementById('personal-event-calendar');
    els.date = document.getElementById('personal-event-date');
    els.dateHint = document.getElementById('personal-event-date-hint');
    els.annual = document.getElementById('personal-event-annual');
    if (!els.modal) return;

    document.getElementById('btn-manage-personal-events')?.addEventListener('click', open);
    document.getElementById('btn-add-personal-event')?.addEventListener('click', () => prepareForm());
    els.form.addEventListener('submit', saveFromForm);
    els.annual.addEventListener('change', updateDateHint);
    els.type.addEventListener('change', updateDateHint);
    els.list.addEventListener('click', handleListAction);
    els.modal.addEventListener('click', (event) => {
      if (event.target === els.modal) close();
    });
    document.querySelectorAll('[data-close="modal-personal-events"]').forEach((button) => {
      button.addEventListener('click', close);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !els.modal.classList.contains('hidden')) close();
    });
    render();
  }

  function toCalendarDate(g, type) {
    if (type === 'gregorian') return { year: g.year, month: g.month, day: g.day };
    if (type === 'hijri') return Hijri.gregorianToHijri(g.year, g.month, g.day);
    return Jalali.gregorianToJalali(g.year, g.month, g.day);
  }

  function toGregorian(date, type) {
    if (type === 'gregorian') return { year: date.year, month: date.month, day: date.day };
    if (type === 'hijri') return Hijri.hijriToGregorian(date.year, date.month, date.day);
    return Jalali.jalaliToGregorian(date.year, date.month, date.day);
  }

  function isValidDate(date, type) {
    if (!Number.isInteger(date.year) || date.year < 1 || !Number.isInteger(date.month) || date.month < 1 || date.month > 12 || !Number.isInteger(date.day) || date.day < 1 || date.day > 31) return false;
    try {
      const g = toGregorian(date, type);
      if (!g || !g.year || !g.month || !g.day) return false;
      const roundTrip = toCalendarDate(g, type);
      return roundTrip.year === date.year && roundTrip.month === date.month && roundTrip.day === date.day;
    } catch { return false; }
  }

  function normalizeDigits(value) {
    const persian = '۰۱۲۳۴۵۶۷۸۹';
    const arabic = '٠١٢٣٤٥٦٧٨٩';
    return String(value || '').replace(/[۰-۹٠-٩]/g, (digit) => {
      const faIndex = persian.indexOf(digit);
      return String(faIndex >= 0 ? faIndex : arabic.indexOf(digit));
    });
  }

  function parseDateInput(value, type, annual) {
    const parts = normalizeDigits(value).trim().split(/[\/-]/).map((part) => Number(part));
    if (parts.some((part) => !Number.isInteger(part) || part < 1)) return null;
    let date;
    if (parts.length === 3) date = { year: parts[0], month: parts[1], day: parts[2] };
    else if (parts.length === 2 && annual) {
      const today = toCalendarDate(Storage.getTodayGregorian(), type);
      date = { year: today.year, month: parts[0], day: parts[1] };
    } else return null;

    if (!annual) return isValidDate(date, type) ? date : null;
    // Annual dates such as leap-day birthdays may not exist in this year's
    // calendar. Accept them if they are valid in a nearby year.
    for (let offset = 0; offset <= 4; offset += 1) {
      for (const year of [date.year + offset, date.year - offset]) {
        if (year > 0 && isValidDate({ ...date, year }, type)) return { ...date, year };
      }
    }
    return null;
  }

  function updateDateHint() {
    const annual = els.annual.checked;
    els.date.placeholder = annual ? I18n.t('personalDateAnnualPlaceholder') : I18n.t('personalDatePlaceholder');
    els.date.maxLength = 10;
    const type = els.type.value;
    const sample = toCalendarDate(Storage.getTodayGregorian(), type);
    const month = String(sample.month).padStart(2, '0');
    const day = String(sample.day).padStart(2, '0');
    const example = annual
      ? `${I18n.formatDigits(month)}-${I18n.formatDigits(day)}`
      : `${I18n.formatDigits(sample.year)}-${I18n.formatDigits(month)}-${I18n.formatDigits(day)}`;
    const hintKey = annual ? 'personalDateAnnualExample' : 'personalDateExample';
    if (els.dateHint) els.dateHint.textContent = I18n.t(hintKey, { example });
    els.date.title = annual
      ? `${I18n.t('personalDateAnnualPlaceholder')} (${example})`
      : `${I18n.t('personalDatePlaceholder')} (${example})`;
  }

  function prepareForm(event = null) {
    editingId = event?.id || null;
    els.form.reset();
    els.title.value = event?.title || '';
    const type = event?.calendarType || Storage.getSettings().calendarType || 'jalali';
    els.type.value = ['jalali', 'gregorian', 'hijri'].includes(type) ? type : 'jalali';
    els.annual.checked = Boolean(event?.annually);
    const date = event || toCalendarDate(Storage.getTodayGregorian(), els.type.value);
    els.date.value = event
      ? (event.annually ? `${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}` : `${event.year}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`)
      : `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    document.getElementById('personal-event-form-title').textContent = I18n.t(editingId ? 'personalEventEdit' : 'personalEventAdd');
    document.getElementById('btn-personal-event-save').textContent = I18n.t(editingId ? 'save' : 'personalEventAdd');
    updateDateHint();
    render();
    els.title.focus();
  }

  function open() {
    prepareForm();
    TabyarUI.openModal('modal-personal-events');
  }

  function close() {
    TabyarUI.closeModal('modal-personal-events');
  }

  async function saveFromForm(event) {
    event.preventDefault();
    const title = els.title.value.trim();
    const type = els.type.value;
    const date = parseDateInput(els.date.value, type, els.annual.checked);
    if (!title || !date) {
      TabyarUI.alert(I18n.t('personalEventInvalidDate'), { type: 'warning' });
      return;
    }
    const wasEditing = Boolean(editingId);
    const payload = { title, calendarType: type, ...date, annually: els.annual.checked };
    if (editingId) await Storage.updatePersonalEvent(editingId, payload);
    else await Storage.addPersonalEvent(payload);
    prepareForm();
    CalendarUI.refresh();
    TabyarUI.alert(I18n.t(wasEditing ? 'personalEventUpdated' : 'personalEventSaved'), { type: 'success' });
  }

  function addDays(g, delta) {
    const date = new Date(Date.UTC(g.year, g.month - 1, g.day + delta));
    return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
  }

  function daysBetween(a, b) {
    const left = Date.UTC(a.year, a.month - 1, a.day);
    const right = Date.UTC(b.year, b.month - 1, b.day);
    return Math.round((right - left) / 86400000);
  }

  function nextOccurrence(event, from = Storage.getTodayGregorian()) {
    if (!event.annually) {
      const date = toGregorian(event, event.calendarType);
      const days = daysBetween(from, date);
      return { days, date, past: days < 0 };
    }
    for (let offset = 0; offset <= 370; offset += 1) {
      const candidate = addDays(from, offset);
      const inCalendar = toCalendarDate(candidate, event.calendarType);
      if (inCalendar.month === event.month && inCalendar.day === event.day) return { days: offset, date: candidate };
    }
    return null;
  }

  function formatDate(event) {
    const day = I18n.formatDigits(event.day);
    const month = event.calendarType === 'jalali'
      ? Jalali.PERSIAN_MONTHS[event.month - 1]
      : event.calendarType === 'hijri'
        ? Hijri.MONTHS[event.month - 1]
        : I18n.getGregorianMonthName(event.month - 1);
    const year = event.annually ? '' : ` ${I18n.formatDigits(event.year)}`;
    return `${day} ${month}${year}`;
  }

  function render() {
    if (!els.list) return;
    updateDateHint();
    const items = Storage.getPersonalEvents().map((event) => ({ event, upcoming: nextOccurrence(event) }))
      .filter((item) => item.upcoming)
      .sort((a, b) => a.upcoming.days - b.upcoming.days);
    if (!items.length) {
      els.list.innerHTML = `<li class="personal-events-empty">${I18n.t('personalEventsEmpty')}</li>`;
      return;
    }
    els.list.innerHTML = items.map(({ event, upcoming }) => `
      <li class="personal-event-row" data-id="${escapeAttr(event.id)}">
        <span class="personal-event-mark" aria-hidden="true">✦</span>
        <span class="personal-event-copy"><b>${escapeHtml(event.title)}</b><small>${escapeHtml(formatDate(event))} · ${escapeHtml(upcoming.past ? I18n.t('personalEventPast') : I18n.t(upcoming.days === 0 ? 'personalEventToday' : 'personalEventInDays', { n: I18n.formatDigits(upcoming.days) }))}</small></span>
        <span class="personal-event-row-actions"><button type="button" data-event-action="edit" aria-label="${I18n.t('edit')}">✎</button><button type="button" data-event-action="delete" aria-label="${I18n.t('delete')}"><svg class="modal-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></span>
      </li>`).join('');
  }

  async function handleListAction(event) {
    const button = event.target.closest('[data-event-action]');
    const row = button?.closest('[data-id]');
    if (!button || !row) return;
    const item = Storage.getPersonalEvents().find((entry) => entry.id === row.dataset.id);
    if (!item) return;
    if (button.dataset.eventAction === 'edit') {
      prepareForm(item);
      els.title.focus();
    } else if (button.dataset.eventAction === 'delete') {
      if (await TabyarUI.confirm(I18n.t('personalEventDeleteConfirm'), { danger: true })) {
        await Storage.deletePersonalEvent(item.id);
        render();
        CalendarUI.refresh();
      }
    }
  }

  function getEventsForGregorian(g) {
    const found = [];
    for (const event of Storage.getPersonalEvents()) {
      const calendarDate = toCalendarDate(g, event.calendarType);
      if (calendarDate.month === event.month && calendarDate.day === event.day && (event.annually || calendarDate.year === event.year)) {
        found.push({ title: event.title, type: 'personal' });
      }
    }
    return found;
  }

  function hasEvent(g) {
    return getEventsForGregorian(g).length > 0;
  }

  function openFromCommand() {
    open();
  }

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
  }

  return { init, render, getEventsForGregorian, hasEvent, open: openFromCommand, nextOccurrence };
})();
