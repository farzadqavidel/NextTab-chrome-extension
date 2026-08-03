/**
 * "Most visited" quick-launch pill.
 *
 * Mirrors the Google services pill on the opposite side of the search box and
 * uses chrome.topSites so it fills itself from the user's real browsing habits
 * instead of needing manual setup.
 */
const TopSitesUI = (() => {
  const MAX_TILES = 6;

  let pendingUrl = null;

  function isAvailable() {
    return typeof chrome !== 'undefined' && chrome.topSites && chrome.topSites.get;
  }

  function fetchTopSites() {
    return new Promise((resolve) => {
      if (!isAvailable()) return resolve([]);
      try {
        chrome.topSites.get((sites) => {
          if (chrome.runtime.lastError) return resolve([]);
          resolve(Array.isArray(sites) ? sites : []);
        });
      } catch {
        resolve([]);
      }
    });
  }

  function init() {
    setupMenu();
    render();
  }

  async function render() {
    const card = document.querySelector('.top-sites-card');
    const grid = document.getElementById('top-sites-grid');
    if (!card || !grid) return;

    const settings = Storage.getSettings();
    if (settings.topSitesVisible === false) {
      card.classList.add('hidden');
      return;
    }

    // Drop anything the user removed, then take the first few that remain.
    const sites = (await fetchTopSites())
      .filter((site) => !Storage.isTopSiteHidden(site.url))
      .slice(0, MAX_TILES);

    if (!sites.length) {
      card.classList.add('hidden');
      return;
    }

    card.classList.remove('hidden');
    grid.innerHTML = sites.map((site) => {
      const title = site.title || Favicon.getDomain(site.url);
      return `
        <a href="${escapeAttr(site.url)}" class="gs-tile" data-top-site-url="${escapeAttr(site.url)}"
           title="${escapeAttr(title)}">
          <span class="gs-tile-icon">
            ${Favicon.imgHtml(site.url, title)}
          </span>
        </a>
      `;
    }).join('');

    Favicon.bindAll(grid, 'img');
    bindContextMenus(grid);
  }

  function bindContextMenus(grid) {
    grid.querySelectorAll('[data-top-site-url]').forEach((tile) => {
      tile.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showMenu(e.clientX, e.clientY, tile.dataset.topSiteUrl);
      });
    });
  }

  function showMenu(x, y, url) {
    const menu = document.getElementById('top-sites-context-menu');
    if (!menu) return;

    pendingUrl = url;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    menu.classList.remove('hidden');
  }

  function hideMenu() {
    const menu = document.getElementById('top-sites-context-menu');
    if (menu) menu.classList.add('hidden');
    pendingUrl = null;
  }

  async function removeCurrent() {
    if (!pendingUrl) return;
    await Storage.hideTopSite(pendingUrl);
    hideMenu();
    render();
  }

  async function restoreAll() {
    await Storage.clearHiddenTopSites();
    render();
  }

  function setupMenu() {
    const menu = document.getElementById('top-sites-context-menu');
    if (!menu) return;

    menu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (btn.dataset.action === 'remove-top-site') await removeCurrent();
        else hideMenu();
      });
    });

    document.addEventListener('click', hideMenu);
  }

  function escapeAttr(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return { init, render, restoreAll };
})();
