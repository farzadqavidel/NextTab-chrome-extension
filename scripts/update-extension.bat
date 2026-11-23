@echo off
setlocal EnableExtensions

set "URL=https://github.com/farzadqavidel/NextTab-chrome-extension.git"
set "SCRIPT_DIR=%~dp0"
set "TARGET=%~1"

if "%TARGET%"=="" (
  set "TARGET=%SCRIPT_DIR%.."
)

if exist "%TARGET%\.git\" (
  echo Updating existing clone at: %TARGET%
  git -C "%TARGET%" pull --ff-only
) else (
  echo Cloning into: %TARGET%
  git clone --depth 1 %URL% "%TARGET%"
)

echo.
echo Done. Reload the extension at chrome://extensions (click Reload).
