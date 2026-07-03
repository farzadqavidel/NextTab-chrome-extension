#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Personal Start Page — lightweight installer for Windows.
Downloads extension from GitHub, lets user pick a Chrome profile, installs & launches.
Uses only Python standard library (no pip packages required).
"""

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

APP_NAME = "PersonalStartPage"
GITHUB_ZIP = "https://github.com/farzadqavidel/Chrome-Extention/archive/refs/heads/main.zip"
EXTENSION_ID = "fdhagndefnmcknommlhedenhbclplgom"

INSTALL_DIR = Path(os.environ["LOCALAPPDATA"]) / APP_NAME
EXTENSION_DIR = INSTALL_DIR / "extension"
CONFIG_FILE = INSTALL_DIR / "config.json"
VERSION_FILE = INSTALL_DIR / "version.json"


def pause(msg: str = "\nEnter را بزنید برای خروج..."):
    try:
        input(msg)
    except EOFError:
        pass


def log(msg: str):
    print(msg, flush=True)


def find_chrome() -> Path | None:
    candidates = [
        Path(os.environ.get("PROGRAMFILES", r"C:\Program Files"))
        / "Google/Chrome/Application/chrome.exe",
        Path(os.environ.get("PROGRAMFILES(X86)", r"C:\Program Files (x86)"))
        / "Google/Chrome/Application/chrome.exe",
    ]
    for path in candidates:
        if path.is_file():
            return path
    return None


def chrome_user_data() -> Path:
    return Path(os.environ["LOCALAPPDATA"]) / "Google" / "Chrome" / "User Data"


def load_chrome_profiles() -> list[dict]:
    local_state_path = chrome_user_data() / "Local State"
    if not local_state_path.is_file():
        return []

    try:
        data = json.loads(local_state_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []

    info_cache = data.get("profile", {}).get("info_cache", {})
    profiles: list[dict] = []

    for directory, info in info_cache.items():
        if not isinstance(info, dict):
            continue
        name = (
            info.get("user_name")
            or info.get("gaia_name")
            or info.get("name")
            or directory
        )
        profiles.append(
            {
                "directory": directory,
                "name": str(name),
                "label": info.get("name") or directory,
            }
        )

    profiles.sort(key=lambda p: (p["directory"] != "Default", p["directory"]))
    return profiles


def find_extension_root(extracted_dir: Path) -> Path:
    if (extracted_dir / "manifest.json").is_file():
        return extracted_dir

    for child in extracted_dir.iterdir():
        if child.is_dir() and (child / "manifest.json").is_file():
            return child

    raise FileNotFoundError("manifest.json در فایل دانلود شده پیدا نشد.")


def download_extension(force: bool = False) -> Path:
    INSTALL_DIR.mkdir(parents=True, exist_ok=True)

    if EXTENSION_DIR.is_dir() and (EXTENSION_DIR / "manifest.json").is_file() and not force:
        log(f"افزونه از قبل موجود است: {EXTENSION_DIR}")
        return EXTENSION_DIR

    log("در حال دانلود از GitHub...")
    req = urllib.request.Request(
        GITHUB_ZIP,
        headers={"User-Agent": "PersonalStartPage-Installer/1.0"},
    )

    with tempfile.TemporaryDirectory() as tmp:
        zip_path = Path(tmp) / "extension.zip"
        with urllib.request.urlopen(req, timeout=120) as response:
            zip_path.write_bytes(response.read())

        extract_dir = Path(tmp) / "extract"
        extract_dir.mkdir()
        with zipfile.ZipFile(zip_path) as zf:
            zf.extractall(extract_dir)

        source_root = find_extension_root(extract_dir)

        if EXTENSION_DIR.exists():
            shutil.rmtree(EXTENSION_DIR)
        shutil.copytree(source_root, EXTENSION_DIR)

        manifest = json.loads((EXTENSION_DIR / "manifest.json").read_text(encoding="utf-8"))
        VERSION_FILE.write_text(
            json.dumps({"version": manifest.get("version", "?")}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    log(f"دانلود کامل شد: {EXTENSION_DIR}")
    return EXTENSION_DIR


def load_config() -> dict:
    if CONFIG_FILE.is_file():
        try:
            return json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            pass
    return {}


def save_config(profile_directory: str, chrome_path: str) -> None:
    CONFIG_FILE.write_text(
        json.dumps(
            {
                "profile_directory": profile_directory,
                "chrome_path": chrome_path,
                "extension_id": EXTENSION_ID,
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )


def choose_profile(profiles: list[dict], saved: str | None) -> dict:
    log("\nپروفایل‌های Chrome:")
    for i, profile in enumerate(profiles, start=1):
        marker = " (انتخاب قبلی)" if profile["directory"] == saved else ""
        log(f"  [{i}] {profile['name']}  —  {profile['label']}{marker}")

    while True:
        raw = input("\nشماره پروفایل را وارد کنید: ").strip()
        if raw.isdigit():
            idx = int(raw) - 1
            if 0 <= idx < len(profiles):
                return profiles[idx]
        log("شماره نامعتبر است. دوباره تلاش کنید.")


def create_desktop_shortcut(chrome: Path, profile_directory: str, extension_dir: Path) -> None:
    desktop = Path(os.environ["USERPROFILE"]) / "Desktop"
    shortcut = desktop / "Personal Start Page.lnk"
    chrome_escaped = str(chrome).replace("'", "''")
    profile_escaped = profile_directory.replace("'", "''")
    ext_escaped = str(extension_dir.resolve()).replace("'", "''")

    ps = f"""
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('{shortcut}')
$Shortcut.TargetPath = '{chrome_escaped}'
$Shortcut.Arguments = '--profile-directory="{profile_escaped}" --load-extension="{ext_escaped}" chrome://newtab'
$Shortcut.WorkingDirectory = '{chrome.parent}'
$Shortcut.Description = 'صفحه اول شخصی'
$Shortcut.Save()
"""
    subprocess.run(
        ["powershell", "-NoProfile", "-Command", ps],
        check=False,
        capture_output=True,
    )
    if shortcut.is_file():
        log(f"میانبر ساخته شد: {shortcut}")


def launch_chrome(chrome: Path, profile_directory: str, extension_dir: Path) -> None:
    args = [
        str(chrome),
        f'--profile-directory={profile_directory}',
        f'--load-extension={extension_dir.resolve()}',
        "chrome://newtab",
    ]
    subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    log("Chrome باز شد.")


def install(force_download: bool = False) -> int:
    log("=== Personal Start Page — نصب / به‌روزرسانی ===\n")

    chrome = find_chrome()
    if not chrome:
        log("خطا: Google Chrome پیدا نشد. لطفاً Chrome را نصب کنید.")
        return 1

    profiles = load_chrome_profiles()
    if not profiles:
        log("خطا: پروفایل Chrome پیدا نشد.")
        log(f"مسیر بررسی شده: {chrome_user_data()}")
        return 1

    try:
        download_extension(force=force_download)
    except Exception as exc:
        log(f"خطا در دانلود: {exc}")
        return 1

    config = load_config()
    saved_profile = config.get("profile_directory")
    profile = choose_profile(profiles, saved_profile)

    save_config(profile["directory"], str(chrome))
    create_desktop_shortcut(chrome, profile["directory"], EXTENSION_DIR)

    log("\n---")
    log(f"پروفایل انتخاب‌شده: {profile['name']}")
    log("افزونه فقط روی همین پروفایل Chrome نصب می‌شود.")
    log("همیشه از میانبر «Personal Start Page» روی Desktop استفاده کنید.")

    launch_chrome(chrome, profile["directory"], EXTENSION_DIR)
    return 0


def run_only() -> int:
    config = load_config()
    chrome = Path(config["chrome_path"]) if config.get("chrome_path") else find_chrome()
    profile = config.get("profile_directory")

    if not chrome or not chrome.is_file():
        log("Chrome پیدا نشد. install.py را دوباره اجرا کنید.")
        return 1
    if not profile:
        log("پروفایل ذخیره نشده. install.py را اجرا کنید.")
        return 1
    if not (EXTENSION_DIR / "manifest.json").is_file():
        log("افزونه نصب نیست. install.py را اجرا کنید.")
        return 1

    launch_chrome(chrome, profile, EXTENSION_DIR)
    return 0


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] in ("--run", "-r"):
        return run_only()
    if len(sys.argv) > 1 and sys.argv[1] in ("--update", "-u"):
        return install(force_download=True)
    code = install(force_download=False)
    pause()
    return code


if __name__ == "__main__":
    raise SystemExit(main())
