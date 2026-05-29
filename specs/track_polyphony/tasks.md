# Tasks — Track Polyphony

## Fase 1: Adaptación de la Estructura de Datos e Interfaces

- [x] T1 — Modificar la interfaz `TrackInstance` en `src/stores/sequencer.ts` para cambiar el tipo de `notes` a `Record<number, string[]>`. Cubre: R1.
- [x] T2 — Actualizar el `state` inicial en `src/stores/sequencer.ts` para que la propiedad `notes` se inicialice como un objeto vacío `{}` pero tipado en conformidad con la firma de arreglos. Cubre: R1.
- [x] T3 — Modificar los datos estáticos de `PATTERN_PRESETS` en `src/stores/sequencer.ts` convirtiendo todas las notas monofónicas individuales de formato `string` a arreglos `string[]` de un elemento (e.g., `notes: { 1: ['C2'] }`). Cubre: R1.

---

## Fase 2: Operaciones del Store y Retrocompatibilidad

- [x] T4 — Actualizar la acción `addNote` en `src/stores/sequencer.ts` para agregar la nota en el paso indicado sin duplicados en el array de destino. Cubre: R2.
- [x] T5 — Actualizar la acción `removeNote` en `src/stores/sequencer.ts` para que reciba una nota opcional; si se provee, la remueve del arreglo de ese paso; si el paso queda vacío o no se especifica la nota, elimina la clave del paso completo. Cubre: R3, R4, R5.
- [x] T6 — Actualizar la acción `getNoteAt` en `src/stores/sequencer.ts` para que retorne `string[] | undefined` en concordancia con la nueva estructura. Cubre: R6.
- [x] T7 — Implementar normalización de notas monofónicas (string -> [string]) en `loadProject` y `loadPreset` dentro de `src/stores/sequencer.ts` para asegurar retrocompatibilidad con datos anteriores. Cubre: R7, R8.

---

## Fase 3: Motor de Audio y Síntesis Polifónica

- [x] T8 — Modificar `createSynthByType` en `src/audio/AudioEngine.ts` para que todos los sintetizadores que no sean de percusión (`kick`, `snare`, `hihat`, `clap`, `crash`, `noise`, `tom`, `conga`, `cowbell`, `woodblock`, `shaker`, `rimshot`) se creen envueltos en `Tone.PolySynth`. Cubre: R9, R10.
- [x] T9 — Adaptar la actualización dinámica del ADSR (`nodes.synth.set({ envelope: { attack, release } })`) en `AudioEngine.setupLoop`, `AudioEngine.playNote` y `AudioEngine.exportAudioOffline`. Cubre: R9, R11.
- [x] T10 — Modificar el ciclo de reproducción en tiempo real (`setupLoop`) en `AudioEngine.ts` para disparar arreglos de notas en sintetizadores polifónicos, y disparar los monofónicos de percusión solo una vez por paso. Cubre: R11, R12.
- [x] T11 — Adaptar `exportAudioOffline` en `AudioEngine.ts` para secuenciar adecuadamente los arreglos polifónicos y procesar de manera idéntica los sintetizadores polifónicos. Cubre: R11, R12.

---

## Fase 4: Adaptación de la Interfaz de Usuario (UI/UX)

- [x] T12 — Adaptar la función `isNoteActive` en `src/components/sequencer/PianoRoll.vue` para verificar si la nota está incluida en el arreglo del paso actual. Cubre: R15.
- [x] T13 — Adaptar la función `getGhostNotes` en `src/components/sequencer/PianoRoll.vue` para comprobar la existencia de la nota en los arreglos de notas de otras pistas. Cubre: R16.
- [x] T14 — Adaptar la función `toggleNote` en `src/components/sequencer/PianoRoll.vue` para agregar la nota si no está activa, o remover únicamente la nota clickeada usando la acción actualizada `removeNote(trackName, step, note)` si ya está activa. Cubre: R13, R14.

---

## Fase 5: Pruebas y Verificación

- [x] T15 — Modificar las pruebas de Cucumber en `features/sequencer_state.feature` adaptando el escenario "Monophonic restriction in a track" para verificar que ahora se admiten múltiples notas en un paso (polifonía) y agregar escenarios para la retrocompatibilidad. Cubre: R1, R2, R3, R4, R5, R6, R7.
- [x] T16 — Actualizar los step definitions en `features/step_definitions/sequencer_state.steps.ts` para resolver de forma correcta la aserción y manipulación de arreglos de notas. Cubre: R1, R2, R3, R4, R5, R6, R7.
- [x] T17 — Ejecutar `./init.sh` en el workspace y verificar que compila perfectamente en producción y que el suite de tests se completa al 100% en verde. Cubre: R1-R16.
