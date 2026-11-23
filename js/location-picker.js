const LocationPicker = (() => {
  let debounceTimer = null;

  function getSeparator(lang) {
    const useFa = lang ? lang === 'fa' : I18n.getLang() === 'fa';
    return useFa ? '، ' : ', ';
  }

  function normalizeQuery(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
  }

  function hasFaChars(text) {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  }

  function mapResult(r, lang) {
    const labelLang = lang || (I18n.getLang() === 'fa' ? 'fa' : 'en');
    const label = [r.name, r.admin1, r.country].filter(Boolean).join(getSeparator(labelLang));
    return {
      name: r.name,
      country: r.country || '',
      countryCode: r.country_code || '',
      admin1: r.admin1 || '',
      lat: r.latitude,
      lng: r.longitude,
      timezone: r.timezone || '',
      label,
      display: label // alias kept for callers
    };
  }

  function localLabel(city, lang) {
    const useFa = lang ? lang === 'fa' : I18n.getLang() === 'fa';
    return useFa
      ? [city.nameFa, city.countryFa].filter(Boolean).join('، ')
      : [city.nameEn, city.countryEn].filter(Boolean).join(', ');
  }

  function toPickerItem(city) {
    return {
      name: city.nameFa || city.nameEn,
      nameFa: city.nameFa,
      nameEn: city.nameEn,
      country: city.countryFa || city.countryEn,
      countryFa: city.countryFa,
      countryEn: city.countryEn,
      countryCode: city.countryCode,
      admin1: '',
      lat: city.lat,
      lng: city.lng,
      timezone: city.timezone || '',
      label: localLabel(city)
    };
  }

  /* Offline prefix match over the local city dataset. Instant, zero-network.
     Matches city names and country names (case-insensitive prefix) in the
     language of the typed query (Persian input matches Persian names, latin
     input matches latin names). */
  function searchLocal(query) {
    const trimmed = normalizeQuery(query);
    const q = trimmed.toLowerCase();
    if (q.length < 2) return [];
    const useFa = hasFaChars(trimmed);
    const cities = typeof CitiesData !== 'undefined' ? CitiesData : [];
    const out = [];
    for (const city of cities) {
      const name = useFa ? (city.nameFa || '').toLowerCase() : (city.nameEn || city.latin || '').toLowerCase();
      const country = useFa ? (city.countryFa || '').toLowerCase() : (city.countryEn || '').toLowerCase();
      if (name.startsWith(q)) { out.push(toPickerItem(city)); continue; }
      // Country-prefix match only for longer, meaningful queries (e.g. "ایران").
      if (q.length >= 4 && country.startsWith(q)) out.push(toPickerItem(city));
    }
    return out.slice(0, 20);
  }

  function dedupeKey(item) {
    const name = String(item.nameEn || item.name || '').toLowerCase();
    const country = String(item.countryEn || item.country || '').toLowerCase();
    return `${name}|${country}`;
  }

  function mergeResults(local, api) {
    const seen = new Set();
    const out = [];
    for (const item of [...local, ...api]) {
      if (!item) continue;
      const key = dedupeKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out.slice(0, 20);
  }

  async function fetchOpenMeteo(query) {
    const trimmed = normalizeQuery(query);
    if (trimmed.length < 2) return [];
    const lang = I18n.getLang() === 'fa' ? 'fa' : 'en';
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=10&language=${lang}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((r) => mapResult(r, lang));
  }

  async function searchLocations(query) {
    const trimmed = normalizeQuery(query);
    if (trimmed.length < 2) return [];
    const local = searchLocal(trimmed);
    if (hasFaChars(trimmed)) {
      // The geocoding API only matches latin input — Persian queries are
      // served from the local dataset only.
      return local;
    }
    try {
      const api = await fetchOpenMeteo(trimmed);
      return mergeResults(local, api);
    } catch (err) {
      return local;
    }
  }

  async function resolveLocation(lat, lon) {
    if (lat == null || lon == null) return null;

    const lang = typeof I18n !== 'undefined' && I18n.getRegionalLang() === 'fa' ? 'fa' : 'en';
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=${lang}&count=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const r = (await res.json()).results?.[0];
    if (!r) return null;
    return mapResult(r, lang);
  }

  function buildLocationUpdates(result, prefix = '') {
    const updates = {
      city: result.name,
      country: result.country,
      countryCode: result.countryCode,
      locationLat: result.lat,
      locationLon: result.lng,
      timezone: result.timezone || ''
    };
    if (!prefix) {
      updates.calendarType = RegionHelper.calendarTypeForCountry(result.countryCode);
    }
    if (!prefix) return updates;

    const prefixed = {};
    Object.entries(updates).forEach(([key, value]) => {
      prefixed[`second${key.charAt(0).toUpperCase()}${key.slice(1)}`] = value;
    });
    return prefixed;
  }

  function attach({ inputId, listId, hiddenId, onSelect }) {
    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);
    const hidden = hiddenId ? document.getElementById(hiddenId) : null;
    if (!input || !list) return;

    let selected = null;

    function hideList() {
      list.classList.add('hidden');
      list.innerHTML = '';
      list.style.position = '';
      list.style.inset = '';
      list.style.left = '';
      list.style.top = '';
      list.style.width = '';
    }

    // The list is position: fixed so it escapes the settings modal's scroll
    // container (overflow-y: auto) and never gets clipped. Position it right
    // under the input so it reads as a normal dropdown.
    function positionList() {
      const rect = input.getBoundingClientRect();
      list.style.position = 'fixed';
      list.style.inset = 'auto';
      list.style.right = 'auto';
      list.style.bottom = 'auto';
      list.style.left = `${rect.left}px`;
      const top = rect.bottom + 6;
      list.style.top = `${top}px`;
      list.style.width = `${rect.width}px`;
      // If the list would overflow the viewport bottom, cap it so it stays visible.
      const maxHeight = Math.max(120, window.innerHeight - top - 12);
      if (list.scrollHeight > maxHeight) {
        list.style.maxHeight = `${maxHeight}px`;
      } else {
        list.style.maxHeight = '';
      }
    }

    function showList(items) {
      const trimmed = String(input.value || '').trim();
      if (!items.length) {
        if (trimmed.length >= 2) {
          list.innerHTML = `<li class="location-suggestion-empty">${escapeHtml(I18n.t('locationNotFound'))}</li>`;
          list.classList.remove('hidden');
          positionList();
        } else {
          hideList();
        }
        return;
      }

      list.innerHTML = items.map((item, index) => `
        <li>
          <button type="button" class="location-suggestion" data-index="${index}">
            <span class="location-suggestion-name">${escapeHtml(item.label)}</span>
          </button>
        </li>
      `).join('');
      list.classList.remove('hidden');
      positionList();

      list.querySelectorAll('.location-suggestion').forEach((btn) => {
        btn.addEventListener('click', () => {
          const item = items[Number(btn.dataset.index)];
          selected = item;
          input.value = item.label;
          if (hidden) hidden.value = JSON.stringify(item);
          hideList();
          onSelect?.(item);
        });
      });
    }

    function runSearch(value) {
      const trimmed = String(value || '').trim();
      return searchLocations(trimmed);
    }

    input.addEventListener('input', () => {
      selected = null;
      if (hidden) hidden.value = '';
      const trimmed = String(input.value || '').trim();
      clearTimeout(debounceTimer);
      if (trimmed.length < 2) { hideList(); return; }

      // Immediate offline render (Persian input shows local results only)
      const local = searchLocal(trimmed);
      if (local.length) showList(local);
      else if (hasFaChars(trimmed)) showList([]); // let Persian get the hint right away

      debounceTimer = setTimeout(async () => {
        const items = await runSearch(trimmed);
        if (String(input.value || '').trim() !== trimmed) return; // stale
        showList(items);
      }, 240);
    });

    input.addEventListener('focus', async () => {
      if (input.value.trim().length >= 2) {
        const items = await runSearch(input.value);
        if (String(input.value || '').trim().length >= 2) showList(items);
      }
    });

    document.addEventListener('tabyar:language-changed', async () => {
      if (input.value.trim().length >= 2 && !selected) {
        const items = await runSearch(input.value);
        showList(items);
      }
    });

    window.addEventListener('resize', hideList);
    window.addEventListener('scroll', hideList, true);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { hideList(); input.blur(); }
    });

    document.addEventListener('click', (e) => {
      if (!list.contains(e.target) && e.target !== input) hideList();
    });

    return {
      getSelected: () => selected,
      setDisplay: (label, data) => {
        input.value = label || '';
        selected = data || null;
        if (hidden) hidden.value = data ? JSON.stringify(data) : '';
      },
      clear: () => {
        input.value = '';
        selected = null;
        if (hidden) hidden.value = '';
        hideList();
      }
    };
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str ?? '');
    return div.innerHTML;
  }

  return { attach, searchLocations, searchLocal, resolveLocation, buildLocationUpdates };
})();
