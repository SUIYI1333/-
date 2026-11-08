@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 22.12 or newer is required: https://nodejs.org/
  pause
  exit /b 1
)
node scripts/desktop.mjs dev
if errorlevel 1 (
  echo Development startup failed. Please keep the error message above.
  pause
  exit /b 1
)
exit /b 0
