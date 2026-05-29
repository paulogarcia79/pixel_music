# Sesión Actual

## Feature en curso
- `track_polyphony`

## Plan
- [x] T1 — Modificar la interfaz TrackInstance en `src/stores/sequencer.ts` para cambiar el tipo de `notes` a `Record<number, string[]>`. Cubre: R1.
- [x] T2 — Actualizar el `state` inicial en `src/stores/sequencer.ts` para que la propiedad `notes` se inicialice como un objeto vacío `{}` pero tipado en conformidad con la firma de arreglos. Cubre: R1.
- [x] T3 — Modificar los datos estáticos de `PATTERN_PRESETS` en `src/stores/sequencer.ts` convirtiendo todas las notas de string a string[]. Cubre: R1.
- [x] T4 — Actualizar la acción `addNote` en `src/stores/sequencer.ts` para agregar la nota en el paso indicado sin duplicados. Cubre: R2.
- [x] T5 — Actualizar la acción `removeNote` en `src/stores/sequencer.ts` para recibir nota opcional y eliminar celdas individuales o el paso completo. Cubre: R3, R4, R5.
- [x] T6 — Actualizar la acción `getNoteAt` en `src/stores/sequencer.ts` para retornar `string[] | undefined`. Cubre: R6.
- [x] T7 — Implementar normalización de notas monofónicas (string -> [string]) en `loadProject` y `loadPreset` dentro de `src/stores/sequencer.ts`. Cubre: R7, R8.
- [x] T8 — Modificar `createSynthByType` en `src/audio/AudioEngine.ts` para envolver los sintetizadores melódicos en `Tone.PolySynth`. Cubre: R9, R10.
- [x] T9 — Adaptar la actualización dinámica del ADSR (`synth.set({ envelope: { attack, release } })`) en `AudioEngine.setupLoop`, `AudioEngine.playNote` y `AudioEngine.exportAudioOffline`. Cubre: R9, R11.
- [x] T10 — Modificar el ciclo de reproducción en tiempo real (`setupLoop`) en `AudioEngine.ts` para disparar arreglos de notas polifónicas y percusiones monofónicas. Cubre: R11, R12.
- [x] T11 — Adaptar `exportAudioOffline` en `AudioEngine.ts` para secuenciar polifónicamente las pistas. Cubre: R11, R12.
- [x] T12 — Adaptar la función `isNoteActive` en `src/components/sequencer/PianoRoll.vue` para verificar inclusión en el arreglo del paso. Cubre: R15.
- [x] T13 — Adaptar la función `getGhostNotes` en `src/components/sequencer/PianoRoll.vue` para buscar sobre arreglos de notas fantasma. Cubre: R16.
- [x] T14 — Adaptar la función `toggleNote` en `src/components/sequencer/PianoRoll.vue` para agregar nota o remover la nota individual pulsada. Cubre: R13, R14.
- [x] T15 — Modificar las pruebas de Cucumber en `features/sequencer_state.feature` adaptando el escenario monofónico a polifonía e integrando retrocompatibilidad. Cubre: R1-R7.
- [x] T16 — Actualizar los step definitions en `features/step_definitions/sequencer_state.steps.ts` para resolver de forma correcta arreglos de notas. Cubre: R1-R7.
- [x] T17 — Ejecutar `./init.sh` en el workspace para compilar y pasar la batería de tests en verde al 100%. Cubre: R1-R16.
