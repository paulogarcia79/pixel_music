# Tasks: Classic Guitar PolyPluckSynth Bugfix

Este documento enumera los pasos concretos e incrementales para implementar la corrección del bug en el instrumento `guitar_pixel` en conformidad con el proceso SDD (Spec Driven Development).

---

- [x] T1 — Implementar la clase de envoltura `PolyPluckSynth` en `src/audio/AudioEngine.ts` para gestionar un pool de voces de `Tone.PluckSynth` de forma rotatoria y polifónica. Cubre: R1, R2, R3, R4, R5.
- [x] T2 — Actualizar el caso de inicialización `guitar_pixel` en `createSynthByType` para instanciar `PolyPluckSynth` en lugar de intentar envolverlo en `Tone.PolySynth`. Cubre: R1.
- [x] T3 — Agregar pruebas unitarias e integración en `tests/audioEngine.spec.ts` para verificar la estabilidad de `guitar_pixel` en reproducción y evitar errores de herencia de `Monophonic`. Cubre: R1, R2, R3, R4, R5.
- [x] T4 — Ejecutar `./init.sh` en el workspace para certificar que compila y que todas las pruebas pasan exitosamente al 100%. Cubre: R1-R5.
