const DashboardLayoutUI = (() => {
  const WIDGETS = [
    { id: 'day-info-card', key: 'widgetToday' },
    { id: 'calendar-card', key: 'widgetCalendar' },
    { id: 'bookmarks-card', key: 'widgetBookmarks' },
    { id: 'notes-card', key: 'widgetNotes' },
    { id: 'tasks-card', key: 'widgetTasks' }
  ];
  // Layout is intentionally constrained to these five responsive bento slots.
  // Dragging only changes the order-to-slot mapping; it never changes spans.
  const SLOT_NAMES = ['slot-a', 'slot-b', 'slot-c', 'slot-d', 'slot-e'];
  const listEl = () => document.getElementById('widget-layout-settings');
  let arranging = false;
  let draggingId = null;
  let draggingSettingsId = null;

  function getOrder() {
    const saved = Storage.getSettings().widgetOrder;
    const ids = new Set(WIDGETS.map((widget) => widget.id));
    const order = [];
    if (Array.isArray(saved)) saved.forEach((id) => {
      if (ids.has(id) && !order.includes(id)) order.push(id);
    });
    WIDGETS.forEach((widget) => { if (!order.includes(widget.id)) order.push(widget.id); });
    return order;
  }

  function ensureDragHandles() {
    WIDGETS.forEach((widget) => {
      const card = document.getElementById(widget.id);
      if (!card) return;
      card.dataset.layoutWidget = widget.id;
      let handle = card.querySelector('.widget-drag-handle');
      if (!handle) {
        handle = document.createElement('button');
        handle.type = 'button';
        handle.className = 'widget-drag-handle';
        handle.draggable = true;
        handle.dataset.widgetDrag = widget.id;
        handle.setAttribute('aria-grabbed', 'false');
        handle.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg>';
        card.prepend(handle);
      }
      const label = I18n.t('widgetDragHandle', { widget: I18n.t(widget.key) });
      handle.setAttribute('aria-label', label);
      handle.title = label;
    });
  }

  function apply() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    ensureDragHandles();
    const settings = Storage.getSettings();
    const hidden = new Set(Array.isArray(settings.hiddenWidgets) ? settings.hiddenWidgets : []);
    const order = getOrder();
    const visibleOrder = order.filter((id) => !hidden.has(id));
    order.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const isHidden = hidden.has(id);
      el.classList.toggle('hidden', isHidden);
      el.dataset.layoutWidget = id;
      if (isHidden) {
        el.style.gridArea = '';
        delete el.dataset.layoutSlot;
      }
    });
    visibleOrder.forEach((id, index) => {
      const el = document.getElementById(id);
      const slot = SLOT_NAMES[index] || SLOT_NAMES[SLOT_NAMES.length - 1];
      if (el) {
        el.style.gridArea = slot;
        el.dataset.layoutSlot = slot;
      }
    });
  }

  function renderSettings() {
    ensureDragHandles();
    const target = listEl();
    if (!target) return;
    const order = getOrder();
    const hidden = new Set(Storage.getSettings().hiddenWidgets || []);
    target.innerHTML = order.map((id, index) => {
      const widget = WIDGETS.find((item) => item.id === id);
      if (!widget) return '';
      const dragLabel = I18n.t('widgetListDragHandle', { widget: I18n.t(widget.key) });
      return `<div class="widget-layout-row" data-widget="${widget.id}">
        <button type="button" class="widget-layout-grip" draggable="true" data-widget-row-drag="${widget.id}" aria-grabbed="false" aria-label="${dragLabel}" title="${dragLabel}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="8" cy="6" r="1.5"/><circle cx="16" cy="6" r="1.5"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/><circle cx="8" cy="18" r="1.5"/><circle cx="16" cy="18" r="1.5"/></svg></button>
        <label class="widget-layout-toggle"><input type="checkbox" data-widget-visible="${widget.id}" ${hidden.has(widget.id) ? '' : 'checked'}><span>${I18n.t(widget.key)}</span></label>
        <div class="widget-layout-actions">
          <button type="button" class="widget-order-btn" data-widget-move="up" aria-label="${I18n.t('moveUp')}" title="${I18n.t('moveUp')}" ${index === 0 ? 'disabled' : ''}>↑</button>
          <button type="button" class="widget-order-btn" data-widget-move="down" aria-label="${I18n.t('moveDown')}" title="${I18n.t('moveDown')}" ${index === order.length - 1 ? 'disabled' : ''}>↓</button>
        </div>
      </div>`;
    }).join('');
  }

  function setupDragAndDrop() {
    const dashboard = document.getElementById('dashboard');
    if (!dashboard) return;
    dashboard.addEventListener('dragstart', (event) => {
      const handle = event.target.closest('[data-widget-drag]');
      if (!arranging || !handle) {
        if (handle) event.preventDefault();
        return;
      }
      const card = handle.closest('[data-layout-widget]');
      if (!card || card.classList.contains('hidden')) {
        event.preventDefault();
        return;
      }
      draggingId = handle.dataset.widgetDrag;
      handle.setAttribute('aria-grabbed', 'true');
      card.classList.add('widget-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggingId);
      try { event.dataTransfer.setDragImage(card, Math.min(card.offsetWidth / 2, 150), 28); } catch {}
    });

    dashboard.addEventListener('dragover', (event) => {
      if (!arranging || !draggingId) return;
      const card = event.target.closest('[data-layout-widget]');
      if (!card || card.classList.contains('hidden') || card.dataset.layoutWidget === draggingId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      card.classList.add('widget-drop-target');
    });

    dashboard.addEventListener('dragleave', (event) => {
      const card = event.target.closest('[data-layout-widget]');
      if (!card || card.contains(event.relatedTarget)) return;
      card.classList.remove('widget-drop-target');
    });

    dashboard.addEventListener('drop', async (event) => {
      if (!arranging || !draggingId) return;
      const targetCard = event.target.closest('[data-layout-widget]');
      const targetId = targetCard?.dataset.layoutWidget;
      if (!targetId || targetId === draggingId || targetCard.classList.contains('hidden')) return;
      event.preventDefault();
      const order = getOrder();
      const sourceIndex = order.indexOf(draggingId);
      const targetIndex = order.indexOf(targetId);
      if (sourceIndex < 0 || targetIndex < 0) return;
      [order[sourceIndex], order[targetIndex]] = [order[targetIndex], order[sourceIndex]];
      await Storage.updateSettings({ widgetOrder: order });
      apply();
      renderSettings();
      targetCard.classList.add('widget-drop-complete');
      setTimeout(() => targetCard.classList.remove('widget-drop-complete'), 450);
    });

    dashboard.addEventListener('dragend', (event) => {
      const handle = event.target.closest('[data-widget-drag]');
      if (handle) handle.setAttribute('aria-grabbed', 'false');
      draggingId = null;
      dashboard.querySelectorAll('.widget-dragging, .widget-drop-target').forEach((el) => {
        el.classList.remove('widget-dragging', 'widget-drop-target');
      });
    });
  }

  function clearSettingsDragState(target = listEl()) {
    draggingSettingsId = null;
    target?.querySelectorAll('.widget-layout-row-dragging, .widget-layout-row-drop-target').forEach((row) => {
      row.classList.remove('widget-layout-row-dragging', 'widget-layout-row-drop-target');
    });
    target?.querySelectorAll('[data-widget-row-drag]').forEach((handle) => handle.setAttribute('aria-grabbed', 'false'));
  }

  function setupSettingsListDragAndDrop(target) {
    target.addEventListener('dragstart', (event) => {
      const handle = event.target.closest('[data-widget-row-drag]');
      if (!handle) return;
      draggingSettingsId = handle.dataset.widgetRowDrag;
      const row = handle.closest('.widget-layout-row');
      row?.classList.add('widget-layout-row-dragging');
      handle.setAttribute('aria-grabbed', 'true');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', `tabyar-widget:${draggingSettingsId}`);
      try { if (row) event.dataTransfer.setDragImage(row, Math.min(row.offsetWidth / 2, 180), row.offsetHeight / 2); } catch {}
    });

    target.addEventListener('dragover', (event) => {
      if (!draggingSettingsId) return;
      const row = event.target.closest('.widget-layout-row[data-widget]');
      if (!row || row.dataset.widget === draggingSettingsId) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      row.classList.add('widget-layout-row-drop-target');
    });

    target.addEventListener('dragleave', (event) => {
      const row = event.target.closest('.widget-layout-row[data-widget]');
      if (!row || row.contains(event.relatedTarget)) return;
      row.classList.remove('widget-layout-row-drop-target');
    });

    target.addEventListener('drop', async (event) => {
      if (!draggingSettingsId) return;
      const row = event.target.closest('.widget-layout-row[data-widget]');
      const targetId = row?.dataset.widget;
      if (!targetId || targetId === draggingSettingsId) return;
      event.preventDefault();
      const order = getOrder();
      const sourceIndex = order.indexOf(draggingSettingsId);
      if (sourceIndex < 0) return;
      const [moved] = order.splice(sourceIndex, 1);
      if (!moved) return;
      const targetIndex = order.indexOf(targetId);
      if (targetIndex < 0) return;
      const rowRect = row.getBoundingClientRect();
      const before = event.clientY < rowRect.top + rowRect.height / 2;
      order.splice(targetIndex + (before ? 0 : 1), 0, moved);
      clearSettingsDragState(target);
      await Storage.updateSettings({ widgetOrder: order });
      apply();
      renderSettings();
    });

    target.addEventListener('dragend', () => clearSettingsDragState(target));
  }

  function startArrange() {
    arranging = true;
    document.body.classList.add('widget-layout-editing');
    document.getElementById('modal-settings')?.classList.add('hidden');
    document.getElementById('widget-layout-edit-bar')?.classList.remove('hidden');
    apply();
    document.querySelector('.widget-layout-editing [data-layout-widget]:not(.hidden) .widget-drag-handle')?.focus();
  }

  function finishArrange() {
    arranging = false;
    draggingId = null;
    document.body.classList.remove('widget-layout-editing');
    document.getElementById('widget-layout-edit-bar')?.classList.add('hidden');
    document.querySelectorAll('.widget-dragging, .widget-drop-target').forEach((el) => {
      el.classList.remove('widget-dragging', 'widget-drop-target');
    });
  }

  async function moveWidget(row, direction) {
    const order = getOrder();
    const index = order.indexOf(row.dataset.widget);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]];
    await Storage.updateSettings({ widgetOrder: order });
    apply();
    renderSettings();
  }

  function init() {
    apply();
    setupDragAndDrop();
    const target = listEl();
    if (!target) return;
    setupSettingsListDragAndDrop(target);
    target.addEventListener('change', async (event) => {
      const input = event.target.closest('[data-widget-visible]');
      if (!input) return;
      const id = input.dataset.widgetVisible;
      const hidden = new Set(Storage.getSettings().hiddenWidgets || []);
      if (input.checked) hidden.delete(id); else hidden.add(id);
      await Storage.updateSettings({ hiddenWidgets: [...hidden] });
      apply();
    });
    target.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-widget-move]');
      const row = button?.closest('[data-widget]');
      if (!button || !row || button.disabled) return;
      await moveWidget(row, button.dataset.widgetMove === 'up' ? -1 : 1);
    });
    document.getElementById('btn-widget-layout-edit')?.addEventListener('click', startArrange);
    document.getElementById('btn-widget-layout-done')?.addEventListener('click', finishArrange);
    document.addEventListener('keydown', (event) => {
      if (arranging && event.key === 'Escape' && !document.querySelector('.modal-overlay:not(.hidden)')) finishArrange();
    });
    document.getElementById('btn-widget-layout-reset')?.addEventListener('click', async () => {
      await Storage.updateSettings({
        widgetOrder: WIDGETS.map((widget) => widget.id),
        hiddenWidgets: []
      });
      apply();
      renderSettings();
    });
  }

  return { init, apply, renderSettings, getOrder, startArrange, finishArrange };
})();
