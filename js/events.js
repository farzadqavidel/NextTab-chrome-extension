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

  function getKey(month, day) {
    return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getEvents(jy, jm, jd) {
    const shamsiKey = getKey(jm, jd);
    const events = [];

    if (SHAMSI[shamsiKey]) {
      events.push(...SHAMSI[shamsiKey]);
    }

    const h = Hijri.fromJalali(jy, jm, jd);
    const hijriKey = getKey(h.month, h.day);
    if (HIJRI[hijriKey]) {
      HIJRI[hijriKey].forEach((e) => {
        if (!events.some((x) => x.title === e.title)) {
          events.push({ ...e, source: 'hijri' });
        }
      });
    }

    return events;
  }

  function isHoliday(jy, jm, jd) {
    return getEvents(jy, jm, jd).some((e) => e.type === 'holiday');
  }

  function hasEvents(jy, jm, jd) {
    return getEvents(jy, jm, jd).length > 0;
  }

  function formatGregorian(jy, jm, jd) {
    const g = Jalali.jalaliToGregorian(jy, jm, jd);
    return `${Jalali.toPersianDigits(g.day)} ${GREGORIAN_MONTHS[g.month - 1]} ${Jalali.toPersianDigits(g.year)}`;
  }

  function formatHijri(jy, jm, jd) {
    const h = Hijri.fromJalali(jy, jm, jd);
    return Hijri.format(h.year, h.month, h.day);
  }

  return { getEvents, isHoliday, hasEvents, formatGregorian, formatHijri, GREGORIAN_MONTHS };
})();
