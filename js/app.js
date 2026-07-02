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
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim()) {
      document.getElementById('search-form').submit();
    }
  });
});
