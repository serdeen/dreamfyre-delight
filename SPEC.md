# Build Spec: Chaos Pad

## Concept & Vision
A generative ambient soundscape pad — 4 layered oscillators (sine, triangle, saw, square) each with their own pitch, volume, and LFO modulation. Hit "Chaos" and it randomizes all params at once. "Drift" slowly modulates parameters over time. The result is a self-playing ambient texture generator, like having a tiny modular synth in the browser.

## Parameters to Test
- **Temperature** — 0.7 (slightly lower, want clean oscillator code)
- **Token limit** — 1800 (compact but needs oscillator layering + LFO math)
- **Build speed** — local M4 Pro via Ollama
- **Model** — llama3.1:8b with new strict constraints (no PHP, no backticks, must start `<!DOCTYPE`)

## Design
- Dark background `#0a0a0f` with soft violet accent `#9b5de5`
- Fonts: Space Mono + Inter
- Centered single-column layout; large "Chaos" button as focal point
- 4 oscillator rows stacked vertically, each with frequency knob, gain, waveform selector, LFO rate, LFO depth
- "Drift" toggle and speed control below the oscillators
- Minimal — no piano keys, no sequencer

## Features
- [ ] 4 oscillator layers, each: frequency slider (80Hz–1200Hz), gain slider (0–1), waveform buttons (sin/tri/saw/sqr), LFO rate slider (0.1–5Hz), LFO depth slider (0–1)
- [ ] Master gain (~0.6) with dynamics compressor for speaker safety
- [ ] "Chaos" button: randomizes all 4 oscillators' params simultaneously with smooth ramp to new values
- [ ] "Drift" toggle: a slow LFO on each oscillator's frequency (sine wave, period 8–20s) for evolving texture
- [ ] All oscillators start at A4=440Hz base, detune slightly via LFO for beating/ chorus effect
- [ ] AudioContext lazy-init on first interaction
- [ ] Clean stop: gain ramp to 0 over 0.5s on page hide / AudioContext close

## Technical Approach
- Web Audio API: OscillatorNode per layer (4 total), GainNode per layer, LFO OscillatorNode modulating frequency via GainNode
- LFO chain: LFO osc → LFO gain node → connect to main osc.frequency (additive modulation)
- Each oscillator has its own audio chain: osc → layerGain → masterGain → compressor → destination
- Chaos: `Math.random()` all params, use `setTargetAtTime()` for smooth transitions (time constant ~0.3s)
- Drift: separate slow LFO (period 8–20s) per oscillator, modulates base frequency ±20Hz

## Verification
- [ ] All 4 oscillators produce sound simultaneously without clipping
- [ ] Waveform switch changes timbre correctly per oscillator
- [ ] LFO rate slider visibly warbles the pitch (test at 2Hz)
- [ ] Chaos button randomizes everything and audio transitions smoothly
- [ ] Drift mode slowly evolves pitch over time (audible within 10s)
- [ ] No console errors on load or interaction