# Technical Design: ADSR Envelope and Physical Modeling

Este documento detalla las decisiones técnicas, cambios de arquitectura y modificaciones en las interfaces para la implementación de la envolvente ADSR completa y el modelado físico en Pixel Music.

---

## 1. Archivos Afectados

El desarrollo afectará a los siguientes componentes existentes:
- `src/stores/sequencer.ts` (Store de Pinia y normalización de presets)
- `src/audio/AudioEngine.ts` (Motor de audio, reproducción, preescucha y exportación offline)
- `src/components/sequencer/DevicePanel.vue` (Panel Eurorack de instrumentos y envolvente)

---

## 2. Modificaciones de Interfaces y Firmas Nuevas

### A. Store (`src/stores/sequencer.ts`)

La interfaz `TrackInstance` se extenderá con cuatro nuevas propiedades numéricas:
```typescript
export interface TrackInstance {
  // ... propiedades existentes (name, notes, type, volume, reverbWet, delayWet, muted, attack, release)
  decay: number;
  sustain: number;
  dampening: number;
  resonance: number;
}
```

La firma de la acción `setTrackADSR` se actualizará para incluir todos los campos de la envolvente:
```typescript
setTrackADSR(trackName: string, attack: number, decay: number, sustain: number, release: number): void
```

Se añadirá una nueva acción para gestionar el modelado físico en pistas basadas en cuerdas o algoritmos físicos (como `guitar_pixel`):
```typescript
setTrackPhysicalModel(trackName: string, dampening: number, resonance: number): void
```

Se actualizarán `createDefaultTrack`, `loadProject` y `loadPreset` para inicializar y normalizar estos campos con valores por defecto estables:
- `decay`: `0.1` (segundos)
- `sustain`: `0.8` (ganancia, de `0.0` a `1.0`)
- `dampening`: `4000` (Hz)
- `resonance`: `0.95` (factor, de `0.0` a `1.0`)

---

## 3. Lógica del Motor de Audio (`src/audio/AudioEngine.ts`)

### A. Modulación de Envolvente ADSR Completa
En las fases de reproducción en tiempo real (`setupLoop`), preescucha (`playNote`) y exportación offline (`exportAudioOffline`), se aplicará la modulación ADSR completa al sintetizador.
- Si el sintetizador expone directamente la propiedad `envelope` (ej. `MonoSynth` o `Synth`), se asignará directamente:
  ```typescript
  if (synth.envelope) {
    synth.envelope.attack = track.attack;
    synth.envelope.decay = track.decay;
    synth.envelope.sustain = track.sustain;
    synth.envelope.release = track.release;
  }
  ```
- Si es un `PolySynth` que requiere el método genérico `.set`, se actualizará mediante:
  ```typescript
  synth.set({
    envelope: {
      attack: track.attack,
      decay: track.decay,
      sustain: track.sustain,
      release: track.release
    }
  });
  ```

### B. Modulación de Modelado Físico
Para sintetizadores basados en el algoritmo Karplus-Strong de modelado físico (instrumento tipo `guitar_pixel`, que instancia `Tone.PluckSynth`), se aplicarán dinámicamente sus propiedades de amortiguación (`dampening`) y resonancia (`resonance`):
```typescript
if (track.type === 'guitar_pixel') {
  synth.set({
    dampening: track.dampening,
    resonance: track.resonance
  });
}
```

---

## 4. Cambios en la UI (`src/components/sequencer/DevicePanel.vue`)

### A. Panel ADSR de 4 Vías
Se integrarán perillas adicionales de tipo `<Knob />` en la sección de Envolvente ADSR para modelar `decay` y `sustain`:
- **Decay Knob**: Min `0.01`s, Max `2.0`s, Step `0.01`, Default `0.1`.
- **Sustain Knob**: Min `0.0` (0%), Max `1.0` (100%), Step `0.05`, Default `0.8`.

### B. Sección Dinámica de Modelado Físico
Se renderizará dinámicamente una nueva sección visual en el Device Panel si `selectedTrack.type === 'guitar_pixel'` llamada `Physical Modeling` con 2 perillas:
- **Dampening Knob**: Min `100` Hz, Max `8000` Hz, Step `100`, Default `4000`.
- **Resonance Knob**: Min `0.0`, Max `1.0` (o `0.99` para evitar retroalimentación infinita si aplica), Step `0.01`, Default `0.95`.

### C. Visualizador SVG Reactivo y Preciso
Se rediseñará la trayectoria del SVG para reflejar fielmente los valores del store.
Dimensiones visuales proporcionales calculadas:
- `aw` (Attack Width): `(attack - 0.001) / 2 * 45` px (rango: 0 a 45)
- `dw` (Decay Width): `(decay - 0.01) / 2 * 45` px (rango: 0 a 45)
- `sh` (Sustain Height / Eje Y): `80 - (sustain * 70)` px (rango: Y=80 [silencio] a Y=10 [ataque máximo])
- `rw` (Release Width): `(release - 0.01) / 4 * 50` px (rango: 0 a 50)
- `sw` (Sustain Width): Constante de `25` px

Puntos de la envolvente SVG (`envelopePath`):
1. Inicio (Suelo Izquierdo): `M 0 80`
2. Pico de Ataque: `L ${aw} 10`
3. Fin de Decaimiento (Nivel de Sostenido): `L ${aw + dw} ${sh}`
4. Fin de Sostenido (Inicio de Liberación): `L ${aw + dw + sw} ${sh}`
5. Fin de Liberación (Suelo Derecho): `L ${aw + dw + sw + rw} 80`

Se ajustará la posición (`cx`, `cy`) de los cuatro círculos decorativos e interactivos en el SVG para coincidir exactamente con estos puntos de control dinámicos.

### D. Sección de Percusión (Ocultamiento y Mensaje Informativo)
Si el tipo de pista activa corresponde a un instrumento percusivo (`['kick', 'snare', 'hihat', 'tom', 'clap', 'crash', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot']`), el panel ocultará por completo las perillas de control ADSR y la curva SVG. En su lugar, renderizará un contenedor oscuro informativo estilizado con el mensaje `"DRUM SYNTHESIS: TRANSIENT ENVELOPE IS AUTOMATIC"`, explicando que la síntesis percusiva de corta duración no requiere ni admite modulación ADSR prolongada.

---

## 5. Alternativa Descartada y Justificación

- **Alternativa descartada**: Implementar un mapeo global e interno de envolventes y modelados en el `AudioEngine` en lugar de persistirlos directamente en cada pista dentro del store de Pinia.
- **Justificación**: Descentralizar los parámetros de síntesis en el motor de audio rompería la arquitectura orientada al estado único del secuenciador. Provocaría incoherencias visuales en el Device Panel al alternar entre pistas, impediría la serialización/guardado nativo de canciones con envolventes personalizadas a través de `loadProject` y complicaría la retrocompatibilidad con proyectos cargados o presets existentes. Mantener toda la configuración de síntesis en el store de la pista garantiza reactividad instantánea, persistencia limpia en el JSON de exportación y trazabilidad absoluta.

---

## 6. Manejo de Excepciones

- No se añaden excepciones personalizadas adicionales, sino que se reutiliza el control de nulos existente. Si se intenta configurar parámetros para una pista inexistente, las acciones del store retornarán inmediatamente de forma silenciosa para evitar fallos catastróficos en tiempo de ejecución.
