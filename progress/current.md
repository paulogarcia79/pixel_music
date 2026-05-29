# Sesión Actual

## Feature en curso
- `bugfix/classic-guitar-voice` (en la rama `bugfix/classic-guitar-voice`)

## Plan
- [x] T1 — Implementar la clase de envoltura `PolyPluckSynth` en `src/audio/AudioEngine.ts` para gestionar un pool de voces de `Tone.PluckSynth` de forma rotatoria y polyfónica.
- [x] T2 — Actualizar el caso de inicialización `guitar_pixel` en `createSynthByType` para instanciar `PolyPluckSynth` en lugar de intentar envolverlo en `Tone.PolySynth`.
- [x] T3 — Agregar pruebas unitarias e integración en `tests/audioEngine.spec.ts` para verificar la estabilidad de `guitar_pixel` en reproducción y evitar errores de herencia de `Monophonic`.
- [x] T4 — Ejecutar `./init.sh` en el workspace para certificar que compila y que todas las pruebas pasan exitosamente al 100%.
