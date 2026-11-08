NOVA CUT 10.0 — EDITOR MAX (Windows x64)

NOWY UKŁAD: zatwierdzony wzór ULTRA CINEMA z dużym podglądem, panelem mediów po lewej, narzędziami po prawej i osią czasu na dole.

• Wybierz „Dodaj MP4” lub przeciągnij plik do edytora; pliki nie są wysyłane do sieci.
• Biblioteka: filtry Wideo / Audio / Zdjęcia, wyszukiwarka, miniatury klipów.
• Panel po prawej: zwijane sekcje Podstawowe, Transformacja, Kolor, LUT, Przejścia, Prędkość, Audio, Napisy SRT i AI Studio.
• Os czasu: V1/V2, globalne efekty w wizualnym rzędzie V3, Audio, SFX; ścieżki napisów i naklejek pod przyciskiem „Ścieżki”. Rząd V3 opisuje istniejące efekty GLOBALNE i nie jest niezależną warstwą wideo.
• Program zachowuje dotychczasowy renderer FFmpeg, import MP4 z proxy dla nieobsługiwanych kodeków, Quality Inspector, automatyczne napisy, keyframes i SRT.
• Dwa lokalne modele napisów Whisper: Base (dokładniejszy) i Tiny (szybszy, mniej pamięci).
• Nowa ikona NOVA SIGNATURE dla okna aplikacji, instalatora i Portable EXE.
• Działające przed aktualizacją animowane keyframes i niektóre napisy nie są jeszcze obsługiwane we wszystkich natywnych ścieżkach eksportu FFmpeg; testuj krótki klip przed ważnym projektem.

GitHub: release/nova-cut-10.0-editor-max
Kompilacja: GitHub Actions -> NOVA CUT 10.0 - EDITOR MAX Windows EXE -> Artifacts -> NOVA-CUT-Windows-10.0-EDITOR-MAX
Docelowa wielkość PAKIETU Setup + Portable: 700–1000 MB, weryfikowana w Actions; rozmiar pojedynczego EXE może być mniejszy. Pakiet zawiera użyteczne modele AI, bez sztucznego wypełniania.

NOVA CUT 9.0 — MEGA UPDATE (Windows 64-bit)

NOWOŚCI:
- Grupowe zaznaczanie i przesuwanie klipów na osi czasu o 1 sekundę (nie zmienia pozycji wszystkich innych klipów).
- Napisy: import SRT (UTF-8) i eksport SRT z istniejących napisów.
- Analiza scen i ciszy offline za pomocą FFmpeg: wyniki jako klikalne znaczniki czasu (bez automatycznego cięcia).
- Sześć nowych presetów kolorów: aktualizują natywne parametry korekcji brightness/contrast/saturation.
- Opcjonalne odszumianie audio FFmpeg (mowa/muzyka), DOMYŚLNIE WYŁĄCZONE dla zgodności eksportu.
- Zachowano import MP4, analizator jakości, proporcje kinowe, autozapis, Whisper, miniatury, fale audio i ikonę NOVA SIGNATURE.

OGRANICZENIA:
- Wykrywanie scen i ciszy jest heurystyczne: lokalnie przez FFmpeg, nie rozpoznaje semantycznie zawartości scen.
- Odszumianie oraz niektóre nowe opcje działają tylko w natywnym eksporcie FFmpeg.
- Native export nie renderuje jeszcze wszystkich animowanych keyframes/napisów/efektów przeglądarkowych; nie używaj tych funkcji, jeśli potrzebna jest pełna zgodność wizualna MP4.
- Render 10K pozostaje eksperymentalny.
- Zapis projektów JSON i autozapis nie osadzają plików MP4; po restarcie może być potrzebne ponowne wskazanie mediów.

TESTY: npm install; npm run check; npm run build:win

NOVA CUT 8.4 — ULTRA CINEMA REDESIGN (Windows)

Motyw: czarno-czerwony ULTRA CINEMA na podstawie wybranego podglądu.
Nowa ikona NOVA SIGNATURE nr 3: assets/novacut.ico (wielorozmiarowa Windows ICO) i assets/nova-signature.png.
Ikona stosowana w oknie, w pliku EXE i w instalatorze NSIS Setup/Uninstall.

Biblioteka z miniaturami, wyszukiwaniem i filtrami, nawigacja Edycja/Efekty/Przejścia/Napisy/Kolor/Dźwięk/Jakość, pełny podgląd i TIMELINE ULTRA PRO.
Zachowano import MP4 (w tym przeciąganie z Eksploratora i zastępczy podgląd FFmpeg), QUALITY INSPECTOR PRO, audio, efekty, 10K/ULTRA CINEMA, Whisper offline, autozapis i eksport Windows FFmpeg.
Ograniczenia oryginalnego renderera: animowane napisy, naklejki, keyframes mogą wymagać eksportu przeglądarkowego.
GitHub Actions: release/nova-cut-8.4-ultra-cinema-redesign → NSIS Setup + Portable Windows x64.

TESTY: npm run check; uruchomienie Electron oraz test importu MP4 i exportu MP4 na komputerze.

--- Poprzednie uwagi ---
# NOVA CUT 8.2 — ULTRA CINEMA (Windows)

Oparto na działającym 8.1. Zachowano montaż, keyframes, miniatury, waveformy, Whisper offline, autozapis oraz eksport MP4 z dźwiękiem.

## ULTRA CINEMA
- Proporcje kinowe inspirowane wielkoformatową projekcją: 1.43:1 i 1.90:1. **Nie jest to certyfikowany IMAX**.
- Gotowe przyciski 4K UHD 3840, 8K UHD 7680, 10K Ultra 9600, 24 FPS. Są to szerokości klatki, nie gwarantowane standardy DCI/IMAX.
- Przykłady: 4K 1.90:1 = 3840×2022, 4K 1.43:1 = 3840×2686, 8K 1.90:1 = 7680×4042, 10K 1.43:1 = 9600×6714.
- Kolory: neutralny, blockbuster, golden, monochrome; filtry na podglądzie i w natywnym FFmpeg (zbliżone efekty, nie identyczna krzywa barw).
- Audio Cinema: AAC stereo 48 kHz, 320 kb/s (standard 192 kb/s). **Nie Dolby Atmos, nie przestrzenne 5.1**.
- Dla wysokich trybów kinowych użyj 'Eksport MP4 na Windows (FFmpeg)' w zakładce Eksport; eksport z przeglądarki może się ograniczać.
- FFmpeg 10K testuje RAM/dysk/encoder; wyższy kadr 1.43:1 wymaga proporcjonalnie większej ilości RAM. Render MP4 nie ma prawa być oznaczony jako 10K z niższą rozdzielczością.
- Keyframes i automatyczne napisy z 8.0 pozostają obsługiwane przez podgląd/eksport przeglądarkowy; natywny renderer Windows nie wypala tych animacji.
- Zachowano źródła i funkcje Windows 8.1, w tym ffmpeg-static, ffprobe-static, Whisper Base offline w gotowej kompilacji.

## Lokalna kontrola
`npm run check` (Node 22). Kompilacja Windows: `npm install` i `npm run build:win`.


NOVA CUT 8.3 — QUALITY INSPECTOR PRO
- Zakładka 🔎 Jakość z analizą rozdzielczości, liczby FPS, kodeka, bitrate, HDR, wielkości i dźwięku.
- Plik wskazujesz w oknie Windows; analizator FFprobe odczytuje metadane lokalnie i NIE zmienia pliku.
- Po eksporcie MP4 można natychmiast sprawdzić ostatnio zapisany film (w bieżącej sesji programu).
- Bez aplikacji Windows działa ograniczony odczyt wymiarów i rozmiaru pliku w przeglądarce, bez udawania danych FPS/kodeka.
- Rozdzielczość jest miarą liczby pikseli, nie gwarancją detali czy jakości wizualnej.
- Eksport z wersji 8.2, profile 10K/CINEMA, Whisper i oś czasu pozostają zachowane.


NOVA CUT 8.3 — IMPORT MP4
- Przycisk „Dodaj MP4” (Ctrl+Shift+M), wybór wielu plików i przeciąganie z Eksploratora Windows.
- Po imporcie MP4 trafia do biblioteki oraz na oś czasu V1; można dodać go również na V2.
- Dla H.264/AAC podgląd działa bez dodatkowej konwersji. W przypadku nieobsługiwanego kodeka aplikacja Windows próbuje utworzyć lżejszy, tymczasowy podgląd H.264 FFmpeg.
- Podgląd zastępczy nie zmienia oryginału: eksport Windows używa oryginalnej ścieżki MP4. Podgląd może wymagać przetworzenia całego pliku i wolnego miejsca na dysku.
- Proxy jest usuwane po prawidłowym zamknięciu aplikacji.
- W wersji przeglądarkowej pliki o kodekach nieobsługiwanych przez Chromium mogą się nie otwierać.
