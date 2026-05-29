# Historial de Progreso

## Sesión: Inicialización del Repositorio (2026-05-28)
- Creados los archivos base del arnés.
- Verificado el entorno de desarrollo inicial.

## Sesión: Rediseño de Interfaz de Usuario (2026-05-28)
### Feature en curso
- `intuitive_ui_redesign` (Rediseño de interfaz intuitiva)

### Plan
- [x] T1 — Crear el componente reutilizable de perilla rotatoria `src/components/sequencer/Knob.vue` con soporte para interacciones drag de ratón y rotación del indicador visual. Cubre: R5, R6.
- [x] T2 — Implementar pruebas unitarias en `tests/components/Knob.spec.ts` para verificar la reactividad de la perilla, la rotación calculada y la emisión correcta de eventos `update:modelValue`. Cubre: R6.
- [x] T3 — Crear el componente `src/components/sequencer/DevicePanel.vue` con la estética retro-Eurorack pixel-art digital. Cubre: R4, R5.
- [x] T4 — Agrupar los controles en tres subsecciones dentro de `DevicePanel.vue`: Oscillator (tipo), ADSR (Knobs de Attack/Release) y FX Rack (Knobs de Reverb/Delay). Cubre: R5.
- [x] T5 — Implementar el mini-visualizador interactivo de envolvente en `DevicePanel.vue` utilizando Canvas o SVG dinámico. Cubre: R7.
- [x] T6 — Añadir la lógica reactiva en el mini-visualizador para redibujar la envolvente ADSR en tiempo real en response a cambios de Attack y Release. Cubre: R8.
- [x] T7 — Escribir pruebas unitarias en `tests/components/DevicePanel.spec.ts` para validar que el componente lee los datos de la pista seleccionada y que el visualizador de envolvente responde reactivamente al mutar parámetros. Cubre: R5, R7, R8.
- [x] T8 — Crear la constante `INSTRUMENT_CATEGORIES` para asociar tipos de instrumentos a categorías visuales y a sus respectivos iconos Lucide-Vue. Cubre: R10.
- [x] T9 — Modificar `src/App.vue` para simplificar la barra lateral izquierda (Slim Track Strips), integrando iconos de categorías, un slider horizontal ultra-compacto, y botones para duplicar/eliminar y mutear la pista. Cubre: R9, R10, R11.
- [x] T10 — Implementar en la barra lateral el borde de neón cyan activo sobre la tarjeta de la pista seleccionada. Cubre: R12.
- [x] T11 — Integrar el `<DevicePanel />` en la parte inferior del layout de `src/App.vue` con estado de visibilidad expandible/colapsable. Cubre: R1, R2, R3.
- [x] T12 — Escribir pruebas de componentes o BDD en `features/ui_layout.feature` para verificar la visibilidad condicional del panel inferior al hacer clic en el botón de expansión/colapso. Cubre: R2, R3, R12.
- [x] T13 — Agregar la barra de botones de salto rápido de octava ("Low", "Mid", "High") en `src/components/sequencer/PianoRoll.vue`. Cubre: R13.
- [x] T14 — Implementar la lógica de filtrado de filas de notas visibles basadas en la octava activa en `PianoRoll.vue`. Cubre: R14.
- [x] T15 — Agregar el selector "Scale Helper" en `PianoRoll.vue` con soporte para escalas Cromática, Do Mayor, Do Menor y La Menor. Cubre: R15.
- [x] T16 — Implementar la lógica y los estilos de sombreado visual de fondo para notas fuera de la escala seleccionada en el Piano Roll. Cubre: R16.
- [x] T17 — Agregar la superposición interactiva (overlay) con la letra de la nota sobre las celdas del Piano Roll cuando el cursor del ratón hace hover sobre ellas. Cubre: R17.
- [x] T18 — Implementar pruebas unitarias y de integración en `tests/components/PianoRoll.spec.ts` para validar el filtrado de octavas, la detección de notas en escala y el overlay de notas al hacer hover. Cubre: R14, R16, R17.
- [x] T19 — Modificar `src/components/sequencer/SongArranger.vue` para colorear los bloques colocados de forma distintiva según su `patternId` utilizando paletas de neón. Cubre: R19.
- [x] T20 — Ajustar la interacción de inserción de bloques para que sea alineada rigurosamente a la rejilla de Snap seleccionada. Cubre: R20.
- [x] T21 — Modificar el evento de clic en `SongArranger.vue` sobre bloques de patrón existentes para que se eliminen instantáneamente al hacer clic (click-to-remove). Cubre: R21.
- [x] T22 — Embellecer visualmente el playhead (timeline laser) en el Song Arranger dotándolo de un sombreado neon fluorescente. Cubre: R22.
- [x] T23 — Escribir pruebas en `tests/components/SongArranger.spec.ts` para verificar la correcta colocación y eliminación instantánea de bloques de patrones, además del posicionamiento del playhead láser. Cubre: R18, R20, R21, R22.
- [x] T24 — Ejecutar `./init.sh` para comprobar que la build compila sin errores y que todas las pruebas (nuevas y previas) pasan exitosamente al 100%. Cubre: R1-R22.

- [x] Implementación de todas las fases (Fase 1 a 6) completada con éxito.
- [x] Compilación y entorno validados en verde mediante `./init.sh`.
- [x] Esperando validación final y aprobación del subagente `reviewer` (APROBADO).

## Sesión: Biblioteca de Ritmos (Pattern Presets) (2026-05-28)
### Feature en curso
- `pattern_presets` (Biblioteca de ritmos predefinidos)

### Plan
- [x] T1 — Implementar limpieza de sintes en AudioEngine. Cubre: R3.
- [x] T2 — Definir constantes y acción de Presets en el Store. Cubre: R1, R3, R4, R5, R6.
- [x] T3 — Configurar carga inicial por defecto. Cubre: R1.
- [x] T4 — Añadir selector visual en la Barra Superior (Transport). Cubre: R2, R3, R4, R5, R6, R7.
- [x] T5 — Escribir Tests de Verificación. Cubre: R1, R3, R4, R5, R6, R7.
- [x] T6 — Ejecución y Verificación Final. Cubre: R1-R7.

- [x] Implementación completada con éxito y verificado con 100% de tests en verde.
- [x] Aprobado por el subagente `reviewer` con reporte en `progress/review_pattern_presets.md`.

## Sesión: Polifonía en Pistas (Track Polyphony) (2026-05-28)
### Feature en curso
- `track_polyphony` (Polifonía en pistas instrumentales)

### Plan
- [x] T1 — Modificar la interfaz TrackInstance en `src/stores/sequencer.ts` para cambiar el tipo de `notes` a `Record<number, string[]>`. Cubre: R1.
- [x] T2 — Actualizar el `state` inicial en `src/stores/sequencer.ts` para que la propiedad `notes` se inicialice como un objeto vacío `{}` pero tipado en conformidad con la firma de arreglos. Cubre: R1.
- [x] T3 — Modificar los datos estáticos de `PATTERN_PRESETS` en `src/stores/sequencer.ts` convirtiendo todas las notas de string a string[]. Cubre: R1.
- [x] T4 — Actualizar la acción `addNote` en `src/stores/sequencer.ts` para agregar la nota en el paso indicado sin duplicados. Cubre: R2.
- [x] T5 — Actualizar la acción `removeNote` en `src/stores/sequencer.ts` para recibir nota opcional y eliminar celdas individuales o el paso completo. Cubre: R3, R4, R5.
- [x] T6 — Actualizar la acción `getNoteAt` en `src/stores/sequencer.ts` para retornar `string[] | undefined`. Cubre: R6.
- [x] T7 — Implementar normalización de notas monofónicas (string -> [string]) en `loadProject` y `loadPreset` dentro de `src/stores/sequencer.ts`. Cubre: R7, R8.
- [x] T8 — Modificar `createSynthByType` en `src/audio/AudioEngine.ts` para envolver los sintetizadores melódicos en `Tone.PolySynth`. Cubre: R9, R10.
- [x] T9 — Adaptar la actualización dinámica del ADSR (`synth.set({ envelope: { attack, release } })`) en `AudioEngine.setupLoop`, `AudioEngine.playNote` y `AudioEngine.exportAudioOffline`. Cubre: R9, R11.
- [x] T10 — Modificar el ciclo de reproducción en tiempo real (`setupLoop`) en `AudioEngine.ts` para disparar arreglos de notas polifónicas y percusiones monofónicas. Cubre: R11, R12.
- [x] T11 — Adaptar `exportAudioOffline` en `AudioEngine.ts` para secuenciar polifónicamente las pistas. Cubre: R11, R12.
- [x] T12 — Adaptar la función `isNoteActive` en `src/components/sequencer/PianoRoll.vue` para verificar inclusión en el arreglo del paso. Cubre: R15.
- [x] T13 — Adaptar la función `getGhostNotes` en `src/components/sequencer/PianoRoll.vue` para buscar sobre arreglos de notas fantasma. Cubre: R16.
- [x] T14 — Adaptar la función `toggleNote` en `src/components/sequencer/PianoRoll.vue` para agregar nota o remover la nota individual pulsada. Cubre: R13, R14.
- [x] T15 — Modificar las pruebas de Cucumber en `features/sequencer_state.feature` adaptando el escenario monofónico a polifonía e integrando retrocompatibilidad. Cubre: R1-R7.
- [x] T16 — Actualizar los step definitions en `features/step_definitions/sequencer_state.steps.ts` para resolver de forma correcta arreglos de notas. Cubre: R1-R7.
- [x] T17 — Ejecutar `./init.sh` en el workspace para compilar y pasar la batería de tests en verde al 100%. Cubre: R1-R16.

- [x] Implementación completada con éxito, verificada con 100% de tests unitarios y Cucumber en verde.
- [x] Aprobado formalmente por el subagente `reviewer` con reporte en `progress/review_track_polyphony.md`.

## Sesión: Envolvente ADSR y Modelado Físico (adsr_envelope) (2026-05-29)
### Feature en curso
- `adsr_envelope` (Envolvente ADSR y Modelado Físico)

### Plan
- [x] T1 — Extender la interfaz `TrackInstance` en `src/stores/sequencer.ts` para incorporar las propiedades `decay`, `sustain`, `dampening` y `resonance`. Cubre: R1.
- [x] T2 — Actualizar la función de inicialización de pistas `createDefaultTrack` en `src/stores/sequencer.ts` para proveer los valores por defecto de la envolvente y el modelado físico. Cubre: R2.
- [x] T3 — Actualizar la colección estática de `PATTERN_PRESETS` en `src/stores/sequencer.ts` asignando valores coherentes de `decay`, `sustain`, `dampening` y `resonance` a cada una de las pistas predefinidas de todos los géneros. Cubre: R2.
- [x] T4 — Modificar las acciones de carga `loadProject` y `loadPreset` en `src/stores/sequencer.ts` agregando asignaciones fallback (valores por defecto) para pistas legadas cargadas de archivos externos o presets que no contengan los nuevos parámetros. Cubre: R2.
- [x] T5 — Actualizar la acción `setTrackADSR` y añadir la nueva acción `setTrackPhysicalModel` en `src/stores/sequencer.ts` para mutar los parámetros en el store. Cubre: R3, R4.
- [x] T6 — Escribir pruebas unitarias en `tests/presets.spec.ts` o un archivo específico para validar que las mutaciones y acciones del store funcionan correctamente y que el modelo inicializa las propiedades requeridas. Cubre: R1, R2, R3, R4.
- [x] T7 — Integrar dos nuevas perillas `<Knob />` vinculadas de forma reactiva y bidireccional a los parámetros de `Decay` y `Sustain` de la pista activa seleccionada en `src/components/sequencer/DevicePanel.vue`. Cubre: R5.
- [x] T8 — Implementar en `DevicePanel.vue` la subsección interactiva condicional `Physical Modeling` con perillas `<Knob />` específicas para `Dampening` y `Resonance` que se renderice únicamente cuando el tipo de sintetizador sea `guitar_pixel`. Cubre: R6, R7.
- [x] T9 — Rediseñar las fórmulas computadas de dimensionamiento (`aWidth`, `rWidth`, `dw`, `sh`) y la trayectoria SVG `envelopePath` en `DevicePanel.vue` para proyectar fielmente en el minigráfico los cambios en tiempo real del ADSR. Cubre: R8.
- [x] T10 — Actualizar y escribir pruebas unitarias de componentes en `tests/components/DevicePanel.spec.ts` para verificar la interactividad de las nuevas perillas, la visibilidad condicional de los controles de modelado físico y que la curva SVG cambie dinámicamente. Cubre: R5, R6, R7, R8.
- [x] T11 — Actualizar la lógica en `AudioEngine.setupLoop` en `src/audio/AudioEngine.ts` para que al reproducir notas en vivo, se aplique reactiva y dinámicamente el ADSR completo (`attack`, `decay`, `sustain`, `release`) al sintetizador, así como el modelado físico (`dampening`, `resonance`) si el tipo es `guitar_pixel`. Cubre: R9, R10.
- [x] T12 — Modificar la función de preescucha `playNote` en `src/audio/AudioEngine.ts` para instanciar el sintetizador aplicando la envolvente ADSR completa de la pista. Cubre: R11.
- [x] T13 — Adaptar la exportación de audio `exportAudioOffline` en `src/audio/AudioEngine.ts` para que configure de forma robusta la envolvente ADSR completa y las propiedades de modelado físico de Karplus-Strong en cada nodo de sintetizador offline del renderizador. Cubre: R12.
- [x] T14 — Escribir pruebas unitarias de integración del motor de audio (o mocks extendidos en `tests/setup.ts` / tests de integración) que validen el mapeo y aplicación correcta de envolventes y modelados en vivo, preview y exportación offline. Cubre: R9, R10, R11, R12.
- [x] T15 — Ejecutar `./init.sh` en el workspace confirmando que el entorno compila en verde y que la suite completa de tests de componentes, unitarios e integración se ejecuta exitosamente al 100%. Cubre: R1-R12.

- [x] Implementación y trazabilidad completadas al 100%.
- [x] Todos los 62 tests pasaron exitosamente.
- [x] Aprobado por el subagente `reviewer` en `progress/review_adsr_envelope.md`.

## Sesión: ADSR Percussion Conditional Visibility (2026-05-29)
### Feature en curso
- `adsr_envelope` (en la rama `feature/adsr-envelope`)

### Plan
- [x] T16 — Ocultar controles ADSR y curva SVG en `DevicePanel.vue` para pistas de percusión y renderizar bloque informativo de modulación automática. Cubre: R13.
- [x] T17 — Agregar pruebas de componente correspondientes en `DevicePanel.spec.ts`. Cubre: R13.
- [x] T15 — Verificación final del entorno y paso completo de tests con `./init.sh`. Cubre: R1-R13.

- [x] Tareas finalizadas y validadas al 100% de éxito.
- [x] Aprobado por el subagente `reviewer` con veredicto APPROVED en `progress/review_adsr_envelope.md`.

## Sesión: Corrección de Bug en Guitar Pixel (Classic Guitar PluckSynth) (2026-05-29)
### Feature en curso
- `classic_guitar_bugfix` (en la rama `bugfix/classic-guitar-voice`)

### Plan
- [x] T1 — Implementar la clase de envoltura `PolyPluckSynth` en `src/audio/AudioEngine.ts` para gestionar un pool de voces de `Tone.PluckSynth` de forma rotatoria y polyfónica. Cubre: R1, R2, R3, R4, R5.
- [x] T2 — Actualizar el caso de inicialización `guitar_pixel` en `createSynthByType` para instanciar `PolyPluckSynth` en lugar de intentar envolverlo en `Tone.PolySynth`. Cubre: R1.
- [x] T3 — Agregar pruebas unitarias e integración en `tests/audioEngine.spec.ts` para verificar la estabilidad de `guitar_pixel` en reproducción y evitar errores de herencia de `Monophonic`. Cubre: R1, R2, R3, R4, R5.
- [x] T4 — Ejecutar `./init.sh` en el workspace para certificar que compila y que todas las pruebas pasan exitosamente al 100%. Cubre: R1-R5.

- [x] Corrección completada con éxito.
- [x] Toda la suite de 64 tests pasa al 100%.
- [x] Aprobado formalmente por el subagente `reviewer` en `progress/review_classic_guitar_bugfix.md`.

## Sesión: Selector de Instrumentos y Layout Eurorack (2026-05-29)
### Feature en curso
- `instrument_selector_improvement` (Rediseño del selector de instrumentos)

### Plan
- [x] T1 — Modificar `src/components/sequencer/DevicePanel.vue` para expandir la constante `INSTRUMENTS` de 24 a exactamente 30 instrumentos, incorporando a cada definición su categoría correspondiente (`'WAV' | 'SYN' | 'DRM' | 'KEY'`) e iconos descriptivos de píxeles. Cubre: R1, R2.
- [x] T2 — Definir el tipo `InstrumentCategory` e interfaz `InstrumentDefinition` en `DevicePanel.vue` para garantizar robustez y tipado estricto en TypeScript. Cubre: R1, R2.
- [x] T3 — Declarar e inicializar el estado reactivo local `activeTab` (`ref<InstrumentCategory>('WAV')`) en `DevicePanel.vue` para rastrear la pestaña seleccionada. Cubre: R3.
- [x] T4 — Crear la propiedad computada `filteredInstruments` en `DevicePanel.vue` que filtre los 30 instrumentos del catálogo global y retorne sólo aquellos que pertenezcan a la pestaña activa `activeTab`. Cubre: R4.
- [x] T5 — Implementar el observador reactivo (`watch`) en `DevicePanel.vue` sobre `selectedTrack.value?.type` para sincronizar y auto-enfocar automáticamente la pestaña `activeTab` según la categoría del instrumento de la pista enfocada en el secuenciador. Cubre: R8, R9.
- [x] T6 — Rediseñar el HTML de la Oscillator Section en la plantilla de `DevicePanel.vue` para renderizar horizontalmente las cuatro pestañas `WAV`, `SYN`, `DRM` y `KEY` con estilos retro-futuristas de Tailwind v4 y controladores de cambio al hacer clic. Cubre: R3, R4.
- [x] T7 — Reemplazar la grilla de instrumentos por una rejilla compacta de dos columnas (`grid-cols-2`) que renderice la colección computada de `filteredInstruments`. Cubre: R5.
- [x] T8 — Configurar cada botón de instrumento de la rejilla con una altura física fija y compacta de exactamente `24px` (`h-6`) y asegurar que el click llame a la propiedad de actualización `trackType`. Cubre: R6, R10.
- [x] T9 — Aplicar clases condicionales a los botones de instrumento en la rejilla para destacar visualmente el instrumento activo de la pista seleccionada (borde neón y fondo translúcido). Cubre: R7.
- [x] T10 — Actualizar y ampliar la suite de pruebas unitarias de componentes en `tests/components/DevicePanel.spec.ts` para verificar la cobertura completa de los nuevos requerimientos. Cubre: R1-R10.
- [x] T11 — Ejecutar la inicialización y suite de pruebas del proyecto (`./init.sh`) verificando que compile sin errores y que todas las pruebas (las existentes y las nuevas) pasen exitosamente al 100% en color verde. Cubre: R1-R10.

- [x] Implementación completada con éxito.
- [x] Todas las pruebas (65 tests en verde) pasan perfectamente.
- [x] Aprobado por el subagente `reviewer` en `progress/review_instrument_selector_improvement.md`.

## Sesión: Corrección de Bug de Volumen Inaudible en Percusión Tonal (2026-05-29)
### Feature en curso
- `tonal_percussion_bugfix` (en la rama `bugfix/tonal-percussion-volume`)

### Plan
- [x] T1 — Modificar `AudioEngine.setupLoop` en `src/audio/AudioEngine.ts` para disparar instrumentos de percusión tonal (`kick`, `tom`, `conga`, `woodblock`) usando la nota programada (o fallback `'C2'`) en lugar del valor `'16n'`.
- [x] T2 — Modificar `AudioEngine.playNote` en `src/audio/AudioEngine.ts` para reproducir notas de preescucha con tono en percusión de membrana.
- [x] T3 — Modificar `AudioEngine.exportAudioOffline` en `src/audio/AudioEngine.ts` para renderizar la exportación offline usando notas reales en percusión de membrana.
- [x] T4 — Escribir pruebas unitarias e integración en `tests/audioEngine.spec.ts` que validen el paso de notas tonales y duración adecuada a los sintetizadores de membrana.
- [x] T5 — Ejecutar `./init.sh` en el workspace para certificar que compila y que todas las pruebas pasan exitosamente al 100%.

- [x] Bug corregido con éxito aplicando comprobaciones y fallbacks robustos para kick, tom, conga y woodblock.
- [x] Toda la suite completa de 68 tests (incluyendo 3 nuevos tests dedicados) pasa al 100%.
- [x] Aprobado formalmente por el subagente `reviewer` en `progress/review_tonal_percussion_bugfix.md`.

## Sesión: Ampliación de Instrumentos a 33 tipos (instruments_expansion) (2026-05-29)
### Feature en curso
- `instruments_expansion` (en la rama `feature/instruments-expansion`)

### Plan
- [x] T1 — Añadir los nuevos literales en `src/stores/sequencer.ts`. Cubre: R1.
- [x] T2 — Agregar los tres registros a `INSTRUMENTS` y actualizar `isPercussion` en `src/components/sequencer/DevicePanel.vue`. Cubre: R2, R3.
- [x] T3 — Implementar la clase de envoltura `ExplosionSynth` en `src/audio/AudioEngine.ts`. Cubre: R4.
- [x] T4 — Actualizar flujos de percusión en `src/audio/AudioEngine.ts` (`setupLoop`, `playNote`, `exportAudioOffline`). Cubre: R5, R6.
- [x] T5 — Implementar la creación de sintetizadores en `createSynthByType` para `fat_square`, `retro_laser` y `retro_explosion` en `src/audio/AudioEngine.ts`. Cubre: R7.
- [x] T6 — Escribir pruebas unitarias en `tests/audioEngine.spec.ts` para verificar instanciación y disparo de los nuevos instrumentos. Cubre: R1, R4, R7.

- [x] Implementación completada con éxito.
- [x] Todas las pruebas (71 tests en verde) pasan perfectamente.
- [x] Compilación de producción validada exitosamente.
- [x] Aprobado por el subagente `reviewer` con veredicto APPROVED en `progress/review_instruments_expansion.md`.
