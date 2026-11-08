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
