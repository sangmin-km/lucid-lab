@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
if exist "..\.tools\node-v22.23.3-win-x64\node.exe" (
  "..\.tools\node-v22.23.3-win-x64\node.exe" scripts\add-project.cjs
) else (
  node scripts\add-project.cjs
)
exit /b %errorlevel%
