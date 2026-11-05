@echo off
setlocal
cd /d "%~dp0"
echo NOVA CUT 5.2.1 - automatyczna naprawa ukladu plikow
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0napraw_foldery.ps1"
set "CODE=%ERRORLEVEL%"
echo.
if not "%CODE%"=="0" echo Naprawa nie zostala zakonczona. Przeczytaj blad powyzej.
echo Nacisnij dowolny klawisz aby zamknac okno...
pause >nul
exit /b %CODE%
