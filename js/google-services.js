const GoogleServicesUI = (() => {
  // Keep these icons inside the extension instead of requesting Google's
  // generic s2 favicon for every service. That endpoint often returns the
  // Google "G" for Gmail/Drive and makes the pill wait on a network request.
  const SERVICES = [
    { id: 'gmail', url: 'https://mail.google.com', iconPath: 'icons/services/gmail.webp', nameKey: 'googleGmail' },
    { id: 'drive', url: 'https://drive.google.com', iconPath: 'icons/services/drive.webp', nameKey: 'googleDrive' },
    { id: 'meet', url: 'https://meet.google.com', iconPath: 'icons/services/meet.webp', nameKey: 'googleMeet' },
    { id: 'maps', url: 'https://maps.google.com', iconPath: 'icons/services/maps.webp', nameKey: 'googleMaps' },
    { id: 'youtube', url: 'https://www.youtube.com', iconPath: 'icons/services/youtube.webp', nameKey: 'googleYoutube' },
    { id: 'translate', url: 'https://translate.google.com', iconPath: 'icons/services/translate.webp', nameKey: 'googleTranslate' },
    { id: 'calendar', url: 'https://calendar.google.com', iconPath: 'icons/services/calendar.webp', nameKey: 'googleCalendar' },
    { id: 'photos', url: 'https://photos.google.com', iconPath: 'icons/services/photos.webp', nameKey: 'googlePhotos' }
  ];

  function getEnabledServices() {
    const settings = Storage.getSettings();
    return settings.enabledGoogleServices || SERVICES.map((s) => s.id);
  }

  function init() {
    render();
  }

  function serviceIconHtml(service) {
    return `<img src="${service.iconPath}" alt="" width="22" height="22" loading="eager" decoding="async">`;
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
          ${serviceIconHtml(service)}
        </span>
        <span class="gs-tile-label">${I18n.t(service.nameKey)}</span>
      </a>
    `).join('');
  }

  function getServices() {
    return SERVICES;
  }

  return { init, render, getServices, getEnabledServices };
})();
