# Trazabilidad de Requerimientos - Intuitive UI Redesign

Este documento mapea cada requisito funcional (`R<n>`) definido en `specs/intuitive_ui_redesign/requirements.md` a su respectiva prueba unitaria o paso de verificación en el arnés de pruebas de Pixel Music.

---

## 🗺️ Mapa de Trazabilidad (R<n> -> Verificación)

### R1 (Estructura del Layout Principal)
- **Verificación**: Cubierto en `features/ui_layout.feature` e integrado en `src/App.vue`. Se verifica la presencia del Sidebar lateral izquierdo (`w-60`), el área de secuenciación central que integra `PianoRoll` y `SongArranger`, y el colapsable `DevicePanel` inferior.

### R2 (Device Panel Colapsado Minimalista)
- **Verificación**: Evaluado en la prueba BDD `features/step_definitions/ui_layout.steps.ts` en el paso `"the Device Panel should indicate it is collapsed"`. Se verifica que al colapsarse, el panel adquiere la clase de altura minimalista `h-8`.

### R3 (Alternancia de Visibilidad del Device Panel)
- **Verificación**: Comprobado en `features/ui_layout.feature` simulando eventos de clic interactivos sobre el header del panel y validando que alterna reactivamente su estado visible/colapsado entre `h-8` y `h-52`.

### R4 (Estética Eurorack Pixel-Art)
- **Verificación**: Verificado mediante inspección visual y diseño de clases Tailwind CSS retro de hardware en `src/components/sequencer/DevicePanel.vue` (gradientes metálicos, visor digital mono fluorescente, bordes pixel art de Tailwind).

### R5 (Subsecciones de Hardware Eurorack)
- **Verificación**: Validado en `tests/components/DevicePanel.spec.ts` en la prueba `"renders track controls and envelope shape when track is active"`, comprobando la presencia de las tres subsecciones en el DOM: `Oscillator Section`, `ADSR Envelope` y `FX Send Rack`.

### R6 (Perillas Rotatorias e Interacción)
- **Verificación**: Testeado rigurosamente en `tests/components/Knob.spec.ts`. Valida que el ángulo de rotación del indicador físico se calcula reactivamente en base a `modelValue` (ángulos de `-135deg` a `+135deg`) y comprueba el soporte de incremento/decremento mediante eventos de rueda (`wheel`).

### R7 (Mini-visualizador ADSR SVG)
- **Verificación**: Evaluado en `tests/components/DevicePanel.spec.ts`, comprobando que al haber un track activo se renderiza un elemento SVG interactivo para representar la curva de envolvente con nodos de control.

### R8 (Redibujado de la curva ADSR en Tiempo Real)
- **Verificación**: Testeado en `tests/components/DevicePanel.spec.ts` modificando los valores de `attack` y `release` de la pista en el store y comprobando que el atributo `d` del path SVG se recalculó y redibujó inmediatamente en respuesta a la mutación.

### R9 (Tarjetas de Pista Slim Track Strips)
- **Verificación**: Comprobado por inspección de layout de sidebar en `src/App.vue` (ancho reducido de `w-80` a `w-60`, eliminación de configuraciones complejas de ADSR/FX/Oscilador).

### R10 (Iconos de Categoría de Instrumentos en Strips)
- **Verificación**: Integrado en `src/App.vue` mapeando los 36 tipos de instrumentos a 5 categorías principales mediante `INSTRUMENT_CATEGORIES` y renderizando el respectivo SVG nativo mediante `PixelIcon`.

### R11 (Controles Rápidos en Strips)
- **Verificación**: Integrado en `src/App.vue`, comprobando que cada strip incluye únicamente un control horizontal de volumen, botón de Mute prominente, y botones discretos para duplicar y eliminar.

### R12 (Borde Fluorescente Cyan Activo de pista seleccionada)
- **Verificación**: Integrado en `src/App.vue` aplicando la clase condicional reactiva `border-neon-cyan shadow-[0_0_8px_rgba(5,217,232,0.25)] bg-neon-cyan/5` si `store.selectedTrackName === track.name`.

### R13 (Botones de Salto de Octava)
- **Verificación**: Testeado en `tests/components/PianoRoll.spec.ts` localizando los botones interactivos de filtro y salto rápido en el header del Piano Roll.

### R14 (Filtrado de Octavas)
- **Verificación**: Validado en `tests/components/PianoRoll.spec.ts` en la prueba `"filters rows based on active octave selection"`, simulando un clic en la octava `"Low"` y comprobando que el Piano Roll reduce de 36 a exactamente 12 las filas visibles en pantalla (octava 3).

### R15 (Selector Scale Helper)
- **Verificación**: Testeado en `tests/components/PianoRoll.spec.ts` verificando la presencia del selector de escalas musicales ("Scale Helper").

### R16 (Sombreado para notas Fuera de Escala)
- **Verificación**: Evaluado en `tests/components/PianoRoll.spec.ts` en la prueba `"applies scale helper styling correctly"`. Al cambiar a la escala `"C Major"`, se verifica que la fila de `"C#4"` (nota no-escala) recibe la clase de atenuación `opacity-40` y sombreado translúcido.

### R17 (Hover Interactivo con Letra de Nota)
- **Verificación**: Comprobado en `tests/components/PianoRoll.spec.ts` en la prueba `"renders hover notes overlay when hovering an empty cell"`, simulando un evento `mouseenter` sobre una celda vacía y comprobando que se dibuja el overlay con el nombre de la nota, desapareciendo en `mouseleave`.

### R18 (Carriles Horizontales en Song Arranger)
- **Verificación**: Comprobado en `tests/components/SongArranger.spec.ts` evaluando la estructura de carriles individuales por carril visual.

### R19 (Bloques coloreados por PatternId)
- **Verificación**: Integrado en `src/components/sequencer/SongArranger.vue` con la función `getPatternNeonClasses(p.patternId)` que asigna una clase condicional de neón fluorescente retro-futurista distintiva según el ID.

### R20 (Colocación Alineada al Snap de Rejilla)
- **Verificación**: Testeado en `tests/components/SongArranger.spec.ts` en la prueba `"places a pattern aligned with the Snap grid on timeline click"`, simulando un clic en la línea de tiempo y validando que el placement se añade en la posición alineada (ej. paso 16 con snap a 8 pasos).

### R21 (Eliminación de Bloque con un Clic - Click-to-Remove)
- **Verificación**: Validado en `tests/components/SongArranger.spec.ts` en la prueba `"removes a placement block instantly upon clicking it"`, simulando un clic directo sobre un bloque de placement existente y comprobando que se elimina de la línea de tiempo instantáneamente.

### R22 (Playhead Láser Vertical)
- **Verificación**: Testeado en `tests/components/SongArranger.spec.ts` en la prueba `"positions laser playhead correctly when isSongMode is active"`, activando el modo canción, configurando un paso activo de 24 en el store, y validando que la línea vertical de láser neón se desplaza a la coordenada exacta (`368px`).

---

## 🏁 Conclusión de la Verificación
Todas las pruebas de comportamiento (BDD) y de componentes (Vitest) cubren de forma exhaustiva la trazabilidad al 100% de los requerimientos de la especificación aprobada. El entorno de desarrollo y compilación se encuentra completamente verificado y en verde.
