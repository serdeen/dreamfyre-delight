# SPEC.md — Loop Station

## Concept & Vision
A browser-based sampler looper with a visual waveform display. Load audio files, set loop start/end points with draggable markers, and trigger one-shots or looped playback. Tempo indicator shows BPM of loaded sample. Designed for quick sound-checking and layering short phrases.

## Parameters to Test
- **Temperature:** 0.8 (higher creativity for UI variation)
- **Token limit:** 2000 (more room for waveform + looper logic)
- **Goal:** Test 5-pattern auto-patcher (no model self-correction loop for these)

## Design Language
- Dark background `#0a0a0f`, neon cyan `#00f5d4`, neon magenta `#f72585`
- Space Mono (headings) + Inter (body) from Google Fonts
- Atmospheric radial gradients as page background
- Single self-contained HTML file

## Features
1. **Audio file loader** — `<input type="file">` accepts audio files, decodes with `decodeAudioData`
2. **Waveform display** — canvas draws audio buffer data; uses `devicePixelRatio` for crisp rendering
3. **Loop markers** — two vertical lines (start/end) draggable via mousedown/mousemove; calls `stopPlayback()` on reposition
4. **Transport** — Play/Stop buttons; loop mode toggle; play uses `setTargetAtTime` for gain fade-in
5. **One-shot / loop mode** — one-shot triggers at marker region then stops; loop mode schedules `source.onended` re-trigger
6. **Visual playhead** — animated with `requestAnimationFrame`; position synced to `audioCtx.currentTime`
7. **Master chain** — master gain → `DynamicsCompressor` → destination
8. **Tempo display** — rough BPM estimate from sample duration / detected peak interval

## Code Requirements
- Required functions: `initAudio`, `loadFile`, `drawWaveform`, `animate`, `playLoop`, `stopPlayback`
- All Web Audio params use `setTargetAtTime` (not direct `.value` assignment)
- `source.onended` handler resets `isPlaying = false` and clears `currentSource`
- Canvas uses `devicePixelRatio` scaling
- Master chain: `masterGain → DynamicsCompressor → destination`

## Layout
- Full-width waveform canvas (~200px height) with draggable start/end markers
- Below: transport row (Play, Stop, Loop toggle), tempo readout
- Above: file input for audio loading
- Responsive: waveform resizes with window via `resize` event