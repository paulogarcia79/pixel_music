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

