const Hijri = (() => {
  const MONTHS = [
    'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی',
    'جمادی‌الاول', 'جمادی‌الثانی', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه'
  ];

  function gregorianToJulianDay(gy, gm, gd) {
    let a = Math.floor((14 - gm) / 12);
    let y = gy + 4800 - a;
    let m = gm + 12 * a - 3;
    return gd + Math.floor((153 * m + 2) / 5) + 365 * y +
      Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  }

  function julianDayToGregorian(jd) {
    let l = jd + 68569;
    let n = Math.floor(4 * l / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    let i = Math.floor(4000 * (l + 1) / 1461001);
    l = l - Math.floor(1461 * i / 4) + 31;
    let j = Math.floor(80 * l / 2447);
    const gd = l - Math.floor(2447 * j / 80);
    l = Math.floor(j / 11);
    const gm = j + 2 - 12 * l;
    const gy = 100 * (n - 49) + i + l;
    return { year: gy, month: gm, day: gd };
  }

  function gregorianToHijri(gy, gm, gd) {
    const jd = gregorianToJulianDay(gy, gm, gd);
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    let remaining = l - 10631 * n + 354;
    const j = Math.floor((10985 - remaining) / 5316) *
      Math.floor(50 * remaining / 17719) +
      Math.floor(remaining / 5670) * Math.floor(43 * remaining / 15238);
    remaining = remaining - Math.floor((30 - j) / 15) * Math.floor(17719 * j / 50) -
      Math.floor(j / 16) * Math.floor(15238 * j / 43) + 29;
    const hm = Math.floor(24 * remaining / 709);
    const hd = remaining - Math.floor(709 * hm / 24);
    const hy = 30 * n + j + hm - 30;
    return { year: hy, month: hm, day: hd };
  }

  function hijriToGregorian(hy, hm, hd) {
    const jd = Math.floor((11 * hy + 3) / 30) + 354 * hy + 30 * hm -
      Math.floor((hm - 1) / 2) + hd + 1948440 - 385;
    return julianDayToGregorian(jd);
  }

  function daysInHijriMonth(hy, hm) {
    const start = hijriToGregorian(hy, hm, 1);
    const next = hm === 12 ? { year: hy + 1, month: 1 } : { year: hy, month: hm + 1 };
    const end = hijriToGregorian(next.year, next.month, 1);
    return gregorianToJulianDay(end.year, end.month, end.day) -
      gregorianToJulianDay(start.year, start.month, start.day);
  }

  function getWeekday(hy, hm, hd) {
    const g = hijriToGregorian(hy, hm, hd);
    return new Date(g.year, g.month - 1, g.day).getDay();
  }

  function getMonthDays(hy, hm) {
    const count = daysInHijriMonth(hy, hm);
    const days = [];
    for (let d = 1; d <= count; d++) {
      days.push({ day: d, weekday: getWeekday(hy, hm, d) });
    }
    return days;
  }

  function today() {
    const now = new Date();
    return gregorianToHijri(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  function fromJalali(jy, jm, jd) {
    const g = Jalali.jalaliToGregorian(jy, jm, jd);
    return gregorianToHijri(g.year, g.month, g.day);
  }

  function format(hy, hm, hd) {
    return `${Jalali.toPersianDigits(hd)} ${MONTHS[hm - 1]} ${Jalali.toPersianDigits(hy)}`;
  }

  function formatShort(hy, hm, hd) {
    return `${Jalali.toPersianDigits(hd)}/${Jalali.toPersianDigits(hm)}/${Jalali.toPersianDigits(hy)}`;
  }

  return {
    MONTHS,
    gregorianToHijri,
    hijriToGregorian,
    fromJalali,
    format,
    formatShort,
    julianDayToGregorian,
    gregorianToJulianDay,
    daysInHijriMonth,
    getWeekday,
    getMonthDays,
    today
  };
})();
