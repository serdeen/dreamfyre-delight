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
- Polyphonic — hold multiple keys simultaneously
- Clean single-file HTML, no external deps

## Audio Routing
```
Oscillator → Filter → Delay → Reverb → Output
     ↓
  Gain (ADSR)
```

## Parameters to Test
- Polyphony limit (8 voices max to avoid clipping)
- Reverb algorithm quality vs latency
- LFO sync to tempo vs free-run
