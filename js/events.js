const PersianEvents = (() => {
  const SHAMSI = {
    '01-01': [{ title: 'جشن نوروز / آغاز سال نو', type: 'holiday' }],
    '01-02': [{ title: 'عید نوروز', type: 'holiday' }],
    '01-03': [{ title: 'عید نوروز', type: 'holiday' }],
    '01-04': [{ title: 'عید نوروز', type: 'holiday' }],
    '01-12': [{ title: 'روز جمهوری اسلامی ایران', type: 'holiday' }],
    '01-13': [{ title: 'روز طبیعت (سیزده‌به‌در)', type: 'holiday' }],
    '01-17': [{ title: 'روز معمار', type: 'occasion' }],
    '01-18': [{ title: 'روز سلامتی', type: 'occasion' }],
    '01-19': [{ title: 'روز ملی گل و گیاه', type: 'occasion' }],
    '01-25': [{ title: 'روز بزرگداشت عطار نیشابوری', type: 'occasion' }],
    '02-01': [{ title: 'روز بزرگداشت سعدی', type: 'occasion' }],
    '02-02': [{ title: 'روز زمین پاک', type: 'occasion' }],
    '02-03': [{ title: 'روز کارگر (جهانی)', type: 'occasion' }],
    '02-10': [{ title: 'روز ملی خلیج فارس', type: 'occasion' }],
    '02-15': [{ title: 'روز بزرگداشت حکیم عمر خیام', type: 'occasion' }],
    '02-28': [{ title: 'روز بزرگداشت خیام و روز جهانی ارتباطات', type: 'occasion' }],
    '03-01': [{ title: 'روز بهزیستی و تأمین اجتماعی', type: 'occasion' }],
    '03-03': [{ title: 'فتح خرمشهر', type: 'occasion' }],
    '03-14': [{ title: 'رحلت امام خمینی (ره)', type: 'holiday' }],
    '03-15': [{ title: 'قیام ۱۵ خرداد', type: 'holiday' }],
    '03-25': [{ title: 'روز گل و گیاه', type: 'occasion' }],
    '03-31': [{ title: 'شهادت امام جعفر صادق (ع) — تعطیل رسمی', type: 'holiday' }],
    '04-01': [{ title: 'روز اصناف', type: 'occasion' }],
    '04-07': [{ title: 'روز قوه قضائیه', type: 'occasion' }],
    '04-10': [{ title: 'روز صنعت و معدن', type: 'occasion' }],
    '04-12': [{ title: 'روز بزرگداشت علامه مجلسی', type: 'occasion' }],
    '04-14': [{ title: 'رحلت امام خمینی (ره)', type: 'occasion' }],
    '04-27': [{ title: 'روز ارتباطات و روابط عمومی', type: 'occasion' }],
    '05-01': [{ title: 'روز بزرگداشت مولوی', type: 'occasion' }],
    '05-09': [{ title: 'روز بزرگداشت محمدبن‌زکریای رازی', type: 'occasion' }],
    '05-22': [{ title: 'روز بزرگداشت ملاصدرا', type: 'occasion' }],
    '06-01': [{ title: 'روز بزرگداشت ابوعلی سینا و روز پزشک', type: 'occasion' }],
    '06-02': [{ title: 'آغاز هفته دولت', type: 'occasion' }],
    '06-04': [{ title: 'روز کارمند', type: 'occasion' }],
    '06-05': [{ title: 'روز داروساز', type: 'occasion' }],
    '06-08': [{ title: 'روز مبارزه با تروریسم', type: 'occasion' }],
    '06-13': [{ title: 'تاسوعای حسینی', type: 'occasion' }],
    '06-14': [{ title: 'عاشورای حسینی', type: 'occasion' }],
    '06-30': [{ title: 'روز گفت‌وگوی تمدن‌ها', type: 'occasion' }],
    '07-08': [{ title: 'روز بزرگداشت محمدبن‌جریر طبری', type: 'occasion' }],
    '07-12': [{ title: 'روز بزرگداشت علامه مجلسی', type: 'occasion' }],
    '08-01': [{ title: 'روز بزرگداشت شیخ صدوق', type: 'occasion' }],
    '08-08': [{ title: 'روز بزرگداشت مولوی', type: 'occasion' }],
    '08-13': [{ title: 'روز بزرگداشت حافظ', type: 'occasion' }],
    '09-05': [{ title: 'روز تجلیل از اسرا و مفقودان', type: 'occasion' }],
    '09-16': [{ title: 'روز دانشجو', type: 'occasion' }],
    '09-30': [{ title: 'شب یلدا', type: 'occasion' }],
    '10-05': [{ title: 'روز ایمنی در برابر زلزله', type: 'occasion' }],
    '10-20': [{ title: 'روز کوهنورد', type: 'occasion' }],
    '10-22': [{ title: 'پیروزی انقلاب اسلامی', type: 'holiday' }],
    '10-29': [{ title: 'روز ملی هوای پاک', type: 'occasion' }],
    '11-01': [{ title: 'روز ۲۲ بهمن', type: 'occasion' }],
    '11-22': [{ title: 'پیروزی عملیات فتح‌المبین', type: 'occasion' }],
    '12-05': [{ title: 'روز درختکاری', type: 'occasion' }],
    '12-09': [{ title: 'روز ملی حمایت از حقوق مصرف‌کنندگان', type: 'occasion' }],
    '12-16': [{ title: 'روز معلم', type: 'occasion' }],
    '12-22': [{ title: 'روز بزرگداشت شهدا', type: 'occasion' }],
    '12-25': [{ title: 'روز بزرگداشت پروین اعتصامی', type: 'occasion' }],
    '12-29': [{ title: 'روز ملی شدن صنعت نفت ایران', type: 'holiday' }]
  };

  const HIJRI = {
    '01-01': [{ title: 'آغاز سال قمری', type: 'occasion' }],
    '01-09': [{ title: 'تاسوعای حسینی', type: 'holiday' }],
    '01-10': [{ title: 'عاشورای حسینی', type: 'holiday' }],
    '02-20': [{ title: 'اربعین حسینی', type: 'occasion' }],
    '02-28': [{ title: 'رحلت پیامبر اکرم (ص) / شهادت امام حسن مجتبی (ع)', type: 'holiday' }],
    '02-29': [{ title: 'شهادت امام رضا (ع)', type: 'holiday' }],
    '03-03': [{ title: 'شهادت امام حسن مجتبی (ع)', type: 'holiday' }],
    '03-12': [{ title: 'ولادت پیامبر اکرم (ص) و امام جعفر صادق (ع)', type: 'holiday' }],
    '03-17': [{ title: 'ولادت پیامبر (ص) و امام صادق (ع) — روایت اهل سنت', type: 'occasion' }],
    '05-03': [{ title: 'شهادت امام جعفر صادق (ع)', type: 'holiday' }],
    '06-20': [{ title: 'ولادت حضرت فاطمه (س) / روز زن و مادر', type: 'holiday' }],
    '07-01': [{ title: 'ولادت امام محمد باقر (ع)', type: 'occasion' }],
    '07-03': [{ title: 'شهادت امام علی (ع)', type: 'holiday' }],
    '07-13': [{ title: 'ولادت امام علی (ع) / روز پدر', type: 'holiday' }],
    '07-15': [{ title: 'ولادت امام حسن مجتبی (ع)', type: 'occasion' }],
    '07-25': [{ title: 'شهادت امام جعفر صادق (ع)', type: 'holiday' }],
    '07-27': [{ title: 'مبعث پیامبر اکرم (ص)', type: 'holiday' }],
    '08-03': [{ title: 'ولادت امام حسین (ع)', type: 'occasion' }],
    '08-15': [{ title: 'ولادت امام زمان (عج)', type: 'holiday' }],
    '09-01': [{ title: 'آغاز ماه مبارک رمضان', type: 'occasion' }],
    '09-17': [{ title: 'شب قدر (اول)', type: 'occasion' }],
    '09-19': [{ title: 'شب قدر (دوم)', type: 'occasion' }],
    '09-21': [{ title: 'شهادت امام علی (ع) / شب قدر (سوم)', type: 'holiday' }],
    '10-01': [{ title: 'عید سعید فطر', type: 'holiday' }],
    '10-25': [{ title: 'شهادت امام جعفر صادق (ع)', type: 'holiday' }],
    '11-11': [{ title: 'عید سعید غدیر خم', type: 'holiday' }],
    '12-08': [{ title: 'روز عرفه', type: 'occasion' }],
    '12-10': [{ title: 'عید سعید قربان', type: 'holiday' }],
    '12-18': [{ title: 'عید سعید غدیر خم', type: 'holiday' }]
  };

  const GREGORIAN_MONTHS = [
    'ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن',
    'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'
  ];

  const GREGORIAN = {
    '01-01': [{ titleFa: 'سال نو میلادی', titleEn: "New Year's Day", type: 'holiday' }],
    '01-06': [{ titleFa: 'شب کریسمس (ارتدکس)', titleEn: 'Orthodox Christmas Eve', type: 'occasion' }],
    '02-02': [{ titleFa: 'جشن میانه زمستان', titleEn: 'Groundhog Day', type: 'occasion' }],
    '02-14': [{ titleFa: 'روز ولنتاین', titleEn: "Valentine's Day", type: 'occasion' }],
    '03-08': [{ titleFa: 'روز جهانی زن', titleEn: "International Women's Day", type: 'occasion' }],
    '03-17': [{ titleFa: 'روز سنت پاتریک', titleEn: "St. Patrick's Day", type: 'occasion' }],
    '04-01': [{ titleFa: 'دروغ اول آوریل', titleEn: "April Fools' Day", type: 'occasion' }],
    '04-22': [{ titleFa: 'روز زمین', titleEn: 'Earth Day', type: 'occasion' }],
    '05-01': [{ titleFa: 'روز کارگر جهانی', titleEn: 'International Workers\' Day', type: 'holiday' }],
    '05-05': [{ titleFa: 'روز پیروزی', titleEn: 'Cinco de Mayo', type: 'occasion' }],
    '06-05': [{ titleFa: 'روز محیط زیست', titleEn: 'World Environment Day', type: 'occasion' }],
    '06-21': [{ titleFa: 'روز جهانی یوگا', titleEn: 'International Yoga Day', type: 'occasion' }],
    '07-04': [{ titleFa: 'روز استقلال آمریکا', titleEn: 'Independence Day (US)', type: 'holiday' }],
    '07-14': [{ titleFa: 'روز ملی فرانسه', titleEn: 'Bastille Day', type: 'holiday' }],
    '08-12': [{ titleFa: 'روز جهانی جوان', titleEn: 'International Youth Day', type: 'occasion' }],
    '09-21': [{ titleFa: 'روز جهانی صلح', titleEn: 'International Day of Peace', type: 'occasion' }],
    '10-01': [{ titleFa: 'روز جهانی سالمندان', titleEn: 'International Day of Older Persons', type: 'occasion' }],
    '10-24': [{ titleFa: 'روز ملل متحد', titleEn: 'United Nations Day', type: 'occasion' }],
    '10-31': [{ titleFa: 'جشن هالووین', titleEn: 'Halloween', type: 'occasion' }],
    '11-11': [{ titleFa: 'روز آتش‌بس', titleEn: 'Armistice Day', type: 'occasion' }],
    '11-24': [{ titleFa: 'Thanksgiving (US)', titleEn: 'Thanksgiving (US)', type: 'holiday' }],
    '12-10': [{ titleFa: 'روز حقوق بشر', titleEn: 'Human Rights Day', type: 'occasion' }],
    '12-24': [{ titleFa: 'شب کریسمس', titleEn: 'Christmas Eve', type: 'occasion' }],
    '12-25': [{ titleFa: 'کریسمس', titleEn: 'Christmas Day', type: 'holiday' }],
    '12-26': [{ titleFa: 'روز بوکسینگ', titleEn: 'Boxing Day', type: 'occasion' }],
    '12-31': [{ titleFa: 'شب سال نو', titleEn: "New Year's Eve", type: 'occasion' }]
  };

  function localizeEvent(event, lang) {
    const title = lang === 'en' ? (event.titleEn || event.titleFa || event.title) : (event.titleFa || event.titleEn || event.title);
    return { title, type: event.type, source: event.source };
  }

  function getKey(month, day) {
    return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getGregorianEvents(gy, gm, gd, lang) {
    const key = getKey(gm, gd);
    return (GREGORIAN[key] || []).map((e) => localizeEvent(e, lang));
  }

  function getHijriEvents(hy, hm, hd, lang) {
    const key = getKey(hm, hd);
    return (HIJRI[key] || []).map((e) => localizeEvent({ ...e, titleFa: e.title, titleEn: e.title }, lang));
  }

  function getEvents(jy, jm, jd, lang) {
    const shamsiKey = getKey(jm, jd);
    const events = [];

    if (SHAMSI[shamsiKey]) {
      SHAMSI[shamsiKey].forEach((e) => {
        events.push(localizeEvent({ ...e, titleFa: e.title, titleEn: e.title }, lang));
      });
    }

    const h = Hijri.fromJalali(jy, jm, jd);
    const hijriKey = getKey(h.month, h.day);
    if (HIJRI[hijriKey]) {
      HIJRI[hijriKey].forEach((e) => {
        const item = localizeEvent({ ...e, titleFa: e.title, titleEn: e.title }, lang);
        if (!events.some((x) => x.title === item.title)) {
          events.push({ ...item, source: 'hijri' });
        }
      });
    }

    return events;
  }

  function isGregorianHoliday(gy, gm, gd, lang) {
    return getGregorianEvents(gy, gm, gd, lang).some((e) => e.type === 'holiday');
  }

  function isHijriHoliday(hy, hm, hd, lang) {
    return getHijriEvents(hy, hm, hd, lang).some((e) => e.type === 'holiday');
  }

  function isHoliday(jy, jm, jd, lang) {
    return getEvents(jy, jm, jd, lang).some((e) => e.type === 'holiday');
  }

  function hasGregorianEvents(gy, gm, gd, lang) {
    return getGregorianEvents(gy, gm, gd, lang).length > 0;
  }

  function hasHijriEvents(hy, hm, hd, lang) {
    return getHijriEvents(hy, hm, hd, lang).length > 0;
  }

  function hasEvents(jy, jm, jd, lang) {
    return getEvents(jy, jm, jd, lang).length > 0;
  }

  function formatGregorian(jy, jm, jd) {
    const g = Jalali.jalaliToGregorian(jy, jm, jd);
    return formatGregorianFromGregorian(g.year, g.month, g.day);
  }

  function formatGregorianFromGregorian(gy, gm, gd) {
    const month = GREGORIAN_MONTHS[gm - 1];
    const d = Jalali.toPersianDigits(gd);
    const y = Jalali.toPersianDigits(gy);
    return `\u2066${d}\u2069 ${month} \u2066${y}\u2069`;
  }

  function formatHijri(jy, jm, jd) {
    const h = Hijri.fromJalali(jy, jm, jd);
    return Hijri.format(h.year, h.month, h.day);
  }

  return {
    getEvents,
    getGregorianEvents,
    getHijriEvents,
    isHoliday,
    isGregorianHoliday,
    isHijriHoliday,
    hasEvents,
    hasGregorianEvents,
    hasHijriEvents,
    formatGregorian,
    formatGregorianFromGregorian,
    formatHijri,
    GREGORIAN_MONTHS
  };
})();
