# Implementación y Trazabilidad — adsr_envelope

Este documento mapea cada requerimiento funcional `R<n>` establecido en la especificación (`specs/adsr_envelope/requirements.md`) a su prueba unitaria o de componente correspondiente, asegurando trazabilidad completa y objetiva del desarrollo de la feature.

---

## Trazabilidad de Requerimientos

### R1 — Propiedades de Estado
- **QUÉ**: El sistema DEBE incluir las propiedades `decay`, `sustain`, `dampening` y `resonance` en el modelo de estado de cada pista (`TrackInstance`) dentro del store de la aplicación.
- **TEST**: `tests/presets.spec.ts` -> `"ADSR R1, R2, R3, R4: should initialize, default, setTrackADSR, and setTrackPhysicalModel properties"`

### R2 — Valores por Defecto y Normalización
- **QUÉ**: El sistema DEBE asignar valores por defecto estables (`decay: 0.1` en segundos, `sustain: 0.8` como factor de ganancia de 0.0 a 1.0, `dampening: 4000` en Hz, `resonance: 0.95` como factor de 0.0 a 1.0) al instanciar nuevas pistas o cargar proyectos antiguos que carezcan de estos parámetros.
- **TEST**: `tests/presets.spec.ts` -> `"ADSR R1, R2, R3, R4: should initialize, default, setTrackADSR, and setTrackPhysicalModel properties"`

### R3 — Acción setTrackADSR
- **QUÉ**: CUANDO la acción `setTrackADSR` sea invocada en el store con parámetros de Attack, Decay, Sustain y Release, el sistema DEBE actualizar reactivamente los cuatro valores de envolvente de la pista correspondiente.
- **TEST**: `tests/presets.spec.ts` -> `"ADSR R1, R2, R3, R4: should initialize, default, setTrackADSR, and setTrackPhysicalModel properties"`

### R4 — Acción setTrackPhysicalModel
- **QUÉ**: CUANDO la acción `setTrackPhysicalModel` sea invocada en el store con parámetros de Dampening y Resonance, el sistema DEBE actualizar reactivamente ambos valores de modelado físico de la pista correspondiente.
- **TEST**: `tests/presets.spec.ts` -> `"ADSR R1, R2, R3, R4: should initialize, default, setTrackADSR, and setTrackPhysicalModel properties"`

### R5 — Perillas de Envolvente ADSR en UI
- **QUÉ**: MIENTRAS el panel Eurorack esté abierto y haya una pista activa seleccionada, el sistema DEBE mostrar cuatro perillas (`Knob`) etiquetadas como Attack, Decay, Sustain y Release para modular los parámetros ADSR de la pista seleccionada.
- **TEST**: `tests/components/DevicePanel.spec.ts` -> `"R5, R6, R7, R8: supports Decay/Sustain knobs, conditional Physical Modeling and SVG updates"`

### R6 — Perillas de Modelado Físico para guitar_pixel
- **QUÉ**: MIENTRAS el panel Eurorack esté abierto y la pista activa seleccionada sea del tipo de sintetizador de modelado físico `guitar_pixel`, el sistema DEBE mostrar controles interactivos adicionales de tipo perilla (`Knob`) para Dampening y Resonance.
- **TEST**: `tests/components/DevicePanel.spec.ts` -> `"R5, R6, R7, R8: supports Decay/Sustain knobs, conditional Physical Modeling and SVG updates"`

### R7 — Ocultamiento de Modelado Físico para otros Sintetizadores
- **QUÉ**: MIENTRAS la pista activa seleccionada NO sea del tipo de sintetizador de modelado físico `guitar_pixel`, el sistema NO DEBE mostrar los controles interactivos de Dampening y Resonance en el panel Eurorack.
- **TEST**: `tests/components/DevicePanel.spec.ts` -> `"R5, R6, R7, R8: supports Decay/Sustain knobs, conditional Physical Modeling and SVG updates"`

### R8 — Trayectoria SVG de Envolvente Reactiva
- **QUÉ**: CUANDO el usuario modifique cualquiera de los parámetros de Attack, Decay, Sustain o Release a través de las perillas correspondientes, el sistema DEBE redibujar reactivamente la trayectoria visual del mini-visualizador SVG (`envelopePath`) en tiempo real utilizando los cuatro valores dinámicos reales actualizados.
- **TEST**: `tests/components/DevicePanel.spec.ts` -> `"R5, R6, R7, R8: supports Decay/Sustain knobs, conditional Physical Modeling and SVG updates"`

### R9 — Aplicación de ADSR en Reproducción en Vivo (AudioEngine)
- **QUÉ**: CUANDO una pista con notas programadas inicie su reproducción en tiempo real, el sistema DEBE actualizar y aplicar los parámetros dinámicos de Attack, Decay, Sustain y Release a la envolvente del sintetizador correspondiente en el `AudioEngine`.
- **TEST**: `tests/audioEngine.spec.ts` -> `"R9, R10: setupLoop should dynamically apply ADSR and physical modeling parameters to track synths"`

### R10 — Aplicación de Modelado Físico en Reproducción en Vivo
- **QUÉ**: CUANDO una pista con tipo de instrumento `guitar_pixel` inicie su reproducción en tiempo real, el sistema DEBE actualizar y aplicar los parámetros dinámicos de Dampening y Resonance al sintetizador `PluckSynth` en el `AudioEngine`.
- **TEST**: `tests/audioEngine.spec.ts` -> `"R9, R10: setupLoop should dynamically apply ADSR and physical modeling parameters to track synths"`

### R11 — Modulación ADSR en Preescucha (playNote)
- **QUÉ**: CUANDO el usuario realice una preescucha (función `playNote` en `AudioEngine`) de una nota individual sobre una pista activa, el sistema DEBE instanciar el sintetizador temporal aplicando los valores de envolvente ADSR de dicha pista.
- **TEST**: `tests/audioEngine.spec.ts` -> `"R11: playNote should apply ADSR envelope and physical modeling values to the preview synth"`

### R12 — Modulación ADSR y Modelado Físico en Exportación Offline
- **QUÉ**: CUANDO el usuario realice una exportación offline (`exportAudioOffline` en `AudioEngine`), el sistema DEBE aplicar los parámetros ADSR completos (y Dampening/Resonance para `guitar_pixel`) de cada pista al motor de síntesis offline para cada nota programada.
- **TEST**: `tests/audioEngine.spec.ts` -> `"R12: exportAudioOffline should apply ADSR and physical modeling parameters to the offline synths"`
