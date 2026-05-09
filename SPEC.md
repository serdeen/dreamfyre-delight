# Build: pan-sphere

## Concept & Vision
A stereo panning lab with a glowing orb that moves left/right as you pan. Drag the orb or use L/R buttons. Visualizes stereo field in real-time. Simple, tactile, satisfying.

## Parameters to Test
- **Temperature**: 0.75 (complex-ish audio chain with panner node + gain + compressor)
- **Token limit**: 1800
- **Goal**: Verify panner automation wiring + RAF visualizer

## Design
- Dark `#0a0a0f` background with radial glow
- Neon cyan `#00f5d4` orb, magenta `#f72585` accent ring
- Space Mono headings, Inter body
- Single-column, centered, ~400px max-width

## Audio
- Oscillator drone (toggle on/off)
- StereoPannerNode for L/R pan
- Master gain (~0.55) + DynamicsCompressor
- Oscillator: sine wave at 110Hz (A2), gentle

## Visualizer
- Canvas orb follows pan value (-1 to +1)
- Glow intensity pulses slightly
- RAF loop for smooth animation

## Controls
- Toggle button: Start/Stop drone
- L / R buttons for step pan (-0.1 per click)
- Draggable orb (mousedown + mousemove)
- Pan value display: "L100" ... "CENTER" ... "R100"

## Code Requirements
- `audioCtx.createStereoPanner()` — panner node
- `audioCtx.createOscillator()` + `audioCtx.createGain()` — drone chain
- `audioCtx.createDynamicsCompressor()` — compressor
- `requestAnimationFrame` — orb animation loop
- `devicePixelRatio` — crisp canvas
- `setTargetAtTime` — smooth gain/pan changes
- `onended` handler if using buffer source (N/A here — oscillator mode)
- `stopPlayback()` function wired to stop button