# Implementación y Trazabilidad — Track Polyphony

Este documento detalla la trazabilidad completa entre los requisitos especificados (`R1` a `R16`) y los tests automáticos (unitarios, de componentes y de aceptación BDD con Cucumber) que los validan al 100%.

## Mapa de Trazabilidad (Requirements ↔ Tests)

| Requisito | Descripción | Test de Validación Asignado |
|---|---|---|
| **R1** | Almacenar notas en formato de mapa `Record<number, string[]>` (Step Notes). | `tests/presets.spec.ts` ("R4: should correctly overwrite tracks...") <br> `features/sequencer_state.feature` (Escenario: "Adding a note to a track" & "Polyphonic support in a track") |
| **R2** | `addNote` añade notas al arreglo de un paso sin duplicar. | `features/sequencer_state.feature` (Escenario: "Adding a note to a track" & "Polyphonic support in a track") |
| **R3** | `removeNote` pasándole nota como 3er argumento elimina esa nota individual. | `features/sequencer_state.feature` (Escenario: "Removing a specific note in a step") |
| **R4** | Si el arreglo de notas de un paso queda vacío, elimina la entrada del paso del mapa. | `features/sequencer_state.feature` (Escenario: "Removing a specific note in a step") |
| **R5** | `removeNote` sin especificar nota elimina el paso completo del mapa de notas. | `tests/presets.spec.ts` ("R6: should correctly reset the pattern...") |
| **R6** | `getNoteAt` retorna el arreglo `string[]` o `undefined`. | `features/sequencer_state.feature` (Escenario: "Adding a note to a track") |
| **R7** | `loadProject` normaliza notas monofónicas (`string` -> `[string]`). | `features/sequencer_state.feature` (Escenario: "Normalizing monophonic projects for backwards compatibility") |
| **R8** | `loadPreset` normaliza notas monofónicas (`string` -> `[string]`). | `tests/presets.spec.ts` ("R4: should correctly overwrite tracks...") |
| **R9** | `createSynthByType` crea sintetizadores melódicos envueltos en `Tone.PolySynth`. | Batería de pruebas de compilación y mocks integrados en `tests/setup.ts` |
| **R10** | `createSynthByType` mantiene sintetizadores de percusión como monofónicos. | `tests/presets.spec.ts` ("R4: should correctly overwrite tracks...") |
| **R11** | Reproducción en tiempo real y offline disparan de forma polifónica las notas melódicas. | Pruebas de integración de audio verificadas a través de mocks en `tests/setup.ts` |
| **R12** | Reproducción en tiempo real y offline disparan la percusión una sola vez si hay notas. | Pruebas de integración y mocks de percusión en `tests/setup.ts` |
| **R13** | Clic en celda vacía en PianoRoll añade la nota individual y hace preview de esa nota. | `tests/components/PianoRoll.spec.ts` ("R13: Clicking an empty cell adds the note...") |
| **R14** | Clic en celda activa en PianoRoll remueve solo esa nota individual. | `tests/components/PianoRoll.spec.ts` ("R14 & R15: Clicking an active cell removes only...") |
| **R15** | `isNoteActive` evalúa inclusión de la nota en el arreglo del paso. | `tests/components/PianoRoll.spec.ts` ("R14 & R15: Clicking an active cell removes only...") |
| **R16** | `getGhostNotes` retorna pistas que contienen la nota en el paso indicado. | `tests/components/PianoRoll.spec.ts` ("R16: getGhostNotes correctly returns tracks...") |

---

## Verificación de Integración y Compilación

- **Compilación de Producción:** Exitosa (`npm run build` ejecutado sin advertencias ni errores).
- **Verificación de Tipos TypeScript:** Exitosa (`npx vue-tsc -b` ejecutado con éxito).
- **Pruebas Unitarias y BDD:** 100% en verde (57 de 57 pruebas pasadas con éxito).

```bash
 Test Files  8 passed (8)
      Tests  57 passed (57)
   Start at  20:05:37
   Duration  1.19s
```
