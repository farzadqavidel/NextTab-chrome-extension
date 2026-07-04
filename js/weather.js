const WeatherUI = (() => {
  const els = {};
  let forecastData = null;
  let isOpen = false;
  let cityLabel = '';

  function init() {
    els.widget = document.getElementById('weather-widget');
    els.icon = document.getElementById('weather-icon');
    els.temp = document.getElementById('weather-temp');
    els.desc = document.getElementById('weather-desc');
    els.modal = document.getElementById('modal-weather');
    els.modalBody = document.getElementById('weather-modal-body');

    if (!els.widget) return;

    els.widget.addEventListener('click', openModal);
    els.modal?.querySelector('[data-close="modal-weather"]')?.addEventListener('click', closeModal);
    els.modal?.addEventListener('click', (e) => {
      if (e.target === els.modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    });

    loadWeather();
  }

  function openModal(e) {
    e.stopPropagation();
    if (!forecastData || !els.modal) return;
    isOpen = true;
    els.modal.classList.remove('hidden');
    renderForecastModal();
  }

  function closeModal() {
    isOpen = false;
    els.modal?.classList.add('hidden');
  }

  async function loadWeather() {
    if (els.desc) els.desc.textContent = I18n.t('weatherLoading');
    try {
      const coords = await resolveCoords();
      cityLabel = coords.city || '';
      await fetchWeather(coords.lat, coords.lon);
    } catch {
      if (els.desc) els.desc.textContent = I18n.t('weatherUnavailable');
    }
  }

  async function resolveCoords() {
    const s = Storage.getSettings();
    if (s.locationLat != null && s.locationLon != null) {
      const resolved = await LocationPicker.resolveLocation(s.locationLat, s.locationLon);
      return {
        lat: s.locationLat,
        lon: s.locationLon,
        city: resolved?.name || s.city || ''
      };
    }

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
          /* fall through to timezone geocoding */
        }
      }
    }

    return geocodeFromTimezone();
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
    const lang = I18n.getLang() === 'fa' ? 'fa' : 'en';
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
      label: [r.name, r.admin1, r.country].filter(Boolean).join(I18n.getLang() === 'fa' ? '، ' : ', ')
    };
  }

  async function geocodeLocation(city, country) {
    const lang = I18n.getLang() === 'fa' ? 'fa' : 'en';
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
    await loadWeather();
    return updates;
  }

  async function geocodeFromTimezone() {
    const tz = Locale.getTimezone();
    const lang = I18n.getLang() === 'fa' ? 'fa' : 'en';
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

  async function fetchWeather(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&past_days=3&forecast_days=5&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('weather fetch failed');
    forecastData = await res.json();
    renderCurrent();
  }

  function getTodayKey() {
    const tz = forecastData?.timezone || Locale.getTimezone();
    return Locale.formatDateISO(new Date(), tz);
  }

  function renderCurrent() {
    if (!forecastData?.current) return;
    const cur = forecastData.current;
    const w = I18n.getWmo(cur.weather_code);
    els.icon.textContent = w.icon;
    els.temp.textContent = `${Math.round(cur.temperature_2m)}°`;
    els.desc.textContent = cityLabel ? `${cityLabel} · ${w.label}` : w.label;
    els.widget.title = `${w.label} — ${I18n.t('weatherClick')}`;
  }

  function renderForecastModal() {
    if (!forecastData?.daily || !els.modalBody) return;

    const cur = forecastData.current;
    const w = I18n.getWmo(cur.weather_code);
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = forecastData.daily;
    const today = getTodayKey();

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
            ${cityLabel ? `<span class="weather-modal-city">${cityLabel}</span>` : ''}
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
    renderCurrent();
    if (isOpen) renderForecastModal();
  }

  return { init, refresh, reload: loadWeather, geocodeLocation, applyLocation };
})();
