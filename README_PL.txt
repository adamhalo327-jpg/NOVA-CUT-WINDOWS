NOVA CUT 8.0 — ULTIMATE STUDIO (Windows 10/11 64-bit)

Nowości: fale dźwiękowe AUDIO, miniatury zdjęć/filmów, efekty VHS/Film Grain/Winieta, keyframes (skala, pozycja i przezroczystość), automatyczne napisy z lokalnym Whisper.cpp, autozapis ustawień montażu oraz odświeżony interfejs.

Eksport FFmpeg MP4 z 7.0 pozostaje bez zmian. Klatki kluczowe, nowe efekty i automatyczne napisy są renderowane w silniku Canvas (Eksportuj — przeglądarka), natywny FFmpeg nadal pomija zaawansowane animacje i napisy. To ograniczenie zostanie usunięte w kolejnej aktualizacji.

Autonapisy: wybierz audio lub film z mową, kliknij Automatyczne napisy. Rozpoznawanie offline na CPU, model Whisper base jest pobierany przez workflow i pakowany do instalatora. Aplikacja nie wysyła nagrań do chmury.

AUTOZAPIS: co 15 sekund i przy zmianach, do localStorage. Nie zapisuje bajtów plików źródłowych. Po przywróceniu trzeba zaimportować media ponownie; ich identyfikacja odbywa się po nazwie i rozmiarze.

Wersję Windows build wykonuje GitHub Actions z gałęzi release/nova-cut-8.0-ultimate-studio. Źródła nie zawierają modelu ggml-base.bin, znajduje się on wyłącznie w docelowych instalatorach.

Prośba: rozmiar 500–750 MB oznacza łączny ZIP Setup+Portable. GitHub Actions raportuje realną wielkość (bez sztucznego paddingu). Sprawdzaj logi i rezultat kompilacji.
