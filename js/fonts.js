/**
 * FontsUI — selectable UI font for the whole extension.
 * 8 Persian-first Google Font families (plus the system stack).
 * The chosen stack is exposed as --app-font-family on <html> so every
 * rule in the stylesheet picks it up without per-component edits.
 */
const FontsUI = (() => {
  const FONT_STACKS = {
    vazir: { stack: "'Vazirmatn', 'Segoe UI', Tahoma, sans-serif", google: 'Vazirmatn:wght@400;500;600;700;800', labelKey: 'fontVazir' },
    lalezar: { stack: "'Lalezar', 'Vazirmatn', 'Segoe UI', sans-serif", google: 'Lalezar', labelKey: 'fontLalezar' },
    estedad: { stack: "'Estedad', 'Vazirmatn', 'Segoe UI', sans-serif", google: 'Estedad:wght@400;500;600;700', labelKey: 'fontEstedad' },
    noto: { stack: "'Noto Sans Arabic', 'Vazirmatn', 'Segoe UI', sans-serif", google: 'Noto+Sans+Arabic:wght@400;500;600;700', labelKey: 'fontNotoSans' },
    naskh: { stack: "'Noto Naskh Arabic', 'Amiri', 'Vazirmatn', sans-serif", google: 'Noto+Naskh+Arabic:wght@400;500;600;700', labelKey: 'fontNaskh' },
    amiri: { stack: "'Amiri', 'Noto Naskh Arabic', serif", google: 'Amiri:wght@400;700', labelKey: 'fontAmiri' },
    scheherazade: { stack: "'Scheherazade New', 'Amiri', serif", google: 'Scheherazade+New:wght@400;500;600;700', labelKey: 'fontScheherazade' },
    markazi: { stack: "'Markazi Text', 'Noto Naskh Arabic', serif", google: 'Markazi+Text:wght@400;500;600;700', labelKey: 'fontMarkazi' },
    system: { stack: "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif", google: null, labelKey: 'fontSystem' }
  };

  /* Font families in the Appearance settings panel (default first). */
  const ORDER = ['vazir', 'lalezar', 'estedad', 'noto', 'naskh', 'amiri', 'scheherazade', 'markazi', 'system'];
  const SAMPLE = 'طراحی محیطی';

  function fontStack(id) {
    const font = FONT_STACKS[id] || FONT_STACKS.vazir;
    return font.stack;
  }

  function fontGoogleUrl(id) {
    const font = FONT_STACKS[id];
    if (!font || !font.google) return null;
    return 'https://fonts.googleapis.com/css2?family=' + font.google + '&display=swap';
  }

  /* Inject the chosen Google Font stylesheet once. */
  function ensureGoogleFont(id) {
    const url = fontGoogleUrl(id);
    if (!url) return;
    if (document.querySelector(`link[data-app-font="${id}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.setAttribute('data-app-font', id);
    document.head.appendChild(link);
  }

  function apply(id) {
    const font = FONT_STACKS[id] ? id : 'vazir';
    const root = document.documentElement;
    root.style.setProperty('--app-font-family', fontStack(font));
    document.body?.style.setProperty('--app-font-family', fontStack(font));
    ensureGoogleFont(font);
    document.querySelectorAll('.font-card').forEach((card) => {
      const active = card.dataset.font === font;
      card.classList.toggle('active', active);
      card.setAttribute('aria-pressed', String(active));
      const badge = card.querySelector('.font-card-badge');
      if (badge) badge.textContent = I18n.t('fontCurrent');
    });
  }

  function render() {
    const wrap = document.getElementById('font-grid');
    if (!wrap) return;
    const current = Storage.getSettings().font || 'vazir';
    wrap.innerHTML = ORDER.map((id) => `
      <button type="button" class="font-card ${id === current ? 'active' : ''}"
              data-font="${id}" aria-pressed="${id === current}">
        <span class="font-card-name" style="font-family: ${fontStack(id)}">${I18n.t(FONT_STACKS[id].labelKey)}</span>
        <span class="font-card-sample" style="font-family: ${fontStack(id)}">${SAMPLE}</span>
        <span class="font-card-badge">${I18n.t('fontCurrent')}</span>
      </button>
    `).join('');
    wrap.querySelectorAll('.font-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const id = card.dataset.font;
        if (!FONT_STACKS[id]) return;
        apply(id);
        await Storage.updateSettings({ font: id });
      });
    });
  }

  function refreshButtons() {
    const s = Storage.getSettings();
    apply(s.font || 'vazir');
  }

  function init() {
    render();
    apply(Storage.getSettings().font || 'vazir');
    document.addEventListener('tabyar:language-changed', () => render());
  }

  return { init, render, refreshButtons, apply, fontStack };
})();
