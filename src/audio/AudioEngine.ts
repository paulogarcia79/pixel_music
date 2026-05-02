import * as Tone from 'tone';

export class AudioEngine {
  private static synth: Tone.Synth;
  private static lastPlayedNote: string | null = null;
  private static initialized: boolean = false;

  public static initialize() {
    if (!this.initialized) {
      // Usamos onda cuadrada (square) por defecto para darle ese toque 8-bit
      this.synth = new Tone.Synth({
        oscillator: {
          type: 'square'
        },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.2,
          release: 0.5
        }
      }).toDestination();
      
      this.initialized = true;
    }
  }

  public static playNote(note: string, duration: string) {
    if (!this.initialized) {
      console.warn("AudioEngine no está inicializado. Llama a initialize() primero.");
      return;
    }
    
    // Reproducir la nota
    this.synth.triggerAttackRelease(note, duration);
    this.lastPlayedNote = note;
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }
}
