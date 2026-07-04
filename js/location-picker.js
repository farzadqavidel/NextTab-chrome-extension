const LocationPicker = (() => {
  let debounceTimer = null;

  function getSeparator() {
    return I18n.getLang() === 'fa' ? '، ' : ', ';
  }

  function mapResult(r) {
    return {
      name: r.name,
      country: r.country || '',
      countryCode: r.country_code || '',
      admin1: r.admin1 || '',
      lat: r.latitude,
      lon: r.longitude,
      timezone: r.timezone || '',
      label: [r.name, r.admin1, r.country].filter(Boolean).join(getSeparator())
    };
  }

  async function searchLocations(query) {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const lang = I18n.getLang() === 'fa' ? 'fa' : 'en';
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=8&language=${lang}`;
    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((r) => mapResult(r));
  }

  async function resolveLocation(lat, lon) {
    if (lat == null || lon == null) return null;

    const lang = I18n.getLang() === 'fa' ? 'fa' : 'en';
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=${lang}&count=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const r = (await res.json()).results?.[0];
    if (!r) return null;
    return mapResult(r);
  }

  function buildLocationUpdates(result) {
    return {
      city: result.name,
      country: result.country,
      countryCode: result.countryCode,
      locationLat: result.lat,
      locationLon: result.lon,
      timezone: result.timezone || '',
      calendarType: RegionHelper.calendarTypeForCountry(result.countryCode)
    };
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
    }

    function showList(items) {
      if (!items.length) {
        hideList();
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

    input.addEventListener('input', () => {
      selected = null;
      if (hidden) hidden.value = '';
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        const items = await searchLocations(input.value);
        showList(items);
      }, 280);
    });

    input.addEventListener('focus', async () => {
      if (input.value.trim().length >= 2) {
        const items = await searchLocations(input.value);
        showList(items);
      }
    });

    document.addEventListener('tabyar:language-changed', async () => {
      if (!input.value.trim()) return;
      if (selected) {
        const resolved = await resolveLocation(selected.lat, selected.lon);
        if (resolved) {
          selected = resolved;
          input.value = resolved.label;
          if (hidden) hidden.value = JSON.stringify(resolved);
        }
      }
      if (input.value.trim().length >= 2) {
        const items = await searchLocations(input.value);
        showList(items);
      }
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
    div.textContent = str;
    return div.innerHTML;
  }

  return { attach, searchLocations, resolveLocation, buildLocationUpdates };
})();
