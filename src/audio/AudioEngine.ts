import * as Tone from 'tone';
import { useSequencerStore } from '../stores/sequencer';

export class AudioEngine {
  private static synth: Tone.Synth;
  private static lastPlayedNote: string | null = null;
  private static initialized: boolean = false;

  public static async initialize() {
    if (!this.initialized) {
      await Tone.start();
      
      this.synth = new Tone.Synth({
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.2,
          release: 0.5
        }
      }).toDestination();
      
      this.initialized = true;
      this.setupLoop();
    }
  }

  private static setupLoop() {
    const store = useSequencerStore();
    
    // El loop corre cada semicorchea (16n)
    Tone.Transport.scheduleRepeat((time) => {
      const step = (Math.floor(Tone.Transport.seconds / Tone.Time('16n').toSeconds()) % 16) + 1;
      
      // Actualizar el paso actual en el store para la UI
      Tone.Draw.schedule(() => {
        store.setCurrentStep(step);
      }, time);

      store.tracks.forEach(track => {
        const note = track.notes[step];
        if (note) {
          this.synth.triggerAttackRelease(note, '16n', time);
        }
      });
    }, '16n');
  }

  public static async toggle() {
    await this.initialize();
    
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      useSequencerStore().setCurrentStep(0);
    } else {
      Tone.Transport.start();
    }
  }

  public static playNote(note: string, duration: string) {
    if (!this.initialized) {
      this.initialize().then(() => {
        this.synth.triggerAttackRelease(note, duration);
      });
      return;
    }
    this.synth.triggerAttackRelease(note, duration);
    this.lastPlayedNote = note;
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }
}

