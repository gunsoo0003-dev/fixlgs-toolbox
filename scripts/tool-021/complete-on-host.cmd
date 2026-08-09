@echo off
setlocal
cd /d "%~dp0\..\.."
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\tool-021\complete-on-host.ps1"
exit /b %ERRORLEVEL%
