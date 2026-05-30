# Technical Design: Modulation Effects, LFO, and Arpeggiator

Este documento detalla las decisiones técnicas, los archivos a modificar, las nuevas firmas, el enrutamiento del flujo de señal de audio y las alternativas consideradas para la feature de Efectos de Modulación, LFO y Arpegiador.

---

## 🏗️ Flujo de Señal de Audio por Pista (Audio Signal Chain)

Para soportar de manera eficiente los nuevos efectos sin necesidad de reconexión dinámica en caliente, cada pista contará con una cadena en serie permanente de efectos de modulación en `AudioEngine.ts`. 

```
[Instrument Synth] 
       │
       ▼
[lfoGain] (Tremolo, 1.0 por defecto)
       │
       ▼
[lfoFilter] (Lowpass Cutoff, 20000 Hz por defecto)
       │
       ▼
[Phaser] (Phaser FX, wet = 0 por defecto)
       │
       ▼
[Flanger] (Flanger FX, wet = 0 por defecto)
       │
       ▼
[Chorus] (Chorus FX, wet = 0 por defecto)
       │
       ▼
[FeedbackDelay] (Delay FX envío, wet = track.delayWet)
       │
       ▼
[Freeverb] (Reverb FX envío, wet = track.reverbWet)
       │
       ▼
[Master Compressor / Output]
```

---

## 📂 Archivos Modificados / Creados

### 1. `src/stores/sequencer.ts`
Agregaremos nuevas propiedades a la interfaz `TrackInstance` y nuevas acciones al store `useSequencerStore` para modificar los parámetros de Modulación, LFO y Arpegiador.

#### Cambios en interfaces y tipos:
* Modificación de la interfaz `TrackInstance`:
```typescript
export interface TrackInstance {
  // ... propiedades existentes (name, notes, type, volume, etc.)
  
  // Modulation FX Slot
  modFX_type: 'none' | 'chorus' | 'flanger' | 'phaser';
  modFX_rate: number;
  modFX_depth: number;
  modFX_wet: number;

  // LFO Modulator
  lfo_target: 'none' | 'pitch' | 'filter' | 'volume';
  lfo_rate: number;
  lfo_depth: number;
  lfo_waveform: 'sine' | 'triangle' | 'square' | 'sawtooth';

  // Arpeggiator
  arp_enabled: boolean;
  arp_rate: '8n' | '16n' | '32n';
  arp_direction: 'up' | 'down' | 'updown' | 'random';
  arp_octaves: number;
}
```

#### Valores por defecto en `createDefaultTrack`:
* `modFX_type = 'none'`, `modFX_rate = 1.5`, `modFX_depth = 0.5`, `modFX_wet = 0.5`
* `lfo_target = 'none'`, `lfo_rate = 5.0`, `lfo_depth = 0.5`, `lfo_waveform = 'sine'`
* `arp_enabled = false`, `arp_rate = '16n'`, `arp_direction = 'up'`, `arp_octaves = 1`

#### Nuevas acciones (Actions):
* `setTrackModFX(trackName: string, type: 'none'|'chorus'|'flanger'|'phaser', rate: number, depth: number, wet: number)`
* `setTrackLFO(trackName: string, target: 'none'|'pitch'|'filter'|'volume', rate: number, depth: number, waveform: 'sine'|'triangle'|'square'|'sawtooth')`
* `setTrackArpeggiator(trackName: string, enabled: boolean, rate: '8n'|'16n'|'32n', direction: 'up'|'down'|'updown'|'random', octaves: number)`

---

### 2. `src/audio/AudioEngine.ts`
Actualizaremos el motor de audio para subdividir el reloj a `32n`, instanciar los nodos por pista, actualizar sus valores en reproducción y procesar la lógica de disparo del arpegiador.

#### Modificación de la interfaz `TrackNodes`:
```typescript
interface TrackNodes {
  synth: any;
  reverb: any;
  delay: any;
  currentType: InstrumentType;
  
  // Nuevos nodos de procesamiento
  lfoFilter: Tone.Filter;
  lfoGain: Tone.Gain;
  lfo: Tone.LFO;
  chorus: Tone.Chorus;
  flanger: Tone.Flanger;
  phaser: Tone.Phaser;
  
  // Estado persistente del arpegiador por pista
  arpState?: {
    notes: string[];
    currentIndex: number;
    lastStep16: number;
  };
}
```

#### Modificación en `getOrCreateLiveNodes(key, type)`:
Instanciaremos los nuevos nodos en serie:
* `const lfoFilter = new Tone.Filter({ context, type: 'lowpass', frequency: 20000 });`
* `const lfoGain = new Tone.Gain({ context, gain: 1.0 });`
* `const lfo = new Tone.LFO({ context, frequency: 5.0, min: 0, max: 1 });`
* `const phaser = new Tone.Phaser({ context, frequency: 1.5, octaves: 3, Q: 10, wet: 0 });`
* `const flanger = new Tone.Flanger({ context, frequency: 1.5, depth: 0.5, wet: 0 });`
* `const chorus = new Tone.Chorus({ context, frequency: 1.5, delayTime: 3.5, depth: 0.5, wet: 0 }).start();`

Conexiones en serie:
`synth -> lfoGain -> lfoFilter -> phaser -> flanger -> chorus -> delay -> reverb -> master`

#### Métodos de actualización de audio (Nuevas firmas privadas):
* `private static updateModulationFX(nodes: TrackNodes, track: TrackInstance, time: number)`:
  Configura `wet`, `frequency` y `depth` de los nodos de modulación según el estado actual en el store, y silencia los no activos.
* `private static updateLFO(nodes: TrackNodes, track: TrackInstance, time: number)`:
  Desconecta el LFO, reestablece parámetros no modulados a sus valores originales, y conecta/modula el parámetro correspondiente si el target no es `'none'`.

#### Modificación de `setupLoop()`:
* Cambiar `Tone.Transport.scheduleRepeat(..., '16n')` a `Tone.Transport.scheduleRepeat(..., '32n')`.
* En cada tick de `32n`:
  * Determinar paso actual de fusa `step32` y paso de semicorchea `step16`.
  * Llamar a `setCurrentStep(step16)` solo cuando `step32 % 2 === 0`.
  * Si el arpegiador está activo en la pista:
    * Calcular el intervalo de fusa correspondiente a `arp_rate`.
    * En el tick adecuado, disparar la nota que toque en `arpState.notes`.
    * Reiniciar `arpState` en cada cambio de semicorchea (`step32 % 2 === 0`) usando las notas cargadas.
  * Si el arpegiador está inactivo:
    * Disparar el acorde convencional polifónico completo solo cuando `step32 % 2 === 0`.

---

### 3. `src/components/sequencer/DevicePanel.vue`
Rediseñaremos la UI del Eurorack Device Panel para incorporar los tres nuevos submódulos compactos side-by-side utilizando componentes de control `Knob` existentes y selectores visuales neón.

---

## 🔌 Excepciones y Robustez

* **Cambio de tipo de instrumento**: Si la pista cambia de sintetizador mediante `setTrackType`, se destruyen y recrean los nodos correctivos. Debemos asegurar que los nuevos nodos modFX, LFO, filtros y ganancias se mantengan consistentes o se reinicien adecuadamente.
* **Notas inválidas o vacías**: Si el acorde a arpegiar no contiene notas válidas, el arpegiador no se dispara y no genera errores de índice fuera de rango.

---

## ⚖️ Alternativa Descartada y Justificación

### Alternativa Descartada:
Crear y conectar dinámicamente los nodos de Chorus, Flanger y Phaser a la cadena de audio únicamente en el momento en que el usuario activa el efecto de modulación correspondiente, destruyéndolos al cambiar a `none`.

### Justificación de Descarte:
La reconexión dinámica de nodos del grafo Web Audio API durante la reproducción en tiempo real genera picos de renderizado (jitter) e introduce ruidos digitales audibles ("clicks/pops") debido a la discontinuidad de la fase de la señal de audio. Además, aumenta el riesgo de fugas de memoria por nodos no desechados correctamente. El enfoque de cadena estática controlada por la propiedad `wet = 0` (bypass virtual) elimina por completo los ruidos, es seguro, robusto y su consumo de CPU es despreciable dado que los navegadores modernos detienen el cálculo interno de efectos de audio cuyo volumen de mezcla (`wet`) es cero.
