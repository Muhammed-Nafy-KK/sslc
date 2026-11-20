@echo off
cd /d "%~dp0"
echo Installing project dependencies...
npm install
if errorlevel 1 (
  echo Dependency installation failed. Check your internet connection and Node.js installation.
  pause
  exit /b 1
)
echo Starting Study Journal...
npm run dev
pause
