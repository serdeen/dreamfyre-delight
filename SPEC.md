# Build Spec: Slicer Dice

## Concept & Vision
A browser-based sample slicer with a dice-randomized playback mode. Drop in any sample (wav/mp3), it auto-slices into N chunks, and the user can either manually trigger slices or hit "Roll Dice" to generate random rhythmic patterns. Feels like a pocket MPC meets a randomizer toy — utilitarian but with moments of magic when the dice land on a great sequence.

## Parameters to Test
- **Temperature** — creativity in the slice-to-chunk decisioning and random pattern generation
- **Token limit** — target compact but feature-complete, ~15KB max
- **Build speed** — local M4 Pro via Ollama generate + manual polish
- **Model** — llama3.1:8b via Ollama (192.168.1.184:11434) → MiniMax on cascade

## Design
- Dark background `#0a0a0f` with amber/orange accent `#ff6b35` (warm contrast to cyan/magenta)
- Fonts: Space Mono (headings) + Inter (body)
- Layout: top file drop zone, middle slice grid (8 slots), bottom transport + dice button
- Grid cells glow when slice is playing; dice button shakes on click

## Features
- [ ] Drag-and-drop file load (wav/mp3 via FileReader + AudioContext decodeAudioData)
- [ ] Auto-slice into 8 equal chunks based on sample duration
- [ ] 8-cell grid with numbered slice buttons; click to trigger that slice
- [ ] Dice Roll button — randomizes playback order of all 8 slices with a slight delay cascade
- [ ] BPM input to quantize slice timing (default 120)
- [ ] Visual waveform strip at top showing full sample with slice markers
- [ ] Master gain + volume per slice
- [ ] No external deps — vanilla Web Audio API only

## Technical Approach
- `AudioContext.decodeAudioData()` to load samples
- Slice: `sampleBuffer.getChannelData(0)` → divide into 8 equal subarrays
- Play slice: `AudioBufferSourceNode` per chunk, connected through gain → master gain → destination
- Dice roll: shuffle array of 0-7 indices, play in sequence with `setTimeout` cascade
- Waveform: downsample full buffer to ~500 points, draw on `<canvas>`
- BPM → ms per beat: `60000 / bpm` per slice step

## Verification
- [ ] File loads and decodes without errors
- [ ] All 8 slices play correct portion of sample (no out-of-bounds)
- [ ] Dice roll triggers all 8 slices in random order
- [ ] Waveform draws with correct slice markers
- [ ] BPM control affects timing correctly
- [ ] No console errors in browser