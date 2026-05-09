# Build Spec: Echo Lab

## Concept & Vision
A browser-based audio delay/echo effect. Load any audio file, set delay time (50ms–1000ms), feedback amount (0–90%), and mix level. Hit "ECHO" to hear the effect in real time. Visual readout shows current delay time in ms and a simple feedback meter.

## Parameters to Test
- **Temperature** — 0.75
- **Token limit** — 1800
- **Model** — llama3.1:8b via Ollama with retry-patch hints (concrete code snippets for recurring failures)
- **Goal** — minimal manual cleanup; test if concrete patch hints fix the 3 recurring issues (setTargetAtTime, requestAnimationFrame, onended)

## Design
- Dark background `#0a0a0f`, coral accent `#e76f51`
- Fonts: Space Mono + Inter
- Centered: file drop → waveform → transport → delay slider → feedback slider → mix slider → ECHO button
- Feedback meter (visual bar showing feedback amount)

## Features
- [ ] Drag-and-drop audio load (wav/mp3)
- [ ] Play/pause toggle
- [ ] Delay time slider: 50ms to 1000ms (step 10ms)
- [ ] Feedback slider: 0% to 90% (controls feedback gain, must stay <1 to avoid infinite loop)
- [ ] Mix slider: dry/wet (0 = fully dry, 1 = fully wet)
- [ ] "ECHO" toggle button — activates/deactivates the delay effect
- [ ] Real-time parameter changes via setTargetAtTime
- [ ] Waveform with playhead
- [ ] Master gain + dynamics compressor

## Technical Approach
- Web Audio delay effect: source → DelayNode → feedback loop (feedbackGain) → dry/wet mix via two GainNodes → masterGain → compressor → destination
- Feedback gain must be < 1 (e.g., 0.6 for 60% feedback), computed from slider as `feedbackGain = sliderValue / 100`
- Dry path: source → dryGain (1 - mix) → masterGain
- Wet path: source → delay → wetGain (mix) → masterGain
- DelayNode.delayTime.setTargetAtTime(newDelay, audioCtx.currentTime, 0.05) for smooth changes
- All gain changes: setTargetAtTime, never direct .value assignment
- Playhead: requestAnimationFrame inside animate() function with onended handler
- DynamicsCompressor in master chain (threshold -6dB, ratio 4:1)

## Code Requirements (validated — these are the 6 high-failure patterns):
- setTargetAtTime: ALL param changes must use it — delayTime, gain values, playbackRate
- requestAnimationFrame: playhead must use recursive animate() pattern
- onended: AudioBufferSourceNode must have source.onended = () => { isPlaying = false; currentSource = null; }
- stopPlayback: helper function that calls source.stop() + cancels raf + resets state
- devicePixelRatio: canvas setup for crisp rendering
- DynamicsCompressor: master chain must include it

## Required function names (must be defined in script):
`ensureAudioContext`, `loadFile`, `playAudio`, `stopPlayback`, `drawWaveform`, `startPlayhead`, `applyEcho`

Generate ONLY the HTML. Start directly with <!DOCTYPE html>.