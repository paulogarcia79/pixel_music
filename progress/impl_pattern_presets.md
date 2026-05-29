# Trazabilidad — Pattern Presets

Este documento contiene el mapeo exacto de los requisitos de negocio (R1-R7) de `specs/pattern_presets/requirements.md` a las pruebas automatizadas correspondientes ubicadas en `tests/presets.spec.ts`.

| Requisito | Descripción | Caso de Prueba (Test) |
|---|---|---|
| **R1** | Inicialización del patrón activo 1 con el preset 'Chiptune Techno' a 130 BPM al cargar la aplicación. | `'R1: should initialize with Chiptune Techno preset and 130 BPM on startup (application mount)'` |
| **R2** | Desplegable de selección en la barra superior (`Transport.vue`) con opciones específicas. | `'R2: should render a select dropdown containing all the specified options'` |
| **R3** | Limpieza y desecho de todos los sintetizadores existentes mediante `AudioEngine.clearAllSynths()`. | `'R3: should invoke AudioEngine.clearAllSynths when a preset is loaded'`<br>`'R3, R4, R5: should trigger loadPreset action on select element change'` |
| **R4** | Sobreescritura de pistas, tipo de sintetizador, volumen, ADSR, efectos y notas del patrón actual. | `'R4: should correctly overwrite tracks, synth types, volumes, ADSR, and note map'`<br>`'R3, R4, R5: should trigger loadPreset action on select element change'` |
| **R5** | Actualización dinámica del tempo (BPM) del secuenciador al valor del preset. | `'R5: should correctly update the BPM when a preset is loaded'`<br>`'R3, R4, R5: should trigger loadPreset action on select element change'` |
| **R6** | Opción 'Empty' restablece a patrón vacío ('Track 1', 'square', sin notas) a 120 BPM. | `'R6: should correctly reset the pattern to default empty state and 120 BPM when Empty option is selected'` |
| **R7** | Cambio de preset al vuelo mantiene la reproducción activa sin interrupción. | `'R7: should maintain reproduction state active when preset is changed during playback'` |

---
*Todos los tests están en estado VERDE (100% exitosos).*
