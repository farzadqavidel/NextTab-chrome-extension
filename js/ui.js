const TabyarUI = (() => {
  let confirmResolve = null;
  let confirmOverlay = null;
  let confirmMessage = null;
  let confirmOk = null;
  let confirmCancel = null;
  let toastContainer = null;

  const TOAST_DURATION = 5000;

  const TOAST_ICONS = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  function init() {
    confirmOverlay = document.getElementById('modal-confirm');
    confirmMessage = document.getElementById('confirm-message');
    confirmOk = document.getElementById('confirm-ok');
    confirmCancel = document.getElementById('confirm-cancel');
    toastContainer = document.getElementById('toast-container');

    confirmOk.addEventListener('click', () => closeConfirm(true));
    confirmCancel.addEventListener('click', () => closeConfirm(false));
    confirmOverlay.addEventListener('click', (e) => {
      if (e.target === confirmOverlay) closeConfirm(false);
    });

    document.addEventListener('keydown', (e) => {
      if (confirmOverlay.classList.contains('hidden')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeConfirm(false);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        closeConfirm(true);
      }
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function formatMessage(text) {
    return text
      .split('\n\n')
      .map((paragraph) => `<p>${paragraph.split('\n').map((line) => escapeHtml(line)).join('<br>')}</p>`)
      .join('');
  }

  function confirm(message, options = {}) {
    if (confirmResolve) closeConfirm(false);

    const { title, danger = false, confirmText, cancelText } = options;

    document.getElementById('confirm-title').textContent = title || I18n.t('confirmTitle');
    confirmMessage.innerHTML = formatMessage(message);
    confirmOk.textContent = confirmText || I18n.t('confirmAction');
    confirmCancel.textContent = cancelText || I18n.t('cancel');

    confirmOk.classList.toggle('btn-danger', danger);
    confirmOk.classList.toggle('btn-primary', !danger);

    const iconEl = document.getElementById('confirm-icon');
    iconEl.className = `confirm-icon ${danger ? 'confirm-icon-danger' : 'confirm-icon-info'}`;
    iconEl.innerHTML = danger
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    confirmOverlay.classList.remove('hidden');
    confirmCancel.focus();

    return new Promise((resolve) => {
      confirmResolve = resolve;
    });
  }

  function closeConfirm(result) {
    if (!confirmResolve) return;
    confirmOverlay.classList.add('hidden');
    const resolve = confirmResolve;
    confirmResolve = null;
    resolve(result);
  }

  function toast(message, options = {}) {
    const type = options.type || 'info';
    const duration = options.duration ?? TOAST_DURATION;

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `
      <span class="toast-icon" aria-hidden="true">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
      <span class="toast-text">${escapeHtml(message)}</span>
      <span class="toast-progress"></span>
    `;

    toastContainer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast-visible'));

    const progress = el.querySelector('.toast-progress');
    progress.style.animationDuration = `${duration}ms`;

    const remove = () => {
      if (!el.isConnected) return;
      el.classList.remove('toast-visible');
      el.classList.add('toast-hiding');
      el.addEventListener('transitionend', () => el.remove(), { once: true });
      setTimeout(() => el.remove(), 500);
    };

    setTimeout(remove, duration);
  }

  function alert(message, options = {}) {
    let type = options.type || 'info';
    if (options.error) type = 'error';
    if (options.success) type = 'success';
    toast(message, { ...options, type });
  }

  return { init, confirm, toast, alert };
})();
