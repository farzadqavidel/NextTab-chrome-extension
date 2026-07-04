document.addEventListener('DOMContentLoaded', async () => {
  await Storage.load();
  I18n.init();
  await syncStoredLocationLanguage();
  await SettingsUI.applyAll();
  CalendarUI.init();
  BookmarksUI.init();
  NotesUI.init();
  SettingsUI.init();
  SearchUI.init();
  GoogleServicesUI.init();

  if (Storage.getSettings().onboardingComplete) {
    WeatherUI.init();
    showWelcomeIfNeeded();
  } else {
    await showOnboardingFlow();
  }

  document.getElementById('dashboard').classList.add('loaded');

  const searchInput = document.getElementById('search-input');
  const searchForm = document.getElementById('search-form');
  const imageInput = document.getElementById('search-image-input');

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      searchForm.submit();
    }
  });

  document.getElementById('btn-search-image').addEventListener('click', () => {
    imageInput.value = '';
    imageInput.click();
  });

  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;

    const form = document.createElement('form');
    form.action = 'https://www.google.com/searchbyimage/upload';
    form.method = 'POST';
    form.enctype = 'multipart/form-data';
    form.target = '_self';

    const input = document.createElement('input');
    input.type = 'file';
    input.name = 'encoded_image';
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  });

  const voiceBtn = document.getElementById('btn-search-voice');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = I18n.getLang() === 'fa' ? 'fa-IR' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      searchInput.value = transcript;
      if (transcript.trim()) searchForm.submit();
    };

    recognition.onend = () => voiceBtn.classList.remove('listening');
    recognition.onerror = () => voiceBtn.classList.remove('listening');

    voiceBtn.addEventListener('click', () => {
      if (voiceBtn.classList.contains('listening')) {
        recognition.stop();
        voiceBtn.classList.remove('listening');
        return;
      }
      recognition.lang = I18n.getLang() === 'fa' ? 'fa-IR' : 'en-US';
      voiceBtn.classList.add('listening');
      recognition.start();
    });
  } else {
    voiceBtn.addEventListener('click', () => {
      alert(I18n.t('voiceNotSupported'));
    });
  }
});

async function syncStoredLocationLanguage() {
  const s = Storage.getSettings();
  if (s.locationLat == null || s.locationLon == null) return;

  const resolved = await LocationPicker.resolveLocation(s.locationLat, s.locationLon);
  if (!resolved) return;

  if (resolved.name !== s.city || resolved.country !== s.country) {
    await Storage.updateSettings({
      city: resolved.name,
      country: resolved.country
    });
  }
}

function updateOnboardingLangButtons(lang) {
  document.querySelectorAll('.onboarding-lang-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

async function showOnboardingFlow() {
  const modal = document.getElementById('modal-onboarding');
  const form = document.getElementById('form-onboarding');
  const lang = Storage.getSettings().language || 'fa';

  updateOnboardingLangButtons(lang);
  modal.classList.remove('hidden');

  const onboardingPicker = LocationPicker.attach({
    inputId: 'onboarding-location-search',
    listId: 'onboarding-location-suggestions',
    hiddenId: 'onboarding-location-data'
  });

  document.querySelectorAll('.onboarding-lang-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      await I18n.setLanguage(btn.dataset.lang);
      updateOnboardingLangButtons(btn.dataset.lang);
    });
  });

  return new Promise((resolve) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const selected = onboardingPicker.getSelected();
      if (!selected) {
        alert(I18n.t('selectFromSuggestions'));
        return;
      }

      const selectedLang = document.querySelector('.onboarding-lang-btn.active')?.dataset.lang || 'fa';
      const locationUpdates = LocationPicker.buildLocationUpdates(selected);

      await Storage.updateSettings({
        ...locationUpdates,
        language: selectedLang,
        onboardingComplete: true
      });

      await I18n.setLanguage(selectedLang);
      modal.classList.add('hidden');
      CalendarUI.refresh();
      WeatherUI.init();
      GoogleServicesUI.render();
      showWelcomeIfNeeded();
      resolve();
    }, { once: true });
  });
}

async function showWelcomeIfNeeded() {
  if (Storage.getSettings().welcomeShown) return;

  const modal = document.getElementById('modal-welcome');
  modal.classList.remove('hidden');

  document.getElementById('btn-welcome-dismiss').addEventListener('click', async () => {
    modal.classList.add('hidden');
    await Storage.updateSettings({ welcomeShown: true });
  }, { once: true });
}
