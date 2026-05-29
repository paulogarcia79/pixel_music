# Design — Track Polyphony

## 1. Archivos Modificados

### `src/stores/sequencer.ts`
- Se actualiza la interfaz `TrackInstance` para cambiar `notes: Record<number, string>` a `notes: Record<number, string[]>`.
- Se adaptan las acciones `addNote`, `removeNote`, `getNoteAt`, `loadProject` y `loadPreset`.
- Se actualizan los datos estáticos de `PATTERN_PRESETS` para inicializar notas en arreglos `[string]` en lugar de `string` planos, eliminando conflictos de tipos con TypeScript.
- Se actualiza el `state` inicial para que `patterns[1].tracks` comience con `notes: {}` correctamente tipado como `Record<number, string[]>`.

### `src/audio/AudioEngine.ts`
- Se adapta `createSynthByType` para envolver todos los sintetizadores melódicos en `Tone.PolySynth`. Los sintetizadores de percusión permanecen como monofónicos puros.
- Se actualiza la lógica de manipulación de envolventes ADSR (tanto en el bucle del secuenciador en tiempo real, renderizado offline y preview): dado que `Tone.PolySynth` no posee la propiedad `envelope` directamente (`synth.envelope` es `undefined`), se debe usar `synth.set({ envelope: { attack, release } })` si `envelope` no existe.
- Se modifica la reproducción del ciclo en tiempo real y el renderizado offline para disparar el array de notas directamente sobre los sintetizadores polifónicos, y controlar que las percusiones monofónicas se disparen una sola vez por paso si hay alguna nota activa en él.

### `src/components/sequencer/PianoRoll.vue`
- Se adapta `isNoteActive` para evaluar si la nota de la fila está incluida en el arreglo del paso actual.
- Se adapta `getGhostNotes` para buscar sobre los arreglos de notas en lugar de coincidencia directa de strings.
- Se adapta `toggleNote` para que remueva una nota individual mediante `store.removeNote(trackName, step, note)` si ya está activa, o la agregue a través de `store.addNote(trackName, step, note)` si no lo está. Se asegura que la previsualización al pulsar (`AudioEngine.playNote`) use únicamente la nota individual clickeada.

### `features/sequencer_state.feature` y `features/step_definitions/sequencer_state.steps.ts`
- Se actualizan los escenarios de prueba existentes. El escenario "Monophonic restriction in a track" se reemplaza o adapta por escenarios de polifonía, y se agregan escenarios para comprobar la normalización de retrocompatibilidad.

---

## 2. Nuevas Firmas y Cambios de Interfaz

### `TrackInstance` (Interface)
```typescript
export interface TrackInstance {
  name: string;
  notes: Record<number, string[]>; // step -> array de notas (Step Notes)
  type: InstrumentType;
  volume: number;
  reverbWet: number;
  delayWet: number;
  muted: boolean;
  attack: number;
  release: number;
}
```

### Store Actions (`src/stores/sequencer.ts`)
```typescript
addNote(trackName: string, step: number, note: string): void
// Agrega la nota al array notes[step] sin duplicados. Inicializa si es necesario.

removeNote(trackName: string, step: number, note?: string): void
// Si se provee `note`, remueve esa nota del arreglo notes[step].
// Si el arreglo resultante queda vacío, o si no se especificó `note`, elimina el step completo (delete notes[step]).

getNoteAt(trackName: string, step: number, patternId?: number): string[] | undefined
// Retorna el arreglo de notas para ese paso en la pista/patrón especificado.
```

---

## 3. Comportamiento en el Motor de Audio (Tone.js)

### Modificación en `createSynthByType`
Para todos los sintetizadores que no estén en la categoría de percusión (`kick`, `snare`, `hihat`, `clap`, `crash`, `noise`, `tom`, `conga`, `cowbell`, `woodblock`, `shaker`, `rimshot`), la creación se realiza envolviendo el sintetizador monofónico original en un `Tone.PolySynth`.

Ejemplo:
```typescript
case 'bass_synth':
  synth = new Tone.PolySynth(Tone.FMSynth, {
    ...common,
    harmonicity: 0.5,
    modulationIndex: 5,
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.5 }
  });
  break;
```

### Modificación al Configurar la Envolvente ADSR
Puesto que `Tone.PolySynth` no expone la propiedad `envelope` directamente, se implementa una asignación segura:
```typescript
if (synth.envelope) {
  synth.envelope.attack = track.attack;
  synth.envelope.release = track.release;
} else if (synth.set) {
  synth.set({
    envelope: {
      attack: track.attack,
      release: track.release
    }
  });
}
```
Esto aplica de manera idéntica en:
1. `AudioEngine.setupLoop` (reproductor en tiempo real).
2. `AudioEngine.playNote` (previsualización de celda).
3. `AudioEngine.exportAudioOffline` (renderizado offline).

---

## 4. Retrocompatibilidad y Normalización

Tanto en `loadProject(data)` como en `loadPreset(presetName)`, se implementa un bucle de normalización segura que recorre los pasos de cada pista:
```typescript
p.tracks.forEach(t => {
  if (t.notes) {
    Object.keys(t.notes).forEach(stepKey => {
      const step = parseInt(stepKey);
      const val = t.notes[step];
      if (typeof val === 'string') {
        t.notes[step] = [val];
      }
    });
  }
});
```

---

## 5. Alternativa Descartada y Justificación

### Alternativa Descartada
Mantener `notes: Record<number, string>` para pistas monofónicas y crear un nuevo campo `polyNotes: Record<number, string[]>` para pistas polifónicas, usando condicionales en toda la UI y motor de audio según el tipo de pista.

### Razón del Descarte
1. **Violación del Single Source of Truth**: Duplicar el origen de datos de las notas del secuenciador añade complejidad extrema, aumenta el riesgo de bugs de sincronización y ensucia la UI.
2. **Complejidad de Mantenimiento**: Cada visualizador, cargador, exportador y reproductor requeriría dos flujos paralelos de control de flujo.
3. **Solución Elegante**: Unificar todas las pistas para que almacenen arreglos de notas (`string[]`) limpia por completo la firma. Un track monofónico simplemente tendrá arreglos de un solo elemento (e.g., `['C4']`), lo cual es completamente soportado y simplifica las interfaces dramáticamente.
