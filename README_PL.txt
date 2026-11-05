NOVA CUT 5.2 — WINDOWS EDITION
================================

To jest projekt desktopowej aplikacji Electron na Windows 10/11 (64-bit).
ZIP zawiera pełne pliki źródłowe. Sam ZIP NIE JEST gotowym instalatorem .exe.
Instalator .exe i wariant portable .exe tworzy GitHub Actions na Windows.

BEZ PROGRAMOWANIA / BEZ INSTALACJI NODE NA SWOIM KOMPUTERZE
1. Rozpakuj ten ZIP.
2. Załóż na GitHub nowe repozytorium, np. NOVA-CUT-WINDOWS.
3. Prześlij ZAWARTOŚĆ folderu (package.json, main.js, app, assets, .github itd.) do głównego katalogu repozytorium. Zachowaj folder .github/workflows.
4. Otwórz na GitHub: Actions → NOVA CUT - Windows EXE → Run workflow / Uruchom przepływ pracy.
5. Gdy zadanie zakończy się zielonym ✓, otwórz je i pobierz Artifacts / Artefakty → NOVA-CUT-Windows-5.2.
6. Rozpakuj pobrany ZIP: znajdują się w nim NOVA-CUT-5.2-Setup-5.2.0.exe oraz NOVA-CUT-5.2-Portable-5.2.0.exe.
7. Uruchom Setup, aby zainstalować program (lub Portable bez instalowania).

ALTERNATYWA: BUDOWANIE NA WŁASNYM KOMPUTERZE
Zainstaluj Node.js 22, następnie w folderze projektu uruchom:
  npm install
  npm run build:win
Gotowe pliki pojawią się w folderze dist.

FUNKCJE
- Wszystkie podstawowe narzędzia z NOVA CUT 5.1 (oś czasu V1/V2, zdjęcia, dźwięk, napisy, SFX, filtry, projekty JSON)
- Nowy przycisk Eksport MP4 na Windows (FFmpeg). Nie wymaga zewnętrznego Pythona ani osobnej instalacji FFmpeg.
- Obsługa klipów, zdjęć, audio w MP4/AAC, ustawienia od 720p do 8K, o ile sprzęt wystarczy.
- Test obecności ścieżki wideo i audio w gotowym MP4.
- Menu Plik: import Ctrl+O, audio Ctrl+Shift+O, zapis Ctrl+S, eksport Ctrl+E.
- Wbudowany renderer desktopowy obsługuje cięcia, prędkość, warstwy V1/V2, podstawowe filtry i miksowanie muzyki oraz SFX.

OGRANICZENIA
- Renderer MP4 Windows w tej wersji NIE eksportuje animowanych napisów, naklejek i części efektów ruchu; użyj drugiego silnika eksportu w edytorze. W kolejnej aktualizacji można je ujednolicić.
- 8K może wymagać bardzo wydajnej karty graficznej i dużej ilości RAM. Nie jest gwarantowane na każdym PC.
- Eksport lokalny zwykle działa bez internetu, natomiast przeglądarkowy FFmpeg.wasm może wymagać internetu do pobrania modułu.
- Niesygnowany instalator może wywołać ostrzeżenie Windows SmartScreen. Weryfikuj pochodzenie pliku; do publicznej dystrybucji zalecany jest podpis kodu.
- Pliki źródłowe nie są wysyłane na serwer NOVA CUT. Projekty JSON nie osadzają wideo i muzyki — przy ponownym otwarciu trzeba ponownie dodać media.

UWAGA DOT. LICENCJI
Aplikacja używa Electron, FFmpeg i ffprobe z zewnętrznych paczek npm. Przy dystrybucji zachowaj odpowiednie informacje licencyjne i sprawdź warunki użytej kompilacji FFmpeg (GPL/LGPL).

