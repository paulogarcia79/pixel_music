# Implementación - tonal_percussion_bugfix

Este documento detalla la trazabilidad entre los cambios del bugfix de volumen inaudible de percusión tonal y sus respectivas pruebas unitarias/integración en `tests/audioEngine.spec.ts`.

## Trazabilidad

### T1 — setupLoop con notas tonales
- **Cambio**: Modificar `AudioEngine.setupLoop` para disparar sintetizadores de membrana (`kick`, `tom`, `conga`, `woodblock`) usando la nota correspondiente de la cuadrícula o fallback ('C2'/'C3') en lugar de usar `'16n'` como nota.
- **Prueba**: `'should trigger tonal percussion instruments with correct notes and 16n duration in setupLoop'`

### T2 — playNote con notas de preescucha tonales
- **Cambio**: Modificar `AudioEngine.playNote` para que las notas de preescucha de percusión de membrana utilicen el tono correcto (o fallback `'C2'`).
- **Prueba**: `'should trigger tonal percussion instruments with correct note and duration in playNote'`

### T3 — exportAudioOffline con renderizado tonal
- **Cambio**: Modificar `AudioEngine.exportAudioOffline` para usar la nota real (o fallback) durante la renderización offline WAV.
- **Prueba**: `'should trigger tonal percussion instruments with correct note and duration in exportAudioOffline'`
