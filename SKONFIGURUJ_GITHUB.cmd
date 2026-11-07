@echo off
setlocal
cd /d "%~dp0"
echo ================================================
echo  NOVA CUT 5.2.2 - naprawa pakietu GitHub
 echo ================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -STA -File "%~dp0SKONFIGURUJ_GITHUB.ps1"
set "STATUS=%ERRORLEVEL%"
echo.
if not "%STATUS%"=="0" echo NIE POWIODLO SIE. Zobacz komunikat powyzej.
echo Nacisnij dowolny klawisz, aby zamknac okno.
pause >nul
exit /b %STATUS%
