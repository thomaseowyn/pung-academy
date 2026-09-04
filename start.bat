@echo off
REM Pung Academy - local dev server.
REM ES modules need a real HTTP origin, so the site must be served rather
REM than opened straight from the filesystem. Double-click this file.

cd /d "%~dp0"
echo Pung Academy is starting at http://localhost:5500/
echo Press Ctrl+C in this window to stop the server.
echo.
start "" http://localhost:5500/
python -m http.server 5500
