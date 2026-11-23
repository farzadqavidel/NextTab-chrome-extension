const WeatherUI = (() => {
  const SLOT_CONFIG = {
    primary: {
      widget: 'weather-widget',
      icon: 'weather-icon',
      temp: 'weather-temp',
      desc: 'weather-desc',
      getCoords(settings) {
        return {
          lat: settings.locationLat,
          lon: settings.locationLon,
          city: settings.city,
          country: settings.country,
          timezone: settings.timezone,
          countryCode: settings.countryCode
        };
      }
    },
    secondary: {
      widget: 'weather-widget-2',
      icon: 'weather-icon-2',
      temp: 'weather-temp-2',
      desc: 'weather-desc-2',
      getCoords(settings) {
        return {
          lat: settings.secondLocationLat,
          lon: settings.secondLocationLon,
          city: settings.secondCity,
          country: settings.secondCountry,
          timezone: settings.secondTimezone,
          countryCode: settings.secondCountryCode
        };
      }
    }
  };

  const els = {};

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const state = {
    primary: { forecastData: null, cityLabel: '' },
    secondary: { forecastData: null, cityLabel: '' }
  };
  let activeSlot = 'primary';
  let isOpen = false;

  function getSlotEls(slot) {
    const cfg = SLOT_CONFIG[slot];
    return {
      widget: document.getElementById(cfg.widget),
      icon: document.getElementById(cfg.icon),
      temp: document.getElementById(cfg.temp),
      desc: document.getElementById(cfg.desc)
    };
  }

  function hasSecondaryLocation() {
    const s = Storage.getSettings();
    return s.secondLocationLat != null && s.secondLocationLon != null;
  }

  function updateSecondaryVisibility() {
    const unit = document.getElementById('location-unit-secondary');
    const card = document.querySelector('.day-info-card');
    const dashboard = document.getElementById('dashboard');
    const hasSecond = hasSecondaryLocation();

    if (unit) unit.classList.toggle('hidden', !hasSecond);
    if (card) card.classList.toggle('has-second-location', hasSecond);
    if (dashboard) dashboard.classList.toggle('has-second-location', hasSecond);
  }

  function init() {
    els.modal = document.getElementById('modal-weather');
    els.modalBody = document.getElementById('weather-modal-body');

    Object.keys(SLOT_CONFIG).forEach((slot) => {
      const slotEls = getSlotEls(slot);
      if (!slotEls.widget) return;
      slotEls.widget.addEventListener('click', (e) => openModal(e, slot));
    });

    els.modal?.querySelector('[data-close="modal-weather"]')?.addEventListener('click', closeModal);
    els.modal?.addEventListener('click', (e) => {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    });

    updateSecondaryVisibility();
    loadAllWeather();
  }

  function openModal(e, slot) {
    e.stopPropagation();
    activeSlot = slot;
    if (!state[slot]?.forecastData || !els.modal) return;
    isOpen = true;
    TabyarUI.openModal('modal-weather');
    renderForecastModal();
  }

  function closeModal() {
    isOpen = false;
    TabyarUI.closeModal('modal-weather');
  }

  async function loadAllWeather() {
    await loadWeatherSlot('primary');
    if (hasSecondaryLocation()) {
      await loadWeatherSlot('secondary');
    } else {
      clearSlot('secondary');
    }
    updateSecondaryVisibility();
  }

  async function loadWeather() {
    await loadAllWeather();
  }

  function renderUnavailable(slot) {
    const slotEls = getSlotEls(slot);
    state[slot].forecastData = null;
    state[slot].cityLabel = '';
    if (slotEls.widget) slotEls.widget.classList.add('is-unavailable');
    if (slotEls.icon) slotEls.icon.textContent = '';
    if (slotEls.temp) slotEls.temp.textContent = '';
    if (slotEls.desc) slotEls.desc.textContent = I18n.t('weatherUnavailable');
    if (slotEls.widget) slotEls.widget.title = I18n.t('weatherUnavailable');
  }

  async function loadWeatherSlot(slot) {
    const slotEls = getSlotEls(slot);
    if (!slotEls.desc) return;

    if (slotEls.widget) slotEls.widget.classList.remove('is-unavailable');
    slotEls.desc.textContent = I18n.t('weatherLoading');
    try {
      const coords = await resolveCoords(slot);
      state[slot].cityLabel = coords.city || '';
      await fetchWeather(slot, coords.lat, coords.lon);
    } catch {
      renderUnavailable(slot);
    }
  }

  function clearSlot(slot) {
    renderUnavailable(slot);
  }

  async function resolveCoords(slot) {
    const s = Storage.getSettings();
    const coords = SLOT_CONFIG[slot].getCoords(s);

    if (coords.lat != null && coords.lon != null) {
      const resolved = await LocationPicker.resolveLocation(coords.lat, coords.lon);
      return {
        lat: coords.lat,
        lon: coords.lon,
        city: resolved?.name || coords.city || ''
      };
    }

    if (slot === 'primary') {
      if (s.city || s.country) {
        const hit = await geocodeLocation(s.city, s.country);
        if (hit) {
          await Storage.updateSettings({
            locationLat: hit.lat,
            locationLon: hit.lon
          });
          return hit;
        }
      }

      if (navigator.geolocation) {
        let denied = false;
        if (navigator.permissions?.query) {
          try {
            const status = await navigator.permissions.query({ name: 'geolocation' });
            denied = status.state === 'denied';
          } catch {
            /* Permissions API unavailable */
          }
        }

        if (!denied) {
          try {
            const pos = await getPosition();
            const city = await reverseGeocode(pos.lat, pos.lon);
            return { lat: pos.lat, lon: pos.lon, city: city || Locale.timezoneLabel() };
          } catch {
            /* fall through */
          }
        }
      }

      return geocodeFromTimezone();
    }

    throw new Error('secondary location unavailable');
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        reject,
        { timeout: 8000, maximumAge: 600000, enableHighAccuracy: false }
      );
    });
  }

  async function reverseGeocode(lat, lon) {
    const lang = I18n.getRegionalLang() === 'fa' ? 'fa' : 'en';
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=${lang}&count=1`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    return data.results?.[0]?.name || '';
  }

  async function searchGeocode(name, lang, count = 1) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=${count}&language=${lang}`;
    const res = await fetch(url);
    if (!res.ok) return count === 1 ? null : [];
    const data = await res.json();
    if (count === 1) {
      const r = data.results?.[0];
      if (!r) return null;
      return mapGeocodeResult(r, name);
    }
    return (data.results || []).map((r) => mapGeocodeResult(r, r.name));
  }

  function mapGeocodeResult(r, fallbackName) {
    return {
      lat: r.latitude,
      lon: r.longitude,
      city: r.name || fallbackName,
      country: r.country || '',
      countryCode: r.country_code || '',
      timezone: r.timezone || '',
      admin1: r.admin1 || '',
      label: [r.name, r.admin1, r.country].filter(Boolean).join(I18n.getRegionalLang() === 'fa' ? '، ' : ', ')
    };
  }

  async function geocodeLocation(city, country) {
    const lang = I18n.getRegionalLang() === 'fa' ? 'fa' : 'en';
    const queries = [
      [city, country].filter(Boolean).join(', '),
      city,
      country
    ].filter(Boolean);

    for (const q of queries) {
      const hit = await searchGeocode(q, lang);
      if (hit) {
        return { ...hit, city: city || hit.city, country: country || hit.country };
      }
    }
    return null;
  }

  async function applyLocation(result) {
    const updates = LocationPicker.buildLocationUpdates(result);
    await Storage.updateSettings(updates);
    CalendarUI.refresh();
    await loadAllWeather();
    return updates;
  }

  async function applySecondLocation(result) {
    const updates = LocationPicker.buildLocationUpdates(result, 'second');
    await Storage.updateSettings(updates);
    await loadWeatherSlot('secondary');
    updateSecondaryVisibility();
    CalendarUI.refresh();
    return updates;
  }

  async function clearSecondLocation() {
    await Storage.updateSettings({
      secondCity: '',
      secondCountry: '',
      secondCountryCode: '',
      secondTimezone: '',
      secondLocationLat: null,
      secondLocationLon: null
    });
    clearSlot('secondary');
    updateSecondaryVisibility();
    CalendarUI.refresh();
  }

  async function geocodeFromTimezone() {
    const tz = Locale.getTimezone();
    const lang = I18n.getRegionalLang() === 'fa' ? 'fa' : 'en';
    const tzLabel = Locale.timezoneLabel();
    const queries = [tzLabel, tz.replace(/_/g, ' ')];

    for (const q of queries) {
      const hit = await searchGeocode(q, lang);
      if (hit) return hit;
    }

    try {
      const region = new Intl.Locale(navigator.language).maximize().region;
      if (region) {
        const hit = await searchGeocode(region, lang);
        if (hit) return { ...hit, city: tzLabel };
        try {
          const countryName = new Intl.DisplayNames([lang], { type: 'region' }).of(region);
          if (countryName) {
            const countryHit = await searchGeocode(countryName, lang);
            if (countryHit) return { ...countryHit, city: tzLabel };
          }
        } catch {
          /* DisplayNames unsupported */
        }
      }
    } catch {
      /* Intl.Locale unsupported */
    }

    throw new Error('location unavailable');
  }

  async function fetchWeather(slot, lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&past_days=3&forecast_days=5&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('weather fetch failed');
    state[slot].forecastData = await res.json();
    renderCurrent(slot);
  }

  function getTodayKey(slot) {
    const tz = state[slot].forecastData?.timezone ||
      (slot === 'secondary' ? Storage.getSettings().secondTimezone : Locale.getTimezone());
    return Locale.formatDateISO(new Date(), tz);
  }

  function renderCurrent(slot) {
    const slotEls = getSlotEls(slot);
    const forecastData = state[slot].forecastData;
    if (!forecastData?.current || !slotEls.widget) return;

    const cur = forecastData.current;
    const w = I18n.getWmo(cur.weather_code);
    if (slotEls.widget) slotEls.widget.classList.remove('is-unavailable');
    if (slotEls.icon) slotEls.icon.textContent = w.icon;
    if (slotEls.temp) slotEls.temp.textContent = `${Math.round(cur.temperature_2m)}°`;
    if (slotEls.desc) slotEls.desc.textContent = w.label;
    slotEls.widget.title = `${w.label} — ${I18n.t('weatherClick')}`;
  }

  function renderForecastModal() {
    const forecastData = state[activeSlot].forecastData;
    const cityLabel = state[activeSlot].cityLabel;
    if (!forecastData?.daily || !els.modalBody) return;

    const cur = forecastData.current;
    const w = I18n.getWmo(cur.weather_code);
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = forecastData.daily;
    const today = getTodayKey(activeSlot);

    let listHtml = '';
    for (let i = 0; i < time.length; i++) {
      const d = time[i];
      const dayW = I18n.getWmo(weather_code[i]);
      const max = Math.round(temperature_2m_max[i]);
      const min = Math.round(temperature_2m_min[i]);
      let label;

      if (d === today) label = I18n.t('weatherToday');
      else if (d === Locale.offsetDateISO(today, 1)) label = I18n.t('weatherTomorrow');
      else if (d === Locale.offsetDateISO(today, -1)) label = I18n.t('weatherYesterday');
      else if (d < today) label = I18n.t('weatherDaysAgo', { n: Math.abs(dayDiff(today, d)) });
      else label = I18n.t('weatherDaysLater', { n: dayDiff(today, d) });

      listHtml += `
        <li class="weather-forecast-item ${d === today ? 'today' : ''}">
          <span class="wf-day">${label}</span>
          <span class="wf-icon">${dayW.icon}</span>
          <span class="wf-label">${dayW.label}</span>
          <span class="wf-temp">${I18n.formatDigits(min)}° / ${I18n.formatDigits(max)}°</span>
        </li>`;
    }

    els.modalBody.innerHTML = `
      <div class="weather-modal-current">
        <div class="weather-modal-current-main">
          <span class="weather-modal-big-icon">${w.icon}</span>
          <div class="weather-modal-current-info">
            <span class="weather-modal-big-temp">${Math.round(cur.temperature_2m)}°</span>
            <span class="weather-modal-current-label">${w.label}</span>
            ${cityLabel ? `<span class="weather-modal-city">${escapeHtml(cityLabel)}</span>` : ''}
          </div>
        </div>
        <div class="weather-modal-stats">
          <div class="weather-stat">
            <span class="weather-stat-label">${I18n.t('humidity')}</span>
            <span class="weather-stat-value">${I18n.formatDigits(Math.round(cur.relative_humidity_2m))}%</span>
          </div>
          <div class="weather-stat">
            <span class="weather-stat-label">${I18n.t('wind')}</span>
            <span class="weather-stat-value">${I18n.formatDigits(Math.round(cur.wind_speed_10m))} km/h</span>
          </div>
        </div>
      </div>
      <div class="weather-modal-forecast">
        <h3 class="weather-panel-title">${I18n.t('weatherForecast')}</h3>
        <ul class="weather-forecast-list">${listHtml}</ul>
      </div>
    `;
  }

  function dayDiff(from, to) {
    return Math.round((new Date(to) - new Date(from)) / 86400000);
  }

  function refresh() {
    renderCurrent('primary');
    if (hasSecondaryLocation()) renderCurrent('secondary');
    if (isOpen) renderForecastModal();
  }

  return {
    init,
    refresh,
    reload: loadWeather,
    geocodeLocation,
    applyLocation,
    applySecondLocation,
    clearSecondLocation,
    hasSecondaryLocation
  };
})();
