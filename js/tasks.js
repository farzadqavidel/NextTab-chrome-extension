const TasksUI = (() => {
  const DEFAULT_FOCUS_MS = 25 * 60 * 1000;
  const DEFAULT_BREAK_MS = 5 * 60 * 1000;
  const MINUTE_MS = 60 * 1000;
  const MAX_DURATION_MINUTES = (999 * 24 * 60) + (23 * 60) + 59;
  const MAX_DURATION_MS = MAX_DURATION_MINUTES * MINUTE_MS;
  const TASK_WEEKDAYS = [
    { short: 'ش', full: 'شنبه' },
    { short: 'ی', full: 'یکشنبه' },
    { short: 'د', full: 'دوشنبه' },
    { short: 'س', full: 'سه‌شنبه' },
    { short: 'چ', full: 'چهارشنبه' },
    { short: 'پ', full: 'پنج‌شنبه' },
    { short: 'ج', full: 'جمعه' }
  ];

  let timer = null;
  let finishing = false;
  let viewYear = 0;
  let viewMonth = 0;
  let draftDueDate = null;
  const els = {};

  function init() {
    els.form = document.getElementById('task-form');
    els.input = document.getElementById('task-input');
    els.due = document.getElementById('task-due-date');
    els.dueButton = document.getElementById('btn-task-due-date');
    els.dueLabel = document.getElementById('task-due-date-label');
    els.todayDate = document.getElementById('tasks-today-date');
    els.list = document.getElementById('task-list');
    els.summary = document.getElementById('tasks-summary');
    els.progress = document.getElementById('task-progress-fill');
    els.progressText = document.getElementById('task-progress-text');
    els.timer = document.getElementById('focus-timer');
    els.phase = document.getElementById('focus-phase');
    els.toggle = document.getElementById('btn-focus-toggle');
    els.reset = document.getElementById('btn-focus-reset');
    els.configButton = document.getElementById('btn-focus-config');
    els.sessions = document.getElementById('focus-sessions');

    if (!els.form) return;
    initDatePicker();
    initFocusConfig();
    els.form.addEventListener('submit', handleSubmit);
    els.list.addEventListener('click', handleTaskAction);
    els.toggle.addEventListener('click', toggleFocus);
    els.reset.addEventListener('click', resetFocus);
    document.addEventListener('visibilitychange', renderFocus);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && els.configModal && !els.configModal.classList.contains('hidden')) {
        event.preventDefault();
        closeFocusConfig();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        toggleFocus();
      }
    });
    render();
    renderFocus();
    timer = setInterval(renderFocus, 1000);
  }

  function todayKey() {
    return Locale.formatDateISO(new Date());
  }

  function todayGregorian() {
    return Storage.getTodayGregorian();
  }

  function parseGregorianIso(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
    return { year, month, day };
  }

  function toIsoDate(gregorian) {
    if (!gregorian || !Number.isInteger(gregorian.year) || !Number.isInteger(gregorian.month) || !Number.isInteger(gregorian.day)) return '';
    return `${gregorian.year}-${String(gregorian.month).padStart(2, '0')}-${String(gregorian.day).padStart(2, '0')}`;
  }

  function jalaliFromIso(value) {
    const gregorian = parseGregorianIso(value);
    return gregorian ? Jalali.gregorianToJalali(gregorian.year, gregorian.month, gregorian.day) : null;
  }

  function fullJalaliDate(value) {
    const date = jalaliFromIso(value);
    return date ? Jalali.formatDate(date.year, date.month, date.day) : '';
  }

  function shortJalaliDate(value) {
    const date = jalaliFromIso(value);
    if (!date) return '';
    return `${Jalali.toPersianDigits(date.day)} ${Jalali.PERSIAN_MONTHS[date.month - 1]}`;
  }

  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = String(value ?? '');
    return node.innerHTML;
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, '&quot;');
  }

  function isOverdue(task) {
    return Boolean(task.dueDate && task.dueDate < todayKey() && !task.done);
  }

  function getDueLabel(task) {
    if (!task.dueDate) return '';
    const dateLabel = fullJalaliDate(task.dueDate);
    if (!dateLabel) return '';
    if (isOverdue(task)) return `${I18n.t('taskOverdue')} · ${dateLabel}`;
    if (task.dueDate === todayKey()) return `${I18n.t('taskDueToday')} · ${dateLabel}`;
    return dateLabel;
  }

  function sortTasks(tasks) {
    return [...tasks].sort((a, b) => {
      if (Boolean(a.done) !== Boolean(b.done)) return Number(a.done) - Number(b.done);
      if (!a.done && a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (!a.done && a.dueDate && !b.dueDate) return -1;
      if (!a.done && !a.dueDate && b.dueDate) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }

  function renderTodayDate() {
    if (!els.todayDate) return;
    const gregorian = todayGregorian();
    const jalali = Jalali.gregorianToJalali(gregorian.year, gregorian.month, gregorian.day);
    const shortDate = shortJalaliDate(toIsoDate(gregorian));
    els.todayDate.textContent = shortDate;
    els.todayDate.title = Jalali.formatDate(jalali.year, jalali.month, jalali.day);
    els.todayDate.setAttribute('aria-label', `${I18n.t('taskTodayDateAria')}: ${els.todayDate.title}`);
  }

  function syncDueDateButton() {
    if (!els.dueButton || !els.dueLabel) return;
    const shortDate = shortJalaliDate(els.due.value);
    const fullDate = fullJalaliDate(els.due.value);
    const selected = Boolean(shortDate && fullDate);
    els.dueButton.classList.toggle('has-date', selected);
    els.dueLabel.textContent = selected ? shortDate : I18n.t('taskDueUnset');
    const accessibleLabel = selected ? `${I18n.t('taskDateLabel')}: ${fullDate}` : I18n.t('taskDateLabel');
    els.dueButton.title = accessibleLabel;
    els.dueButton.setAttribute('aria-label', accessibleLabel);
  }

  function render() {
    if (!els.list) return;
    const tasks = Storage.getTasks();
    const completed = tasks.filter((task) => task.done).length;
    const total = tasks.length;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    els.summary.textContent = I18n.t('taskCount', { completed: I18n.formatDigits(completed), total: I18n.formatDigits(total) });
    els.progressText.textContent = total ? I18n.t('taskProgress', { percent: I18n.formatDigits(percent) }) : I18n.t('taskNoPlan');
    els.progress.style.width = `${percent}%`;
    els.progress.parentElement.setAttribute('aria-valuenow', String(percent));
    renderTodayDate();
    syncDueDateButton();

    const sorted = sortTasks(tasks);
    if (!sorted.length) {
      els.list.innerHTML = `<li class="tasks-empty"><span class="tasks-empty-icon" aria-hidden="true">✦</span><span>${I18n.t('taskEmpty')}</span></li>`;
      return;
    }
    els.list.innerHTML = sorted.map((task) => {
      const due = getDueLabel(task);
      const dueClass = isOverdue(task) ? ' overdue' : '';
      return `<li class="task-row${task.done ? ' is-done' : ''}" data-id="${escapeAttr(task.id)}">
        <button type="button" class="task-check" data-task-action="toggle" aria-label="${task.done ? I18n.t('taskMarkUndone') : I18n.t('taskMarkDone')}" aria-pressed="${Boolean(task.done)}">${task.done ? '✓' : ''}</button>
        <span class="task-row-copy"><span class="task-row-title">${escapeHtml(task.title)}</span>${due ? `<small class="task-due${dueClass}">${escapeHtml(due)}</small>` : ''}</span>
        <button type="button" class="task-delete" data-task-action="delete" aria-label="${I18n.t('delete')}" title="${I18n.t('delete')}">×</button>
      </li>`;
    }).join('');
  }

  function initDatePicker() {
    els.dateModal = document.getElementById('modal-task-date');
    els.dateMonth = document.getElementById('task-date-month');
    els.dateYear = document.getElementById('task-date-year');
    els.dateDays = document.getElementById('task-date-days');
    els.dateWeekdays = document.getElementById('task-date-weekdays');
    els.dateSelected = document.getElementById('task-date-selected');
    els.dateApply = document.getElementById('btn-task-date-apply');
    els.dateToday = document.getElementById('btn-task-date-today');
    els.dateClear = document.getElementById('btn-task-date-clear');
    if (!els.dateModal || !els.dueButton) return;

    els.dateWeekdays.innerHTML = TASK_WEEKDAYS.map(({ short, full }) =>
      `<span title="${full}">${short}</span>`
    ).join('');
    els.dueButton.addEventListener('click', openDatePicker);
    document.getElementById('task-date-prev')?.addEventListener('click', () => navigatePickerMonth(-1));
    document.getElementById('task-date-next')?.addEventListener('click', () => navigatePickerMonth(1));
    els.dateDays.addEventListener('click', handlePickerDayClick);
    els.dateToday.addEventListener('click', selectTodayInPicker);
    els.dateClear.addEventListener('click', clearDueDate);
    els.dateApply.addEventListener('click', applyDueDate);
    els.dateModal.addEventListener('click', (event) => {
      if (event.target === els.dateModal) {
        closeDatePicker();
        return;
      }
      if (event.target.closest('[data-close="modal-task-date"]')) closeDatePicker();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !els.dateModal.classList.contains('hidden')) {
        event.preventDefault();
        closeDatePicker();
      }
    });
  }

  function openDatePicker() {
    const gregorianToday = todayGregorian();
    const today = Jalali.gregorianToJalali(gregorianToday.year, gregorianToday.month, gregorianToday.day);
    draftDueDate = jalaliFromIso(els.due.value);
    const initial = draftDueDate || today;
    viewYear = initial.year;
    viewMonth = initial.month;
    renderDatePicker();
    els.dateModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      const selected = els.dateDays.querySelector('.is-selected');
      (selected || els.dateModal.querySelector('.task-date-nav-btn'))?.focus();
    });
  }

  function navigatePickerMonth(delta) {
    viewMonth += delta;
    if (viewMonth > 12) {
      viewMonth = 1;
      viewYear += 1;
    } else if (viewMonth < 1) {
      viewMonth = 12;
      viewYear -= 1;
    }
    renderDatePicker();
  }

  function renderDatePicker() {
    if (!els.dateDays || !viewYear || !viewMonth) return;
    els.dateMonth.textContent = Jalali.PERSIAN_MONTHS[viewMonth - 1];
    els.dateYear.textContent = Jalali.toPersianDigits(viewYear);

    const monthDays = Jalali.getMonthDays(viewYear, viewMonth);
    const leadingEmptyDays = (monthDays[0].weekday + 1) % 7;
    const gregorianToday = todayGregorian();
    const today = Jalali.gregorianToJalali(gregorianToday.year, gregorianToday.month, gregorianToday.day);
    const cells = Array.from({ length: leadingEmptyDays }, () => '<span class="task-date-empty" aria-hidden="true"></span>');
    monthDays.forEach(({ day }) => {
      const isToday = today.year === viewYear && today.month === viewMonth && today.day === day;
      const isSelected = draftDueDate?.year === viewYear && draftDueDate?.month === viewMonth && draftDueDate?.day === day;
      const dateLabel = Jalali.formatDate(viewYear, viewMonth, day);
      const classes = ['task-date-day', isToday ? 'is-today' : '', isSelected ? 'is-selected' : ''].filter(Boolean).join(' ');
      cells.push(`<button type="button" class="${classes}" data-task-date-day="${day}" aria-label="${escapeAttr(dateLabel)}" aria-pressed="${Boolean(isSelected)}">${Jalali.toPersianDigits(day)}</button>`);
    });
    els.dateDays.innerHTML = cells.join('');
    els.dateSelected.textContent = draftDueDate
      ? Jalali.formatDate(draftDueDate.year, draftDueDate.month, draftDueDate.day)
      : I18n.t('taskDateNoSelection');
    els.dateApply.disabled = !draftDueDate;
  }

  function handlePickerDayClick(event) {
    const button = event.target.closest('[data-task-date-day]');
    if (!button) return;
    draftDueDate = { year: viewYear, month: viewMonth, day: Number(button.dataset.taskDateDay) };
    renderDatePicker();
    els.dateDays.querySelector('.is-selected')?.focus();
  }

  function selectTodayInPicker() {
    const gregorian = todayGregorian();
    draftDueDate = Jalali.gregorianToJalali(gregorian.year, gregorian.month, gregorian.day);
    viewYear = draftDueDate.year;
    viewMonth = draftDueDate.month;
    renderDatePicker();
    els.dateDays.querySelector('.is-selected')?.focus();
  }

  function applyDueDate() {
    if (!draftDueDate) return;
    const gregorian = Jalali.jalaliToGregorian(draftDueDate.year, draftDueDate.month, draftDueDate.day);
    els.due.value = toIsoDate(gregorian);
    syncDueDateButton();
    closeDatePicker();
  }

  function clearDueDate() {
    els.due.value = '';
    syncDueDateButton();
    closeDatePicker();
  }

  function closeDatePicker() {
    if (!els.dateModal) return;
    els.dateModal.classList.add('hidden');
    els.dueButton?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const title = els.input.value.trim();
    if (!title) return;
    await Storage.addTask({ title, dueDate: els.due.value });
    els.form.reset();
    syncDueDateButton();
    els.input.focus();
    render();
  }

  async function handleTaskAction(event) {
    const button = event.target.closest('[data-task-action]');
    if (!button) return;
    const row = button.closest('.task-row');
    const task = Storage.getTasks().find((item) => item.id === row?.dataset.id);
    if (!task) return;
    if (button.dataset.taskAction === 'toggle') {
      await Storage.updateTask(task.id, {
        done: !task.done,
        completedAt: task.done ? null : Date.now()
      });
    } else if (button.dataset.taskAction === 'delete') {
      await Storage.deleteTask(task.id);
    }
    render();
  }

  function initFocusConfig() {
    els.configModal = document.getElementById('modal-focus-config');
    els.configForm = document.getElementById('focus-config-form');
    els.configError = document.getElementById('focus-config-error');
    els.focusDays = document.getElementById('focus-days');
    els.focusHours = document.getElementById('focus-hours');
    els.focusMinutes = document.getElementById('focus-minutes');
    if (!els.configModal || !els.configForm || !els.configButton) return;

    els.configButton.addEventListener('click', openFocusConfig);
    els.configForm.addEventListener('submit', saveFocusConfig);
    els.configForm.querySelectorAll('.focus-duration-input').forEach((input) => {
      input.addEventListener('input', () => input.removeAttribute('aria-invalid'));
    });
    els.configModal.addEventListener('click', (event) => {
      if (event.target === els.configModal || event.target.closest('[data-close="modal-focus-config"]')) {
        closeFocusConfig();
      }
    });
  }

  function getConfiguredDuration(phase) {
    const fallback = phase === 'focus' ? DEFAULT_FOCUS_MS : DEFAULT_BREAK_MS;
    const key = phase === 'focus' ? 'focusMs' : 'breakMs';
    const stored = Number(Storage.getSettings().focusDurations?.[key]);
    return Number.isSafeInteger(stored) && stored >= MINUTE_MS && stored <= MAX_DURATION_MS && stored % MINUTE_MS === 0
      ? stored
      : fallback;
  }

  function durationToParts(durationMs) {
    const totalMinutes = Math.min(MAX_DURATION_MINUTES, Math.max(1, Math.floor(durationMs / MINUTE_MS)));
    return {
      days: Math.floor(totalMinutes / (24 * 60)),
      hours: Math.floor((totalMinutes % (24 * 60)) / 60),
      minutes: totalMinutes % 60
    };
  }

  function writeDurationFields(phase, durationMs) {
    const parts = durationToParts(durationMs);
    ['days', 'hours', 'minutes'].forEach((unit) => {
      const input = els[`${phase}${unit[0].toUpperCase()}${unit.slice(1)}`];
      if (input) {
        input.value = String(parts[unit]);
        input.removeAttribute('aria-invalid');
      }
    });
  }

  function openFocusConfig() {
    if (!els.configModal) return;
    writeDurationFields('focus', getConfiguredDuration('focus'));
    els.configError?.classList.add('hidden');
    els.configModal.classList.remove('hidden');
    requestAnimationFrame(() => els.focusDays?.focus());
  }

  function closeFocusConfig() {
    if (!els.configModal) return;
    els.configModal.classList.add('hidden');
    els.configButton?.focus();
  }

  function readDurationFields(phase) {
    const inputKeys = ['days', 'hours', 'minutes'];
    const limits = { days: 999, hours: 23, minutes: 59 };
    const values = {};
    let invalid = false;
    inputKeys.forEach((unit) => {
      const input = els[`${phase}${unit[0].toUpperCase()}${unit.slice(1)}`];
      const raw = input?.value?.trim() ?? '';
      const value = raw === '' ? 0 : Number(raw);
      const bad = !Number.isInteger(value) || value < 0 || value > limits[unit];
      input?.setAttribute('aria-invalid', String(bad));
      if (bad) invalid = true;
      values[unit] = bad ? 0 : value;
    });

    const totalMinutes = (values.days * 24 * 60) + (values.hours * 60) + values.minutes;
    if (invalid || !Number.isSafeInteger(totalMinutes) || totalMinutes < 1 || totalMinutes > MAX_DURATION_MINUTES) {
      if (!invalid) inputKeys.forEach((unit) => {
        els[`${phase}${unit[0].toUpperCase()}${unit.slice(1)}`]?.setAttribute('aria-invalid', 'true');
      });
      return null;
    }
    return totalMinutes * MINUTE_MS;
  }

  function setFocusConfigError(show) {
    if (!els.configError) return;
    els.configError.textContent = I18n.t('focusTimerSettingsError');
    els.configError.classList.toggle('hidden', !show);
  }

  async function saveFocusConfig(event) {
    event.preventDefault();
    const focusMs = readDurationFields('focus');
    if (focusMs == null) {
      setFocusConfigError(true);
      els.configForm.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    setFocusConfigError(false);
    const state = currentFocusState();
    const running = state.running && getRemaining(state) > 0;
    const breakMs = getConfiguredDuration('break');
    const remainingMs = state.phase === 'focus' ? focusMs : breakMs;
    const currentDurations = Storage.getSettings().focusDurations || {};
    await Storage.updateSettings({
      focusDurations: { ...currentDurations, focusMs },
      focusState: {
        phase: state.phase,
        remainingMs,
        endAt: running ? Date.now() + remainingMs : 0,
        running
      }
    });
    closeFocusConfig();
    renderFocus();
  }

  function currentFocusState() {
    const state = Storage.getSettings().focusState || {};
    const phase = state.phase === 'break' ? 'break' : 'focus';
    const storedRemaining = Number(state.remainingMs);
    const remainingMs = Number.isSafeInteger(storedRemaining) && storedRemaining >= 0 && storedRemaining <= MAX_DURATION_MS
      ? storedRemaining
      : getConfiguredDuration(phase);
    return { phase, remainingMs, endAt: Number(state.endAt) || 0, running: Boolean(state.running) };
  }

  function getRemaining(state = currentFocusState()) {
    return state.running && state.endAt ? Math.max(0, state.endAt - Date.now()) : state.remainingMs;
  }

  function renderFocus() {
    if (!els.timer) return;
    const state = currentFocusState();
    const remaining = getRemaining(state);
    if (state.running && remaining <= 0) {
      finishPhase(state);
      return;
    }

    const totalSeconds = Math.ceil(remaining / 1000);
    let timerText;
    if (totalSeconds >= 24 * 60 * 60) {
      const totalMinutes = Math.ceil(totalSeconds / 60);
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const minutes = totalMinutes % 60;
      const time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      timerText = I18n.t('focusTimerDaysDisplay', {
        days: I18n.formatDigits(days),
        time: I18n.formatDigits(time)
      });
    } else {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const time = hours > 0
        ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      timerText = I18n.formatDigits(time);
    }
    els.timer.textContent = timerText;
    els.timer.setAttribute('aria-label', timerText);
    els.timer.classList.toggle('is-long', totalSeconds >= 60 * 60);
    els.phase.textContent = I18n.t(state.phase === 'focus' ? 'focusWork' : 'focusBreak');
    els.toggle.textContent = I18n.t(state.running ? 'focusPause' : 'focusStart');
    els.toggle.classList.toggle('is-running', state.running);

    const sessions = Storage.getFocusSessions();
    const count = sessions.filter((timestamp) => Locale.formatDateISO(new Date(timestamp)) === todayKey()).length;
    els.sessions.textContent = I18n.t('focusTodaySessions', { n: I18n.formatDigits(count) });
  }

  async function toggleFocus() {
    const state = currentFocusState();
    if (state.running) {
      const remainingMs = getRemaining(state);
      await Storage.updateSettings({ focusState: { phase: state.phase, remainingMs, endAt: 0, running: false } });
    } else {
      const remainingMs = state.remainingMs > 0 ? state.remainingMs : getConfiguredDuration(state.phase);
      await Storage.updateSettings({ focusState: { phase: state.phase, remainingMs, endAt: Date.now() + remainingMs, running: true } });
    }
    renderFocus();
  }

  async function resetFocus() {
    const focusMs = getConfiguredDuration('focus');
    await Storage.updateSettings({ focusState: { phase: 'focus', remainingMs: focusMs, endAt: 0, running: false } });
    renderFocus();
  }

  async function finishPhase(state) {
    if (finishing) return;
    finishing = true;
    try {
      if (state.phase === 'focus') {
        await Storage.addFocusSession(Date.now());
        const breakMs = getConfiguredDuration('break');
        await Storage.updateSettings({ focusState: { phase: 'break', remainingMs: breakMs, endAt: 0, running: false } });
        if (!document.hidden) TabyarUI.alert(I18n.t('focusComplete'), { type: 'success' });
      } else {
        const focusMs = getConfiguredDuration('focus');
        await Storage.updateSettings({ focusState: { phase: 'focus', remainingMs: focusMs, endAt: 0, running: false } });
        if (!document.hidden) TabyarUI.alert(I18n.t('breakComplete'), { type: 'info' });
      }
      renderFocus();
    } finally {
      finishing = false;
    }
  }

  async function createTask(title) {
    const task = await Storage.addTask({ title });
    render();
    return task;
  }

  function focusInput() {
    els.input?.focus();
  }

  function focusTask(id) {
    const row = [...(els.list?.querySelectorAll('.task-row') || [])].find((item) => item.dataset.id === id);
    if (!row) return focusInput();
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('task-highlight');
    setTimeout(() => row.classList.remove('task-highlight'), 1800);
  }

  return { init, render, createTask, focusInput, focusTask, toggleFocus, renderFocus };
})();
