@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\blog.ps1" -Action check
pause
