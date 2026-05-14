# Dreamfyre Build Spec: Arpeggio Engine

## Concept & Vision
A minimal step-sequencer arpeggiator for browser. Pick a root note + scale, set tempo, and watch notes light up in sequence. Neon cyberpunk aesthetic. Feels like a pocket instrument, not a DAW.

## Parameters to Test
- **Temperature** — creativity of scale/arpeggio pattern selection
- **Token limit** — can we generate compact code under constraints
- **Build speed** — local Ollama generation time

## Design
- Dark #0a0a0f background, neon cyan/magenta accents
- 16-step sequencer grid (toggleable steps)
- Root note dropdown (C-B), Scale dropdown (major, minor, pentatonic, blues)
- Tempo slider (60-200 BPM)
- Play/Stop button
- Visual step indicator that pulses on current step

## Features
- Web Audio API oscillator-based synth
- 16 steps, each can be on/off with a pitch offset
- Arpeggio cycles through active steps
- Clean single-file HTML, no external deps except fonts