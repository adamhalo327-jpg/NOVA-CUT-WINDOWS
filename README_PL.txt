NOVA CUT 8.0 — ULTIMATE STUDIO (Windows 10/11 64-bit)

Nowości: fale dźwiękowe AUDIO, miniatury zdjęć/filmów, efekty VHS/Film Grain/Winieta, keyframes (skala, pozycja i przezroczystość), automatyczne napisy z lokalnym Whisper.cpp, autozapis ustawień montażu oraz odświeżony interfejs.

Eksport FFmpeg MP4 z 7.0 pozostaje bez zmian. Klatki kluczowe, nowe efekty i automatyczne napisy są renderowane w silniku Canvas (Eksportuj — przeglądarka), natywny FFmpeg nadal pomija zaawansowane animacje i napisy. To ograniczenie zostanie usunięte w kolejnej aktualizacji.

Autonapisy: wybierz audio lub film z mową, kliknij Automatyczne napisy. Rozpoznawanie offline na CPU, model Whisper base jest pobierany przez workflow i pakowany do instalatora. Aplikacja nie wysyła nagrań do chmury.

AUTOZAPIS: co 15 sekund i przy zmianach, do localStorage. Nie zapisuje bajtów plików źródłowych. Po przywróceniu trzeba zaimportować media ponownie; ich identyfikacja odbywa się po nazwie i rozmiarze.

Wersję Windows build wykonuje GitHub Actions z gałęzi release/nova-cut-8.0-ultimate-studio. Źródła nie zawierają modelu ggml-base.bin, znajduje się on wyłącznie w docelowych instalatorach.

Prośba: rozmiar 500–750 MB oznacza łączny ZIP Setup+Portable. GitHub Actions raportuje realną wielkość (bez sztucznego paddingu). Sprawdzaj logi i rezultat kompilacji.


NOVA CUT 8.1 - 10K QUALITY
- Opcja 10K (9600 x 5400) w zakładce Eksport. Wymaga aplikacji Windows i przycisku Eksport MP4 na Windows.
- Przed renderem sprawdza dostepny kodek HEVC (libx265) lub AV1, co najmniej 8 GiB wolnego RAM oraz wolne miejsce na dysku. Zalecane 16 GiB wolnego RAM i wiecej.
- Eksport 10K jest eksperymentalny. HEVC 10K moze wykraczac poza oficjalne profile i ograniczenia odtwarzaczy; FFmpeg lub koder moze odmowic eksportu. W razie problemu wybierz 8K lub 4K.
- Przy braku mozliwosci renderu program pokazuje blad zamiast potajemnie obnizac jakosc.
- Dotychczasowy eksport 720p-8K i narzedzia 8.0 zostaly zachowane.
