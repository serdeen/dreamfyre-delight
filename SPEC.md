# Build Spec: Tape Stop

## Concept & Vision
A simple single-function audio effect tool: load any audio file (wav/mp3), then trigger a "tape stop" effect — the playback speed ramps down exponentially from 1x to 0x over a configurable duration (0.2s–2s), creating the classic tape-spooling-down sound. There's also a "rewind" button that plays backward at increasing speed.

## Parameters to Test
- **Temperature** — 0.75 (medium-creative for clean code)
- **Token limit** — 1600 (compact build)
- **Model** — llama3.1:8b via Ollama with automated validation + 1 retry on failure
- **Enforcement** — new validate_and_fix loop: attempt 1 fails → feedback → attempt 2 → pass or fail → attempt 3

## Design
- Dark background `#0a0a0f`, warm amber accent `#f4a261`
- Fonts: Space Mono + Inter
- Centered layout: file drop zone, playback controls (play/pause/stop), tape-stop button, rewind button, speed/duration sliders
- Tape stop progress shown as a visual sweep line moving across waveform

## Features
- [ ] Drag-and-drop audio load (wav/mp3)
- [ ] Play/pause toggle button
- [ ] "TAPE STOP" button: triggers playbackRate ramp from 1 → 0 exponentially over set duration
- [ ] "REWIND" button: plays audio backward at accelerating rate (like tape rewinding)
- [ ] Duration slider: 0.2s to 2.0s for tape stop effect
- [ ] Waveform display with playhead indicator
- [ ] Master volume

## Technical Approach
- AudioBuffer + AudioBufferSourceNode for playback
- `playbackRate` property ramped using `setTargetAtTime()` for smooth exponential decay
- For tape stop: `source.playbackRate.setTargetAtTime(0, audioCtx.currentTime, duration / 3)` — exponential approach to 0
- For rewind: negative playbackRate, ramp from -0.5 to -2.0 over 1.5s
- Waveform drawn on canvas; playhead position tracked via `requestAnimationFrame`
- AudioContext lazy-init on first interaction

## Verification
- [ ] File loads and waveform draws correctly
- [ ] Play/pause works without errors
- [ ] Tape stop smoothly ramps playbackRate to 0 (audible decel, then silence)
- [ ] Rewind plays backward with accelerating speed
- [ ] Playhead indicator moves during playback
- [ ] No console errors on load or interaction