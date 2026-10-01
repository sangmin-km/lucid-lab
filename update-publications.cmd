@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\update-publications.ps1
if errorlevel 1 exit /b 1
call build.cmd
exit /b %errorlevel%
