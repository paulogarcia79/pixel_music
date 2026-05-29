# Tasks: ADSR Envelope and Physical Modeling

Este documento enumera los pasos concretos e incrementales para implementar la feature `adsr_envelope` en conformidad con el proceso SDD (Spec Driven Development).

---

## Fase 1: Store y Normalización de Datos

- [x] T1 — Extender la interfaz `TrackInstance` en `src/stores/sequencer.ts` para incorporar las propiedades `decay`, `sustain`, `dampening` y `resonance`. Cubre: R1.
- [x] T2 — Actualizar la función de inicialización de pistas `createDefaultTrack` en `src/stores/sequencer.ts` para proveer los valores por defecto de la envolvente y el modelado físico. Cubre: R2.
- [x] T3 — Actualizar la colección estática de `PATTERN_PRESETS` en `src/stores/sequencer.ts` asignando valores coherentes de `decay`, `sustain`, `dampening` y `resonance` a cada una de las pistas predefinidas de todos los géneros. Cubre: R2.
- [x] T4 — Modificar las acciones de carga `loadProject` y `loadPreset` en `src/stores/sequencer.ts` agregando asignaciones fallback (valores por defecto) para pistas legadas cargadas de archivos externos o presets que no contengan los nuevos parámetros. Cubre: R2.
- [x] T5 — Actualizar la acción `setTrackADSR` y añadir la nueva acción `setTrackPhysicalModel` en `src/stores/sequencer.ts` para mutar los parámetros en el store. Cubre: R3, R4.
- [x] T6 — Escribir pruebas unitarias en `tests/presets.spec.ts` o un archivo específico para validar que las mutaciones y acciones del store funcionan correctamente y que el modelo inicializa las propiedades requeridas. Cubre: R1, R2, R3, R4.

---

## Fase 2: Interfaz de Usuario (Device Panel Eurorack)

- [x] T7 — Integrar dos nuevas perillas `<Knob />` vinculadas de forma reactiva y bidireccional a los parámetros de `Decay` y `Sustain` de la pista activa seleccionada en `src/components/sequencer/DevicePanel.vue`. Cubre: R5.
- [x] T8 — Implementar en `DevicePanel.vue` la subsección interactiva condicional `Physical Modeling` con perillas `<Knob />` específicas para `Dampening` y `Resonance` que se renderice únicamente cuando el tipo de sintetizador sea `guitar_pixel`. Cubre: R6, R7.
- [x] T9 — Rediseñar las fórmulas computadas de dimensionamiento (`aWidth`, `rWidth`, `dw`, `sh`) y la trayectoria SVG `envelopePath` en `DevicePanel.vue` para proyectar fielmente en el minigráfico los cambios en tiempo real del ADSR. Cubre: R8.
- [x] T10 — Actualizar y escribir pruebas unitarias de componentes en `tests/components/DevicePanel.spec.ts` para verificar la interactividad de las nuevas perillas, la visibilidad condicional de los controles de modelado físico y que la curva SVG cambie dinámicamente. Cubre: R5, R6, R7, R8.

---

## Fase 3: Motor de Audio (AudioEngine) y Modulación

- [x] T11 — Actualizar la lógica en `AudioEngine.setupLoop` en `src/audio/AudioEngine.ts` para que al reproducir notas en vivo, se aplique reactiva y dinámicamente el ADSR completo (`attack`, `decay`, `sustain`, `release`) al sintetizador, así como el modelado físico (`dampening`, `resonance`) si el tipo es `guitar_pixel`. Cubre: R9, R10.
- [x] T12 — Modificar la función de preescucha `playNote` en `src/audio/AudioEngine.ts` para instanciar el sintetizador aplicando la envolvente ADSR completa de la pista. Cubre: R11.
- [x] T13 — Adaptar la exportación de audio `exportAudioOffline` en `src/audio/AudioEngine.ts` para que configure de forma robusta la envolvente ADSR completa y las propiedades de modelado físico de Karplus-Strong en cada nodo de sintetizador offline del renderizador. Cubre: R12.
- [x] T14 — Escribir pruebas unitarias de integración del motor de audio (o mocks extendidos en `tests/setup.ts` / tests de integración) que validen el mapeo y aplicación correcta de envolventes y modelados en vivo, preview y exportación offline. Cubre: R9, R10, R11, R12.
- [x] T16 — Implementar en `DevicePanel.vue` el ocultamiento condicional de controles ADSR y curva SVG para pistas de tipo percusión, mostrando en su lugar el bloque informativo con el mensaje retro de modulación automática. Cubre: R13.
- [x] T17 — Actualizar las pruebas unitarias de componentes en `tests/components/DevicePanel.spec.ts` para verificar que los controles ADSR y la curva SVG se ocultan correctamente cuando la pista activa seleccionada es de tipo percusión, y que se muestra el mensaje explicativo. Cubre: R13.
- [ ] T15 — Ejecutar `./init.sh` en el workspace confirmando que el entorno compila en verde y que la suite completa de tests de componentes, unitarios e integración se ejecuta exitosamente al 100%. Cubre: R1-R13.
