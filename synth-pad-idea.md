# Synth Pad — IDEA

## Concept
Atmospheric synth pad generator. Hold keys/chords and they bloom into lush evolving pads with delay, reverb, and filter sweeps. Ambient, dreamy, infinite sustain.

## Design
- Dark #0a0a0f background, soft gradients
- 4-8 key grid for holding chords
- Attack/Release envelope knobs
- Filter cutoff + resonance
- Delay time + feedback
- Reverb wet/dry
- LFO rate + depth for filter modulation
- Multiple wave options (saw, square, sine, triangle)

## Features
- Web Audio API — OscillatorNode + GainNode for each voice
- ADSR envelope with long attack/release
- BiquadFilterNode for lowpass sweep
- DelayNode + feedback loop
- ConvolverNode or algorithmic reverb
- MIDI Learn mode — tap a control to assign it
- Komplete Kontrol integration (NI NKS protocol for preset/param mapping)
- CC mappable: Filter cutoff (CC1/MW), Resonance (CC2), Attack (CC73), Release (CC72), Delay feedback (CC91)
- Pitch bend + modulation wheel supported
- Note on/off with velocity-sensitive amplitude
- Polyphonic — hold multiple keys simultaneously (up to 8 voices)
- Clean single-file HTML, no external deps

## MIDI Integration
- Web MIDI API (`navigator.requestMIDIAccess()`)
- Komplete Kontrol sends Standard MIDI CC messages
- NI NKS: if available, use `navigator.requestMIDIAccess({software: true})` for high-res CC
- Auto-detect KK S-series as primary input
- Fallback to any standard MIDI device

## Audio Routing
```
Oscillator → Filter → Delay → Reverb → Output
     ↓
  Gain (ADSR)

MIDI In → Web MIDI API → CC Mapper → [Filter, Delay, Env, LFO]
                    → Note/Velocity → Voice Allocator → Oscillators
```

## Parameters to Test
- Polyphony limit (8 voices max to avoid clipping)
- Reverb algorithm quality vs latency
- LFO sync to tempo vs free-run
- MIDI latency: Web MIDI API response time vs native
- High-res CC (14-bit) from Komplete Kontrol vs standard 7-bit CC
- Velocity curve mapping for soft/hard playing dynamics
