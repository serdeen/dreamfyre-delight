# Build Spec: Octave Synth

## Concept & Vision
A minimal 2-octave synth pad where the user selects a root note and scale, then plays with explicit octave shift controls (+1, +2, -1, -2 octaves). The octave UI is prominent — top of the interface — so it's immediately obvious this is a required pattern for all Dreamfyre music apps.

## Parameters to Test
- **Build speed** — local llama3.1:8b on M4 Pro generating the full HTML vs what a cloud model would take
- **Code quality** — whether local model produces clean, complete Web Audio implementation

## Design
- Background: `#0a0a0f`
- Accents: cyan `#00f5d4`, magenta `#f72585`
- Fonts: Space Mono (headings), Inter (body) — Google Fonts
- Layout: vertical stack — octave controls at top, scale/key selector, then piano keys

## Features
- [ ] Octave shift buttons: -2, -1, 0, +1, +2 — prominent and always visible
- [ ] Root note picker (C through B)
- [ ] Scale picker: major, minor, pentatonic, blues
- [ ] 2-octave piano keyboard (clickable keys, responsive)
- [ ] Web Audio synthesis — sine wave base, gain envelope for clean note-on/off
- [ ] Active note highlight on key press

## Technical Approach
- Single HTML file, vanilla JS, Web Audio API
- Note frequency helper using 440 Hz A4 reference
- Octave offset applied to MIDI note calculation

## Verification
- [ ] Plays correctly in browser
- [ ] Octave buttons shift pitch up/down by 12 semitones per octave
- [ ] Scale correctly filters which notes are active
- [ ] No console errors