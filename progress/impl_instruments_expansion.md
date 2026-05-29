# Trazabilidad de Requisitos - Instruments Expansion

Este documento mapea cada requisito `R<n>` del pliego de condiciones a su prueba correspondiente en `tests/audioEngine.spec.ts`.

- **R1** (Añadir literales a `InstrumentType`) → Cubierto indirectamente por todos los tests de instanciación e integración que usan los nuevos tipos literales, y verificado por la correcta compilación de TypeScript en `tests/audioEngine.spec.ts`.
- **R2** (Registro en `INSTRUMENTS` en `DevicePanel.vue`) → Cubierto por la prueba de integración de UI en `tests/components/DevicePanel.spec.ts` (los instrumentos se cargan correctamente en el catálogo).
- **R3** (Ocultar ADSR para percusiones nuevas en `DevicePanel.vue`) → Cubierto por la lógica del computed `isPercussion` verificado en `tests/components/DevicePanel.spec.ts`.
- **R4** (Clase `ExplosionSynth` con barrido exponencial) → Cubierto por `should correctly instantiate, trigger, and perform filter sweep for retro_explosion using ExplosionSynth` en `tests/audioEngine.spec.ts`.
- **R5** (Percusión en flujos `setupLoop`, `playNote` y `exportAudioOffline`) → Cubierto por `should trigger tonal percussion instruments with correct notes and 16n duration in setupLoop` y `should trigger tonal percussion instruments with correct note and duration in playNote` adaptados, y las pruebas de `retro_laser` y `retro_explosion` en `tests/audioEngine.spec.ts`.
- **R6** (Percusión melódica/tonal de `retro_laser` con nota de la cuadrícula) → Cubierto por `should correctly instantiate and trigger retro_laser using MembraneSynth with sawtooth oscillator` en `tests/audioEngine.spec.ts`.
- **R7** (Instanciar sintetizadores correspondientes) → Cubierto por `should correctly instantiate and trigger fat_square using PolySynth with fatsquare oscillator`, `should correctly instantiate and trigger retro_laser using MembraneSynth with sawtooth oscillator`, y `should correctly instantiate, trigger, and perform filter sweep for retro_explosion using ExplosionSynth` en `tests/audioEngine.spec.ts`.
