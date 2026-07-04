
const Jalali = (() => {
  const PERSIAN_MONTHS = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const PERSIAN_WEEKDAYS = [
    'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
  ];

  function div(a, b) {
    return Math.floor(a / b);
  }

  function gregorianToJalali(gy, gm, gd) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let jy;

    if (gy > 1600) {
      jy = 979;
      gy -= 1600;
    } else {
      jy = 0;
      gy -= 621;
    }

    const gy2 = gm > 2 ? gy + 1 : gy;
    let days = 365 * gy + div(gy2 + 3, 4) - div(gy2 + 99, 100) +
      div(gy2 + 399, 400) - 80 + gd + g_d_m[gm - 1];

    jy += 33 * div(days, 12053);
    days %= 12053;
    jy += 4 * div(days, 1461);
    days %= 1461;

    if (days > 365) {
      jy += div(days - 1, 365);
      days = (days - 1) % 365;
    }

    let jm;
    let jd;

    if (days < 186) {
      jm = 1 + div(days, 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + div(days - 186, 30);
      jd = 1 + ((days - 186) % 30);
    }

    return { year: jy, month: jm, day: jd };
  }

  function jalaliToGregorian(jy, jm, jd) {
    let gy;

    if (jy > 979) {
      gy = 1600;
      jy -= 979;
    } else {
      gy = 621;
    }

    let days = 365 * jy + div(jy, 33) * 8 + div((jy % 33) + 3, 4) +
      78 + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

    gy += 400 * div(days, 146097);
    days %= 146097;

    if (days > 36524) {
      gy += 100 * div(--days, 36524);
      days %= 36524;
      if (days >= 365) days++;
    }

    gy += 4 * div(days, 1461);
    days %= 1461;

    if (days > 365) {
      gy += div(days - 1, 365);
      days = (days - 1) % 365;
    }

    let gd = days + 1;
    const sal_a = [0, 31, (gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0) ? 29 : 28,
      31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    let gm = 0;
    while (gm < 13 && gd > sal_a[gm]) {
      gd -= sal_a[gm++];
    }

    return { year: gy, month: gm, day: gd };
  }

  function isLeapJalaliYear(jy) {
    const r = jy % 33;
    return r === 1 || r === 5 || r === 9 || r === 13 || r === 17 ||
      r === 22 || r === 26 || r === 30;
  }

  function daysInJalaliMonth(jy, jm) {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return isLeapJalaliYear(jy) ? 30 : 29;
  }

  function today() {
    const now = new Date();
    return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function getWeekday(jy, jm, jd) {
    const g = jalaliToGregorian(jy, jm, jd);
    const date = new Date(g.year, g.month - 1, g.day);
    return date.getDay();
  }

  function getMonthDays(jy, jm) {
    const count = daysInJalaliMonth(jy, jm);
    const days = [];
    for (let d = 1; d <= count; d++) {
      days.push({ day: d, weekday: getWeekday(jy, jm, d) });
    }
    return days;
  }

  function toPersianDigits(num) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);
  }

  function formatDate(jy, jm, jd) {
    return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`;
  }

  function formatTime(date) {
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return toPersianDigits(`${h}:${m}:${s}`);
  }

  function gregorianToday() {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  }

  function daysInGregorianMonth(gy, gm) {
    return new Date(gy, gm, 0).getDate();
  }

  function getGregorianMonthDays(gy, gm) {
    const count = daysInGregorianMonth(gy, gm);
    const days = [];
    for (let d = 1; d <= count; d++) {
      const date = new Date(gy, gm - 1, d);
      days.push({ day: d, weekday: date.getDay() });
    }
    return days;
  }

  function getGregorianWeekday(gy, gm, gd) {
    return new Date(gy, gm - 1, gd).getDay();
  }

  return {
    PERSIAN_MONTHS,
    PERSIAN_WEEKDAYS,
    gregorianToJalali,
    jalaliToGregorian,
    isLeapJalaliYear,
    daysInJalaliMonth,
    today,
    getWeekday,
    getMonthDays,
    toPersianDigits,
    formatDate,
    formatTime,
    gregorianToday,
    daysInGregorianMonth,
    getGregorianMonthDays,
    getGregorianWeekday
  };
})();
