# SPEC.md — Signal Lab

## Concept & Vision
Browser-based multi-waveform signal generator with live oscilloscope visualization. Toggle between sine, square, sawtooth, triangle waves. Adjust frequency (20Hz–2000Hz) and gain. Visual scope shows real-time waveform using AnalyserNode + requestAnimationFrame. Master chain includes DynamicsCompressor for speaker protection.

## Parameters to Test
- **Temperature:** 0.75 (moderate creativity)
- **Token limit:** 1800
- **Goal:** Exercise auto-patcher on all 5 patterns in a single build

## Design Language
- Dark background `#0a0a0f`, neon cyan `#00f5d4`, neon magenta `#f72585`
- Space Mono (headings) + Inter (body) from Google Fonts
- Single self-contained HTML file

## Features
1. **Waveform selector** — 4 buttons: Sine, Square, Sawtooth, Triangle; creates new OscillatorNode on selection
2. **Frequency control** — range slider 20–2000Hz, displays current Hz value
3. **Gain control** — range slider 0–1, uses `setTargetAtTime` for smooth transitions
4. **Oscilloscope canvas** — AnalyserNode with `getByteTimeDomainData`, draws waveform with `requestAnimationFrame`; uses `devicePixelRatio` for crisp rendering
5. **Master chain** — OscillatorNode → GainNode → DynamicsCompressor → destination
6. **On/off toggle** — Play/Stop button; stop calls `oscillator.stop()` properly

## Code Requirements
- Required functions: `initAudio`, `setFrequency`, `setGain`, `drawScope`, `startOsc`, `stopOsc`
- All param changes use `setTargetAtTime`
- Canvas uses `devicePixelRatio`
- Animation uses `requestAnimationFrame` recursively in `drawScope`
- Master chain includes `DynamicsCompressor`

## Layout
- Top: `<h1>Signal Lab</h1>`
- Middle: oscilloscope canvas (full width, ~180px tall)
- Bottom: waveform buttons (Sine/Square/Saw/Tri) + frequency slider + gain slider + Play/Stop
- Responsive: canvas resizes with window