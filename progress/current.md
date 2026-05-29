# Sesión Actual

## Feature en curso
- `instruments_expansion` (en la rama `feature/instruments-expansion`)

## Plan
- [x] T1 — Añadir los nuevos literales en `src/stores/sequencer.ts`.
- [x] T2 — Agregar los tres registros a `INSTRUMENTS` y actualizar `isPercussion` en `src/components/sequencer/DevicePanel.vue`.
- [x] T3 — Implementar la clase de envoltura `ExplosionSynth` en `src/audio/AudioEngine.ts`.
- [x] T4 — Actualizar flujos de percusión en `src/audio/AudioEngine.ts` (`setupLoop`, `playNote`, `exportAudioOffline`).
- [x] T5 — Implementar la creación de sintetizadores en `createSynthByType` para `fat_square`, `retro_laser` y `retro_explosion` en `src/audio/AudioEngine.ts`.
- [x] T6 — Escribir pruebas unitarias en `tests/audioEngine.spec.ts` para verificar instanciación y disparo de los nuevos instrumentos.

