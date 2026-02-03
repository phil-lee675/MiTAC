@echo off
setlocal
cd /d %~dp0\..
set LOG_DIR=%~dp0\..\logs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
set LOG_FILE=%LOG_DIR%\harvest.log
npm run harvest > "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo Harvest failed. See "%LOG_FILE%" for details.
  exit /b %errorlevel%
)
endlocal
