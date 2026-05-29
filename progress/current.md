# Sesión Actual

## Feature en curso
- explosion_synth_volume_fix

## Plan
- [ ] T1 — Modificar la declaración de variables y la inicialización del volumen en `ExplosionSynth`. Cubre: R1, R2, R3.
- [ ] T2 — Actualizar el ruteo interno (conexión del filtro) en `ExplosionSynth` hacia `volumeNode`. Cubre: R2.
- [ ] T3 — Ajustar los métodos `connect` y `dispose` en `ExplosionSynth` para usar `volumeNode`. Cubre: R4, R5.
- [ ] T4 — Agregar test en `tests/audioEngine.spec.ts` para verificar que `ExplosionSynth.volume` es una señal `Tone.Param` y funciona correctamente con `.setValueAtTime`. Cubre: R1, R2, R3, R4, R5.

