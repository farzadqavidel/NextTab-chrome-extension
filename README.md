# Tabyar

**Your personal New Tab — calendar, bookmarks, weather, notes, and themes in one beautiful page.**

[![Version](https://img.shields.io/badge/version-1.1.0-blue?style=flat-square)](https://github.com/farzadqavidel/Chrome-Extention)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)

---

## Overview

**Tabyar** replaces Chrome’s default New Tab with a customizable dashboard designed for daily use.  
It combines a **Jalali calendar**, **bookmarks**, **Google search**, **weather**, **notes**, and rich **appearance settings** — all stored locally in your browser.

> **Version:** `1.1.0`

---

## Built With

| Layer | Technology |
|-------|------------|
| Extension core | **HTML5**, **CSS3**, **JavaScript** (Manifest V3) |
| Storage | Chrome `storage.local` + IndexedDB (wallpapers) |
| Calendar | Custom Jalali & Hijri algorithms |
| Weather | [Open-Meteo API](https://open-meteo.com/) |
| Installer (optional) | **Python 3** (stdlib only) |
| Fonts | [Vazirmatn](https://fonts.google.com/) via Google Fonts |

---

## Features

### Calendar
- Accurate **Jalali (Persian) calendar** with month navigation
- Live clock and today’s date
- Gregorian & Hijri date display
- Iranian occasions & holidays
- Fridays highlighted

### Bookmarks
- Unlimited bookmarks with custom groups & colors
- Auto favicon loading with letter fallback
- Import from Chrome bookmarks (with folder structure)
- Right-click to edit or delete

### Search
- Google search bar (text, voice*, image search)
- Opens results in the same tab

### Weather
- Current weather for your location
- Multi-day forecast modal
- Powered by Open-Meteo

### Notes
- Quick notes panel with trash & restore
- Expand view for longer lists
- Optional blur for privacy

### Appearance & Settings
- **Color themes:** Midnight, Ocean, Forest, Lavender, Glass *(default)*
- **Backgrounds:** gradients, solid colors, image URL, upload, or curated 4K wallpapers
- Blur & overlay controls for background images
- **Languages:** Persian (FA) & English (EN)
- Export / import all data as JSON
- Reset to defaults

### Optional Python Installer
The `launcher/` folder includes a standalone installer that downloads the extension from GitHub and helps set it up on Windows.

---

## Installation

### 1 · Get the project

**Option A — Clone with Git**

```bash
git clone https://github.com/farzadqavidel/Chrome-Extention.git
cd Chrome-Extention
```

**Option B — Download ZIP**

1. Open [github.com/farzadqavidel/Chrome-Extention](https://github.com/farzadqavidel/Chrome-Extention)
2. Click **Code → Download ZIP**
3. Extract the archive to a permanent folder

> **Important:** Choose a stable location **before** loading the extension — for example:
>
> ```
> C:\Extensions\Chrome-Extention
> ```
>
> If you move or delete the folder later, Chrome will disable the extension and you will need to load it again.

---

### 2 · Load in Chrome

1. Open Chrome and go to:

   ```
   chrome://extensions/
   ```

2. Enable **Developer mode** (toggle in the top-right corner)

3. Click **Load unpacked**

4. Select the extension folder (the one containing `manifest.json`)

5. Open a **new tab** — Tabyar is ready

**Enjoy Tabyar!**

---

## Usage Guide

| Action | How |
|--------|-----|
| Open settings | Click the **gear icon** (top-right) |
| Change theme | Settings → **Appearance** → pick a color theme |
| Set background | Settings → **Background** → gradient, color, or image |
| Add bookmark | Click **+** in the center column, or use the folder tabs |
| Import Chrome bookmarks | Bookmarks area → import button |
| Switch language | Settings → **Language** → فارسی / English |
| Backup data | Settings → **Backup** → Export to JSON file |
| Restore data | Settings → **Backup** → Import from JSON file |

All preferences are saved automatically and persist across browser restarts.

---

## Project Structure

```
Chrome-Extention/
├── manifest.json          # Extension manifest (MV3)
├── newtab.html            # New Tab page
├── css/
│   └── styles.css         # All styles
├── js/
│   ├── app.js             # Bootstrap
│   ├── storage.js         # Data layer
│   ├── settings.js        # Themes & backgrounds
│   ├── wallpaper.js       # Wallpaper fetch & cache
│   ├── background.js      # Service worker
│   ├── calendar.js        # Jalali calendar UI
│   ├── bookmarks.js       # Bookmarks manager
│   ├── notes.js           # Notes panel
│   ├── weather.js         # Weather widget
│   ├── i18n.js            # FA / EN translations
│   ├── jalali.js          # Jalali date math
│   ├── hijri.js           # Hijri date math
│   └── events.js          # Occasions data
├── icons/                 # Extension icons (Ty)
├── launcher/              # Optional Python installer
└── README.md
```

---

## Permissions

| Permission | Why |
|------------|-----|
| `storage` | Save bookmarks, notes, and settings locally |
| `bookmarks` | Optional import from Chrome bookmarks |
| `4kwallpapers.com` | Load curated background wallpapers |
| `api.open-meteo.com` | Weather data |

No data is sent to third-party servers except weather API calls and wallpaper downloads you choose.

---

## Development

1. Edit files in the project folder
2. Go to `chrome://extensions/`
3. Click the **reload** icon on the Tabyar card
4. Open a new tab to see changes

---

## Notes

- First load may require internet for **Google Fonts** and **weather**
- Voice search depends on browser support for Web Speech API
- For a clean default experience, use **Reset all data** in settings

---

## Author

Developed by [farzadqavidel](https://github.com/farzadqavidel)

If you find Tabyar useful, consider starring the repository on GitHub.

---

<p align="center">
  <strong>Tabyar</strong> · v1.1.0 · Made with care for a better New Tab
</p>
