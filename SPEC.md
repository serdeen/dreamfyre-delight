# Build Spec: Pitch Shifter

## Concept & Vision
A live pitch-shifting audio player. Load any audio file, then use a large vertical pitch fader to shift playback speed up or down by up to ±12 semitones in real time. Visual feedback shows current shift amount in semitones and cents. Essentially a pitch-shifter/slow-downer for music practice.

## Parameters to Test
- **Temperature** — 0.7
- **Token limit** — 1800
- **Model** — llama3.1:8b via Ollama with enhanced validator (6 checks + 10 wiring patterns + auto-regeneration)
- **Goal** — minimal manual cleanup after generation

## Design
- Dark background `#0a0a0f`, electric blue accent `#00b4d8`
- Fonts: Space Mono + Inter
- Centered layout: file drop zone → waveform → transport → large vertical pitch slider → semitone readout

## Features
- [ ] Drag-and-drop audio load (wav/mp3)
- [ ] Play/pause toggle
- [ ] Large vertical range slider for pitch shift (-12 to +12 semitones)
- [ ] Real-time pitch shift via `playbackRate` (semitone → playbackRate: `Math.pow(2, semitones/12)`)
- [ ] Live readout: current semitone shift + cents display
- [ ] Master volume slider
- [ ] Waveform with playhead

## Technical Approach
- AudioBuffer + AudioBufferSourceNode with playbackRate control
- Semitone to playbackRate: `playbackRate = Math.pow(2, semitones / 12)` (1 semitone = 2^(1/12) ≈ 1.0595)
- Shift range: -12 to +12 semitones maps to playbackRate 0.7937 to 1.2599
- Waveform canvas with devicePixelRatio for crisp rendering
- Playhead via requestAnimationFrame tracking playback position
- DynamicsCompressor on master chain

## Code Requirements (for validator pattern checks)
- `setTargetAtTime` for smooth playbackRate transitions (not direct assignment)
- `onended` handler on AudioBufferSourceNode for clean state management
- `stopPlayback()` helper function that calls `source.stop()` + resets state
- `decodeAudioData` for file loading
- `DynamicsCompressor` in master chain
- `devicePixelRatio` on canvas setup
- `requestAnimationFrame` for playhead animation

## Verification
- [ ] File loads and waveform draws correctly
- [ ] Playback starts and pauses cleanly
- [ ] Pitch slider moves and playbackRate changes in real time
- [ ] Semitone readout updates correctly (6 semitones ≈ playbackRate 1.35)
- [ ] No console errors on load or interaction