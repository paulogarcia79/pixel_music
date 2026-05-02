import * as Tone from 'tone';
import { useSequencerStore, type InstrumentType } from '../stores/sequencer';

export class AudioEngine {
  private static synths: Map<InstrumentType, Tone.Synth | Tone.NoiseSynth> = new Map();
  private static lastPlayedNote: string | null = null;
  private static initialized: boolean = false;

  public static async initialize() {
    if (!this.initialized) {
      await Tone.start();
      
      // Initialize basic synths
      const types: InstrumentType[] = ['square', 'triangle', 'sawtooth'];
      types.forEach(type => {
        this.synths.set(type, new Tone.Synth({
          oscillator: { type: type as any },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 }
        }).toDestination());
      });

      // Noise synth for percussion
      this.synths.set('noise', new Tone.NoiseSynth({
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 }
      }).toDestination());
      
      this.initialized = true;
      this.setupLoop();
    }
  }

  private static setupLoop() {
    const store = useSequencerStore();
    
    Tone.Transport.scheduleRepeat((time) => {
      const step = (Math.floor(Tone.Transport.seconds / Tone.Time('16n').toSeconds()) % 16) + 1;
      
      Tone.Draw.schedule(() => {
        store.setCurrentStep(step);
      }, time);

      store.tracks.forEach(track => {
        const note = track.notes[step];
        if (note) {
          const synth = this.synths.get(track.type);
          if (synth) {
            if (track.type === 'noise') {
              (synth as Tone.NoiseSynth).triggerAttackRelease('16n', time);
            } else {
              (synth as Tone.Synth).triggerAttackRelease(note, '16n', time);
            }
          }
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

  public static playNote(note: string, duration: string, type: InstrumentType = 'square') {
    if (!this.initialized) {
      this.initialize().then(() => {
        this.triggerSynth(note, duration, type);
      });
      return;
    }
    this.triggerSynth(note, duration, type);
    this.lastPlayedNote = note;
  }

  private static triggerSynth(note: string, duration: string, type: InstrumentType) {
    const synth = this.synths.get(type);
    if (synth) {
      if (type === 'noise') {
        (synth as Tone.NoiseSynth).triggerAttackRelease(duration);
      } else {
        (synth as Tone.Synth).triggerAttackRelease(note, duration);
      }
    }
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }
}

