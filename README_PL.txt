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
