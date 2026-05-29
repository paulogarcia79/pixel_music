# Sesión Actual

## Feature en curso
- `tonal_percussion_bugfix` (en la rama `bugfix/tonal-percussion-volume`)

## Plan
- [x] T1 — Modificar `AudioEngine.setupLoop` en `src/audio/AudioEngine.ts` para disparar instrumentos de percusión tonal (`kick`, `tom`, `conga`, `woodblock`) usando la nota programada (o fallback `'C2'`) en lugar del valor `'16n'`.
- [x] T2 — Modificar `AudioEngine.playNote` en `src/audio/AudioEngine.ts` para reproducir notas de preescucha con tono en percusión de membrana.
- [ ] T3 — Modificar `AudioEngine.exportAudioOffline` en `src/audio/AudioEngine.ts` para renderizar la exportación offline usando notas reales en percusión de membrana.
- [ ] T4 — Escribir pruebas unitarias e integración en `tests/audioEngine.spec.ts` que validen el paso de notas tonales y duración adecuada a los sintetizadores de membrana.
- [ ] T5 — Ejecutar `./init.sh` en el workspace para certificar que compila y que todas las pruebas pasan exitosamente al 100%.
