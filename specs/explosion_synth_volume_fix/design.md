# Design - ExplosionSynth Volume Fix

## Componentes y Archivos Afectados

- `src/audio/AudioEngine.ts`:
  - Se modificará la clase interna `ExplosionSynth` para separar el nodo de volumen (`volumeNode` de tipo `Tone.Volume`) y la propiedad expuesta públicamente (`volume` de tipo `Tone.Param<"decibels">`).
- `tests/audioEngine.spec.ts`:
  - Se añadirá una prueba para validar que `ExplosionSynth.volume` es un `Tone.Param` y responde correctamente al método `setValueAtTime`.

## Alternativas Consideradas y Descartadas

- **Alternativa Descartada**: Mantener `volume` como `Tone.Volume` y crear un método envoltorio `setVolume(db, time)`.
  - **Razón del descarte**: Esto rompería la consistencia con el resto del codebase donde `volume` es expuesto directamente como un `Tone.Param` (ej. `PolyPluckSynth`), obligando a lógica de control especial en el `AudioEngine` o en los stores para este instrumento en particular.

## Detalles de Implementación

- En `ExplosionSynth`:
  - Declaración:
    ```typescript
    private volumeNode: Tone.Volume;
    public volume: Tone.Param<"decibels">;
    ```
  - Constructor:
    ```typescript
    this.volumeNode = new Tone.Volume({ context: this.context });
    this.volume = this.volumeNode.volume;
    this.filter = new Tone.Filter({ context: this.context, type: 'lowpass', frequency: 800, Q: 2 }).connect(this.volumeNode);
    ```
  - Métodos `connect` y `dispose`:
    ```typescript
    public connect(dest: Tone.ToneAudioNode) {
      this.volumeNode.connect(dest);
      return this;
    }
    public dispose() {
      this.noise.dispose();
      this.filter.dispose();
      this.volumeNode.dispose();
      return this;
    }
    ```
