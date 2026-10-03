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
      timeWeatherTitle: 'زمان و آب‌وهوا',
      dayInfoOneLocation: 'یک موقعیت',
      dayInfoTwoLocations: 'دو موقعیت',
      dayInfoLocalLocation: 'موقعیت محلی',
      dayInfoSecondLocation: 'موقعیت دوم',
      noOccasion: 'مناسبت خاصی ثبت نشده',
      sundayHoliday: 'یکشنبه (تعطیل)',
      fridayHoliday: 'جمعه (تعطیل)',
      calPrev: 'ماه قبل',
      calNext: 'ماه بعد',
      calGoToday: 'برو به امروز',
      gregorian: 'میلادی',
      solar: 'شمسی',
      hijri: 'قمری',
      searchGoogle: 'جستجو در گوگل',
      searchPlaceholder: 'جستجو در گوگل...',
      searchSubmit: 'جستجو',
      searchImage: 'جستجوی تصویر',
      searchVoice: 'جستجوی صوتی',
      searchHistory: 'سابقه جستجو',
      clearSearchHistory: 'حذف همه جستجوها',
      clearSearchHistoryConfirm: 'همه سابقه جستجو حذف شود؟',
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
      back: 'بازگشت',
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
      dropBookmarkToHome: 'برای انتقال به صفحهٔ اصلی، اینجا رها کنید',
      dropBookmarkToParent: 'برای انتقال به پوشهٔ «{folder}»، اینجا رها کنید',
      bookmarkDropToFolderHint: 'بوکمارک را برای انتقال به این پوشه رها کنید',
      bookmarkMovedToFolder: 'بوکمارک به پوشهٔ «{folder}» منتقل شد.',
      bookmarkMovedToHome: 'بوکمارک به صفحهٔ اصلی منتقل شد.',
      bookmarkOrderUpdated: 'ترتیب بوکمارک‌ها تغییر کرد.',
      bookmarkMoveFailed: 'جابجایی بوکمارک انجام نشد.',
      folderDragHint: 'برای جابه‌جایی پوشه بکشید',
      folderOrderUpdated: 'ترتیب پوشه‌ها تغییر کرد.',
      folderOrderFailed: 'جابجایی پوشه انجام نشد.',
      editBookmark: 'ویرایش بوکمارک',
      title: 'عنوان',
      titlePlaceholder: 'مثلاً: گیت‌هاب',
      url: 'آدرس (URL)',
      folder: 'پوشه',
      cancel: 'انصراف',
      confirmTitle: 'تأیید',
      confirmAction: 'تأیید',
      save: 'ذخیره',
      newGroup: 'گروه جدید',
      groupName: 'نام گروه',
      groupNamePlaceholder: 'مثلاً: کاری',
      color: 'رنگ',
      createGroup: 'ساخت گروه',
      deleteGroup: 'حذف گروه',
      deleteGroupConfirm: 'این گروه حذف می‌شود. ادامه می‌دهید؟',
      deleteGroupWithBookmarksConfirm: 'آیا لینک‌های داخل این گروه هم حذف شوند؟\n\n«تأیید» = حذف لینک‌ها\n«انصراف» = انتقال لینک‌ها به صفحه اصلی',
      deleteFolderWithItemsConfirm: 'بوکمارک‌ها و زیرپوشه‌های داخل این پوشه هم حذف شوند؟\n\n«تأیید» = حذف کامل محتوا\n«انصراف» = انتقال محتوا به پوشهٔ والد',
      editGroup: 'ویرایش گروه',
      openNewTab: 'باز کردن در تب جدید',
      copyLinkAddress: 'کپی آدرس لینک',
      linkCopied: 'آدرس لینک کپی شد',
      copyFailed: 'کپی کردن انجام نشد',
      fileAccessNeeded: 'برای باز کردن فایل‌های محلی، در صفحه chrome://extensions گزینه «Allow access to file URLs» این افزونه را فعال کنید.',
      defaultFolder: 'صفحه اصلی',
      edit: 'ویرایش',
      tabAppearance: 'ظاهر',
      tabBackground: 'پس‌زمینه',
      tabBackup: 'ذخیره',
      displayMode: 'حالت نمایش',
      darkMode: 'دارک مود',
      lightMode: 'لایت مود',
      colorTheme: 'تم رنگی',
      perfModeTitle: 'حالت عملکرد',
      perfModeDesc: 'برای سیستم‌های ضعیف‌تر، افکت‌های سنگین غیرفعال می‌شود.',
      perfModeAuto: 'خودکار',
      perfModeLite: 'سبک',
      perfModeFull: 'کامل',
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
      backupDesc: 'بوکمارک‌ها، یادداشت‌ها، کارها، مناسبت‌های شخصی، آمار تمرکز و همه تنظیمات صفحه ذخیره می‌شود.',
      exportFile: 'ذخیره در فایل',
      importFile: 'بارگذاری از فایل',
      backupHint: 'با «ذخیره در فایل» محل ذخیره را خودتان انتخاب می‌کنید.',
      resetAll: 'بازنشانی همه داده‌ها',
      invalidUrl: 'لطفاً آدرس معتبر وارد کنید (با http://‌ ، https:// یا file://)',
      deleteBookmarkConfirm: 'آیا از حذف این بوکمارک مطمئن هستید؟',
      importChromeConfirm: 'همه بوکمارک‌های کروم با ساختار پوشه‌ها منتقل می‌شوند. ادامه می‌دهید؟',
      followChromeBookmarks: 'پیروی از بوکمارک کروم',
      chromeBookmarksBar: 'نوار بوکمارک',
      chromeOtherBookmarks: 'سایر بوکمارک‌ها',
      chromeMobileBookmarks: 'بوکمارک‌های موبایل',
      chromeSystemFolderHint: 'پوشهٔ پیش‌فرض کروم؛ برای دیدن محتوا بازش کنید.',
      followChromeDesc: 'همگام‌سازی پیوسته و دوطرفه؛ افزودن، حذف، جابه‌جایی و ترتیب پوشه‌های تودرتو میان کروم و تبیار هماهنگ می‌شود.',
      followChromeConfirm: 'با فعال‌سازی، ساختار بوکمارک‌های کروم جایگزین بوکمارک‌ها و پوشه‌های فعلی تبیار می‌شود. مواردی که فقط در تبیار هستند حذف خواهند شد. این کار فقط پس از تأیید انجام می‌شود. ادامه می‌دهید؟',
      chromeSyncEnabled: 'همگام‌سازی بوکمارک کروم فعال شد',
      chromeSyncDisabled: 'همگام‌سازی بوکمارک کروم غیرفعال شد',
      chromeSyncFailed: 'فعال‌سازی همگام‌سازی انجام نشد',
      chromeSyncImportUnavailable: 'وقتی پیروی از بوکمارک کروم روشن است، بوکمارک‌ها به‌طور پیوسته همگام می‌شوند و ایمپورت یک‌باره لازم نیست.',
      bookmarkWriteFailed: 'تغییر بوکمارک در کروم انجام نشد؛ دوباره تلاش کنید.',
      importSuccess: 'بوکمارک‌ها با موفقیت منتقل شدند',
      invalidImageUrl: 'لطفاً آدرس تصویر را وارد کنید',
      importDataSuccess: 'تنظیمات و داده‌ها با موفقیت بارگذاری شد',
      invalidFile: 'فایل نامعتبر است',
      resetConfirm: 'همه بوکمارک‌ها، یادداشت‌ها، کارها، مناسبت‌های شخصی و تنظیمات حذف می‌شوند. مطمئن هستید؟',
      addBookmarkBtn: 'افزودن بوکمارک',
      humidity: 'رطوبت',
      wind: 'باد',
      currentWeather: 'وضعیت فعلی',
      themeMidnight: 'نیمه‌شب',
      themeOcean: 'اقیانوس',
      themeForest: 'جنگل',
      themeLavender: 'اسطوخودوس',
      themeGlass: 'شیشه‌ای',
      themeSunset: 'غروب',
      themeCrimson: 'یاقوتی',
      themeAmber: 'کهربایی',
      themeEmerald: 'زمرد',
      themeRose: 'رز',
      themeSlate: 'دودی',
      themeCoffee: 'قهوه',
      themeCyberpunk: 'سایبرپانک',
      topSites: 'پربازدیدها',
      topSitesDesc: 'پربازدیدترین سایت‌های شما کنار نوار جستجو نمایش داده می‌شود.',
      showTopSites: 'نمایش سایت‌های پربازدید',
      removeFromList: 'حذف از این لیست',
      restoreTopSites: 'بازگرداندن سایت‌های حذف‌شده',
      restoreTopSitesHint: 'با راست‌کلیک روی هر آیکون می‌توانید آن را از لیست حذف کنید.',
      topSitesRestored: 'سایت‌های حذف‌شده بازگردانده شدند',
      tabAbout: 'درباره ما',
      aboutTitle: 'درباره تبیار',
      aboutDesc: 'تبیار یک صفحه تب جدید فارسی، سریع و متن‌باز برای مرورگر کروم است؛ با تقویم شمسی، آب‌وهوا، بوکمارک، یادداشت و کلی امکانات دیگر.',
      aboutRepoTitle: 'مخزن گیت‌هاب',
      aboutStar: 'اگر این افزونه برایتان مفید بود، لطفاً به مخزن ما در گیت‌هاب ستاره ⭐ بدهید. حمایت شما انگیزه‌ی ادامه‌ی توسعه است!',
      aboutOpenRepo: 'مشاهده در گیت‌هاب',
      aboutStarBtn: 'ستاره دادن به پروژه',
      aboutIssue: 'گزارش مشکل یا پیشنهاد',
      aboutDeveloper: 'توسعه‌دهنده',
      aboutVersion: 'نسخه',
      readyWallpapers: 'والپیپرهای آماده',
      wpNature: 'طبیعت',
      wpSpace: 'فضا',
      wpMinimal: 'مینیمال',
      wpAnime: 'انیمه',
      wpCars: 'ماشین',
      wpAbstract: 'انتزاعی',
      welcomeTitle: 'به تبیار خوش آمدید',
      welcomeInstalled: 'این افزونه روی سیستم شما نصب شده است.',
      welcomeLocationWarningBefore: 'اگر محل قرارگیری پوشه افزونه را عوض کنید، افزونه دچار مشکل می‌شود و باید مجدداً آن را در ',
      welcomeLocationWarningAfter: ' بارگذاری کنید.',
      welcomeBackupHint: 'همچنین می‌توانید در قسمت «ذخیره» تنظیمات، نسبت به دانلود بکاپ اقدام کنید.',
      welcomeGotIt: 'متوجه شدم',
      importBookmarksTitle: 'ایمپورت و همگام‌سازی بوکمارک',
      importBookmarksDesc: 'بوکمارک‌های کروم را یک‌باره منتقل کنید یا پیروی پیوسته و دوطرفه را فعال کنید.',
      importChromeBookmarks: 'ایمپورت از کروم',
      importFailed: 'ایمپورت بوکمارک‌ها انجام نشد',
      onboardingTitle: 'تنظیمات اولیه',
      onboardingDesc: 'لطفاً کشور، شهر و زبان خود را انتخاب کنید.',
      country: 'کشور',
      city: 'شهر',
      countryPlaceholder: 'مثلاً: ایران',
      cityPlaceholder: 'مثلاً: تهران',
      onboardingContinue: 'ادامه',
      tabGeneral: 'عمومی',
      yourLocation: 'محل زندگی',
      locationDesc: 'برای نمایش آب‌وهوا و مناسبت‌های محلی، کشور و شهر خود را وارد کنید.',
      saveLocation: 'ذخیره محل',
      locationSaved: 'محل زندگی ذخیره شد',
      locationNotFound: 'شهر یا کشور پیدا نشد. لطفاً دوباره بررسی کنید.',
      googleServices: 'سرویس‌های گوگل',
      googleSearch: 'جستجو',
      googleGmail: 'جیمیل',
      googleDrive: 'درایو',
      googleMeet: 'میت',
      googleMaps: 'نقشه',
      googleYoutube: 'یوتیوب',
      googleTranslate: 'ترجمه',
      googleCalendar: 'تقویم',
      googlePhotos: 'عکس‌ها',
      searchLocation: 'جستجوی شهر یا کشور',
      searchLocationPlaceholder: 'نام شهر یا کشور را بنویسید...',
      showGoogleServices: 'نمایش سرویس‌های گوگل',
      googleServicesSettings: 'سرویس‌هایی که می‌خواهید در صفحه نمایش داده شوند را انتخاب کنید.',
      calendarType: 'نوع تقویم',
      calendarTypeAuto: 'تنظیم خودکار بر اساس کشور',
      calendarJalali: 'شمسی',
      calendarGregorian: 'میلادی',
      calendarHijri: 'قمری',
      selectFromSuggestions: 'لطفاً یک مورد از لیست پیشنهادها را انتخاب کنید.',
      secondLocation: 'کشور دوم',
      secondLocationDesc: 'نمایش آب‌وهوا و ساعت یک شهر دیگر کنار محل اصلی (اختیاری).',
      saveSecondLocation: 'ذخیره کشور دوم',
      clearSecondLocation: 'حذف کشور دوم',
      secondLocationSaved: 'کشور دوم ذخیره شد.',
      taskTitle: 'برنامهٔ امروز',
      taskCount: '{completed} از {total} انجام‌شده',
      taskProgress: 'پیشرفت امروز · {percent}٪',
      taskProgressAria: 'پیشرفت برنامهٔ امروز',
      taskNoPlan: 'امروز را با یک کار کوچک شروع کن',
      taskEmpty: 'هنوز کاری برای امروز نچیده‌ای.',
      taskInputPlaceholder: 'یک کار مهم برای امروز…',
      taskDateLabel: 'موعد',
      taskDueUnset: 'موعد',
      taskDateCalendarType: 'تقویم شمسی',
      taskDatePickerTitle: 'انتخاب موعد کار',
      taskDatePickerHelp: 'تاریخ‌ها در اینجا بر پایهٔ تقویم شمسی هستند.',
      taskDatePrevMonth: 'ماه قبل',
      taskDateNextMonth: 'ماه بعد',
      taskDateSelectDay: 'انتخاب روز',
      taskDateSelectedLabel: 'تاریخ انتخاب‌شده',
      taskDateNoSelection: 'بدون موعد',
      taskDateClear: 'پاک‌کردن موعد',
      taskDateApply: 'انتخاب تاریخ',
      taskDateToday: 'امروز',
      addTask: 'افزودن کار',
      taskDailyEyebrow: 'برنامهٔ روزانه',
      taskTodayDateAria: 'تاریخ شمسی امروز',
      taskDueToday: 'امروز',
      taskOverdue: 'عقب‌افتاده',
      taskMarkDone: 'انجام شد',
      taskMarkUndone: 'برگرداندن به کارهای باز',
      focusTitle: 'تمرکز',
      focusWork: 'جلسهٔ تمرکز',
      focusBreak: 'استراحت کوتاه',
      focusTimerSettings: 'تنظیم مدت تایمر',
      focusTimerSettingsEyebrow: 'تایمر تمرکز',
      focusTimerSettingsHelp: 'مدت جلسهٔ تمرکز را با روز، ساعت و دقیقه تنظیم کنید؛ مدت استراحت در این پنجره تغییر نمی‌کند.',
      focusTimerSettingsApplyNote: 'ذخیره، شمارش‌گر فعلی را با مدت کامل تازه از نو آغاز می‌کند.',
      focusTimerSettingsError: 'مدت تمرکز باید بیشتر از صفر باشد؛ ساعت و دقیقه را در بازهٔ مجاز وارد کنید.',
      focusDurationLabel: 'مدت تمرکز',
      breakDurationLabel: 'مدت استراحت',
      timerDays: 'روز',
      timerHours: 'ساعت',
      timerMinutes: 'دقیقه',
      focusTimerDaysDisplay: '{days} روز · {time}',
      focusStart: 'شروع',
      focusPause: 'مکث',
      focusReset: 'بازنشانی',
      focusTodaySessions: '{n} جلسه امروز',
      focusComplete: 'آفرین! جلسهٔ تمرکز تمام شد؛ وقت یک استراحت کوتاه است.',
      breakComplete: 'استراحت تمام شد؛ آمادهٔ جلسهٔ بعدی هستی؟',
      taskAdded: 'کار به برنامهٔ امروز اضافه شد.',
      noteAdded: 'یادداشت ذخیره شد.',
      personalEvents: 'مناسبت‌های شخصی',
      managePersonalEvents: 'مدیریت مناسبت‌های شخصی',
      personalEventsEmpty: 'هنوز تولد یا مناسبت شخصی اضافه نکرده‌ای.',
      personalEventAdd: 'افزودن مناسبت',
      personalEventEdit: 'ویرایش مناسبت',
      personalEventTitle: 'عنوان مناسبت',
      personalEventTitlePlaceholder: 'مثلاً: تولد مامان',
      personalEventCalendar: 'نوع تقویم',
      personalEventDate: 'تاریخ',
      personalEventAnnual: 'هر سال تکرار شود',
      personalDatePlaceholder: 'سال-ماه-روز',
      personalDateAnnualPlaceholder: 'ماه-روز',
      personalDateExample: 'نمونه: {example} · سال-ماه-روز',
      personalDateAnnualExample: 'نمونه: {example} · ماه-روز برای تکرار سالانه',
      personalEventInvalidDate: 'تاریخ معتبر وارد کن؛ نمونه: ۱۴۰۵-۰۱-۰۱ یا برای تکرار سالانه ۰۱-۰۱',
      personalEventSaved: 'مناسبت ذخیره شد.',
      personalEventUpdated: 'مناسبت به‌روزرسانی شد.',
      personalEventDeleteConfirm: 'این مناسبت حذف شود؟',
      personalEventToday: 'امروز',
      personalEventInDays: '{n} روز دیگر',
      personalEventPast: 'گذشته',
      commandTitle: 'میان‌برهای تب‌یار',
      quickActions: 'ابزارهای سریع',
      commandPlaceholder: 'جستجوی بوکمارک، سرویس یا فرمان…',
      commandHint: 'برای بازکردن میان‌برها از ↑ ↓ و Enter استفاده کن',
      commandNoResults: 'چیزی پیدا نشد.',
      commandNewTask: 'رفتن به فهرست کارها',
      commandNewTaskHint: 'افزودن کار تازه',
      commandAddTask: 'افزودن کار',
      commandCreateTaskHint: 'ساختن یک کار جدید',
      commandAddNote: 'یادداشت سریع',
      commandCreateNoteHint: 'ذخیره در یادداشت‌های تب‌یار',
      commandSearchGoogle: 'جستجو در گوگل',
      commandSearchGoogleHint: 'بازکردن نتایج در تب جدید',
      commandPersonalEvent: 'افزودن مناسبت شخصی',
      commandPersonalEventHint: 'تولد، سالگرد یا شمارش‌معکوس',
      commandFocus: 'شروع / مکث تایمر تمرکز',
      commandFocusHint: 'میان‌بر: Ctrl + Shift + F',
      commandPrivacy: 'حالت حریم خصوصی',
      commandPrivacyHint: 'میان‌بر: Ctrl + Shift + H',
      commandSettingsHint: 'تنظیمات تب‌یار',
      commandToday: 'رفتن به امروز',
      commandTodayHint: 'بازگشت تقویم به تاریخ امروز',
      commandTaskSubtitle: 'رفتن به برنامهٔ امروز',
      privacyEnable: 'فعال‌کردن حالت حریم خصوصی',
      privacyDisable: 'خاموش‌کردن حالت حریم خصوصی',
      privacyEnabled: 'اطلاعات شخصی صفحه محو شد.',
      privacyDisabled: 'حالت حریم خصوصی خاموش شد.',
      widgetLayoutTitle: 'چیدمان داشبورد',
      widgetLayoutDesc: 'با دستگیرهٔ فهرست ترتیب را عوض کن، یا حالت چیدمان را باز کن و کارت‌ها را بین جایگاه‌های امن بکش؛ اندازهٔ شبکه ثابت می‌ماند.',
      arrangeWidgets: 'تنظیم چیدمان با کشیدن',
      finishWidgetLayout: 'پایان چیدمان',
      widgetLayoutEditModeHint: 'دستهٔ یک کارت را بکشید و روی کارت مقصد رها کنید؛ جایگاه‌ها عوض می‌شوند و شبکه ثابت می‌ماند.',
      widgetDragHandle: 'گرفتن و جابه‌جایی {widget}',
      widgetListDragHandle: 'گرفتن برای جابه‌جایی {widget}',
      widgetToday: 'ساعت، هوا و مناسبت‌ها',
      widgetCalendar: 'تقویم',
      widgetBookmarks: 'بوکمارک‌ها',
      widgetNotes: 'یادداشت‌ها',
      widgetTasks: 'برنامه و تمرکز',
      moveUp: 'انتقال به بالا',
      moveDown: 'انتقال به پایین',
      resetWidgetLayout: 'بازگرداندن چیدمان پیش‌فرض',
      floatingBookmarkTitle: 'دکمهٔ افزودن بوکمارک در سایت‌ها',
      floatingBookmarkDesc: 'یک دکمهٔ نیم‌دایره‌ای کنار صفحه نشان می‌دهد؛ می‌توانی آن را بالا/پایین یا به چپ/راست بکشی. با هاور، وضعیت ذخیره و نام پوشه دیده می‌شود؛ کلیک برای افزودن یا حذف.',
      showFloatingBookmark: 'نمایش دکمهٔ شناور در سایت‌ها',
      persianDigitsTitle: 'نمایش ارقام',
      persianDigitsDesc: 'انتخاب کن تاریخ و ساعت با رقم فارسی یا لاتین نمایش داده شوند.',
      digitsAuto: 'خودکار',
      digitsPersian: 'فارسی',
      digitsLatin: 'لاتین'
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
      timeWeatherTitle: 'Time & weather',
      dayInfoOneLocation: '1 location',
      dayInfoTwoLocations: '2 locations',
      dayInfoLocalLocation: 'Local time',
      dayInfoSecondLocation: 'Second location',
      noOccasion: 'No special occasion',
      sundayHoliday: 'Sunday (holiday)',
      fridayHoliday: 'Friday (holiday)',
      calPrev: 'Previous month',
      calNext: 'Next month',
      calGoToday: 'Go to today',
      gregorian: 'Gregorian',
      solar: 'Solar (Jalali)',
      hijri: 'Hijri',
      searchGoogle: 'Search Google',
      searchPlaceholder: 'Search Google...',
      searchSubmit: 'Search',
      searchImage: 'Image search',
      searchVoice: 'Voice search',
      searchHistory: 'Search history',
      clearSearchHistory: 'Clear all searches',
      clearSearchHistoryConfirm: 'Clear all search history?',
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
      back: 'Back',
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
      dropBookmarkToHome: 'Drop here to move this bookmark to Home',
      dropBookmarkToParent: 'Drop here to move this bookmark to “{folder}”',
      bookmarkDropToFolderHint: 'Drop the bookmark here to move it into this folder',
      bookmarkMovedToFolder: 'Bookmark moved to “{folder}”.',
      bookmarkMovedToHome: 'Bookmark moved to Home.',
      bookmarkOrderUpdated: 'Bookmark order updated.',
      bookmarkMoveFailed: 'Could not move the bookmark.',
      folderDragHint: 'Drag to reorder this folder',
      folderOrderUpdated: 'Folder order updated.',
      folderOrderFailed: 'Could not move the folder.',
      editBookmark: 'Edit bookmark',
      title: 'Title',
      titlePlaceholder: 'e.g. GitHub',
      url: 'URL',
      folder: 'Folder',
      cancel: 'Cancel',
      confirmTitle: 'Confirmation',
      confirmAction: 'Confirm',
      save: 'Save',
      newGroup: 'New group',
      groupName: 'Group name',
      groupNamePlaceholder: 'e.g. Work',
      color: 'Color',
      createGroup: 'Create group',
      deleteGroup: 'Delete group',
      deleteGroupConfirm: 'This group will be deleted. Continue?',
      deleteGroupWithBookmarksConfirm: 'Also delete bookmarks inside this group?\n\nOK = delete bookmarks\nCancel = move bookmarks to main page',
      deleteFolderWithItemsConfirm: 'Delete bookmarks and subfolders inside this folder too?\n\nOK = delete all contents\nCancel = move the contents to the parent folder',
      editGroup: 'Edit group',
      openNewTab: 'Open in new tab',
      copyLinkAddress: 'Copy link address',
      linkCopied: 'Link address copied',
      copyFailed: 'Copy failed',
      fileAccessNeeded: 'To open local files, enable "Allow access to file URLs" for this extension on chrome://extensions.',
      defaultFolder: 'Main page',
      edit: 'Edit',
      tabAppearance: 'Appearance',
      tabBackground: 'Background',
      tabBackup: 'Backup',
      displayMode: 'Display mode',
      darkMode: 'Dark mode',
      lightMode: 'Light mode',
      colorTheme: 'Color theme',
      perfModeTitle: 'Performance mode',
      perfModeDesc: 'Disables heavy visual effects on weaker systems.',
      perfModeAuto: 'Auto',
      perfModeLite: 'Lite',
      perfModeFull: 'Full',
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
      backupDesc: 'Bookmarks, notes, tasks, personal dates, focus stats, and all page settings will be saved.',
      exportFile: 'Save to file',
      importFile: 'Load from file',
      backupHint: 'With "Save to file" you choose where to save.',
      resetAll: 'Reset all data',
      invalidUrl: 'Please enter a valid URL (starting with http://, https:// or file://)',
      deleteBookmarkConfirm: 'Are you sure you want to delete this bookmark?',
      importChromeConfirm: 'All Chrome bookmarks will be imported with folder structure. Continue?',
      followChromeBookmarks: 'Follow Chrome bookmarks',
      chromeBookmarksBar: 'Bookmarks bar',
      chromeOtherBookmarks: 'Other bookmarks',
      chromeMobileBookmarks: 'Mobile bookmarks',
      chromeSystemFolderHint: 'Built-in Chrome folder. Open it to view its contents.',
      followChromeDesc: 'Keep Chrome and Tabyar in continuous two-way sync. Adds, removals, moves, ordering, and nested folders stay in sync.',
      followChromeConfirm: 'Enabling this will replace Tabyar’s current bookmarks and folders with the Chrome bookmark tree. Items that exist only in Tabyar will be removed. Nothing changes until you confirm. Continue?',
      chromeSyncEnabled: 'Chrome bookmark sync enabled',
      chromeSyncDisabled: 'Chrome bookmark sync disabled',
      chromeSyncFailed: 'Could not enable bookmark sync',
      chromeSyncImportUnavailable: 'With Follow Chrome bookmarks enabled, bookmarks sync continuously; a one-time import is not needed.',
      bookmarkWriteFailed: 'Chrome could not update the bookmark. Please try again.',
      importSuccess: 'Bookmarks imported successfully',
      invalidImageUrl: 'Please enter an image URL',
      importDataSuccess: 'Settings and data loaded successfully',
      invalidFile: 'Invalid file',
      resetConfirm: 'All bookmarks, notes, tasks, personal dates and settings will be deleted. Are you sure?',
      addBookmarkBtn: 'Add bookmark',
      humidity: 'Humidity',
      wind: 'Wind',
      currentWeather: 'Current',
      themeMidnight: 'Midnight',
      themeOcean: 'Ocean',
      themeForest: 'Forest',
      themeLavender: 'Lavender',
      themeGlass: 'Glass',
      themeSunset: 'Sunset',
      themeCrimson: 'Crimson',
      themeAmber: 'Amber',
      themeEmerald: 'Emerald',
      themeRose: 'Rose',
      themeSlate: 'Slate',
      themeCoffee: 'Coffee',
      themeCyberpunk: 'Cyberpunk',
      topSites: 'Most visited',
      topSitesDesc: 'Your most visited sites appear next to the search bar.',
      showTopSites: 'Show most visited sites',
      removeFromList: 'Remove from this list',
      restoreTopSites: 'Restore removed sites',
      restoreTopSitesHint: 'Right-click any icon to remove it from the list.',
      topSitesRestored: 'Removed sites have been restored',
      tabAbout: 'About',
      aboutTitle: 'About Tabyar',
      aboutDesc: 'Tabyar is a fast, open-source Persian new tab page for Chrome, with Jalali calendar, weather, bookmarks, notes and much more.',
      aboutRepoTitle: 'GitHub repository',
      aboutStar: 'If you find this extension useful, please give our GitHub repo a star ⭐. Your support keeps the project going!',
      aboutOpenRepo: 'View on GitHub',
      aboutStarBtn: 'Star the project',
      aboutIssue: 'Report an issue or idea',
      aboutDeveloper: 'Developer',
      aboutVersion: 'Version',
      readyWallpapers: 'Ready wallpapers',
      wpNature: 'Nature',
      wpSpace: 'Space',
      wpMinimal: 'Minimal',
      wpAnime: 'Anime',
      wpCars: 'Cars',
      wpAbstract: 'Abstract',
      welcomeTitle: 'Welcome to Tabyar',
      welcomeInstalled: 'This extension is installed on your system.',
      welcomeLocationWarningBefore: 'If you move the extension folder to a different location, it may stop working and you will need to reload it at ',
      welcomeLocationWarningAfter: '.',
      welcomeBackupHint: 'You can also download a backup from the Backup section in Settings.',
      welcomeGotIt: 'Got it',
      importBookmarksTitle: 'Import & sync bookmarks',
      importBookmarksDesc: 'Import Chrome bookmarks once, or enable continuous two-way following.',
      importChromeBookmarks: 'Import from Chrome',
      importFailed: 'Failed to import bookmarks',
      onboardingTitle: 'Initial setup',
      onboardingDesc: 'Please select your country, city and language.',
      country: 'Country',
      city: 'City',
      countryPlaceholder: 'e.g. Iran',
      cityPlaceholder: 'e.g. Tehran',
      onboardingContinue: 'Continue',
      tabGeneral: 'General',
      yourLocation: 'Your location',
      locationDesc: 'Enter your country and city for weather and local occasions.',
      saveLocation: 'Save location',
      locationSaved: 'Location saved',
      locationNotFound: 'City or country not found. Please check and try again.',
      googleServices: 'Google services',
      googleSearch: 'Search',
      googleGmail: 'Gmail',
      googleDrive: 'Drive',
      googleMeet: 'Meet',
      googleMaps: 'Maps',
      googleYoutube: 'YouTube',
      googleTranslate: 'Translate',
      googleCalendar: 'Calendar',
      googlePhotos: 'Photos',
      searchLocation: 'Search city or country',
      searchLocationPlaceholder: 'Type a city or country...',
      showGoogleServices: 'Show Google services',
      googleServicesSettings: 'Choose which services appear on the page.',
      calendarType: 'Calendar type',
      calendarTypeAuto: 'Auto based on country',
      calendarJalali: 'Solar (Jalali)',
      calendarGregorian: 'Gregorian',
      calendarHijri: 'Hijri',
      selectFromSuggestions: 'Please select an item from the suggestions list.',
      secondLocation: 'Second location',
      secondLocationDesc: 'Show weather and time for another city next to your main location (optional).',
      saveSecondLocation: 'Save second location',
      clearSecondLocation: 'Remove second location',
      secondLocationSaved: 'Second location saved.',
      taskTitle: 'Today’s plan',
      taskCount: '{completed} of {total} completed',
      taskProgress: 'Today’s progress · {percent}%',
      taskProgressAria: 'Today’s plan progress',
      taskNoPlan: 'Start today with one small win',
      taskEmpty: 'Nothing planned yet. Add your first task.',
      taskInputPlaceholder: 'One important thing for today…',
      taskDateLabel: 'Due date',
      taskDueUnset: 'Due',
      taskDateCalendarType: 'Jalali solar calendar',
      taskDatePickerTitle: 'Choose a due date',
      taskDatePickerHelp: 'Dates are shown using the Jalali calendar.',
      taskDatePrevMonth: 'Previous month',
      taskDateNextMonth: 'Next month',
      taskDateSelectDay: 'Choose a day',
      taskDateSelectedLabel: 'Selected date',
      taskDateNoSelection: 'No due date',
      taskDateClear: 'Clear due date',
      taskDateApply: 'Use this date',
      taskDateToday: 'Today',
      addTask: 'Add task',
      taskDailyEyebrow: 'DAILY PLAN',
      taskTodayDateAria: 'Today in the Jalali calendar',
      taskDueToday: 'Today',
      taskOverdue: 'Overdue',
      taskMarkDone: 'Mark complete',
      taskMarkUndone: 'Move back to active tasks',
      focusTitle: 'Focus',
      focusWork: 'Focus session',
      focusBreak: 'Short break',
      focusTimerSettings: 'Timer duration settings',
      focusTimerSettingsEyebrow: 'FOCUS TIMER',
      focusTimerSettingsHelp: 'Set the focus session length in days, hours, and minutes. Break duration is unchanged here.',
      focusTimerSettingsApplyNote: 'Saving restarts the current timer with its full updated duration.',
      focusTimerSettingsError: 'Focus duration must be greater than zero; enter valid hours and minutes.',
      focusDurationLabel: 'Focus duration',
      breakDurationLabel: 'Break duration',
      timerDays: 'Days',
      timerHours: 'Hours',
      timerMinutes: 'Minutes',
      focusTimerDaysDisplay: '{days}d · {time}',
      focusStart: 'Start',
      focusPause: 'Pause',
      focusReset: 'Reset',
      focusTodaySessions: '{n} sessions today',
      focusComplete: 'Great work! Your focus session is over. Time for a short break.',
      breakComplete: 'Break is over. Ready for another focus session?',
      taskAdded: 'Task added to today’s plan.',
      noteAdded: 'Note saved.',
      personalEvents: 'Personal dates',
      managePersonalEvents: 'Manage personal dates',
      personalEventsEmpty: 'No birthdays or personal dates added yet.',
      personalEventAdd: 'Add personal date',
      personalEventEdit: 'Edit personal date',
      personalEventTitle: 'Event title',
      personalEventTitlePlaceholder: 'For example: Mom’s birthday',
      personalEventCalendar: 'Calendar system',
      personalEventDate: 'Date',
      personalEventAnnual: 'Repeat every year',
      personalDatePlaceholder: 'Year-month-day',
      personalDateAnnualPlaceholder: 'Month-day',
      personalDateExample: 'Example: {example} · year-month-day',
      personalDateAnnualExample: 'Example: {example} · month-day for annual dates',
      personalEventInvalidDate: 'Enter a valid date, e.g. 2026-01-01 or 01-01 for an annual reminder.',
      personalEventSaved: 'Personal date saved.',
      personalEventUpdated: 'Personal date updated.',
      personalEventDeleteConfirm: 'Delete this personal date?',
      personalEventToday: 'Today',
      personalEventInDays: 'In {n} days',
      personalEventPast: 'Past',
      commandTitle: 'Tabyar command palette',
      quickActions: 'Quick actions',
      commandPlaceholder: 'Search bookmarks, services, or commands…',
      commandHint: 'Use ↑ ↓ to navigate and Enter to open',
      commandNoResults: 'No matching results.',
      commandNewTask: 'Go to today’s tasks',
      commandNewTaskHint: 'Add a new task',
      commandAddTask: 'Add task',
      commandCreateTaskHint: 'Create a new task',
      commandAddNote: 'Quick note',
      commandCreateNoteHint: 'Save to Tabyar notes',
      commandSearchGoogle: 'Search Google',
      commandSearchGoogleHint: 'Open results in a new tab',
      commandPersonalEvent: 'Add a personal date',
      commandPersonalEventHint: 'Birthday, anniversary, or countdown',
      commandFocus: 'Start / pause focus timer',
      commandFocusHint: 'Shortcut: Ctrl + Shift + F',
      commandPrivacy: 'Privacy mode',
      commandPrivacyHint: 'Shortcut: Ctrl + Shift + H',
      commandSettingsHint: 'Tabyar settings',
      commandToday: 'Go to today',
      commandTodayHint: 'Return the calendar to today',
      commandTaskSubtitle: 'Go to today’s plan',
      privacyEnable: 'Enable privacy mode',
      privacyDisable: 'Disable privacy mode',
      privacyEnabled: 'Private dashboard details are now blurred.',
      privacyDisabled: 'Privacy mode is off.',
      widgetLayoutTitle: 'Dashboard layout',
      widgetLayoutDesc: 'Drag a list handle to reorder, or open layout mode and move cards between safe slots. Grid sizing stays fixed.',
      arrangeWidgets: 'Arrange with drag and drop',
      finishWidgetLayout: 'Finish arranging',
      widgetLayoutEditModeHint: 'Drag a card handle onto another card to swap their safe slots. The responsive grid stays intact.',
      widgetDragHandle: 'Drag to move {widget}',
      widgetListDragHandle: 'Drag to move {widget}',
      widgetToday: 'Clock, weather & occasions',
      widgetCalendar: 'Calendar',
      widgetBookmarks: 'Bookmarks',
      widgetNotes: 'Notes',
      widgetTasks: 'Tasks & focus',
      moveUp: 'Move up',
      moveDown: 'Move down',
      resetWidgetLayout: 'Restore default layout',
      floatingBookmarkTitle: 'Floating bookmark button',
      floatingBookmarkDesc: 'A half-circle stays at the page edge. Drag it up/down or to the other side; hover shows whether the page is saved and its folder. Click to add or remove it.',
      showFloatingBookmark: 'Show floating button on websites',
      persianDigitsTitle: 'Numeral style',
      persianDigitsDesc: 'Choose Persian or Latin digits for dates and time.',
      digitsAuto: 'Automatic',
      digitsPersian: 'Persian',
      digitsLatin: 'Latin'
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

  const CAL_WEEKDAYS_SAT_START = {
    fa: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
    en: ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
  };

  const CAL_WEEKDAYS_SUN_START = {
    fa: ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'],
    en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  };

  const CAL_WEEKDAYS_MON_START = {
    fa: ['د', 'س', 'چ', 'پ', 'ج', 'ش', 'ی'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  };

  const WEEKDAY_NAMES = {
    fa: Jalali.PERSIAN_WEEKDAYS,
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };

  const GREGORIAN_MONTHS = {
    fa: PersianEvents.GREGORIAN_MONTHS,
    en: ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
  };

  function getCalendarSettings() {
    const settings = Storage.getSettings();
    return {
      calendarType: settings.calendarType || 'jalali',
      countryCode: settings.countryCode || '',
      persianDigits: settings.persianDigits || 'auto'
    };
  }

  function usesRegionalCalendar() {
    const { calendarType } = getCalendarSettings();
    return calendarType === 'jalali' || calendarType === 'hijri';
  }

  function getRegionalLang() {
    if (usesRegionalCalendar()) return 'fa';
    const code = (getCalendarSettings().countryCode || '').toUpperCase();
    if (code === 'IR' || code === 'AF') return 'fa';
    return lang;
  }

  function getRegionalHolidayLabel(key) {
    const regionalLang = getRegionalLang();
    return STRINGS[regionalLang]?.[key] || STRINGS.fa[key] || key;
  }

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
    const labelLang = getRegionalLang();
    const label = WMO[labelLang]?.[code] || WMO.fa[code] || (labelLang === 'en' ? 'Unknown' : 'نامشخص');
    const icon = WMO_ICONS[code] || '🌡️';
    return { icon, label };
  }

  function getFolderName(folder) {
    if (folder.isDefault) return t('defaultFolder');
    if (folder.isChromeRoot) {
      const keyByChromeId = {
        1: 'chromeBookmarksBar',
        2: 'chromeOtherBookmarks',
        3: 'chromeMobileBookmarks'
      };
      const key = keyByChromeId[String(folder.chromeId)];
      if (key) return t(key);
    }
    return folder.name;
  }

  function getGregorianMonthName(monthIndex) {
    const labelLang = getRegionalLang();
    return GREGORIAN_MONTHS[labelLang]?.[monthIndex] || GREGORIAN_MONTHS.fa[monthIndex];
  }

  function getHijriMonthName(monthIndex) {
    return Hijri.MONTHS[monthIndex];
  }

  function getCalendarWeekdays(calendarType, countryCode) {
    const labels = CAL_WEEKDAYS_SAT_START;
    if (RegionHelper.weekStartsOnMonday(calendarType, countryCode)) {
      return CAL_WEEKDAYS_MON_START[lang] || CAL_WEEKDAYS_MON_START.fa;
    }
    if (calendarType === 'gregorian') {
      return CAL_WEEKDAYS_SUN_START[lang] || CAL_WEEKDAYS_SUN_START.fa;
    }
    return labels[lang] || labels.fa;
  }

  function getWeekdayName(dayIndex) {
    if (usesRegionalCalendar()) {
      return Jalali.PERSIAN_WEEKDAYS[dayIndex];
    }
    return WEEKDAY_NAMES[lang]?.[dayIndex] || WEEKDAY_NAMES.en[dayIndex];
  }

  function formatDigits(n) {
    const style = getCalendarSettings().persianDigits;
    if (style === 'persian' || (style === 'auto' && (usesRegionalCalendar() || lang === 'fa'))) {
      return Jalali.toPersianDigits(n);
    }
    return String(n);
  }

  function getMonthName(monthIndex) {
    return Jalali.PERSIAN_MONTHS[monthIndex];
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

    if (typeof SettingsUI !== 'undefined') {
      SettingsUI.updateLanguageButtons?.(lang);
      SettingsUI.updatePerfModeButtons?.(Storage.getSettings().perfMode || 'auto');
    }
  }

  async function setLanguage(nextLang) {
    lang = nextLang === 'en' ? 'en' : 'fa';
    await Storage.updateSettings({ language: lang });
    if (typeof SettingsUI !== 'undefined') {
      SettingsUI.reapplyAppearance?.();
    }
    applyDom();
    document.dispatchEvent(new CustomEvent('tabyar:language-changed'));
    if (typeof CalendarUI !== 'undefined') CalendarUI.refresh();
    if (typeof GoogleServicesUI !== 'undefined') GoogleServicesUI.render?.();
    if (typeof BookmarksUI !== 'undefined') BookmarksUI.render();
    if (typeof NotesUI !== 'undefined') NotesUI.render();
    if (typeof TasksUI !== 'undefined') { TasksUI.render?.(); TasksUI.renderFocus?.(); }
    if (typeof PersonalEventsUI !== 'undefined') PersonalEventsUI.render?.();
    if (typeof PrivacyUI !== 'undefined') PrivacyUI.refresh?.();
    if (typeof DashboardLayoutUI !== 'undefined') DashboardLayoutUI.renderSettings?.();
    if (typeof SearchUI !== 'undefined') SearchUI.refresh?.();
    if (typeof WeatherUI !== 'undefined') WeatherUI.refresh?.();
    if (typeof TopSitesUI !== 'undefined') TopSitesUI.render?.();
    // Re-render the settings panels so theme names, wallpaper labels and
    // service toggles pick up the new language too.
    SettingsUI.refreshI18n?.();
    SettingsUI.updateLanguageButtons?.(lang);
    SettingsUI.updatePerfModeButtons?.(Storage.getSettings().perfMode || 'auto');
  }

  async function toggleLanguage() {
    await setLanguage(lang === 'fa' ? 'en' : 'fa');
  }

  function refreshAll() {
    if (typeof CalendarUI !== 'undefined') CalendarUI.refresh();
    if (typeof GoogleServicesUI !== 'undefined') GoogleServicesUI.render?.();
    if (typeof BookmarksUI !== 'undefined') BookmarksUI.render();
    if (typeof NotesUI !== 'undefined') NotesUI.render();
    if (typeof TasksUI !== 'undefined') { TasksUI.render?.(); TasksUI.renderFocus?.(); }
    if (typeof PersonalEventsUI !== 'undefined') PersonalEventsUI.render?.();
    if (typeof PrivacyUI !== 'undefined') PrivacyUI.refresh?.();
    if (typeof DashboardLayoutUI !== 'undefined') DashboardLayoutUI.renderSettings?.();
    if (typeof SearchUI !== 'undefined') SearchUI.refresh?.();
    if (typeof WeatherUI !== 'undefined') WeatherUI.refresh();
    if (typeof GoogleServicesUI !== 'undefined') GoogleServicesUI.render?.();
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
    getGregorianMonthName,
    getHijriMonthName,
    getCalendarWeekdays,
    getWeekdayName,
    getRegionalLang,
    getRegionalHolidayLabel,
    formatDigits,
    applyDom,
    setLanguage,
    toggleLanguage,
    refreshAll
  };
})();
