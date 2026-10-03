const QuickActionsUI = (() => {
  let root;
  let trigger;
  let menu;

  function isOpen() {
    return Boolean(root && root.classList.contains('is-open'));
  }

  function setOpen(open, { focusFirst = false, restoreFocus = false } = {}) {
    if (!root || !trigger || !menu) return;
    root.classList.toggle('is-open', open);
    menu.classList.toggle('hidden', !open);
    menu.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    if (open && focusFirst) menu.querySelector('[role="menuitem"]')?.focus();
    if (!open && restoreFocus) trigger.focus();
  }

  function moveFocus(direction) {
    const items = [...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
    if (!items.length) return;
    const index = items.indexOf(document.activeElement);
    const next = index < 0
      ? (direction > 0 ? 0 : items.length - 1)
      : (index + direction + items.length) % items.length;
    items[next].focus();
  }

  function init() {
    root = document.getElementById('quick-actions-root');
    trigger = document.getElementById('btn-quick-actions');
    menu = document.getElementById('quick-actions-menu');
    if (!root || !trigger || !menu) return;

    menu.setAttribute('aria-hidden', 'true');
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const opening = !isOpen();
      setOpen(opening, { focusFirst: opening && event.detail === 0 });
    });

    // Close before the selected action runs. Its own click handler still fires,
    // while the popover disappears immediately instead of lingering behind a modal.
    root.addEventListener('click', (event) => {
      if (event.target.closest('[data-quick-action]')) setOpen(false);
    }, true);

    document.addEventListener('click', (event) => {
      if (isOpen() && !root.contains(event.target)) setOpen(false);
    });

    root.addEventListener('keydown', (event) => {
      if (isOpen() && (event.ctrlKey || event.metaKey)) {
        const key = event.key.toLowerCase();
        if (key === 'k' || (event.shiftKey && (key === 'h' || key === 'f'))) {
          setOpen(false);
          return;
        }
      }
      if (!isOpen()) {
        if (event.target === trigger && event.key === 'ArrowDown') {
          event.preventDefault();
          setOpen(true, { focusFirst: true });
        }
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false, { restoreFocus: true });
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        moveFocus(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        moveFocus(-1);
      } else if (event.key === 'Home') {
        event.preventDefault();
        menu.querySelector('[role="menuitem"]')?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        const items = menu.querySelectorAll('[role="menuitem"]:not(:disabled)');
        items[items.length - 1]?.focus();
      }
    });

    root.addEventListener('focusout', () => {
      setTimeout(() => {
        if (isOpen() && !root.contains(document.activeElement)) setOpen(false);
      }, 0);
    });
  }

  return { init, open: () => setOpen(true), close: () => setOpen(false) };
})();
