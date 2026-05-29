# Tasks — Pattern Presets

Checklist de implementación de la funcionalidad Pattern Presets. Todas las tareas deben completarse de forma secuencial por el `implementer`.

- [x] **T1 — Implementar limpieza de sintes en AudioEngine**
      Añadir el método estático `clearAllSynths` en `src/audio/AudioEngine.ts` que recorra y destruya todos los nodos de sintetizador, reverb y delay activos en `trackNodes`.
      *Cubre: R3*

- [x] **T2 — Definir constantes y acción de Presets en el Store**
      En `src/stores/sequencer.ts`, declarar el tipo `PresetDefinition`, estructurar la constante `PATTERN_PRESETS` con el catálogo acordado completo (Chiptune Techno, Synthwave Retro, 8-Bit Rock, Ambient Space y Empty), y codificar la acción `loadPreset(name: string)`.
      *Cubre: R1, R3, R4, R5, R6*

- [x] **T3 — Configurar carga inicial por defecto**
      Modificar el estado inicial (`state`) en `src/stores/sequencer.ts` para que, en lugar de inicializar con un patrón de pista vacía a 120 BPM, se cargue por defecto una copia limpia del preset `'Chiptune Techno'` con `bpm: 130`.
      *Cubre: R1*

- [x] **T4 — Añadir selector visual en la Barra Superior (Transport)**
      Insertar un selector `<select>` estilizado con estética retro Cyberpunk de Tailwind v4 en `src/components/sequencer/Transport.vue` para alternar entre los presets de catálogo y la opción de limpieza. Al cambiar de valor, debe llamar a la acción `loadPreset`.
      *Cubre: R2, R3, R4, R5, R6, R7*

- [x] **T5 — Escribir Tests de Verificación**
      Crear un archivo de pruebas `tests/presets.spec.ts` o añadir pruebas dedicadas para asegurar la correcta inicialización, la sobreescritura de pistas, el refresco de BPM, el comportamiento de la opción Empty y la invocación de `AudioEngine.clearAllSynths`.
      *Cubre: R1, R3, R4, R5, R6, R7*

- [x] **T6 — Ejecución y Verificación Final**
      Ejecutar `./init.sh` en el workspace para garantizar que toda la batería de tests pase satisfactoriamente en verde al 100% y que la compilación de TypeScript no arroje ningún error.
      *Cubre: R1, R2, R3, R4, R5, R6, R7*
