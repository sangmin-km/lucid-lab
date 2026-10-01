@echo off
setlocal
cd /d "%~dp0"
if exist "..\.tools\node-v22.23.3-win-x64\node.exe" (
  "..\.tools\node-v22.23.3-win-x64\node.exe" scripts\build.cjs %*
) else (
  node scripts\build.cjs %*
)
exit /b %errorlevel%
