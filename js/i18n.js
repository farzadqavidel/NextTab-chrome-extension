const I18n = (() => {
  const STRINGS = {
    fa: {
      settings: 'تنظیمات',
      language: 'زبان',
      weatherClick: 'کلیک برای پیش‌بینی',
      weatherLoading: 'در حال بارگذاری...',
      weatherUnavailable: 'آب‌وهوا در دسترس نیست',
      weatherForecast: 'پیش‌بینی آب‌وهوا',
      weatherToday: 'امروز',
      weatherTomorrow: 'فردا',
      weatherYesterday: 'دیروز',
      weatherDaysAgo: '{n} روز قبل',
      weatherDaysLater: '{n} روز بعد',
      occasions: 'مناسبت‌ها',
      noOccasion: 'مناسبت خاصی ثبت نشده',
      calPrev: 'ماه قبل',
      calNext: 'ماه بعد',
      calGoToday: 'برو به امروز',
      gregorian: 'میلادی',
      hijri: 'قمری',
      searchGoogle: 'جستجو در گوگل',
      searchPlaceholder: 'جستجو در گوگل...',
      searchSubmit: 'جستجو',
      searchImage: 'جستجوی تصویر',
      searchVoice: 'جستجوی صوتی',
      voiceNotSupported: 'مرورگر شما از جستجوی صوتی پشتیبانی نمی‌کند',
      add: 'افزودن',
      import: 'ایمپورت',
      emptyBookmarks: 'هنوز بوکمارکی اضافه نکرده‌اید',
      firstBookmark: 'اولین بوکمارک',
      notes: 'یادداشت',
      hideNotes: 'مخفی کردن یادداشت‌ها',
      showNotes: 'نمایش یادداشت‌ها',
      expandNotes: 'نمایش بزرگ‌تر',
      allNotes: 'همه یادداشت‌ها',
      editNote: 'ویرایش یادداشت',
      markDone: 'تیک زدن',
      markUndone: 'برداشتن تیک',
      deleteNoteConfirm: 'این یادداشت به سطل زباله منتقل می‌شود. ادامه می‌دهید؟',
      deleteAllNotesConfirm: 'همه یادداشت‌ها به سطل زباله منتقل می‌شوند. ادامه می‌دهید؟',
      emptyTrashConfirm: 'همه یادداشت‌های سطل زباله برای همیشه حذف می‌شوند. ادامه می‌دهید؟',
      permanentDeleteConfirm: 'این یادداشت برای همیشه حذف می‌شود. ادامه می‌دهید؟',
      notesTrash: 'سطل زباله',
      backToNotes: 'بازگشت به یادداشت‌ها',
      deleteAllNotes: 'حذف همه یادداشت‌ها',
      emptyTrash: 'خالی کردن سطل زباله',
      restoreNote: 'بازیابی',
      trashEmptyTitle: 'سطل زباله خالی است',
      trashEmptyHint: 'یادداشت‌های حذف‌شده اینجا نمایش داده می‌شوند',
      notePlaceholder: 'نوشتن یادداشت جدید...',
      addNote: 'افزودن یادداشت',
      notesEmptyTitle: 'هنوز یادداشتی ثبت نکرده‌اید!',
      notesEmptyHint: 'یادداشت‌های شخصی خود را اینجا بنویسید',
      delete: 'حذف',
      close: 'بستن',
      addNew: 'افزودن جدید',
      addChoiceDesc: 'چه چیزی می‌خواهید اضافه کنید؟',
      link: 'لینک',
      bookmark: 'بوکمارک',
      addBookmarkHint: 'افزودن بوکمارک',
      group: 'گروه',
      addGroupHint: 'ساخت پوشه جدید',
      addBookmark: 'افزودن بوکمارک',
      editBookmark: 'ویرایش بوکمارک',
      title: 'عنوان',
      titlePlaceholder: 'مثلاً: گیت‌هاب',
      url: 'آدرس (URL)',
      folder: 'پوشه',
      cancel: 'انصراف',
      save: 'ذخیره',
      newGroup: 'گروه جدید',
      groupName: 'نام گروه',
      groupNamePlaceholder: 'مثلاً: کاری',
      color: 'رنگ',
      createGroup: 'ساخت گروه',
      deleteGroup: 'حذف گروه',
      deleteGroupConfirm: 'این گروه حذف می‌شود. ادامه می‌دهید؟',
      deleteGroupWithBookmarksConfirm: 'آیا لینک‌های داخل این گروه هم حذف شوند؟\n\n«تأیید» = حذف لینک‌ها\n«انصراف» = انتقال لینک‌ها به «بدون دسته‌بندی»',
      editGroup: 'ویرایش گروه',
      openNewTab: 'باز کردن در تب جدید',
      defaultFolder: 'بدون دسته‌بندی',
      edit: 'ویرایش',
      tabAppearance: 'ظاهر',
      tabBackground: 'پس‌زمینه',
      tabBackup: 'ذخیره',
      displayMode: 'حالت نمایش',
      darkMode: 'دارک مود',
      lightMode: 'لایت مود',
      colorTheme: 'تم رنگی',
      bgType: 'نوع پس‌زمینه',
      gradient: 'گرادیانت',
      solidColor: 'رنگ ساده',
      image: 'تصویر',
      readyGradients: 'گرادیانت‌های آماده',
      bgColor: 'رنگ پس‌زمینه',
      clickToPick: 'برای تغییر رنگ کلیک کنید',
      bgImage: 'تصویر پس‌زمینه',
      imageUrl: 'آدرس تصویر (URL)',
      apply: 'ثبت',
      orUpload: 'یا آپلود تصویر',
      chooseFile: 'انتخاب فایل',
      noFile: 'فایلی انتخاب نشده',
      blurAmount: 'میزان بلور',
      imageOverlay: 'تیرگی روی تصویر',
      backupTitle: 'پشتیبان‌گیری و بازیابی',
      backupDesc: 'تم، یادداشت‌ها، بوکمارک‌ها، پوشه‌ها و همه تنظیمات صفحه ذخیره می‌شود.',
      exportFile: 'ذخیره در فایل',
      importFile: 'بارگذاری از فایل',
      backupHint: 'با «ذخیره در فایل» محل ذخیره را خودتان انتخاب می‌کنید.',
      resetAll: 'بازنشانی همه داده‌ها',
      invalidUrl: 'لطفاً آدرس معتبر وارد کنید (با http:// یا https://)',
      deleteBookmarkConfirm: 'آیا از حذف این بوکمارک مطمئن هستید؟',
      importChromeConfirm: 'همه بوکمارک‌های کروم با ساختار پوشه‌ها منتقل می‌شوند. ادامه می‌دهید؟',
      importSuccess: 'بوکمارک‌ها با موفقیت منتقل شدند',
      invalidImageUrl: 'لطفاً آدرس تصویر را وارد کنید',
      importDataSuccess: 'تنظیمات و داده‌ها با موفقیت بارگذاری شد',
      invalidFile: 'فایل نامعتبر است',
      resetConfirm: 'همه بوکمارک‌ها، یادداشت‌ها و تنظیمات حذف می‌شوند. مطمئن هستید؟',
      addBookmarkBtn: 'افزودن بوکمارک',
      humidity: 'رطوبت',
      wind: 'باد',
      currentWeather: 'وضعیت فعلی',
      themeMidnight: 'نیمه‌شب',
      themeOcean: 'اقیانوس',
      themeForest: 'جنگل',
      themeLavender: 'اسطوخودوس',
      themeGlass: 'شیشه‌ای',
      readyWallpapers: 'والپیپرهای آماده',
      wpNature: 'طبیعت',
      wpSpace: 'فضا',
      wpMinimal: 'مینیمال',
      wpAnime: 'انیمه',
      wpCars: 'ماشین',
      wpAbstract: 'انتزاعی'
    },
    en: {
      settings: 'Settings',
      language: 'Language',
      weatherClick: 'Click for forecast',
      weatherLoading: 'Loading...',
      weatherUnavailable: 'Weather unavailable',
      weatherForecast: 'Weather Forecast',
      weatherToday: 'Today',
      weatherTomorrow: 'Tomorrow',
      weatherYesterday: 'Yesterday',
      weatherDaysAgo: '{n} days ago',
      weatherDaysLater: 'In {n} days',
      occasions: 'Occasions',
      noOccasion: 'No special occasion',
      calPrev: 'Previous month',
      calNext: 'Next month',
      calGoToday: 'Go to today',
      gregorian: 'Gregorian',
      hijri: 'Hijri',
      searchGoogle: 'Search Google',
      searchPlaceholder: 'Search Google...',
      searchSubmit: 'Search',
      searchImage: 'Image search',
      searchVoice: 'Voice search',
      voiceNotSupported: 'Your browser does not support voice search',
      add: 'Add',
      import: 'Import',
      emptyBookmarks: 'No bookmarks yet',
      firstBookmark: 'First bookmark',
      notes: 'Notes',
      hideNotes: 'Hide notes',
      showNotes: 'Show notes',
      expandNotes: 'Expand view',
      allNotes: 'All notes',
      editNote: 'Edit note',
      markDone: 'Mark done',
      markUndone: 'Mark undone',
      deleteNoteConfirm: 'This note will be moved to trash. Continue?',
      deleteAllNotesConfirm: 'All notes will be moved to trash. Continue?',
      emptyTrashConfirm: 'All trashed notes will be permanently deleted. Continue?',
      permanentDeleteConfirm: 'This note will be permanently deleted. Continue?',
      notesTrash: 'Trash',
      backToNotes: 'Back to notes',
      deleteAllNotes: 'Delete all notes',
      emptyTrash: 'Empty trash',
      restoreNote: 'Restore',
      trashEmptyTitle: 'Trash is empty',
      trashEmptyHint: 'Deleted notes appear here',
      notePlaceholder: 'Write a new note...',
      addNote: 'Add note',
      notesEmptyTitle: 'No notes yet!',
      notesEmptyHint: 'Write your personal notes here',
      delete: 'Delete',
      close: 'Close',
      addNew: 'Add new',
      addChoiceDesc: 'What would you like to add?',
      link: 'Link',
      bookmark: 'Bookmark',
      addBookmarkHint: 'Add bookmark',
      group: 'Group',
      addGroupHint: 'Create new folder',
      addBookmark: 'Add bookmark',
      editBookmark: 'Edit bookmark',
      title: 'Title',
      titlePlaceholder: 'e.g. GitHub',
      url: 'URL',
      folder: 'Folder',
      cancel: 'Cancel',
      save: 'Save',
      newGroup: 'New group',
      groupName: 'Group name',
      groupNamePlaceholder: 'e.g. Work',
      color: 'Color',
      createGroup: 'Create group',
      deleteGroup: 'Delete group',
      deleteGroupConfirm: 'This group will be deleted. Continue?',
      deleteGroupWithBookmarksConfirm: 'Also delete bookmarks inside this group?\n\nOK = delete bookmarks\nCancel = move bookmarks to "Uncategorized"',
      editGroup: 'Edit group',
      openNewTab: 'Open in new tab',
      defaultFolder: 'Uncategorized',
      edit: 'Edit',
      tabAppearance: 'Appearance',
      tabBackground: 'Background',
      tabBackup: 'Backup',
      displayMode: 'Display mode',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      colorTheme: 'Color theme',
      bgType: 'Background type',
      gradient: 'Gradient',
      solidColor: 'Solid color',
      image: 'Image',
      readyGradients: 'Preset gradients',
      bgColor: 'Background color',
      clickToPick: 'Click to change color',
      bgImage: 'Background image',
      imageUrl: 'Image URL',
      apply: 'Apply',
      orUpload: 'Or upload image',
      chooseFile: 'Choose file',
      noFile: 'No file selected',
      blurAmount: 'Blur amount',
      imageOverlay: 'Image overlay',
      backupTitle: 'Backup & restore',
      backupDesc: 'Theme, notes, bookmarks, folders and all page settings will be saved.',
      exportFile: 'Save to file',
      importFile: 'Load from file',
      backupHint: 'With "Save to file" you choose where to save.',
      resetAll: 'Reset all data',
      invalidUrl: 'Please enter a valid URL (starting with http:// or https://)',
      deleteBookmarkConfirm: 'Are you sure you want to delete this bookmark?',
      importChromeConfirm: 'All Chrome bookmarks will be imported with folder structure. Continue?',
      importSuccess: 'Bookmarks imported successfully',
      invalidImageUrl: 'Please enter an image URL',
      importDataSuccess: 'Settings and data loaded successfully',
      invalidFile: 'Invalid file',
      resetConfirm: 'All bookmarks, notes and settings will be deleted. Are you sure?',
      addBookmarkBtn: 'Add bookmark',
      humidity: 'Humidity',
      wind: 'Wind',
      currentWeather: 'Current',
      themeMidnight: 'Midnight',
      themeOcean: 'Ocean',
      themeForest: 'Forest',
      themeLavender: 'Lavender',
      themeGlass: 'Glass',
      readyWallpapers: 'Ready wallpapers',
      wpNature: 'Nature',
      wpSpace: 'Space',
      wpMinimal: 'Minimal',
      wpAnime: 'Anime',
      wpCars: 'Cars',
      wpAbstract: 'Abstract'
    }
  };

  const WMO = {
    fa: {
      0: 'آسمان صاف', 1: 'اغلب صاف', 2: 'نیمه ابری', 3: 'ابری',
      45: 'مه', 48: 'مه یخ‌زده',
      51: 'نم‌نم باران', 53: 'نم‌نم باران', 55: 'نم‌نم شدید',
      61: 'باران خفیف', 63: 'باران متوسط', 65: 'باران شدید',
      71: 'برف خفیف', 73: 'برف متوسط', 75: 'برف شدید', 77: 'دانه برف',
      80: 'رگبار خفیف', 81: 'رگبار متوسط', 82: 'رگبار شدید',
      95: 'رعد و برق', 96: 'تگرگ', 99: 'تگرگ شدید'
    },
    en: {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Rime fog',
      51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
      61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Light snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
      80: 'Light showers', 81: 'Moderate showers', 82: 'Heavy showers',
      95: 'Thunderstorm', 96: 'Hail', 99: 'Heavy hail'
    }
  };

  const WMO_ICONS = {
    0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌦️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '🌨️', 73: '🌨️', 75: '❄️', 77: '🌨️',
    80: '🌦️', 81: '🌧️', 82: '⛈️',
    95: '⛈️', 96: '⛈️', 99: '⛈️'
  };

  const CAL_WEEKDAYS = {
    fa: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  };

  const JALALI_MONTHS = {
    fa: Jalali.PERSIAN_MONTHS,
    en: ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
      'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand']
  };

  const WEEKDAY_NAMES = {
    fa: Jalali.PERSIAN_WEEKDAYS,
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };

  let lang = 'fa';

  function getLang() {
    return lang;
  }

  function t(key, vars) {
    let str = STRINGS[lang]?.[key] || STRINGS.fa[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  }

  function getWmo(code) {
    const label = WMO[lang]?.[code] || WMO.fa[code] || (lang === 'en' ? 'Unknown' : 'نامشخص');
    const icon = WMO_ICONS[code] || '🌡️';
    return { icon, label };
  }

  function getFolderName(folder) {
    if (folder.isDefault) return t('defaultFolder');
    return folder.name;
  }

  function getMonthName(monthIndex) {
    return JALALI_MONTHS[lang]?.[monthIndex] || JALALI_MONTHS.fa[monthIndex];
  }

  function getWeekdayName(dayIndex) {
    return WEEKDAY_NAMES[lang]?.[dayIndex] || WEEKDAY_NAMES.fa[dayIndex];
  }

  function formatDigits(n) {
    return lang === 'fa' ? Jalali.toPersianDigits(n) : String(n);
  }

  function applyDom() {
    lang = Storage.getSettings().language || 'fa';
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-en', lang === 'en');

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });

    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.title = t(el.dataset.i18nTitle);
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.dataset.i18nAria));
    });

    const calWeekdays = document.querySelector('.cal-weekdays');
    if (calWeekdays) {
      calWeekdays.innerHTML = CAL_WEEKDAYS[lang]
        .map((d) => `<span>${d}</span>`)
        .join('');
    }

    if (typeof SettingsUI !== 'undefined') {
      SettingsUI.updateLanguageButtons?.(lang);
    }
  }

  async function setLanguage(nextLang) {
    lang = nextLang === 'en' ? 'en' : 'fa';
    await Storage.updateSettings({ language: lang });
    if (typeof SettingsUI !== 'undefined') {
      SettingsUI.reapplyAppearance?.();
    }
    applyDom();
    if (typeof CalendarUI !== 'undefined') CalendarUI.refresh();
    if (typeof BookmarksUI !== 'undefined') BookmarksUI.render();
    if (typeof NotesUI !== 'undefined') NotesUI.render();
    if (typeof WeatherUI !== 'undefined') WeatherUI.reload?.();
    SettingsUI.updateLanguageButtons?.(lang);
  }

  async function toggleLanguage() {
    await setLanguage(lang === 'fa' ? 'en' : 'fa');
  }

  function refreshAll() {
    if (typeof CalendarUI !== 'undefined') CalendarUI.refresh();
    if (typeof BookmarksUI !== 'undefined') BookmarksUI.render();
    if (typeof NotesUI !== 'undefined') NotesUI.render();
    if (typeof WeatherUI !== 'undefined') WeatherUI.refresh();
    if (typeof SettingsUI !== 'undefined') SettingsUI.refreshI18n?.();
  }

  function init() {
    lang = Storage.getSettings().language || 'fa';
    applyDom();
  }

  return {
    init,
    t,
    getLang,
    getWmo,
    getFolderName,
    getMonthName,
    getWeekdayName,
    formatDigits,
    applyDom,
    setLanguage,
    toggleLanguage,
    refreshAll
  };
})();
