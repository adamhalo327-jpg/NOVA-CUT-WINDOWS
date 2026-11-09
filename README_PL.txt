NOVA CUT 13.2 — SEEK FIX: przewijanie filmu suwakiem bez przerywania odtwarzania, przyciski ±5s obok play, odświeżanie klatki po seeked; oryginalny eksport bez zmian.

NOVA CUT 13.2 — PLAYER QUALITY PRO (Windows)
===================================================

NOWOŚĆ: Ustawienia ⚙ Jakość obok przycisku ▶ Odtwórz.
Wybór: Auto, 240p, 360p, 480p, 720p, 1080p, 1440p, 4K.
Po zmianie rozdzielczość bufora podglądu jest dostosowana do wybranego profilu,
bez zwiększania jakości ponad rzeczywistą rozdzielczość źródła.
Jakość eksportu MP4 jest niezależna: użyj panelu Eksport.
Uwaga: wybranie 4K podglądu może spowolnić komputer; Auto zalecane.
Zapamiętanie wyboru w ustawieniach lokalnych programu.

POZOSTAŁE: Wszystkie funkcje NOVA CUT 13.1 zachowane;
import MP4/MOV/MKV, podglądy proxy, ikona NOVA SIGNATURE,
napisy Whisper, LUT, renderowanie CPU/GPU i kolejka.

NOVA CUT 13.1 — MEDIA COMPATIBILITY FIX

Automatyczne rozpoznawanie kodeków FFprobe przy imporcie MP4, MOV, MKV i innych filmów.
Dla kodeków nieobsługiwanych przez Electron powstaje tylko lekka kopia H.264 720p do podglądu; eksport Windows zawsze korzysta z oryginału.
Gdy materiał ma metadane, ale brakuje prawidłowo dekodowanej klatki, import przełącza się na FFmpeg.
Obsługa wykrycia błędu podczas odtwarzania i ponownego utworzenia podglądu, bez usuwania klipu z osi czasu.
Zachowane: narzędzia 11–13, automatyczne napisy, kolejka, GPU/CPU, eksport i ikona NOVA SIGNATURE.

NOVA CUT 13.0 — ULTRA RENDER ENGINE
Zawiera funkcje 11.0 i 12.0 oraz kolejkę eksportu MP4 Windows.

Nowe funkcje: tryb CPU / Auto GPU / Wymuś GPU, wykrywanie działających NVENC/QSV/AMF, kontrola wolnego RAM, kolejka 20 zadań, renderowanie w tle gdy aplikacja jest zminimalizowana, ponawianie na CPU po błędzie GPU w trybie Auto. Obsługa profili 4K, 6K, 8K oraz eksperymentalnego 10K.

Nie zamykaj programu podczas renderowania; nie jest to oddzielna usługa Windows. Nie każdy GPU ma dostępny kodek; 10K wymaga wydajnego CPU/RAM i stosuje zabezpieczenia 10K z poprzednich wersji.

Dodatkowy model Whisper Small Q5 w paczce ZIP można zaimportować przyciskiem w CINEMA MASTER.

NOWOŚĆ: Eksport → Nazwa filmu przed eksportem. Wpisana nazwa jest używana w oknie zapisu Windows, kolejce eksportu i pobraniu przeglądarkowym. Możesz później wybrać folder lub zmienić nazwę w systemowym dialogu zapisu.

NOVA CUT 13.2 - NAPRAWA ENOENT: FFprobe.exe i FFmpeg.exe sa kopiowane do resources/tools/ poza app.asar; import MP4/MOV/MKV i badanie wlasciwosci dzialaja rowniez po instalacji Windows. Plik oryginalny jest nietkniety.


NOVA CUT 13.3 — PLAYER QUALITY ULTRA
Menu przy odtwarzaczu: Auto, 240p, 360p, 480p, 720p, 1080p, 1440p, 4K, 8K oraz 10K. 8K/10K to eksperymentalne ustawienia podglądu dla odpowiednio mocnych komputerów i materiałów źródłowych. Nie zmieniają jakości źródła ani eksportowanego MP4; do płynnego montażu używaj Auto albo 1080p. Profil eksportu jest oddzielnie w panelu Eksport.


NOVA CUT 14.0 — STUDIO DESKTOP
Interfejs inspirowany powszechnym układem profesjonalnych edytorów: zakładki mediów po lewej, odtwarzacz w centrum, inspektor właściwości po prawej i wielościeżkowa oś czasu na dole. Własna nazwa i identyfikacja NOVA CUT; nie jest to produkt CapCut.
Importuj MP4/MOV/MKV, dodaj na oś czasu. Użyj playera, jakości Auto–10K, narzędzi przy klipach i eksportu Windows MP4. Funkcje z 13.3 pozostają.
