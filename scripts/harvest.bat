@echo off
setlocal
cd /d %~dp0\..

rem Seed crawl from the main site; crawler will follow subfolders and any mitaccomputing.com subdomains it discovers.
set "MITAC_HARVEST_SEEDS=https://www.mitaccomputing.com,https://mitaccomputing.com"

npm run harvest
endlocal
