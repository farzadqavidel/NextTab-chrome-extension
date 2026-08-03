const GoogleServicesUI = (() => {
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
          ${Favicon.imgHtml('https://' + service.icon, I18n.t(service.nameKey))}
        </span>
        <span class="gs-tile-label">${I18n.t(service.nameKey)}</span>
      </a>
    `).join('');

    Favicon.bindAll(grid, 'img');
  }

  function getServices() {
    return SERVICES;
  }

  return { init, render, getServices, getEnabledServices };
})();
