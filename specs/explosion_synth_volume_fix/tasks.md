# Tasks - ExplosionSynth Volume Fix

- [x] T1 — Modificar la declaración de variables y la inicialización del volumen en `ExplosionSynth`. Cubre: R1, R2, R3.
- [x] T2 — Actualizar el ruteo interno (conexión del filtro) en `ExplosionSynth` hacia `volumeNode`. Cubre: R2.
- [x] T3 — Ajustar los métodos `connect` y `dispose` en `ExplosionSynth` para usar `volumeNode`. Cubre: R4, R5.
- [x] T4 — Agregar test en `tests/audioEngine.spec.ts` para verificar que `ExplosionSynth.volume` es una señal `Tone.Param` y funciona correctamente con `.setValueAtTime`. Cubre: R1, R2, R3, R4, R5.
