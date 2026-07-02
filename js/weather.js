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
      const pos = await getPosition();
      await fetchWeather(pos.lat, pos.lon);
      cityLabel = '';
    } catch {
      await fetchWeather(35.6892, 51.3890);
      cityLabel = I18n.t('tehran');
    }
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject();
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
        reject,
        { timeout: 8000, maximumAge: 600000 }
      );
    });
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

  function renderCurrent() {
    if (!forecastData?.current) return;
    const cur = forecastData.current;
    const w = I18n.getWmo(cur.weather_code);
    els.icon.textContent = w.icon;
    els.temp.textContent = `${Math.round(cur.temperature_2m)}°`;
    els.desc.textContent = cityLabel || w.label;
    els.widget.title = `${w.label} — ${I18n.t('weatherClick')}`;
  }

  function renderForecastModal() {
    if (!forecastData?.daily || !els.modalBody) return;

    const cur = forecastData.current;
    const w = I18n.getWmo(cur.weather_code);
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = forecastData.daily;
    const today = new Date().toISOString().slice(0, 10);

    let listHtml = '';
    for (let i = 0; i < time.length; i++) {
      const d = time[i];
      const dayW = I18n.getWmo(weather_code[i]);
      const max = Math.round(temperature_2m_max[i]);
      const min = Math.round(temperature_2m_min[i]);
      let label;

      if (d === today) label = I18n.t('weatherToday');
      else if (d === offsetDate(today, 1)) label = I18n.t('weatherTomorrow');
      else if (d === offsetDate(today, -1)) label = I18n.t('weatherYesterday');
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

  function offsetDate(iso, days) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function dayDiff(from, to) {
    return Math.round((new Date(to) - new Date(from)) / 86400000);
  }

  function refresh() {
    renderCurrent();
    if (isOpen) renderForecastModal();
  }

  return { init, refresh };
})();
