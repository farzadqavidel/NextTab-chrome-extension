const SettingsUI = (() => {
  const THEMES = {
    midnight: {
      nameKey: 'themeMidnight',
      mode: 'dark',
      vars: {
        '--bg-card': 'rgba(15, 30, 60, 0.55)',
        '--bg-card-hover': 'rgba(20, 40, 80, 0.65)',
        '--text-primary': '#f1f5f9',
        '--text-secondary': '#94a3b8',
        '--accent': '#6366f1',
        '--accent-hover': '#818cf8',
        '--border': 'rgba(148, 163, 184, 0.15)',
        '--shadow': '0 8px 32px rgba(0,0,0,0.25)',
        '--search-bg': 'rgba(15, 30, 60, 0.6)',
        '--cal-today': '#6366f1',
        '--cal-friday': '#f87171'
      }
    },
    ocean: {
      nameKey: 'themeOcean',
      mode: 'dark',
      vars: {
        '--bg-card': 'rgba(8, 47, 73, 0.55)',
        '--bg-card-hover': 'rgba(12, 74, 110, 0.65)',
        '--text-primary': '#ecfeff',
        '--text-secondary': '#a5f3fc',
        '--accent': '#06b6d4',
        '--accent-hover': '#22d3ee',
        '--border': 'rgba(165, 243, 252, 0.15)',
        '--shadow': '0 8px 32px rgba(0,0,0,0.25)',
        '--search-bg': 'rgba(8, 47, 73, 0.6)',
        '--cal-today': '#06b6d4',
        '--cal-friday': '#fb7185'
      }
    },
    forest: {
      nameKey: 'themeForest',
      mode: 'dark',
      vars: {
        '--bg-card': 'rgba(5, 46, 22, 0.55)',
        '--bg-card-hover': 'rgba(20, 83, 45, 0.65)',
        '--text-primary': '#ecfdf5',
        '--text-secondary': '#86efac',
        '--accent': '#22c55e',
        '--accent-hover': '#4ade80',
        '--border': 'rgba(134, 239, 172, 0.15)',
        '--shadow': '0 8px 32px rgba(0,0,0,0.25)',
        '--search-bg': 'rgba(5, 46, 22, 0.6)',
        '--cal-today': '#22c55e',
        '--cal-friday': '#fbbf24'
      }
    },
    lavender: {
      nameKey: 'themeLavender',
      mode: 'dark',
      vars: {
        '--bg-card': 'rgba(46, 16, 101, 0.55)',
        '--bg-card-hover': 'rgba(76, 29, 149, 0.65)',
        '--text-primary': '#faf5ff',
        '--text-secondary': '#c4b5fd',
        '--accent': '#a78bfa',
        '--accent-hover': '#c4b5fd',
        '--border': 'rgba(196, 181, 253, 0.15)',
        '--shadow': '0 8px 32px rgba(0,0,0,0.25)',
        '--search-bg': 'rgba(46, 16, 101, 0.6)',
        '--cal-today': '#a78bfa',
        '--cal-friday': '#f472b6'
      }
    },
    light: {
      nameKey: 'themeLight',
      mode: 'light',
      vars: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f4f7fb',
        '--text-primary': '#1e293b',
        '--text-secondary': '#64748b',
        '--accent': '#4285f4',
        '--accent-hover': '#1a73e8',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#4285f4',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f8fafc'
      }
    }
  };

  const GRADIENTS = {
    sky: 'linear-gradient(180deg, #C7E2F7 0%, #dbeafe 50%, #C7E2F7 100%)',
    softblue: 'linear-gradient(160deg, #C7E2F7 0%, #e0f2fe 40%, #bfdbfe 100%)',
    midnight: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    ocean: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 50%, #0e7490 100%)',
    aurora: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #0e7490 100%)',
    sunset: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)',
    forest: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    lavender: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #6b21a8 100%)',
    dawn: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #fef3c7 100%)',
    night: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e293b 100%)'
  };

  function init() {
    document.getElementById('btn-settings').addEventListener('click', openSettings);
    setupTabs();
    renderThemeGrid();
    renderGradientGrid();
    setupBackgroundControls();
    setupModeToggle();
    setupBackupControls();
    applyAll();
  }

  function openSettings() {
    syncControlsFromSettings();
    document.getElementById('modal-settings').classList.remove('hidden');
  }

  function setupTabs() {
    document.querySelectorAll('.settings-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.settings-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      });
    });
  }

  function setupModeToggle() {
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const mode = btn.dataset.mode;
        const themeKey = mode === 'light' ? 'light' : 'midnight';
        await Storage.updateSettings({ colorMode: mode, theme: themeKey });
        updateModeButtons(mode);
        renderThemeGrid();
        applyTheme(themeKey);
      });
    });
  }

  function updateModeButtons(mode) {
    document.querySelectorAll('.mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  function renderThemeGrid() {
    const grid = document.getElementById('theme-grid');
    const settings = Storage.getSettings();

    grid.innerHTML = Object.entries(THEMES).map(([key, theme]) => {
      const accent = theme.vars['--accent'];
      return `
        <button class="theme-card ${settings.theme === key ? 'active' : ''}" data-theme="${key}">
          <div class="theme-preview" style="background: ${accent}"></div>
          <span>${I18n.t(theme.nameKey)}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.theme-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const themeKey = card.dataset.theme;
        const theme = THEMES[themeKey];
        await Storage.updateSettings({ theme: themeKey, colorMode: theme.mode });
        grid.querySelectorAll('.theme-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        updateModeButtons(theme.mode);
        applyTheme(themeKey);
      });
    });
  }

  function renderGradientGrid() {
    const grid = document.getElementById('gradient-grid');
    const settings = Storage.getSettings();

    grid.innerHTML = Object.entries(GRADIENTS).map(([key, gradient]) => `
      <button class="gradient-card ${settings.bgGradient === key ? 'active' : ''}"
              data-gradient="${key}"
              style="background: ${gradient}"
              title="${key}"></button>
    `).join('');

    grid.querySelectorAll('.gradient-card').forEach((card) => {
      card.addEventListener('click', async () => {
        await Storage.updateSettings({ bgGradient: card.dataset.gradient, bgType: 'gradient' });
        grid.querySelectorAll('.gradient-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        document.querySelector('input[name="bg-type"][value="gradient"]').checked = true;
        showBgOptions('gradient');
        applyBackground();
      });
    });
  }

  function setupBackgroundControls() {
    document.querySelectorAll('input[name="bg-type"]').forEach((radio) => {
      radio.addEventListener('change', async (e) => {
        await Storage.updateSettings({ bgType: e.target.value });
        showBgOptions(e.target.value);
        applyBackground();
      });
    });

    document.getElementById('bg-color-picker').addEventListener('input', async (e) => {
      await Storage.updateSettings({ bgColor: e.target.value });
      applyBackground();
    });

    document.getElementById('btn-bg-url-apply').addEventListener('click', applyBgFromUrl);

    document.getElementById('bg-image-upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const nameEl = document.getElementById('bg-file-name');
      if (!file) {
        if (nameEl) nameEl.textContent = I18n.t('noFile');
        return;
      }
      if (nameEl) nameEl.textContent = file.name;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await Storage.updateSettings({ bgImage: ev.target.result, bgType: 'image' });
        document.querySelector('input[name="bg-type"][value="image"]').checked = true;
        showBgOptions('image');
        applyBackground();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('bg-blur').addEventListener('input', async (e) => {
      const val = e.target.value;
      document.getElementById('bg-blur-value').textContent = val + 'px';
      await Storage.updateSettings({ bgBlur: parseInt(val, 10) });
      applyBackground();
    });

    document.getElementById('bg-overlay').addEventListener('input', async (e) => {
      const val = e.target.value;
      document.getElementById('bg-overlay-value').textContent = val + '%';
      await Storage.updateSettings({ bgOverlay: parseInt(val, 10) });
      applyBackground();
    });
  }

  async function applyBgFromUrl() {
    const url = document.getElementById('bg-image-url').value.trim();
    if (!url) {
      alert(I18n.t('invalidImageUrl'));
      return;
    }
    await Storage.updateSettings({ bgImage: url, bgType: 'image' });
    document.querySelector('input[name="bg-type"][value="image"]').checked = true;
    showBgOptions('image');
    applyBackground();
  }

  function setupBackupControls() {
    document.getElementById('btn-export-data').addEventListener('click', () => {
      const data = Storage.exportAllData();
      const date = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `صفحه-اول-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import-data').addEventListener('click', () => {
      document.getElementById('import-data-file').click();
    });

    document.getElementById('import-data-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          await Storage.importAllData(data);
          applyAll();
          I18n.applyDom();
          BookmarksUI.render();
          CalendarUI.refresh();
          NotesUI.render();
          alert(I18n.t('importDataSuccess'));
        } catch {
          alert(I18n.t('invalidFile'));
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-reset-data').addEventListener('click', async () => {
      if (confirm(I18n.t('resetConfirm'))) {
        await Storage.resetAll();
        applyAll();
        I18n.applyDom();
        BookmarksUI.render();
        CalendarUI.refresh();
        NotesUI.render();
        renderThemeGrid();
        renderGradientGrid();
        syncControlsFromSettings();
      }
    });
  }

  function showBgOptions(type) {
    document.getElementById('bg-gradient-options').classList.toggle('hidden', type !== 'gradient');
    document.getElementById('bg-color-options').classList.toggle('hidden', type !== 'color');
    document.getElementById('bg-image-options').classList.toggle('hidden', type !== 'image');
  }

  function syncControlsFromSettings() {
    const s = Storage.getSettings();
    document.querySelector(`input[name="bg-type"][value="${s.bgType}"]`).checked = true;
    showBgOptions(s.bgType);
    document.getElementById('bg-color-picker').value = s.bgColor;
    document.getElementById('bg-image-url').value = s.bgImage.startsWith('data:') ? '' : s.bgImage;
    document.getElementById('bg-blur').value = s.bgBlur;
    document.getElementById('bg-blur-value').textContent = s.bgBlur + 'px';
    document.getElementById('bg-overlay').value = s.bgOverlay;
    document.getElementById('bg-overlay-value').textContent = s.bgOverlay + '%';
    updateModeButtons(s.colorMode);
  }

  function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.midnight;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
    document.body.classList.toggle('light-mode', theme.mode === 'light');
    document.body.classList.toggle('dark-mode', theme.mode === 'dark');
  }

  function applyBackground() {
    const s = Storage.getSettings();
    const layer = document.getElementById('background-layer');

    layer.style.filter = '';
    layer.style.background = '';
    layer.style.backgroundImage = '';
    layer.style.backgroundSize = '';
    layer.style.backgroundPosition = '';

    if (s.bgType === 'gradient') {
      const gradient = GRADIENTS[s.bgGradient] || GRADIENTS.sky;
      layer.style.background = gradient;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      layer.style.background = s.bgColor;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'image' && s.bgImage) {
      layer.style.backgroundImage = `url("${s.bgImage}")`;
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = 'center';
      layer.style.filter = `blur(${s.bgBlur}px)`;
      layer.style.setProperty('--bg-overlay-opacity', s.bgOverlay / 100);
    }
  }

  function applyAll() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    applyBackground();
    updateModeButtons(s.colorMode);
  }

  function refreshI18n() {
    renderThemeGrid();
    syncControlsFromSettings();
  }

  return { init, applyAll, refreshI18n };
})();
