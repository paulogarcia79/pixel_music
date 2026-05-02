import * as Tone from 'tone';
import { useSequencerStore, type InstrumentType } from '../stores/sequencer';

export class AudioEngine {
  private static synths: Map<string, Tone.Synth | Tone.NoiseSynth | Tone.FMSynth | Tone.PolySynth> = new Map();
  private static lastPlayedNote: string | null = null;
  private static initialized: boolean = false;
  private static masterReverb: Tone.Reverb;
  private static masterDelay: Tone.FeedbackDelay;

  public static async initialize() {
    if (!this.initialized) {
      await Tone.start();
      
      this.masterReverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).toDestination();
      this.masterDelay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.3, wet: 0.15 }).connect(this.masterReverb);
      
      this.initialized = true;
      this.setupLoop();
    }
  }

  private static getOrCreateSynthForTrack(trackName: string, type: InstrumentType): any {
    if (this.synths.has(trackName)) {
      return this.synths.get(trackName)!;
    }

    let synth: any;
    const dest = this.masterDelay;

    switch (type) {
      case 'noise':
        synth = new Tone.NoiseSynth({ envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 } }).connect(dest);
        break;
      case 'kick':
        synth = new Tone.MembraneSynth({ 
          pitchDecay: 0.05, 
          octaves: 10, 
          oscillator: { type: 'sine' },
          envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).connect(dest);
        break;
      case 'snare':
        synth = new Tone.NoiseSynth({
          noise: { type: 'white' },
          envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 }
        }).connect(dest);
        break;
      case 'hihat':
        synth = new Tone.NoiseSynth({
          noise: { type: 'pink' },
          envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
        }).connect(dest);
        break;
      case 'sine':
        synth = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.05, release: 1 } }).connect(dest);
        break;
      case 'fm_pluck':
        synth = new Tone.FMSynth({ modulationIndex: 10, envelope: { attack: 0.001, decay: 0.2, sustain: 0.1 } }).connect(dest);
        break;
      case 'fm_bell':
        synth = new Tone.FMSynth({ harmonicity: 3, modulationIndex: 15, envelope: { attack: 0.01, decay: 1, sustain: 0 } }).connect(dest);
        break;
      default:
        synth = new Tone.Synth({ oscillator: { type: type as any }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 } }).connect(dest);
    }

    this.synths.set(trackName, synth);
    return synth;
  }

  public static resetSynth(trackName: string) {
    if (this.synths.has(trackName)) {
      this.synths.get(trackName)!.dispose();
      this.synths.delete(trackName);
    }
  }

  private static setupLoop() {
    const store = useSequencerStore();
    
    Tone.Transport.scheduleRepeat((time) => {
      const totalSteps = Tone.Transport.seconds / Tone.Time('16n').toSeconds();
      const stepInBar = (Math.floor(totalSteps) % 16) + 1;
      const totalBars = Math.floor(totalSteps / 16);
      
      let patternId = store.currentPatternId;
      if (store.isSongMode) {
        const seqIndex = totalBars % store.songSequence.length;
        patternId = store.songSequence[seqIndex];
        store.currentSequenceIndex = seqIndex;
      }

      Tone.Draw.schedule(() => {
        store.setCurrentStep(stepInBar);
      }, time);

      store.tracks.forEach(track => {
        if (track.muted) return;

        const note = track.patterns[patternId]?.[stepInBar];
        if (note) {
          const synth = this.getOrCreateSynthForTrack(track.name, track.type);
          synth.volume.value = track.volume;

          if (track.type === 'noise' || track.type === 'snare' || track.type === 'hihat') {
            (synth as Tone.NoiseSynth).triggerAttackRelease('16n', time);
          } else if (track.type === 'kick') {
            (synth as Tone.MembraneSynth).triggerAttackRelease(note, '16n', time);
          } else {
            synth.triggerAttackRelease(note, '16n', time);
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
      Tone.Transport.seconds = 0;
      Tone.Transport.start();
    }
  }

  public static playNote(note: string, duration: string, type: InstrumentType = 'square', trackName: string = 'Preview') {
    if (!this.initialized) {
      this.initialize().then(() => {
        this.triggerSynth(note, duration, type, trackName);
      });
      return;
    }
    this.triggerSynth(note, duration, type, trackName);
    this.lastPlayedNote = note;
  }

  private static triggerSynth(note: string, duration: string, type: InstrumentType, trackName: string) {
    const synth = this.getOrCreateSynthForTrack(trackName, type);
    synth.volume.value = -10;

    if (type === 'noise' || type === 'snare' || type === 'hihat') {
      (synth as Tone.NoiseSynth).triggerAttackRelease(duration);
    } else if (type === 'kick') {
      (synth as Tone.MembraneSynth).triggerAttackRelease(note, duration);
    } else {
      synth.triggerAttackRelease(note, duration);
    }
  }

  public static setMasterEffects(reverbWet: number, delayWet: number) {
    if (!this.initialized) return;
    this.masterReverb.wet.value = reverbWet;
    this.masterDelay.wet.value = delayWet;
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }
}
