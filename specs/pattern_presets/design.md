# Design — Pattern Presets

Este diseño especifica los cambios de arquitectura y flujos de datos para implementar la funcionalidad **Pattern Presets** con total sincronización de audio (Tone.js) y estado (Pinia).

## 1. Archivos a crear o modificar

### A. `src/audio/AudioEngine.ts` (Modificación)
*   **Adición**: Método estático `clearAllSynths()` para desechar ordenadamente todos los nodos de audio instanciados.
*   **Propósito**: Liberar memoria y evitar que sintetizadores huérfanos sigan conectados a los buses de mezcla Master cuando se reemplazan las pistas por un nuevo preset.

### B. `src/stores/sequencer.ts` (Modificación)
*   **Adición**: Declarar la constante `PATTERN_PRESETS` que contenga la definición de los 4 presets (`Chiptune Techno`, `Synthwave Retro`, `8-Bit Rock`, y `Ambient Space`) junto con la plantilla `Empty` para la opción de limpieza completa.
*   **Modificación**: Ajustar el estado inicial (`state`) del store para inicializar `patterns[1]` con los datos correspondientes al preset `'Chiptune Techno'` y establecer `bpm` a `130` (en lugar de arrancar con una pista vacía por defecto).
*   **Adición**: Método/Acción `loadPreset(presetName: string)` que realice:
    1.  Llamar a `AudioEngine.clearAllSynths()`.
    2.  Actualizar la lista de pistas del patrón actual (`this.patterns[this.currentPatternId].tracks`) con una copia limpia (`JSON.parse(JSON.stringify(...))`) de los datos del preset.
    3.  Actualizar el tempo general `this.setBpm(preset.bpm)`.
    4.  Actualizar la pista seleccionada `this.selectedTrackName` con el nombre de la primera pista del preset.

### C. `src/components/sequencer/Transport.vue` (Modificación)
*   **Adición**: Añadir un selector `<select>` en la barra superior (junto a los botones de play/record/render) con diseño Cyberpunk / Neon retro de Tailwind v4.
*   **Comportamiento**:
    *   Listará las opciones disponibles: `Chiptune Techno`, `Synthwave Retro`, `8-Bit Rock`, `Ambient Space` y `Empty (Limpiar Todo)`.
    *   Al cambiar el valor seleccionado, se invocará la acción `store.loadPreset(value)`.
    *   El valor seleccionado inicial coincidirá con el preset cargado.

---

## 2. Firmas nuevas y Estructuras de Datos

### Estructura del preset en `src/stores/sequencer.ts`
```typescript
export interface PresetDefinition {
  name: string;
  bpm: number;
  tracks: Array<{
    name: string;
    type: InstrumentType;
    volume: number;
    reverbWet: number;
    delayWet: number;
    muted: boolean;
    attack: number;
    release: number;
    notes: Record<number, string>; // step -> note
  }>;
}
```

### Nueva firma en `AudioEngine.ts`
```typescript
public static clearAllSynths(): void {
  this.trackNodes.forEach((nodes) => {
    nodes.synth.dispose();
    nodes.reverb.dispose();
    nodes.delay.dispose();
  });
  this.trackNodes.clear();
}
```

### Nueva firma en `sequencer.ts` (acciones del store)
```typescript
loadPreset(presetName: string): void {
  const preset = PATTERN_PRESETS[presetName];
  if (!preset) return;
  
  // 1. Limpiar nodos del motor de audio
  AudioEngine.clearAllSynths();

  // 2. Sobreescribir las pistas del patrón activo
  const currentPattern = this.patterns[this.currentPatternId];
  if (currentPattern) {
    currentPattern.tracks = JSON.parse(JSON.stringify(preset.tracks));
  }

  // 3. Modificar BPM
  this.setBpm(preset.bpm);

  // 4. Seleccionar la primera pista por defecto
  if (preset.tracks.length > 0) {
    this.selectedTrackName = preset.tracks[0].name;
  }
}
```

---

## 3. Excepciones y Casos de Borde
*   **Cambio en Caliente (Durante la Reproducción)**: Si el secuenciador se encuentra en estado `'started'`, al ejecutar `loadPreset()`, `AudioEngine.clearAllSynths()` eliminará los sintes viejos sin alterar la línea de tiempo de `Tone.Transport`. En la siguiente semicorchea (`16n`), el bucle de secuenciación de `AudioEngine` detectará la ausencia de nodos para las nuevas pistas y creará sus sintetizadores correspondientes de forma transparente llamando a `getOrCreateLiveNodes()`. Esto garantiza que la transición ocurra al vuelo (on-the-fly) sin cuelgues ni necesidad de reiniciar el audio manualmente.
*   **Nombre de preset inexistente**: Si se pasa un valor que no existe en el catálogo, la acción del store simplemente retornará temprano sin causar efectos colaterales (safeguard).

---

## 4. Alternativa Descartada y Justificación
*   **Alternativa descartada**: Mantener los sintetizadores instanciados en `trackNodes` al cargar el preset y limitarse a mutar sus propiedades de envolvente (`attack`, `release`) y oscilador en caliente.
*   **Justificación**: Las diferentes pistas de un preset pueden definir tipos de sintetizador radicalmente distintos (p. ej. la pista 3 en 'Chiptune Techno' es de tipo `'acid_synth'`, mientras que en 'Synthwave Retro' es de tipo `'bass_synth'`). En Tone.js, estos instrumentos usan clases subyacentes totalmente diferentes (`MonoSynth` vs `FMSynth`). No es posible mutar el tipo de clase subyacente de un nodo de Tone.js ya creado. Forzar esto causaría errores de tipo en tiempo de ejecución o requeriría una lógica de conversión excesivamente compleja y propensa a fallos. Liberar todos los sintes actuales mediante `clearAllSynths()` y dejar que el motor los recree bajo demanda es significativamente más simple, robusto y está alineado con el ciclo de vida reactivo de la aplicación.
