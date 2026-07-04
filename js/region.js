const RegionHelper = (() => {
  const HIJRI_COUNTRIES = new Set([
    'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'YE', 'EG', 'IQ', 'SY', 'JO', 'LB', 'PS',
    'LY', 'SD', 'MA', 'DZ', 'TN', 'KM', 'DJ', 'SO', 'MR', 'PK', 'BD', 'ID', 'MY', 'BN'
  ]);

  function calendarTypeForCountry(countryCode) {
    const code = (countryCode || '').toUpperCase();
    if (code === 'IR' || code === 'AF') return 'jalali';
    if (HIJRI_COUNTRIES.has(code)) return 'hijri';
    return 'gregorian';
  }

  function weekStartsOnMonday(calendarType, countryCode) {
    if (calendarType === 'gregorian') {
      const code = (countryCode || '').toUpperCase();
      return code !== 'IR' && code !== 'AF';
    }
    return false;
  }

  return { calendarTypeForCountry, weekStartsOnMonday };
})();
