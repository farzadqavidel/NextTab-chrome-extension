# لانچر پایتون — Personal Start Page

نصب‌کننده سبک (فقط Python استاندارد، بدون pip).

## پیش‌نیاز

- Windows 10/11
- [Python 3.8+](https://www.python.org/downloads/)
- Google Chrome

## نحوه کار

1. **دانلود از GitHub** — آخرین نسخه از [Chrome-Extention](https://github.com/farzadqavidel/Chrome-Extention) دانلود و در `%LOCALAPPDATA%\PersonalStartPage\extension` ذخیره می‌شود.
2. **انتخاب اکانت Chrome** — پروفایل‌های Chrome (ایمیل/نام) از `Local State` خوانده می‌شود و از شما پرسیده می‌شود کدام را می‌خواهید.
3. **نصب روی پروفایل انتخاب‌شده** — میانبر Desktop می‌سازد که Chrome را با `--profile-directory` و `--load-extension` باز می‌کند (فقط همان اکانت Google).

## اجرا

```bat
launcher\install.bat
```

یا:

```powershell
python launcher/install.py
```

### فقط باز کردن (بدون نصب مجدد)

```bat
launcher\run.bat
```

### به‌روزرسانی از GitHub

```powershell
python launcher/install.py --update
```

## تفاوت با لانچر C# قبلی

| | C# (قبلی) | Python (جدید) |
|---|---|---|
| حجم | ~60MB (self-contained) | چند KB اسکript |
| منبع افزونه | داخل exe / dist | دانلود از GitHub |
| پروفایل Chrome | پروفایل جدا (جدید) | اکانت Chrome خود کاربر |
| وابستگی | .NET 8 | فقط Python |

## نکته

Chrome را بعد از نصب یک بار ببندید و از میانبر Desktop باز کنید. اگر افزونه دیده نشد: `chrome://extensions` → فعال‌سازی.
