# Tasks: Instrument Selector Improvement

Este documento enumera los pasos concretos e incrementales para implementar la feature `instrument_selector_improvement` en conformidad con el proceso SDD (Spec Driven Development).

---

## Fase 1: Catálogo y Preparación de Datos

- [x] T1 — Modificar `src/components/sequencer/DevicePanel.vue` para expandir la constante `INSTRUMENTS` de 24 a exactamente 30 instrumentos, incorporando a cada definición su categoría correspondiente (`'WAV' | 'SYN' | 'DRM' | 'KEY'`) e iconos descriptivos de píxeles. Cubre: R1, R2.
- [x] T2 — Definir el tipo `InstrumentCategory` e interfaz `InstrumentDefinition` en `DevicePanel.vue` para garantizar robustez y tipado estricto en TypeScript. Cubre: R1, R2.

---

## Fase 2: Implementación de la Interfaz y Reactividad

- [x] T3 — Declarar e inicializar el estado reactivo local `activeTab` (`ref<InstrumentCategory>('WAV')`) en `DevicePanel.vue` para rastrear la pestaña seleccionada. Cubre: R3.
- [x] T4 — Crear la propiedad computada `filteredInstruments` en `DevicePanel.vue` que filtre los 30 instrumentos del catálogo global y retorne sólo aquellos que pertenezcan a la pestaña activa `activeTab`. Cubre: R4.
- [x] T5 — Implementar el observador reactivo (`watch`) en `DevicePanel.vue` sobre `selectedTrack.value?.type` para sincronizar y auto-enfocar automáticamente la pestaña `activeTab` según la categoría del instrumento de la pista enfocada en el secuenciador. Cubre: R8, R9.
- [ ] T6 — Rediseñar el HTML de la Oscillator Section en la plantilla de `DevicePanel.vue` para renderizar horizontalmente las cuatro pestañas `WAV`, `SYN`, `DRM` y `KEY` con estilos retro-futuristas de Tailwind v4 y controladores de cambio al hacer clic. Cubre: R3, R4.
- [ ] T7 — Reemplazar la grilla de instrumentos por una rejilla compacta de dos columnas (`grid-cols-2`) que renderice la colección computada de `filteredInstruments`. Cubre: R5.
- [ ] T8 — Configurar cada botón de instrumento de la rejilla con una altura física fija y compacta de exactamente `24px` (`h-6`) y asegurar que el click llame a la propiedad de actualización `trackType`. Cubre: R6, R10.
- [ ] T9 — Aplicar clases condicionales a los botones de instrumento en la rejilla para destacar visualmente el instrumento activo de la pista seleccionada (borde neón y fondo translúcido). Cubre: R7.

---

## Fase 3: Pruebas y Verificación de Calidad

- [ ] T10 — Actualizar y ampliar la suite de pruebas unitarias de componentes en `tests/components/DevicePanel.spec.ts` para verificar la cobertura completa de los nuevos requerimientos:
    *   Verificar que se muestren las 4 pestañas (`WAV`, `SYN`, `DRM`, `KEY`) al cargar el panel con una pista activa.
    *   Verificar que los botones de instrumento tengan el layout de dos columnas y la clase de altura compacta de `24px` (`h-6`).
    *   Verificar que al cambiar de pestaña activa (haciendo clic en otra pestaña), se filtren y muestren sólo los instrumentos correspondientes.
    *   Verificar el auto-foco reactivo bidireccional: al cambiar el tipo de instrumento de la pista a percusión (ej. `kick`) o teclado (ej. `piano_pixel`), la pestaña activa cambia automáticamente a `DRM` o `KEY` respectivamente.
    *   Verificar que al hacer clic en un botón de instrumento se actualice la propiedad del store del secuenciador correspondientemente.
    Cubre: R1-R10.
- [ ] T11 — Ejecutar la inicialización y suite de pruebas del proyecto (`./init.sh`) verificando que compile sin errores y que todas las pruebas (las existentes y las nuevas) pasen exitosamente al 100% en color verde. Cubre: R1-R10.
