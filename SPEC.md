# SPEC.md — Tuner

## Concept & Vision
Browser-based chromatic tuner using microphone input. Detects pitch via AnalyserNode autocorrelation, displays nearest note name (C, C#, D...) and cents off (+/- 50 cents). Visual needle or bar shows pitch deviation.

## Parameters to Test
- **Temperature:** 0.6 (lower than usual — testing if simpler builds need less heat)
- **Token limit:** 1600
- **Goal:** Test whether simpler builds at lower temp produce single-gen success (0 retries, minimal manual)

## Design Language
- Dark background `#0a0a0f`, neon cyan `#00f5d4`, neon magenta `#f72585`
- Space Mono (headings) + Inter (body) from Google Fonts
- Single self-contained HTML file

## Features
1. **Mic activation** — "Start Mic" button requests getUserMedia, sets up AudioContext from mic stream
2. **Pitch detection** — uses AnalyserNode with getFloatTimeDomainData, basic autocorrelation for fundamental frequency
3. **Note display** — large display of nearest note (e.g., "A4"), cents deviation (e.g., "+12¢"), frequency in Hz
4. **Visual indicator** — horizontal bar/needle showing how close to in-tune (green = close, red = far)
5. **Master chain:** mic → MediaStreamSource → AnalyserNode → (no output — visual only, or optional DynamicsCompressor)

## Code Requirements
- Required functions: `initAudio`, `detectPitch`, `updateDisplay`
- Must use `getUserMedia` for mic access
- Must use `decodeAudioData` or proper mic stream setup
- Canvas uses `devicePixelRatio`
- All AudioParam changes use `setTargetAtTime`
- Master chain includes `DynamicsCompressor` for safety

## Layout
- Top: `<h1>Tuner</h1>`
- Middle: large note display (e.g., "A4"), frequency, cents deviation
- Below: visual pitch indicator bar
- Bottom: [🎤 Start Mic] button, status text
- Responsive