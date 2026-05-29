# Trazabilidad de Requerimientos: Classic Guitar Bugfix

Este documento confirma y mapea cada uno de los requerimientos funcionales definidos en el spec de `classic_guitar_bugfix` con sus correspondientes pruebas unitarias y de integración.

---

## Trazabilidad

- **R1** (PolyPluckSynth pool sin errores de herencia Monophonic) → `R9, R10: setupLoop should dynamically apply ADSR and physical modeling parameters to track synths` en `tests/audioEngine.spec.ts` y `should play guitar_pixel notes polyphonically using PolyPluckSynth without errors` en `tests/audioEngine.spec.ts`.
- **R2** (set propaga dampening y resonance) → `R9, R10: setupLoop should dynamically apply ADSR and physical modeling parameters to track synths`, `R11: playNote should apply ADSR envelope and physical modeling values to the preview synth`, y `R12: exportAudioOffline should apply ADSR and physical modeling parameters to the offline synths` en `tests/audioEngine.spec.ts`.
- **R3** (triggerAttackRelease rotativo y polifónico) → `should play guitar_pixel notes polyphonically using PolyPluckSynth without errors` en `tests/audioEngine.spec.ts`.
- **R4** (triggerRelease en todas las voces) → `should play guitar_pixel notes polyphonically using PolyPluckSynth without errors` en `tests/audioEngine.spec.ts`.
- **R5** (dispose de todas las voces y volumen) → `should play guitar_pixel notes polyphonically using PolyPluckSynth without errors` en `tests/audioEngine.spec.ts` (a través de `clearAllSynths` en `beforeEach`).
