const SettingsUI = (() => {
  const THEMES = {
    midnight: {
      nameKey: 'themeMidnight',
      accent: '#6366f1',
      dark: {
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
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f4f5fb',
        '--text-primary': '#1e293b',
        '--text-secondary': '#64748b',
        '--accent': '#6366f1',
        '--accent-hover': '#818cf8',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#6366f1',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f8fafc'
      }
    },
    ocean: {
      nameKey: 'themeOcean',
      accent: '#06b6d4',
      dark: {
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
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f0fdfa',
        '--text-primary': '#134e4a',
        '--text-secondary': '#64748b',
        '--accent': '#06b6d4',
        '--accent-hover': '#0891b2',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#06b6d4',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f0fdfa'
      }
    },
    forest: {
      nameKey: 'themeForest',
      accent: '#22c55e',
      dark: {
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
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f0fdf4',
        '--text-primary': '#14532d',
        '--text-secondary': '#64748b',
        '--accent': '#22c55e',
        '--accent-hover': '#16a34a',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#22c55e',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f0fdf4'
      }
    },
    lavender: {
      nameKey: 'themeLavender',
      accent: '#a78bfa',
      dark: {
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
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#faf5ff',
        '--text-primary': '#4c1d95',
        '--text-secondary': '#64748b',
        '--accent': '#a78bfa',
        '--accent-hover': '#8b5cf6',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#a78bfa',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#faf5ff'
      }
    },
    glass: {
      nameKey: 'themeGlass',
      accent: '#38bdf8',
      dark: {
        '--bg-card': 'rgba(255, 255, 255, 0.1)',
        '--bg-card-hover': 'rgba(255, 255, 255, 0.16)',
        '--surface-muted': 'rgba(255, 255, 255, 0.07)',
        '--text-primary': '#f8fafc',
        '--text-secondary': 'rgba(248, 250, 252, 0.7)',
        '--accent': '#38bdf8',
        '--accent-hover': '#7dd3fc',
        '--border': 'rgba(255, 255, 255, 0.2)',
        '--shadow': '0 8px 32px rgba(0, 0, 0, 0.22)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.32)',
        '--search-bg': 'rgba(255, 255, 255, 0.12)',
        '--cal-today': '#38bdf8',
        '--cal-friday': '#fb7185',
        '--tile-bg': 'rgba(255, 255, 255, 0.12)',
        '--input-bg': 'rgba(255, 255, 255, 0.1)'
      },
      light: {
        '--bg-card': 'rgba(255, 255, 255, 0.48)',
        '--bg-card-hover': 'rgba(255, 255, 255, 0.58)',
        '--surface-muted': 'rgba(255, 255, 255, 0.38)',
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--accent': '#0ea5e9',
        '--accent-hover': '#0284c7',
        '--border': 'rgba(255, 255, 255, 0.55)',
        '--shadow': '0 8px 32px rgba(0, 0, 0, 0.08)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.14)',
        '--search-bg': 'rgba(255, 255, 255, 0.58)',
        '--cal-today': '#0ea5e9',
        '--cal-friday': '#ef4444',
        '--tile-bg': 'rgba(255, 255, 255, 0.5)',
        '--input-bg': 'rgba(255, 255, 255, 0.42)'
      }
    }
  };

  const GRADIENTS = {
    midnight: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    ocean: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 50%, #0e7490 100%)',
    aurora: 'linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #0e7490 100%)',
    sunset: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #9a3412 100%)',
    forest: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
    lavender: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #6b21a8 100%)',
    night: 'linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e293b 100%)'
  };

  const WALLPAPERS = {
    nature: [
      { id: '26748', url: 'https://4kwallpapers.com/images/wallpapers/stac-a-phris-arch-1920x1080-26748.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26748.jpg' },
      { id: '26444', url: 'https://4kwallpapers.com/images/wallpapers/lunar-tides-1920x1080-26444.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26444.jpg' },
      { id: '26357', url: 'https://4kwallpapers.com/images/wallpapers/mountain-peaks-teal-1920x1080-26357.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26357.jpg' },
      { id: '26446', url: 'https://4kwallpapers.com/images/wallpapers/black-volcanic-sand-1920x1080-26446.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26446.jpg' }
    ],
    space: [
      { id: '26741', url: 'https://4kwallpapers.com/images/wallpapers/europa-jupiter-moon-1920x1080-26741.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26741.jpg' },
      { id: '26342', url: 'https://4kwallpapers.com/images/wallpapers/planet-earth-dark-1920x1080-26342.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26342.jpg' },
      { id: '26344', url: 'https://4kwallpapers.com/images/wallpapers/moon-dark-1920x1080-26344.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26344.jpg' },
      { id: '26347', url: 'https://4kwallpapers.com/images/wallpapers/mars-red-planet-1920x1080-26347.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26347.jpg' }
    ],
    minimal: [
      { id: '26734', url: 'https://4kwallpapers.com/images/wallpapers/metallic-abstract-1920x1080-26734.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26734.jpg' },
      { id: '26307', url: 'https://4kwallpapers.com/images/wallpapers/lone-tree-1920x1080-26307.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26307.jpg' },
      { id: '26517', url: 'https://4kwallpapers.com/images/wallpapers/zenitsu-agatsuma-1920x1080-26517.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26517.jpg' },
      { id: '26106', url: 'https://4kwallpapers.com/images/wallpapers/marshmello-material-1920x1080-26106.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26106.jpg' }
    ],
    anime: [
      { id: '26719', url: 'https://4kwallpapers.com/images/wallpapers/sakamoto-days-1920x1080-26719.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26719.jpg' },
      { id: '26732', url: 'https://4kwallpapers.com/images/wallpapers/lumine-intertwined-1920x1080-26732.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26732.jpg' },
      { id: '26691', url: 'https://4kwallpapers.com/images/wallpapers/pain-nagato-black-1920x1080-26691.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26691.jpg' },
      { id: '26716', url: 'https://4kwallpapers.com/images/wallpapers/reze-selfie-1920x1080-26716.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26716.jpg' }
    ],
    cars: [
      { id: '26722', url: 'https://4kwallpapers.com/images/wallpapers/genesis-magma-gt3-1920x1080-26722.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26722.jpg' },
      { id: '26727', url: 'https://4kwallpapers.com/images/wallpapers/bugatti-w16-mistral-1920x1080-26727.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26727.jpg' },
      { id: '26704', url: 'https://4kwallpapers.com/images/wallpapers/audi-nuvolari-super-1920x1080-26704.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26704.jpg' },
      { id: '26708', url: 'https://4kwallpapers.com/images/wallpapers/bmw-m-concept-neue-1920x1080-26708.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26708.jpg' }
    ],
    abstract: [
      { id: '26737', url: 'https://4kwallpapers.com/images/wallpapers/microsoft-surface-1920x1080-26737.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26737.jpg' },
      { id: '26735', url: 'https://4kwallpapers.com/images/wallpapers/microsoft-surface-1920x1080-26735.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26735.jpg' },
      { id: '26687', url: 'https://4kwallpapers.com/images/wallpapers/huawei-gradient-1920x1080-26687.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26687.jpg' },
      { id: '26686', url: 'https://4kwallpapers.com/images/wallpapers/huawei-dark-mode-1920x1080-26686.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26686.jpg' }
    ]
  };

  const WALLPAPER_CATEGORY_KEYS = {
    nature: 'wpNature',
    space: 'wpSpace',
    minimal: 'wpMinimal',
    anime: 'wpAnime',
    cars: 'wpCars',
    abstract: 'wpAbstract'
  };

  const BASE_DARK_VARS = {
    '--surface-muted': 'rgba(255, 255, 255, 0.07)',
    '--tile-bg': 'rgba(255, 255, 255, 0.12)',
    '--input-bg': 'rgba(255, 255, 255, 0.1)',
    '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.32)'
  };

  let settingsPanelsRendered = false;

  function ensureSettingsPanels() {
    if (settingsPanelsRendered) return;
    settingsPanelsRendered = true;
    renderThemeGrid();
    renderGradientGrid();
    renderWallpaperGallery();
  }

  function init() {
    document.getElementById('btn-settings').addEventListener('click', openSettings);
    setupTabs();
    setupBackgroundControls();
    setupLanguageToggle();
    setupLocationControls();
    setupGoogleServicesControls();
    setupBackupControls();
  }

  function openSettings() {
    ensureSettingsPanels();
    syncControlsFromSettings();
    renderGoogleServicesSettings();
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

  function setupLanguageToggle() {
    document.querySelectorAll('.lang-btn:not(.onboarding-lang-btn)').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await I18n.setLanguage(btn.dataset.lang);
        updateLanguageButtons(btn.dataset.lang);
      });
    });
  }

  function updateLanguageButtons(lang) {
    document.querySelectorAll('.lang-btn:not(.onboarding-lang-btn)').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  let settingsLocationPicker = null;

  function buildLocationLabel(settings) {
    return [settings.city, settings.country].filter(Boolean).join(getSeparator());
  }

  function getSeparator() {
    return I18n.getLang() === 'fa' ? '، ' : ', ';
  }

  async function refreshLocationLabels() {
    const s = Storage.getSettings();
    if (s.locationLat == null || s.locationLon == null) {
      settingsLocationPicker?.clear();
      return;
    }

    const resolved = await LocationPicker.resolveLocation(s.locationLat, s.locationLon);
    if (!resolved) return;

    await Storage.updateSettings({
      city: resolved.name,
      country: resolved.country
    });

    settingsLocationPicker?.setDisplay(resolved.label, resolved);
  }

  async function syncLocationDisplay() {
    const s = Storage.getSettings();
    if (s.locationLat == null || s.locationLon == null) {
      settingsLocationPicker?.clear();
      return;
    }

    const resolved = await LocationPicker.resolveLocation(s.locationLat, s.locationLon);
    if (resolved) {
      settingsLocationPicker?.setDisplay(resolved.label, resolved);
      return;
    }

    const label = buildLocationLabel(s);
    settingsLocationPicker?.setDisplay(label, label ? {
      name: s.city,
      country: s.country,
      countryCode: s.countryCode,
      lat: s.locationLat,
      lon: s.locationLon,
      timezone: s.timezone,
      label
    } : null);
  }

  function getCalendarTypeLabel(calendarType) {
    const map = {
      jalali: 'calendarJalali',
      gregorian: 'calendarGregorian',
      hijri: 'calendarHijri'
    };
    return I18n.t(map[calendarType] || 'calendarJalali');
  }

  function updateCalendarTypeHint(calendarType) {
    const el = document.getElementById('setting-calendar-type-hint');
    if (!el) return;
    const type = calendarType || Storage.getSettings().calendarType || 'jalali';
    el.textContent = `${I18n.t('calendarType')}: ${getCalendarTypeLabel(type)} — ${I18n.t('calendarTypeAuto')}`;
  }

  function initSettingsLocationPicker() {
    settingsLocationPicker = LocationPicker.attach({
      inputId: 'setting-location-search',
      listId: 'setting-location-suggestions',
      hiddenId: 'setting-location-data',
      onSelect: (item) => updateCalendarTypeHint(RegionHelper.calendarTypeForCountry(item.countryCode))
    });
  }

  function setupLocationControls() {
    initSettingsLocationPicker();
    document.getElementById('btn-save-location').addEventListener('click', saveLocationSettings);
  }

  async function saveLocationSettings() {
    const input = document.getElementById('setting-location-search');
    if (!input.value.trim()) {
      await Storage.updateSettings({
        country: '',
        city: '',
        countryCode: '',
        timezone: '',
        locationLat: null,
        locationLon: null,
        calendarType: 'jalali'
      });
      settingsLocationPicker?.clear();
      CalendarUI.refresh();
      WeatherUI.reload();
      updateCalendarTypeHint('jalali');
      return;
    }

    const selected = settingsLocationPicker?.getSelected();
    if (!selected) {
      alert(I18n.t('selectFromSuggestions'));
      return;
    }

    await WeatherUI.applyLocation(selected);
    updateCalendarTypeHint();
    alert(I18n.t('locationSaved'));
  }

  function setupGoogleServicesControls() {
    document.getElementById('toggle-google-services-visible').addEventListener('change', async (e) => {
      await Storage.updateSettings({ googleServicesVisible: e.target.checked });
      GoogleServicesUI.render();
      renderGoogleServicesSettings();
    });
  }

  function renderGoogleServicesSettings() {
    const container = document.getElementById('google-services-settings');
    if (!container) return;

    const enabled = new Set(GoogleServicesUI.getEnabledServices());
    const visible = Storage.getSettings().googleServicesVisible !== false;
    container.classList.toggle('is-disabled', !visible);

    container.innerHTML = GoogleServicesUI.getServices().map((service) => `
      <label class="service-toggle">
        <input type="checkbox" data-service-id="${service.id}" ${enabled.has(service.id) ? 'checked' : ''} ${visible ? '' : 'disabled'}>
        <span>${I18n.t(service.nameKey)}</span>
      </label>
    `).join('');

    container.querySelectorAll('input[data-service-id]').forEach((checkbox) => {
      checkbox.addEventListener('change', async () => {
        const current = new Set(GoogleServicesUI.getEnabledServices());
        if (checkbox.checked) current.add(checkbox.dataset.serviceId);
        else current.delete(checkbox.dataset.serviceId);
        await Storage.updateSettings({ enabledGoogleServices: [...current] });
        GoogleServicesUI.render();
      });
    });
  }

  function renderThemeGrid() {
    const grid = document.getElementById('theme-grid');
    const settings = Storage.getSettings();

    grid.innerHTML = Object.entries(THEMES).map(([key, theme]) => {
      const preview = key === 'glass'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(56,189,248,0.35) 100%)'
        : theme.accent;
      return `
        <button class="theme-card ${settings.theme === key ? 'active' : ''}" data-theme="${key}">
          <div class="theme-preview ${key === 'glass' ? 'theme-preview-glass' : ''}" style="background: ${preview}"></div>
          <span>${I18n.t(theme.nameKey)}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.theme-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const themeKey = card.dataset.theme;
        await Storage.updateSettings({ theme: themeKey });
        grid.querySelectorAll('.theme-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
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
        await applyBackground();
      });
    });
  }

  function updateColorPickerUI(color) {
    const normalized = (color || '#000000').toLowerCase();
    const picker = document.getElementById('bg-color-picker');
    const preview = document.getElementById('bg-color-preview');
    const hexEl = document.getElementById('bg-color-hex');
    if (picker) picker.value = normalized;
    if (preview) preview.style.background = normalized;
    if (hexEl) hexEl.textContent = normalized.toUpperCase();
    document.querySelectorAll('.color-preset').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.color.toLowerCase() === normalized);
    });
  }

  function renderWallpaperGallery() {
    const container = document.getElementById('wallpaper-gallery');
    if (!container) return;

    const settings = Storage.getSettings();
    container.innerHTML = Object.entries(WALLPAPERS).map(([category, items]) => `
      <div class="wallpaper-category">
        <h5 class="wallpaper-category-title">${I18n.t(WALLPAPER_CATEGORY_KEYS[category])}</h5>
        <div class="wallpaper-grid">
          ${items.map((wallpaper) => `
            <button type="button"
                    class="wallpaper-card ${settings.bgImage === wallpaper.url ? 'active' : ''}"
                    data-url="${wallpaper.url}"
                    style="background-image:url('${wallpaper.thumb}')"
                    title="${I18n.t(WALLPAPER_CATEGORY_KEYS[category])}"></button>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.wallpaper-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const url = card.dataset.url;
        card.classList.add('loading');
        await Storage.updateSettings({ bgImage: url, bgType: 'image' });
        document.getElementById('bg-image-url').value = url;
        document.querySelector('input[name="bg-type"][value="image"]').checked = true;
        showBgOptions('image');
        container.querySelectorAll('.wallpaper-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        try {
          await applyBackground();
        } finally {
          card.classList.remove('loading');
        }
      });
    });
  }

  function updateWallpaperSelection(url) {
    document.querySelectorAll('.wallpaper-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.url === url);
    });
  }

  function setupBackgroundControls() {
    document.querySelectorAll('input[name="bg-type"]').forEach((radio) => {
      radio.addEventListener('change', async (e) => {
        await Storage.updateSettings({ bgType: e.target.value });
        showBgOptions(e.target.value);
        await applyBackground();
      });
    });

    document.getElementById('bg-color-picker').addEventListener('input', async (e) => {
      const color = e.target.value;
      updateColorPickerUI(color);
      await Storage.updateSettings({ bgColor: color });
      await applyBackground();
    });

    document.querySelectorAll('.color-preset').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const color = btn.dataset.color;
        updateColorPickerUI(color);
        await Storage.updateSettings({ bgColor: color, bgType: 'color' });
        document.querySelector('input[name="bg-type"][value="color"]').checked = true;
        showBgOptions('color');
        await applyBackground();
      });
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
        updateWallpaperSelection('');
        await applyBackground();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('bg-blur').addEventListener('input', async (e) => {
      const val = e.target.value;
      document.getElementById('bg-blur-value').textContent = val + 'px';
      await Storage.updateSettings({ bgBlur: parseInt(val, 10) });
      await applyBackground();
    });

    document.getElementById('bg-overlay').addEventListener('input', async (e) => {
      const val = e.target.value;
      document.getElementById('bg-overlay-value').textContent = val + '%';
      await Storage.updateSettings({ bgOverlay: parseInt(val, 10) });
      await applyBackground();
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
    updateWallpaperSelection(url);
    await applyBackground();
  }

  function setupBackupControls() {
    document.getElementById('btn-export-data').addEventListener('click', () => {
      const data = Storage.exportAllData();
      const date = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tabyar-backup-${date}.json`;
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
          await applyAll();
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
        await applyAll();
        I18n.applyDom();
        BookmarksUI.render();
        CalendarUI.refresh();
        NotesUI.render();
        ensureSettingsPanels();
        syncControlsFromSettings();
      }
    });

    document.getElementById('btn-import-chrome-bookmarks').addEventListener('click', importChromeBookmarks);
  }

  async function importChromeBookmarks() {
    if (!confirm(I18n.t('importChromeConfirm'))) return;

    try {
      const tree = await new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((nodes) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(nodes);
        });
      });
      await Storage.importBookmarkTree(tree);
      BookmarksUI.render();
      alert(I18n.t('importSuccess'));
    } catch (err) {
      console.error('Tabyar: bookmark import failed', err);
      alert(I18n.t('importFailed'));
    }
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
    updateColorPickerUI(s.bgColor);
    document.getElementById('bg-image-url').value = s.bgImage.startsWith('data:') ? '' : s.bgImage;
    document.getElementById('bg-blur').value = s.bgBlur;
    document.getElementById('bg-blur-value').textContent = s.bgBlur + 'px';
    document.getElementById('bg-overlay').value = s.bgOverlay;
    document.getElementById('bg-overlay-value').textContent = s.bgOverlay + '%';
    updateLanguageButtons(s.language || 'fa');
    syncLocationDisplay();
    updateCalendarTypeHint(s.calendarType);

    const toggleGs = document.getElementById('toggle-google-services-visible');
    if (toggleGs) toggleGs.checked = s.googleServicesVisible !== false;
    renderGoogleServicesSettings();
  }

  function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.glass;
    const vars = { ...BASE_DARK_VARS, ...theme.dark };
    const root = document.documentElement;
    const body = document.body;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
      body.style.setProperty(key, val);
    });
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    body.classList.toggle('glass-theme', themeKey === 'glass');
  }

  function resetBackgroundLayer(layer) {
    layer.style.filter = '';
    layer.style.background = '';
    layer.style.backgroundImage = '';
    layer.style.backgroundSize = '';
    layer.style.backgroundPosition = '';
    layer.classList.remove('bg-loading');
  }

  async function applyBackgroundImage(s) {
    const layer = document.getElementById('background-layer');
    if (!layer || s.bgType !== 'image' || !s.bgImage) return;

    layer.classList.add('bg-loading');
    try {
      const src = await WallpaperLoader.resolve(s.bgImage);
      layer.style.backgroundImage = `url("${src}")`;
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = 'center';
      layer.style.filter = `blur(${s.bgBlur}px)`;
      layer.style.setProperty('--bg-overlay-opacity', s.bgOverlay / 100);
    } catch (err) {
      console.warn('Tabyar: wallpaper load failed', err);
    } finally {
      layer.classList.remove('bg-loading');
    }
  }

  function applyBackgroundSync() {
    const s = Storage.getSettings();
    const layer = document.getElementById('background-layer');
    if (!layer) return;

    resetBackgroundLayer(layer);

    if (s.bgType === 'gradient') {
      layer.style.background = GRADIENTS[s.bgGradient] || GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      layer.style.background = s.bgColor;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'image' && s.bgImage) {
      layer.style.background = GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
      applyBackgroundImage(s);
    }
  }

  async function applyBackground() {
    const s = Storage.getSettings();
    const layer = document.getElementById('background-layer');
    if (!layer) return;

    resetBackgroundLayer(layer);

    if (s.bgType === 'gradient') {
      layer.style.background = GRADIENTS[s.bgGradient] || GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      layer.style.background = s.bgColor;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'image' && s.bgImage) {
      layer.style.background = GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
      await applyBackgroundImage(s);
    }
  }

  function applyQuick() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    applyBackgroundSync();
    updateLanguageButtons(s.language || 'fa');
  }

  async function applyAll() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    await applyBackground();
    updateLanguageButtons(s.language || 'fa');
  }

  async function reapplyAppearance() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    await applyBackground();
  }

  function refreshI18n() {
    ensureSettingsPanels();
    renderThemeGrid();
    renderWallpaperGallery();
    renderGoogleServicesSettings();
    syncControlsFromSettings();
  }

  return { init, applyQuick, applyAll, refreshI18n, refreshLocationLabels, updateLanguageButtons, reapplyAppearance };
})();
