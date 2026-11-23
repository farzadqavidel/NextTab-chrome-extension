const DashboardLayoutUI = (() => {
  // ── Zones ────────────────────────────────────────────────────────────────
  // Bento zone: the five dashboard cards. Only these may swap between bento slots.
  const WIDGETS = [
    { id: 'day-info-card', key: 'widgetToday' },
    { id: 'calendar-card', key: 'widgetCalendar' },
    { id: 'bookmarks-card', key: 'widgetBookmarks' },
    { id: 'notes-card', key: 'widgetNotes' },
    { id: 'tasks-card', key: 'widgetTasks' }
  ];
  // Feed zone: the full-width sections under the dashboard (sites / prices / news).
  // They may only swap among themselves.
  const FEED_WIDGETS = [
    { id: 'sites-section', key: 'sitesTitle' },
    { id: 'prices-section', key: 'pricesTitle' },
    { id: 'news-section', key: 'newsTitle' }
  ];

  // Constraint rules — the grid is fixed, so each widget may go only where it
  // belongs: the bookmarks card keeps the wide middle slot, the other four keep
  // the corner slots, and feed sections stay in the below-fold zone.
  const CORNER_SLOTS = ['slot-a', 'slot-b', 'slot-d', 'slot-e'];
  const WIDE_SLOT = 'slot-c';
  const WIDE_WIDGET_ID = 'bookmarks-card';

  const FEED_DEFAULT_ORDER = FEED_WIDGETS.map((widget) => widget.id);

  let arranging = false;
  let draggingId = null;
  // Snapshot of the state that arrange mode mutates, restored on finishArrange.
  // Each entry: { card, tabindex, draggable, inner: [{el, tabindex}] }
  let savedCardState = [];

  const $ = (id) => document.getElementById(id);
  const isFeed = (id) => FEED_WIDGETS.some((widget) => widget.id === id);

  // ── Order resolution ─────────────────────────────────────────────────────
  function getOrder() {
    const saved = Storage.getSettings().widgetOrder;
    const order = [];
    const bentoIds = new Set(WIDGETS.map((widget) => widget.id));
    if (Array.isArray(saved)) saved.forEach((id) => {
      if (bentoIds.has(id) && !order.includes(id)) order.push(id);
    });
    WIDGETS.forEach((widget) => { if (!order.includes(widget.id)) order.push(widget.id); });
    return order;
  }

  function getFeedOrder() {
    const saved = Storage.getSettings().feedOrder;
    const order = [];
    if (Array.isArray(saved)) {
      saved.forEach((id) => {
        if (FEED_WIDGETS.some((widget) => widget.id === id) && !order.includes(id)) order.push(id);
      });
    }
    FEED_WIDGETS.forEach((widget) => { if (!order.includes(widget.id)) order.push(widget.id); });
    return order;
  }

  function visibleWidgets(allIds, hiddenSet) {
    return allIds.filter((id) => !hiddenSet.has(id) && $(id) && !$(id).classList.contains('hidden'));
  }

  function hiddenWidgets() {
    const s = Storage.getSettings();
    return new Set(Array.isArray(s.hiddenWidgets) ? s.hiddenWidgets : []);
  }

  function feedHiddenIds() {
    const s = Storage.getSettings();
    const hidden = new Set();
    if (s.sitesVisible === false) hidden.add('sites-section');
    if (s.pricesVisible === false) hidden.add('prices-section');
    if (s.newsVisible === false) hidden.add('news-section');
    return hidden;
  }

  // ── Slot assignment (constraint-aware) ──────────────────────────────────
  function slotMap() {
    const visible = visibleWidgets(getOrder(), hiddenWidgets());
    const map = {};
    const hasWide = visible.includes(WIDE_WIDGET_ID);
    if (hasWide) map[WIDE_WIDGET_ID] = WIDE_SLOT;
    const regular = visible.filter((id) => id !== WIDE_WIDGET_ID);
    regular.forEach((id, index) => {
      map[id] = CORNER_SLOTS[index % CORNER_SLOTS.length];
    });
    return map;
  }

  function allowedSlots(id) {
    return id === WIDE_WIDGET_ID ? [WIDE_SLOT] : CORNER_SLOTS;
  }

  function canSwap(sourceId, targetId) {
    if (!sourceId || !targetId || sourceId === targetId) return false;
    const feedZone = isFeed(sourceId);
    if (feedZone !== isFeed(targetId)) return false;
    if (feedZone) return true; // swap anywhere inside the feed zone
    const map = slotMap();
    const slotOfSource = map[sourceId];
    const slotOfTarget = map[targetId];
    if (!slotOfSource || !slotOfTarget || slotOfSource === slotOfTarget) return false;
    return allowedSlots(sourceId).includes(slotOfTarget) && allowedSlots(targetId).includes(slotOfSource);
  }

  // ── Handles & application ────────────────────────────────────────────────
  function visibleCards() {
    return [...WIDGETS, ...FEED_WIDGETS]
      .map((widget) => $(widget.id))
      .filter((card) => card && !card.classList.contains('hidden'));
  }

  function ensureDragHandles() {
    [...WIDGETS, ...FEED_WIDGETS].forEach((widget) => {
      const card = $(widget.id);
      if (!card) return;
      card.dataset.layoutWidget = widget.id;
      let handle = card.querySelector('.widget-drag-handle');
      if (!handle) {
        handle = document.createElement('span');
        handle.className = 'widget-drag-handle';
        handle.setAttribute('aria-hidden', 'true');
        handle.setAttribute('title', I18n.t('widgetDragHandle', { widget: I18n.t(widget.key) }));
        handle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg>';
        card.prepend(handle);
      }
    });
  }

  function apply() {
    const hidden = hiddenWidgets();
    const order = getOrder();
    const map = slotMap();
    const visible = visibleWidgets(order, hidden);
    // Bento cards: assign slots from the constraint-aware map.
    order.forEach((id) => {
      const el = $(id);
      if (!el) return;
      const isHidden = hidden.has(id);
      el.classList.toggle('hidden', isHidden);
      el.dataset.layoutWidget = id;
      if (isHidden || !visible.includes(id)) {
        el.style.gridArea = '';
        el.style.order = '';
        delete el.dataset.layoutSlot;
        return;
      }
      const slot = map[id];
      if (slot) {
        el.style.gridArea = slot;
        el.dataset.layoutSlot = slot;
      }
    });
    // Feed sections: order only (they live in the below-fold zone).
    const allFeedIds = FEED_WIDGETS.map((widget) => widget.id);
    const feedHidden = feedHiddenIds();
    const visibleFeed = getFeedOrder().filter((id) => !feedHidden.has(id) && !$(id)?.classList.contains('hidden'));
    allFeedIds.forEach((id) => {
      const el = $(id);
      if (!el) return;
      const isHidden = feedHidden.has(id) || el.classList.contains('hidden');
      if (isHidden) { el.style.order = ''; delete el.dataset.layoutSlot; return; }
      const index = visibleFeed.indexOf(id);
      el.style.order = index === -1 ? '' : index + 1;
    });
  }

  // ── Arrange-mode inert layer ─────────────────────────────────────────────
  function snapshotInnerContent(card) {
    const snapshot = [];
    card.querySelectorAll('a, button, input, textarea, select, [tabindex]').forEach((el) => {
      snapshot.push({ el, tabindex: el.getAttribute('tabindex') });
      el.setAttribute('tabindex', '-1');
    });
    return snapshot;
  }

  function restoreInnerContent(snapshot) {
    snapshot.forEach(({ el, tabindex }) => {
      if (tabindex === null || tabindex === undefined) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', tabindex);
    });
  }

  // ── Drag and drop ───────────────────────────────────────────────────────
  function setupDragAndDrop(container) {
    if (!container) return;
    container.addEventListener('dragstart', (event) => {
      // In a normal page, never touch bookmark-tile drags (they have their own handler).
      if (!arranging) return;
      const card = event.target.closest('[data-layout-widget]');
      if (!card || card.classList.contains('hidden')) {
        event.preventDefault();
        return;
      }
      draggingId = card.dataset.layoutWidget;
      card.classList.add('widget-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggingId);
      try { event.dataTransfer.setDragImage(card, Math.min(card.offsetWidth / 2, 150), 28); } catch {}
    });

    container.addEventListener('dragover', (event) => {
      if (!arranging || !draggingId) return;
      container.querySelectorAll('[data-layout-widget]').forEach((el) => {
        el.classList.remove('widget-drop-target', 'widget-drop-invalid');
      });
      const card = event.target.closest('[data-layout-widget]');
      if (!card || card.classList.contains('hidden') || card.dataset.layoutWidget === draggingId) return;
      if (canSwap(draggingId, card.dataset.layoutWidget)) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        card.classList.add('widget-drop-target');
      } else {
        card.classList.add('widget-drop-invalid');
      }
    });

    container.addEventListener('dragleave', (event) => {
      const card = event.target.closest('[data-layout-widget]');
      if (!card || card.contains(event.relatedTarget)) return;
      card.classList.remove('widget-drop-target', 'widget-drop-invalid');
    });

    container.addEventListener('drop', async (event) => {
      if (!arranging || !draggingId) return;
      const targetCard = event.target.closest('[data-layout-widget]');
      const targetId = targetCard?.dataset.layoutWidget;
      if (!targetId || !canSwap(draggingId, targetId) || targetCard.classList.contains('hidden')) return;
      event.preventDefault();
      if (isFeed(draggingId)) {
        const order = getFeedOrder();
        const sourceIndex = order.indexOf(draggingId);
        const targetIndex = order.indexOf(targetId);
        if (sourceIndex < 0 || targetIndex < 0) return;
        [order[sourceIndex], order[targetIndex]] = [order[targetIndex], order[sourceIndex]];
        await Storage.updateSettings({ feedOrder: order });
      } else {
        const order = getOrder();
        const sourceIndex = order.indexOf(draggingId);
        const targetIndex = order.indexOf(targetId);
        if (sourceIndex < 0 || targetIndex < 0) return;
        [order[sourceIndex], order[targetIndex]] = [order[targetIndex], order[sourceIndex]];
        await Storage.updateSettings({ widgetOrder: order });
      }
      apply();
      targetCard.classList.add('widget-drop-complete');
      setTimeout(() => targetCard.classList.remove('widget-drop-complete'), 450);
    });

    container.addEventListener('dragend', () => {
      draggingId = null;
      document.querySelectorAll('.widget-dragging, .widget-drop-target, .widget-drop-invalid').forEach((el) => {
        el.classList.remove('widget-dragging', 'widget-drop-target', 'widget-drop-invalid');
      });
    });
  }

  function startArrange() {
    if (arranging) return;
    arranging = true;
    document.body.classList.add('widget-layout-editing');
    TabyarUI.closeModal('modal-settings');
    document.getElementById('widget-layout-edit-bar')?.classList.remove('hidden');
    apply();
    savedCardState = [];
    visibleCards().forEach((card) => {
      savedCardState.push({
        card,
        tabindex: card.getAttribute('tabindex'),
        draggable: card.getAttribute('draggable'),
        inner: snapshotInnerContent(card)
      });
      card.setAttribute('draggable', 'true');
      card.setAttribute('tabindex', '0');
    });
    savedCardState[0]?.card.focus();
  }

  function finishArrange() {
    if (!arranging) return;
    arranging = false;
    draggingId = null;
    document.body.classList.remove('widget-layout-editing');
    document.getElementById('widget-layout-edit-bar')?.classList.add('hidden');
    savedCardState.forEach(({ card, tabindex, draggable, inner }) => {
      if (draggable === null || draggable === undefined) card.removeAttribute('draggable');
      else card.setAttribute('draggable', draggable);
      if (tabindex === null || tabindex === undefined) card.removeAttribute('tabindex');
      else card.setAttribute('tabindex', tabindex);
      restoreInnerContent(inner);
    });
    savedCardState = [];
    document.querySelectorAll('.widget-dragging, .widget-drop-target, .widget-drop-invalid').forEach((el) => {
      el.classList.remove('widget-dragging', 'widget-drop-target', 'widget-drop-invalid');
    });
  }

  function init() {
    ensureDragHandles();
    apply();
    setupDragAndDrop(document.getElementById('dashboard'));
    setupDragAndDrop(document.getElementById('feed-sections'));
    document.getElementById('btn-widget-layout-edit')?.addEventListener('click', startArrange);
    document.getElementById('btn-widget-layout-done')?.addEventListener('click', finishArrange);
    document.addEventListener('keydown', (event) => {
      if (arranging && event.key === 'Escape' && !document.querySelector('.modal-overlay:not(.hidden)')) finishArrange();
    });
    document.getElementById('btn-widget-layout-reset')?.addEventListener('click', async () => {
      await Storage.updateSettings({
        widgetOrder: WIDGETS.map((widget) => widget.id),
        feedOrder: [...FEED_DEFAULT_ORDER],
        hiddenWidgets: []
      });
      apply();
    });
  }

  return { init, apply, getOrder, startArrange, finishArrange };
})();
