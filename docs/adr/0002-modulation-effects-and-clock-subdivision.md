# Modulation Effects, LFO, and Clock Subdivision Architecture

We decided to:
1. **Clock the AudioEngine loop at 32n** (instead of 16n) to natively support sub-step timing for the Arpeggiator (8n, 16n, 32n speed rates) with precise Web Audio scheduling, while advancing the main Piano Roll step sequencer every 2 clock ticks.
2. **Implement a single Modulation Effect Slot per track** that routes the signal chain through a series of Tone.js Chorus, Flanger, and Phaser nodes. We toggle the active effect by setting its `wet` mix value, bypassing inactive effects (`wet = 0`) to conserve CPU.
3. **Equip each track with a dedicated LFO Modulator** that dynamically connects/disconnects its target parameter. It modulates `detune` (in cents) for pitch vibrato, a per-track lowpass Filter cutoff for spectral sweeps, or a dedicated Gain node for tremolo, scaling the LFO output using depth and offset bounds.
4. **Incorporate compact side-by-side modules in the Eurorack Device Panel** for Modulation FX, LFO, and Arpeggiator, keeping the horizontal modular synth aesthetic.
