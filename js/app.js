document.addEventListener('DOMContentLoaded', async () => {
  await Storage.load();
  I18n.init();
  SettingsUI.applyAll();
  CalendarUI.init();
  BookmarksUI.init();
  NotesUI.init();
  WeatherUI.init();
  SettingsUI.init();

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
