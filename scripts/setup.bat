@echo off
setlocal
cd /d %~dp0\..
set LOG_DIR=%~dp0\..\logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\setup.log
call npm install > "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo Install failed. See "%LOG_FILE%" for details.
  exit /b %errorlevel%
)
call npx playwright install >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo Playwright install failed. See "%LOG_FILE%" for details.
  exit /b %errorlevel%
)
endlocal
