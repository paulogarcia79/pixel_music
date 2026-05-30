# Traceability Map: Modulation Effects, LFO, and Arpeggiator

Este documento establece la correspondencia exacta entre cada requisito funcional (`R<n>`) definido en `specs/modulation_effects/requirements.md` y su respectiva prueba unitaria en `tests/modulationEffects.spec.ts`, garantizando la trazabilidad al 100%.

---

| Requisito (Requirements Spec) | Prueba Unitaria (Vitest Unit Test) | Estado |
|---|---|---|
| **R1**: AudioEngine loop runs at `32n` fusa subdivision. | `R1, R2: should run setupLoop scheduled repeat at 32n and play conventional notes at step32 % 2 === 0` |  Green |
| **R2**: Conventional step notes triggered only at even fusa ticks (`step32 % 2 === 0`). | `R1, R2: should run setupLoop scheduled repeat at 32n and play conventional notes at step32 % 2 === 0` |  Green |
| **R3**: Track modulation slot supports `'none' | 'chorus' | 'flanger' | 'phaser'`. | Soportado en Pinia Store / DevicePanel UI, y testeado en el test de mezcla activa `R5, R6`. |  Green |
| **R4**: MIENTRAS `'none'`, `wet = 0` para chorus, flanger y phaser. | `R4: should set wet to 0 for chorus, flanger, and phaser when modFX_type is none` |  Green |
| **R5**: MIENTRAS activo (`'chorus'`, `'flanger'`, `'phaser'`), el wet del activo se configura según store y los otros se fuerzan a 0. | `R5, R6: should apply correct parameters and wet mixing values to the active modFX slot and bypass the others` |  Green |
| **R6**: UI modifications of rate/depth update frequency/depth of active audio node in real time. | `R5, R6: should apply correct parameters and wet mixing values to the active modFX slot and bypass the others` |  Green |
| **R7**: Track LFO modulator enrouted to `'none' | 'pitch' | 'filter' | 'volume'`. | Soportado en Pinia Store / DevicePanel UI, y verificado en las aserciones de LFO `R8`, `R9`, `R10`, `R11`. |  Green |
| **R8**: MIENTRAS LFO is `'none'`, LFO is disconnected and defaults restored (detune = 0, filter = 20000 Hz, gain = 1.0). | `R8: should disconnect LFO and restore default parameters when lfo_target is none` |  Green |
| **R9**: MIENTRAS LFO is `'pitch'`, LFO connects to detune and oscillates detune between `-100 * depth` and `+100 * depth`. | `R9: should configure LFO to modulate synth detune when lfo_target is pitch` |  Green |
| **R10**: MIENTRAS LFO is `'filter'`, LFO connects to lowpass dedicated filter oscillating frequency between `200` and `200 + 9800 * depth` Hz. | `R10: should configure LFO to modulate dedicated lowpass filter frequency when lfo_target is filter` |  Green |
| **R11**: MIENTRAS LFO is `'volume'`, LFO connects to gain dedicated tremolo node oscillating gain between `1.0 - depth` and `1.0`. | `R11: should configure LFO to modulate dedicated gain nodes when lfo_target is volume` |  Green |
| **R12**: Arpeggiator activated/deactivated independently via `arp_enabled` store flag. | Soportado en Pinia Store / DevicePanel UI, y testeado en el test arpegiador `R13, R14, R15`. |  Green |
| **R13**: MIENTRAS arpeggiator is active and notes programmed, sequences a single note per tick of temporal rate (`arp_rate`). | `R13, R14, R15: should sequence notes chromatically through the arpeggiator and restart on a new step` |  Green |
| **R14**: Arpeggiator respects direction (`'up'`, `'down'`, `'updown'`, `'random'`) over chromatically ordered notes extended by `arp_octaves` (1 to 3). | `R13, R14, R15: should sequence notes chromatically through the arpeggiator and restart on a new step` |  Green |
| **R15**: Arpeggiator resets/resyncs at the start of each new sixteenth note (`16n`). | `R13, R14, R15: should sequence notes chromatically through the arpeggiator and restart on a new step` |  Green |
| **R16**: Render three new interactive retro Eurorack submodules side-by-side (Modulation FX, LFO, Arpeggiator) in the Device Panel. | `R16: should render three compact modular panels for modFX, LFO, and arpeggiator inside DevicePanel.vue` |  Green |

---
