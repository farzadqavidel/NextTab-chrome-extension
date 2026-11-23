(() => {
  if (window.top !== window || !document.documentElement) return;
  if (!/^https?:$/.test(location.protocol) && location.protocol !== 'file:') return;
  if (window.__tabyarFloatingBookmarkInjected) return;
  window.__tabyarFloatingBookmarkInjected = true;

  const BUTTON_SIZE = 52;
  const EDGE_GAP = 12;
  const PEEK_SIZE = BUTTON_SIZE / 2;
  const POSITION_KEY = 'tabyarFloatingBookmarkPosition';
  const THEME_ACCENTS = {
    midnight: '#6366f1', ocean: '#06b6d4', forest: '#22c55e', lavender: '#a78bfa',
    sunset: '#fb7185', crimson: '#ef4444', amber: '#f59e0b', emerald: '#10b981',
    rose: '#ec4899', slate: '#94a3b8', coffee: '#c08457', cyberpunk: '#f0f'
  };

  const host = document.createElement('div');
  host.id = 'tabyar-floating-bookmark-host';
  host.style.cssText = 'all:initial!important;position:fixed!important;left:auto!important;right:-26px!important;top:auto!important;bottom:22px!important;width:52px!important;height:52px!important;transform:none!important;z-index:2147483647!important;display:block!important;visibility:visible!important;overflow:visible!important;pointer-events:auto!important;';
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `
    <style>
      :host{all:initial}
      *{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
      .wrap{position:relative;width:52px;height:52px;overflow:visible}
      button{all:unset;position:absolute;inset:0;box-sizing:border-box;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;cursor:grab;color:#fff;background:linear-gradient(145deg,color-mix(in srgb,var(--tabyar-accent,#38bdf8) 78%,#fff),var(--tabyar-accent,#38bdf8));border:1px solid rgba(255,255,255,.48);box-shadow:0 5px 18px color-mix(in srgb,var(--tabyar-accent,#38bdf8) 42%,transparent),inset 0 1px 0 rgba(255,255,255,.35);opacity:.62;transform:translateX(0);transition:transform .22s cubic-bezier(.2,.75,.25,1),opacity .2s ease,background .2s ease,box-shadow .2s ease;outline:none;touch-action:none;user-select:none;-webkit-tap-highlight-color:transparent}
      button.saved{background:linear-gradient(145deg,color-mix(in srgb,var(--tabyar-accent,#38bdf8) 62%,#fff),color-mix(in srgb,var(--tabyar-accent,#38bdf8) 86%,#000))}
      :host([data-side="right"]:hover) button,:host([data-side="right"]:focus-within) button{opacity:1;transform:translateX(-26px);box-shadow:0 9px 25px rgba(24,18,60,.42),inset 0 1px 0 rgba(255,255,255,.45)}
      :host([data-side="left"]:hover) button,:host([data-side="left"]:focus-within) button{opacity:1;transform:translateX(26px);box-shadow:0 9px 25px rgba(24,18,60,.42),inset 0 1px 0 rgba(255,255,255,.45)}
      :host(.dragging) button{opacity:1!important;transform:none!important;transition:none!important;cursor:grabbing;box-shadow:0 12px 30px rgba(24,18,60,.48),inset 0 1px 0 rgba(255,255,255,.5)}
      button:active{filter:brightness(1.08)}
      button:focus-visible{outline:3px solid #facc15;outline-offset:3px}
      button[disabled]{cursor:wait;opacity:.78}
      .icon{width:23px;height:23px;display:grid;place-items:center;opacity:0;transform:translateX(5px);transition:opacity .16s ease,transform .22s cubic-bezier(.2,.75,.25,1);pointer-events:none}
      .icon svg{width:23px;height:23px;display:block}
      :host(:hover) .icon,:host(:focus-within) .icon,:host(.dragging) .icon{opacity:1;transform:translateX(0)}
      .toast{position:absolute;right:86px;top:50%;transform:translateY(-50%);width:max-content;max-width:min(270px,70vw);padding:9px 12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:rgba(15,20,34,.97);color:#fff;font-size:12px;line-height:1.55;box-shadow:0 8px 26px rgba(0,0,0,.34);opacity:0;pointer-events:none;transition:opacity .18s ease;white-space:normal;text-align:start;z-index:2}
      :host([data-side="left"]) .toast{left:86px;right:auto}
      .toast.visible{opacity:1}
      :host(.dragging) .toast{opacity:0}
      .picker{position:absolute;bottom:calc(100% + 12px);left:50%;transform:translateX(-50%) translateY(6px);min-width:216px;max-width:min(280px,76vw);max-height:min(330px,64vh);overflow-y:auto;display:none;padding:8px;border:1px solid rgba(255,255,255,.16);border-radius:15px;background:rgba(13,18,31,.97);color:#fff;box-shadow:0 18px 46px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.12);z-index:4;direction:auto}
      .picker.open{display:block;animation:pickerIn .18s cubic-bezier(.2,.75,.25,1)}
      @keyframes pickerIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      .picker-title{font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5);padding:2px 9px 7px;border-bottom:1px solid rgba(255,255,255,.1);margin-bottom:6px}
      .picker-item{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border:none;border-radius:10px;background:transparent;color:#fff;font:inherit;font-size:13px;line-height:1.4;cursor:pointer;text-align:start;transition:background .12s ease,color .12s ease}
      .picker-item svg{width:17px;height:17px;flex-shrink:0;opacity:.9}
      .picker-item:hover,.picker-item:focus-visible{background:rgba(255,255,255,.13);outline:none}
      .picker-item .picker-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .picker-item.root{color:#a5f3d0}
      .picker-sep{height:1px;background:rgba(255,255,255,.1);margin:6px 4px}
      @media(prefers-reduced-motion:reduce){button,.icon,.toast{transition:none}.picker.open{animation:none;transform:translateX(-50%)}}
    </style>
    <div class="wrap" dir="auto">
      <button id="toggle" type="button" aria-label="افزودن به بوکمارک‌های تب‌یار" aria-pressed="false" aria-haspopup="true" aria-expanded="false">
        <span class="icon" id="icon" aria-hidden="true"></span>
      </button>
      <span class="toast" id="toast" role="status" aria-live="polite" aria-hidden="true" dir="auto"></span>
      <div class="picker" id="picker" role="menu" aria-hidden="true" aria-label=""></div>
    </div>`;

  const button = shadow.getElementById('toggle');
  const icon = shadow.getElementById('icon');
  const toast = shadow.getElementById('toast');
  const picker = shadow.getElementById('picker');
  let foldersState = [];
  let lang = 'fa';
  let isSaved = false;
  let savedFolderId = 'default';
  let savedFolderName = '';
  let savedFolderIsDefault = true;
  let savedChromeMode = false;
  let position = { side: 'right', topRatio: 1 };
  let toastTimer = null;
  let toastIsAction = false;
  let pointerHover = false;
  let keyboardFocus = false;
  let dragState = null;
  let suppressClick = false;
  let suppressClickTimer = null;

  const plusIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const savedIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  const labels = {
    fa: {
      add: 'افزودن به بوکمارک‌های تب‌یار',
      remove: 'حذف از بوکمارک‌های تب‌یار',
      added: 'به بوکمارک‌های تب‌یار اضافه شد ✓',
      removed: 'از بوکمارک‌های تب‌یار حذف شد',
      failed: 'ذخیره انجام نشد؛ دوباره تلاش کنید',
      unsupported: 'این نوع صفحه قابل ذخیره نیست',
      saving: 'در حال ذخیره…',
      notSaved: 'هنوز ذخیره نشده؛ برای افزودن کلیک کنید. برای جابه‌جایی بکشید.',
      savedHome: 'این صفحه از قبل در صفحهٔ اصلی بوکمارک شده؛ کلیک برای حذف، کشیدن برای جابه‌جایی.',
      savedFolder: 'این صفحه در پوشهٔ «{folder}» وجود دارد؛ کلیک برای حذف، کشیدن برای جابه‌جایی.',
      aFolder: 'یک پوشه',
      savedChromeRootStatus: 'این صفحه در نوار بوکمارک‌های کروم وجود دارد؛ کلیک برای حذف، کشیدن برای جابه‌جایی.',
      pickerTitle: 'کجای دیگری ذخیره شود؟',
      pickerRoot: 'بیرون از پوشه‌ها (صفحهٔ اصلی)',
      pickerRootChrome: 'بیرون از پوشه‌ها (نوار بوکمارک‌های کروم)',
      savedRootAction: 'خارج از پوشه‌ها و در صفحهٔ اصلی ذخیره شد ✓',
      savedChromeRootAction: 'در نوار بوکمارک‌های کروم ذخیره شد ✓',
      savedFolderAction: 'در پوشهٔ «{folder}» ذخیره شد ✓',
      failedFolder: 'ذخیره انجام نشد؛ دوباره تلاش کنید',
      removedFromHomeAction: 'از صفحهٔ اصلی حذف شد',
      removedFromChromeRootAction: 'از نوار بوکمارک‌های کروم حذف شد',
      removedFromFolderAction: 'از پوشهٔ «{folder}» حذف شد'
    },
    en: {
      add: 'Add to NextTab bookmarks',
      remove: 'Remove from NextTab bookmarks',
      added: 'Added to NextTab bookmarks ✓',
      removed: 'Removed from NextTab bookmarks',
      failed: 'Could not update. Please try again.',
      unsupported: 'This page cannot be saved',
      saving: 'Updating…',
      notSaved: 'Not saved yet. Click to add, or drag to move this button.',
      savedHome: 'Already in Home. Click to remove, or drag to move this button.',
      savedFolder: 'Already in “{folder}”. Click to remove, or drag to move this button.',
      aFolder: 'a folder',
      savedChromeRootStatus: 'Already in the Chrome Bookmarks bar. Click to remove, or drag to move this button.',
      pickerTitle: 'Where should this be saved?',
      pickerRoot: 'Outside all folders (Home)',
      pickerRootChrome: 'Outside all folders (Chrome Bookmarks bar)',
      savedRootAction: 'Saved outside all folders (Home) ✓',
      savedChromeRootAction: 'Saved to the Chrome Bookmarks bar ✓',
      savedFolderAction: 'Saved in “{folder}” ✓',
      failedFolder: 'Could not save. Please try again.',
      removedFromHomeAction: 'Removed from Home',
      removedFromChromeRootAction: 'Removed from the Chrome Bookmarks bar',
      removedFromFolderAction: 'Removed from “{folder}”'
    }
  };

  function t(key) { return labels[lang][key] || labels.fa[key]; }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizePosition(value) {
    const side = value?.side === 'left' ? 'left' : 'right';
    const ratio = Number(value?.topRatio);
    return { side, topRatio: Number.isFinite(ratio) ? clamp(ratio, 0, 1) : 1 };
  }

  function topFromRatio(ratio) {
    const minTop = EDGE_GAP;
    const maxTop = Math.max(minTop, window.innerHeight - BUTTON_SIZE - EDGE_GAP);
    return minTop + (maxTop - minTop) * clamp(ratio, 0, 1);
  }

  function ratioFromTop(top) {
    const minTop = EDGE_GAP;
    const maxTop = Math.max(minTop, window.innerHeight - BUTTON_SIZE - EDGE_GAP);
    return maxTop === minTop ? 0 : clamp((top - minTop) / (maxTop - minTop), 0, 1);
  }

  function applyPosition() {
    const top = Math.round(topFromRatio(position.topRatio));
    host.dataset.side = position.side;
    host.style.setProperty('top', `${top}px`, 'important');
    host.style.setProperty('bottom', 'auto', 'important');
    host.style.setProperty('left', position.side === 'left' ? `-${PEEK_SIZE}px` : 'auto', 'important');
    host.style.setProperty('right', position.side === 'right' ? `-${PEEK_SIZE}px` : 'auto', 'important');
  }

  function setDragHostPosition(left, top) {
    const maxLeft = Math.max(0, window.innerWidth - BUTTON_SIZE);
    const maxTop = Math.max(EDGE_GAP, window.innerHeight - BUTTON_SIZE - EDGE_GAP);
    const safeLeft = clamp(left, 0, maxLeft);
    const safeTop = clamp(top, EDGE_GAP, maxTop);
    host.dataset.side = 'drag';
    host.style.setProperty('left', `${Math.round(safeLeft)}px`, 'important');
    host.style.setProperty('right', 'auto', 'important');
    host.style.setProperty('top', `${Math.round(safeTop)}px`, 'important');
    host.style.setProperty('bottom', 'auto', 'important');
    return { left: safeLeft, top: safeTop };
  }

  function normalizedUrl(value) {
    try {
      const url = new URL(value);
      url.hash = '';
      if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '');
      return url.href.toLowerCase();
    } catch {
      return String(value || '').toLowerCase();
    }
  }

  function statusText() {
    if (!isSaved) return t('notSaved');
    if (savedFolderIsDefault || savedFolderId === 'default') {
      return savedChromeMode ? t('savedChromeRootStatus') : t('savedHome');
    }
    return t('savedFolder').replace('{folder}', savedFolderName || t('aFolder'));
  }

  function hasAttention() {
    return pointerHover || keyboardFocus;
  }

  function refreshHoverMessage() {
    if (toastIsAction) return;
    if (hasAttention()) {
      toast.textContent = statusText();
      toast.classList.add('visible');
      toast.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-description', statusText());
    } else {
      toast.classList.remove('visible');
      toast.setAttribute('aria-hidden', 'true');
    }
  }

  function updateVisualState() {
    icon.innerHTML = isSaved ? savedIcon : plusIcon;
    button.classList.toggle('saved', isSaved);
    button.setAttribute('aria-pressed', String(isSaved));
    button.setAttribute('aria-label', t(isSaved ? 'remove' : 'add'));
    button.setAttribute('aria-description', statusText());
    refreshHoverMessage();
  }

  function showToast(text) {
    toast.textContent = text;
    toast.classList.add('visible');
    toast.setAttribute('aria-hidden', 'false');
    toastIsAction = true;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastIsAction = false;
      refreshHoverMessage();
    }, 2300);
  }

  function folderIconSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7a2 2 0 0 1 2-2h4l2 2.5h6a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/></svg>';
  }
  const rootIconSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7"/><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9"/></svg>';

  function pickerLabelFor(folder) {
    return String(folder?.name || t('aFolder')) || t('aFolder');
  }

  function removedMessage(response) {
    if (response?.folderChromeMode && response?.folderIsDefault) return t('removedFromChromeRootAction');
    if (response?.folderIsDefault) return t('removedFromHomeAction');
    if (response?.folderName) return t('removedFromFolderAction').replace('{folder}', response.folderName);
    return t('removed');
  }

  function renderFolderPicker() {
    const folders = Array.isArray(foldersState) ? foldersState.filter((folder) => folder && !folder.isDefault && !folder.isChromeRoot && folder.id !== 'default') : [];
    const html = [
      `<div class="picker-title">${t('pickerTitle')}</div>`,
      `<button type="button" class="picker-item root" role="menuitem" data-folder-id="default">${rootIconSvg}<span class="picker-name">${escapeHtml(t(savedChromeMode ? 'pickerRootChrome' : 'pickerRoot'))}</span></button>`,
      folders.length ? '<div class="picker-sep" aria-hidden="true"></div>' : '',
      ...folders.map((folder) => `<button type="button" class="picker-item" role="menuitem" data-folder-id="${escapeHtml(folder.id)}">${folderIconSvg()}<span class="picker-name">${escapeHtml(pickerLabelFor(folder))}</span></button>`)
    ];
    picker.innerHTML = html.join('');
    picker.querySelectorAll('.picker-item').forEach((item) => {
      item.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        chooseFolder(item.dataset.folderId);
      });
    });
  }

  function openFolderPicker() {
    renderFolderPicker();
    picker.setAttribute('aria-label', t('pickerTitle'));
    picker.classList.add('open');
    picker.setAttribute('aria-hidden', 'false');
    button.setAttribute('aria-expanded', 'true');
    toast.classList.remove('visible');
    toast.setAttribute('aria-hidden', 'true');
    const first = picker.querySelector('.picker-item');
    if (first) first.focus();
  }

  function closeFolderPicker({ returnFocus = false } = {}) {
    if (!picker.classList.contains('open')) return;
    picker.classList.remove('open');
    picker.setAttribute('aria-hidden', 'true');
    button.setAttribute('aria-expanded', 'false');
    refreshHoverMessage();
    if (returnFocus) button.focus();
  }

  function chooseFolder(folderId) {
    closeFolderPicker();
    saveToFolder(folderId === 'default' ? 'default' : String(folderId));
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  function saveToFolder(folderId) {
    button.disabled = true;
    button.setAttribute('aria-label', t('saving'));
    chrome.runtime.sendMessage({
      type: 'TABYAR_SAVE_PAGE',
      title: document.title || location.hostname,
      folderId
    }, (response) => {
      button.disabled = false;
      if (chrome.runtime.lastError || !response) {
        showToast(t('failed'));
        updateVisualState();
        return;
      }
      if (!response.ok) {
        if (response.reason === 'unsupported') showToast(t('unsupported'));
        else if (response.reason === 'folder-not-found') showToast(t('failedFolder'));
        else showToast(t('failed'));
        updateVisualState();
        return;
      }
      setStatusFromResponse(response);
      updateVisualState();
      if (response.action === 'removed') {
        showToast(t('removed'));
        return;
      }
      showToast(addedMessage(response));
    });
  }

  function addedMessage(response) {
    if (!response?.folderId) return t('added');
    if (response.folderIsDefault) {
      return response.folderChromeMode ? t('savedChromeRootAction') : t('savedRootAction');
    }
    return t('savedFolderAction').replace('{folder}', response.folderName || t('aFolder'));
  }

  function setStatusFromData(data) {
    const bookmarks = Array.isArray(data?.bookmarks) ? data.bookmarks : [];
    const currentUrl = normalizedUrl(location.href);
    const match = bookmarks.find((item) => normalizedUrl(item.url) === currentUrl);
    savedChromeMode = Boolean(data?.settings?.followChromeBookmarks);
    if (!match) {
      isSaved = false;
      savedFolderId = 'default';
      savedFolderName = '';
      savedFolderIsDefault = true;
      return;
    }

    savedFolderId = match.folderId || 'default';
    const folders = Array.isArray(data?.folders) ? data.folders : [];
    const folder = folders.find((item) => item.id === savedFolderId || (savedFolderId === 'default' && item.isDefault));
    savedFolderName = folder?.name || '';
    savedFolderIsDefault = savedFolderId === 'default' || Boolean(folder?.isDefault);
    isSaved = true;
  }

  function setStatusFromResponse(response) {
    isSaved = Boolean(response?.saved);
    savedChromeMode = Boolean(response?.folderChromeMode);
    if (!isSaved) {
      savedFolderId = 'default';
      savedFolderName = '';
      savedFolderIsDefault = true;
      savedChromeMode = false;
      return;
    }
    savedFolderId = response.folderId || 'default';
    savedFolderName = response.folderName || '';
    savedFolderIsDefault = Boolean(response.folderIsDefault) || savedFolderId === 'default';
  }

  function clearClickSuppression() {
    if (suppressClickTimer) clearTimeout(suppressClickTimer);
    suppressClickTimer = null;
    suppressClick = false;
  }

  function armClickSuppression() {
    suppressClick = true;
    clearTimeout(suppressClickTimer);
    suppressClickTimer = setTimeout(clearClickSuppression, 700);
  }

  function finishDrag(event, canceled = false) {
    if (!dragState || (event && event.pointerId !== dragState.pointerId)) return;
    const state = dragState;
    dragState = null;

    if (!canceled && state.moved) {
      const centerX = state.lastLeft + BUTTON_SIZE / 2;
      position = {
        side: centerX < window.innerWidth / 2 ? 'left' : 'right',
        topRatio: ratioFromTop(state.lastTop)
      };
      armClickSuppression();
    } else {
      position = state.originalPosition;
    }

    host.classList.remove('dragging');
    applyPosition();
    if (!canceled && state.moved) {
      chrome.storage.local.set({ [POSITION_KEY]: position }, () => { void chrome.runtime.lastError; });
    }

    try {
      if (button.hasPointerCapture(state.pointerId)) button.releasePointerCapture(state.pointerId);
    } catch { /* Pointer capture may already have been released by the browser. */ }
    updateVisualState();
  }

  function handlePointerDown(event) {
    closeFolderPicker();
    if (suppressClick) clearClickSuppression();
    if (event.button !== 0 || button.disabled || event.isPrimary === false || dragState) return;

    const rect = button.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      lastLeft: rect.left,
      lastTop: rect.top,
      originalPosition: { ...position },
      moved: false
    };
    host.classList.add('dragging');
    const point = setDragHostPosition(rect.left, rect.top);
    dragState.lastLeft = point.left;
    dragState.lastTop = point.top;
    try { button.setPointerCapture(event.pointerId); } catch { /* Capturing is optional on older browsers. */ }
  }

  function handlePointerMove(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    if (!dragState.moved) {
      const distance = Math.hypot(event.clientX - dragState.startX, event.clientY - dragState.startY);
      if (distance < 6) return;
      dragState.moved = true;
      toast.classList.remove('visible');
      toast.setAttribute('aria-hidden', 'true');
    }
    if (event.cancelable) event.preventDefault();
    const point = setDragHostPosition(event.clientX - dragState.offsetX, event.clientY - dragState.offsetY);
    dragState.lastLeft = point.left;
    dragState.lastTop = point.top;
  }

  function handlePointerUp(event) {
    finishDrag(event, false);
  }

  function handlePointerCancel(event) {
    finishDrag(event, true);
  }

  function updateSettingsFromData(state) {
    lang = state?.settings?.language === 'en' ? 'en' : 'fa';
    const theme = state?.settings?.theme || 'midnight';
    host.style.setProperty('--tabyar-accent', THEME_ACCENTS[theme] || THEME_ACCENTS.midnight);
    foldersState = Array.isArray(state?.folders) ? state.folders : [];
    host.style.setProperty('display', state?.settings?.floatingBookmarkButton === false ? 'none' : 'block', 'important');
    setStatusFromData(state);
    updateVisualState();
  }

  chrome.storage.local.get(['personalStartPage', POSITION_KEY], (result) => {
    const state = result.personalStartPage;
    updateSettingsFromData(state);
    position = normalizePosition(result[POSITION_KEY]);
    applyPosition();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local') return;
    if (changes.personalStartPage) updateSettingsFromData(changes.personalStartPage.newValue);
    if (changes[POSITION_KEY]) {
      position = normalizePosition(changes[POSITION_KEY].newValue);
      if (!dragState) applyPosition();
    }
  });

  button.addEventListener('pointerenter', () => {
    pointerHover = true;
    refreshHoverMessage();
  });
  button.addEventListener('pointerleave', () => {
    pointerHover = false;
    refreshHoverMessage();
  });
  button.addEventListener('focus', () => {
    keyboardFocus = true;
    refreshHoverMessage();
  });
  button.addEventListener('blur', () => {
    keyboardFocus = false;
    refreshHoverMessage();
  });
  button.addEventListener('pointerdown', handlePointerDown);
  button.addEventListener('pointermove', handlePointerMove);
  button.addEventListener('pointerup', handlePointerUp);
  button.addEventListener('pointercancel', handlePointerCancel);
  button.addEventListener('click', (event) => {
    if (suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      clearClickSuppression();
      return;
    }
    if (button.disabled) return;
    if (isSaved) {
      removeSavedBookmark();
      return;
    }
    if (picker.classList.contains('open')) {
      closeFolderPicker({ returnFocus: true });
      return;
    }
    openFolderPicker();
  });

  function removeSavedBookmark() {
    button.disabled = true;
    button.setAttribute('aria-label', t('saving'));
    chrome.runtime.sendMessage({
      type: 'TABYAR_SAVE_PAGE',
      title: document.title || location.hostname
    }, (response) => {
      button.disabled = false;
      if (chrome.runtime.lastError || !response) {
        showToast(t('failed'));
        updateVisualState();
        return;
      }
      if (!response.ok) {
        showToast(response.reason === 'unsupported' ? t('unsupported') : t('failed'));
        updateVisualState();
        return;
      }
      setStatusFromResponse(response);
      updateVisualState();
      showToast(response.action === 'removed' ? removedMessage(response) : t('added'));
    });
  }

  // Close the picker on Escape or on an outside press.
  document.addEventListener('pointerdown', (event) => {
    if (!picker.classList.contains('open')) return;
    if (host.contains(event.target)) return;
    closeFolderPicker();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!picker.classList.contains('open')) return;
    closeFolderPicker({ returnFocus: true });
  });

  position = normalizePosition(null);
  applyPosition();
  document.documentElement.appendChild(host);
  window.addEventListener('resize', () => {
    if (!dragState) applyPosition();
  });
})();
