// Extension update helper.
//
// Chrome extensions cannot install updates themselves, so this module does the
// closest useful thing: on a single tap of the "بررسی اپدیت" button it
//   1. Detects the current version from the manifest.
//   2. Reads the latest version tag on GitHub and compares it semver-style.
//   3. Reports the result and ALWAYS offers a one-tap download so the update
//      is reachable even if the version check itself fails (no network, no
//      tags, rate-limited API) — the pill degrades gracefully, the download
//      never goes missing.
const UpdatesUI = (() => {
  const REPO_OWNER = 'farzadqavidel';
  const REPO_NAME = 'tabyar-chrome-extension';
  const REPO_WEB = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;
  const REPO_ZIP_URL = `${REPO_WEB}/archive/refs/heads/main.zip`;

  const $ = (id) => document.getElementById(id);

  function t(key) {
    try { return I18n.t(key); } catch { return key; }
  }

  function getCurrentVersion() {
    try { return (chrome.runtime.getManifest() && chrome.runtime.getManifest().version) || ''; }
    catch { return ''; }
  }

  function normalizeVersion(value) {
    return String(value || '').trim().replace(/^v/i, '');
  }

  // Semver-ish compare: numeric parts, then pre-release awareness.
  //  "1.2.3" < "1.2.3-beta" is false — a plain release is greater than any
  //  of its pre-releases. Equal releases without pre-release return 0.
  function compareVersions(a, b) {
    const pa = normalizeVersion(a).split(/[.-]/).map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : 0));
    const pb = normalizeVersion(b).split(/[.-]/).map((p) => (/^\d+$/.test(p) ? parseInt(p, 10) : 0));
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i += 1) {
      const x = pa[i] || 0;
      const y = pb[i] || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }
    const preA = String(a || '').trim().split('-')[1];
    const preB = String(b || '').trim().split('-')[1];
    if (preA && !preB) return -1; // a is pre-release, b is plain → b is newer
    if (!preA && preB) return 1;
    return 0;
  }

  function displayVersion(value) {
    if (!value) return '—';
    return /^v/i.test(value) ? value : `v${value}`;
  }

  function setPill(id, state, text) {
    const el = $(id);
    if (!el) return;
    el.className = `update-status-pill update-status-${state}`;
    el.textContent = text;
  }

  function setVisibility(id, show) {
    const el = $(id);
    if (el) el.hidden = !show;
  }

  // Fetchs the latest version-like tag. Throws when nothing usable exists.
  async function fetchLatestTag() {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/tags?per_page=20`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`github-${res.status}`);
    const tags = await res.json();
    const names = (Array.isArray(tags) ? tags : [])
      .map((tag) => String((tag && tag.name) || '').trim())
      // Only tags that look like version numbers — skip loosely named tags.
      .filter((name) => /^v?\d+(\.\d+){1,2}(-|$)/.test(name));
    if (!names.length) throw new Error('no-version-tags');
    return names.reduce((best, name) => (compareVersions(name, best) > 0 ? name : best), names[0]);
  }

  async function fetchLatestCommit() {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits/main`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!res.ok) throw new Error(`github-${res.status}`);
    const data = await res.json();
    return String((data && data.sha) || '').slice(0, 7);
  }

  // Always reveal the download button. The update must be reachable even if
  // the version check itself failed — that is the whole point of this module.
  function revealDownload(href) {
    const downloadBtn = $('btn-update-download');
    if (downloadBtn) {
      downloadBtn.href = href || REPO_ZIP_URL;
      setVisibility('btn-update-download', true);
    }
    setVisibility('update-after-install', true);
  }

  async function checkLatest() {
    const current = getCurrentVersion();

    setVisibility('update-result', true);
    setVisibility('update-after-install', false);

    setPill('update-status', 'checking', t('updateChecking'));

    // Primary path — tag-based comparison (accurate vs the manifest version).
    try {
      const latestTag = await fetchLatestTag();
      const latestDisplay = displayVersion(latestTag);
      const isNewer = current && compareVersions(latestTag, current) > 0;
      if (isNewer || !current) {
        setPill('update-status', 'available', `${t('updateAvailable')} — ${latestDisplay}`);
      } else {
        setPill('update-status', 'uptodate', `${t('updateUpToDate')} (v${normalizeVersion(current)})`);
      }
      // Download the tagged archive so what is displayed matches what is downloaded.
      revealDownload(`${REPO_WEB}/archive/refs/tags/${encodeURIComponent(latestTag)}.zip`);
      return;
    } catch (err) {
      /* fall through — never report a dead end */
    }

    // Degraded path — still offer the update via the main branch.
    let reported = false;
    try {
      const sha = await fetchLatestCommit();
      if (sha) {
        setPill('update-status', 'uptodate', `${t('updateLatestCommit')} ${sha}`);
        reported = true;
      }
    } catch { /* ignore — fall through to the error pill */ }
    if (!reported) setPill('update-status', 'error', t('updateError'));

    revealDownload(REPO_ZIP_URL);
  }

  function runUpdate() {
    const btn = $('btn-update-extension');
    if (btn) btn.disabled = true;
    checkLatest()
      .catch(() => setPill('update-status', 'error', t('updateError')))
      .finally(() => {
        if (btn) btn.disabled = false;
      });
  }

  function init() {
    const mainBtn = $('btn-update-extension');
    if (!mainBtn) return;
    if (mainBtn.dataset.updateBound === '1') return;
    mainBtn.dataset.updateBound = '1';
    mainBtn.addEventListener('click', runUpdate);
  }

  return { init, checkLatest };
})();
