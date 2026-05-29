# Design - Instruments Expansion

## Archivos Modificados
- `src/stores/sequencer.ts`
- `src/components/sequencer/DevicePanel.vue`
- `src/audio/AudioEngine.ts`
- `tests/audioEngine.spec.ts`

## Detalles Técnicos
- Registro de tipos en `InstrumentType`.
- Adición de `INSTRUMENTS` y lógica `isPercussion` en `DevicePanel.vue`.
- Implementación de `ExplosionSynth` usando Tone.js:
  - NoiseSynth con ruido blanco y envolvente.
  - Filter con tipo lowpass y rampa de frecuencia descendente exponencial.
- Modificación de métodos clave en `AudioEngine` para manejar percusión nueva.
