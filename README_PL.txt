NOVA CUT 5.2.2 — WINDOWS EDITION

Ten ZIP jest pełnym źródłem do kompilacji. Nie wrzucaj jego środka ręcznie na GitHub.
Archiwum pakietu naprawczego zawiera SKONFIGURUJ_GITHUB.cmd, który skopiuje ten ZIP oraz workflow do lokalnego repozytorium.

Co poprawiono:
- GitHub Actions zawsze wyodrębnia kompletne źródła z ZIP i sprawdza app/index.html.
- Elektron sprawdza obecność panelu oraz gotowość JavaScript; w razie błędu wyświetla stronę diagnostyczną.
- Log: %APPDATA%\nova-cut\novacut-startup.log (lokalizacja może zależeć od nazwy aplikacji Electron).
- W przypadku czarnego okna można uruchomić przenośną wersję z parametrem --disable-gpu.
- ZACHOWANO poprzednie funkcje edytora i lokalny renderer MP4 (FFmpeg).

Uwaga: nowej wersji EXE nie dało się przetestować na Twoim komputerze. Jeśli będzie problem, otwórz Narzędzia programisty F12 albo przekaż zawartość logu.
