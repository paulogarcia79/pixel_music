# Requirements: Classic Guitar PolyPluckSynth Bugfix

Este documento define el comportamiento esperado para la resolución del bug de herencia Monophonic de PluckSynth en el instrumento `guitar_pixel`, especificados mediante la notación estándar **EARS** (Easy Approach to Requirements Syntax).

---

## 1. Comportamiento y Funcionalidades de PolyPluckSynth

### R1
El sistema DEBE instanciar un pool de voces polifónico (`PolyPluckSynth`) para el instrumento `guitar_pixel` en `AudioEngine` para reproducir notas polifónicamente sin lanzar errores de herencia de `Monophonic`.

### R2
CUANDO se llame a la función `set` sobre el sintetizador de `guitar_pixel`, el sistema DEBE propagar los parámetros `dampening` y `resonance` a todas las voces de `Tone.PluckSynth` en el pool.

### R3
CUANDO se llame a `triggerAttackRelease` en el sintetizador de `guitar_pixel` con una o varias notas, el sistema DEBE disparar las notas rotando secuencialmente entre las voces disponibles del pool.

### R4
CUANDO se llame a `triggerRelease` en el sintetizador de `guitar_pixel`, el sistema DEBE invocar `triggerRelease` en todas las voces del pool si está disponible.

### R5
CUANDO se llame a `dispose` en el sintetizador de `guitar_pixel`, el sistema DEBE liberar (dispose) todas las voces del pool y el nodo de volumen asociado.
