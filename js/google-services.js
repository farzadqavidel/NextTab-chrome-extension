const GoogleServicesUI = (() => {
  const DEFAULT_FAVICON = 'icons/default-favicon.png';

  const SERVICES = [
    { id: 'gmail', url: 'https://mail.google.com', icon: 'mail.google.com', nameKey: 'googleGmail' },
    { id: 'drive', url: 'https://drive.google.com', icon: 'drive.google.com', nameKey: 'googleDrive' },
    { id: 'maps', url: 'https://maps.google.com', icon: 'maps.google.com', nameKey: 'googleMaps' },
    { id: 'youtube', url: 'https://www.youtube.com', icon: 'youtube.com', nameKey: 'googleYoutube' },
    { id: 'translate', url: 'https://translate.google.com', icon: 'translate.google.com', nameKey: 'googleTranslate' },
    { id: 'calendar', url: 'https://calendar.google.com', icon: 'calendar.google.com', nameKey: 'googleCalendar' },
    { id: 'photos', url: 'https://photos.google.com', icon: 'photos.google.com', nameKey: 'googlePhotos' }
  ];

  function getEnabledServices() {
    const settings = Storage.getSettings();
    return settings.enabledGoogleServices || SERVICES.map((s) => s.id);
  }

  function init() {
    render();
  }

  function render() {
    const card = document.querySelector('.google-services-card');
    const grid = document.getElementById('google-services-grid');
    if (!grid || !card) return;

    const settings = Storage.getSettings();
    if (settings.googleServicesVisible === false) {
      card.classList.add('hidden');
      return;
    }

    card.classList.remove('hidden');
    const enabled = new Set(getEnabledServices());
    const visibleServices = SERVICES.filter((service) => enabled.has(service.id));

    if (visibleServices.length === 0) {
      card.classList.add('hidden');
      return;
    }

    grid.innerHTML = visibleServices.map((service) => `
      <a href="${service.url}" class="gs-tile" title="${I18n.t(service.nameKey)}">
        <span class="gs-tile-icon">
          <img src="https://www.google.com/s2/favicons?domain=${service.icon}&sz=64" alt="" loading="lazy" data-default-favicon="${DEFAULT_FAVICON}">
        </span>
        <span class="gs-tile-label">${I18n.t(service.nameKey)}</span>
      </a>
    `).join('');

    grid.querySelectorAll('img').forEach((img) => {
      img.addEventListener('error', () => {
        if (img.dataset.fallbackApplied === 'true') return;
        img.dataset.fallbackApplied = 'true';
        img.src = DEFAULT_FAVICON;
      });
    });
  }

  function getServices() {
    return SERVICES;
  }

  return { init, render, getServices, getEnabledServices };
})();
