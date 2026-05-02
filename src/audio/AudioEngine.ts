import * as Tone from 'tone';
import { useSequencerStore, type InstrumentType } from '../stores/sequencer';

interface TrackNodes {
  synth: any;
  reverb: Tone.Reverb;
  delay: Tone.FeedbackDelay;
  currentType: InstrumentType;
}

export class AudioEngine {
  private static trackNodes: Map<string, TrackNodes> = new Map();
  private static lastPlayedNote: string | null = null;
  private static initialized: boolean = false;
  private static masterLimiter: Tone.Limiter;
  private static masterCompressor: Tone.Compressor;
  private static masterVolume: Tone.Volume;
  private static analyser: Tone.Waveform;
  private static recorder: Tone.Recorder;

  public static async initialize() {
    if (!this.initialized) {
      await Tone.start();
      
      this.masterLimiter = new Tone.Limiter(-1).toDestination();
      
      this.analyser = new Tone.Waveform(256);
      this.recorder = new Tone.Recorder();
      
      this.masterCompressor = new Tone.Compressor({
        threshold: -12,
        ratio: 4,
        attack: 0.003,
        release: 0.25
      }).connect(this.masterLimiter);
      
      // Connect master to analyser and recorder
      this.masterCompressor.fan(this.analyser, this.recorder);
      
      this.masterVolume = new Tone.Volume(0).connect(this.masterCompressor);
      
      this.initialized = true;
      this.setupLoop();
    }
  }

  public static getAnalyser() {
    return this.analyser;
  }

  public static async startRecording() {
    await this.initialize();
    this.recorder.start();
  }

  public static async stopRecording() {
    const blob = await this.recorder.stop();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.download = "pixel_music_render.webm";
    anchor.href = url;
    anchor.click();
  }

  private static createSynthByType(type: InstrumentType, dest: Tone.ToneAudioNode): any {
    const synthOptions: any = {
      kick: () => new Tone.MembraneSynth({ 
        pitchDecay: 0.05, octaves: 10, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }),
      snare: () => new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0, release: 0.2 }
      }),
      hihat: () => new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
      }),
      noise: () => new Tone.NoiseSynth({ 
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 } 
      }),
      sine: () => new Tone.Synth({ 
        oscillator: { type: 'sine' }, 
        envelope: { attack: 0.05, release: 1 } 
      }),
      fm_pluck: () => new Tone.FMSynth({ 
        modulationIndex: 10, 
        envelope: { attack: 0.001, decay: 0.2, sustain: 0.1 } 
      }),
      fm_bell: () => new Tone.FMSynth({ 
        harmonicity: 3, modulationIndex: 15, 
        envelope: { attack: 0.01, decay: 1, sustain: 0 } 
      }),
      default: (t: any) => new Tone.Synth({ 
        oscillator: { type: t }, 
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 } 
      })
    };

    const builder = synthOptions[type] || (() => synthOptions.default(type));
    return builder().connect(dest);
  }

  private static getOrCreateNodesForTrack(trackName: string, type: InstrumentType): TrackNodes {
    const existing = this.trackNodes.get(trackName);
    
    if (existing && existing.currentType !== type) {
      existing.synth.dispose();
      existing.synth = this.createSynthByType(type, existing.delay);
      existing.currentType = type;
      return existing;
    }

    if (existing) return existing;

    const reverb = new Tone.Reverb({ decay: 1.5, wet: 0 }).connect(this.masterVolume);
    const delay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.3, wet: 0 }).connect(reverb);
    const synth = this.createSynthByType(type, delay);
    
    // Set initial volume to avoid 0dB burst
    synth.volume.value = -16;

    const nodes = { synth, reverb, delay, currentType: type };
    this.trackNodes.set(trackName, nodes);
    return nodes;
  }

  public static resetSynth(trackName: string) {
    if (this.trackNodes.has(trackName)) {
      const nodes = this.trackNodes.get(trackName)!;
      nodes.synth.dispose();
      nodes.reverb.dispose();
      nodes.delay.dispose();
      this.trackNodes.delete(trackName);
    }
  }

  private static setupLoop() {
    const store = useSequencerStore();
    
    Tone.Transport.scheduleRepeat((time) => {
      const totalSteps = Tone.Transport.getSecondsAtTime(time) / Tone.Time('16n').toSeconds();
      const stepInBar = (Math.round(totalSteps) % 16) + 1;
      const totalBars = Math.floor(Math.round(totalSteps) / 16);
      
      let patternId = store.currentPatternId;
      if (store.isSongMode) {
        const seqLength = store.songSequence.length;
        if (seqLength > 0) {
          const seqIndex = totalBars % seqLength;
          patternId = store.songSequence[seqIndex];
          
          Tone.Draw.schedule(() => {
            store.currentSequenceIndex = seqIndex;
          }, time);
        }
      }

      Tone.Draw.schedule(() => {
        store.setCurrentStep(stepInBar);
      }, time);

      const currentPattern = store.patterns[patternId];
      if (!currentPattern) return;

      currentPattern.tracks.forEach(track => {
        if (track.muted) return;

        const note = track.notes[stepInBar];
        if (note) {
          const nodes = this.getOrCreateNodesForTrack(track.name, track.type);
          
          nodes.synth.volume.setValueAtTime(track.volume - 6, time);
          nodes.reverb.wet.setValueAtTime(track.reverbWet, time);
          nodes.delay.wet.setValueAtTime(track.delayWet, time);

          if (track.type === 'noise' || track.type === 'snare' || track.type === 'hihat') {
            (nodes.synth as Tone.NoiseSynth).triggerAttackRelease('16n', time);
          } else if (track.type === 'kick') {
            (nodes.synth as Tone.MembraneSynth).triggerAttackRelease(note, '16n', time);
          } else {
            nodes.synth.triggerAttackRelease(note, '16n', time);
          }
        }
      });
    }, '16n');
  }

  public static async toggle() {
    await this.initialize();
    
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      this.masterVolume.volume.rampTo(-Infinity, 0.05);
      
      this.trackNodes.forEach(nodes => {
        if ('releaseAll' in nodes.synth) nodes.synth.releaseAll();
        else if ('triggerRelease' in nodes.synth) nodes.synth.triggerRelease();
      });
      
      useSequencerStore().setCurrentStep(0);
    } else {
      this.masterVolume.volume.value = 0;
      Tone.Transport.seconds = 0;
      Tone.Transport.start();
    }
  }

  public static playNote(note: string, duration: string, type: InstrumentType = 'square', trackName: string = 'Preview') {
    this.lastPlayedNote = note;
    if (!this.initialized) {
      this.initialize().then(() => {
        this.triggerSynth(note, duration, type, trackName);
      });
      return;
    }
    this.triggerSynth(note, duration, type, trackName);
  }

  private static triggerSynth(note: string, duration: string, type: InstrumentType, trackName: string) {
    const nodes = this.getOrCreateNodesForTrack(trackName, type);
    
    const store = useSequencerStore();
    const track = store.getTrackInPattern(trackName);
    
    const time = Tone.now();
    if (track) {
      nodes.synth.volume.setValueAtTime(track.volume - 6, time);
      nodes.reverb.wet.setValueAtTime(track.reverbWet, time);
      nodes.delay.wet.setValueAtTime(track.delayWet, time);
    } else {
      nodes.synth.volume.setValueAtTime(-16, time);
    }

    if (type === 'noise' || type === 'snare' || type === 'hihat') {
      (nodes.synth as Tone.NoiseSynth).triggerAttackRelease(duration, time);
    } else if (type === 'kick') {
      (nodes.synth as Tone.MembraneSynth).triggerAttackRelease(note, duration, time);
    } else {
      nodes.synth.triggerAttackRelease(note, duration, time);
    }
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }
}
