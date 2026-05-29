import * as Tone from 'tone';
import { useSequencerStore, type InstrumentType } from '../stores/sequencer';

interface TrackNodes {
  synth: any;
  reverb: any;
  delay: any;
  currentType: InstrumentType;
}

export class PolyPluckSynth {
  private voices: Tone.PluckSynth[] = [];
  private voiceIndex = 0;
  public volume: Tone.Param<"decibels">;
  private volumeNode: Tone.Volume;
  private context: Tone.BaseContext;

  constructor(options: { context: Tone.BaseContext, voicesCount?: number, dampening?: number, resonance?: number }) {
    this.context = options.context;
    const voicesCount = options.voicesCount || 8;
    this.volumeNode = new Tone.Volume({ context: this.context, volume: 0 });
    this.volume = this.volumeNode.volume;
    
    for (let i = 0; i < voicesCount; i++) {
      const voice = new Tone.PluckSynth({
        context: this.context,
        attackNoise: 1,
        dampening: options.dampening ?? 4000,
        resonance: options.resonance ?? 0.95
      });
      voice.connect(this.volumeNode);
      this.voices.push(voice);
    }
  }

  public connect(dest: Tone.ToneAudioNode) {
    this.volumeNode.connect(dest);
    return this;
  }

  public set(options: any) {
    if (options.dampening !== undefined || options.resonance !== undefined) {
      this.voices.forEach(v => {
        if (options.dampening !== undefined) v.dampening = options.dampening;
        if (options.resonance !== undefined) v.resonance = options.resonance;
      });
    }
    return this;
  }

  public triggerAttackRelease(notes: string | string[], duration: string | number, time?: number) {
    const notesArray = Array.isArray(notes) ? notes : [notes];
    notesArray.forEach(note => {
      const voice = this.voices[this.voiceIndex];
      voice.triggerAttackRelease(note, duration, time);
      this.voiceIndex = (this.voiceIndex + 1) % this.voices.length;
    });
    return this;
  }

  public triggerRelease(time?: number) {
    this.voices.forEach(v => {
      if (v.triggerRelease) v.triggerRelease(time);
    });
    return this;
  }

  public dispose() {
    this.voices.forEach(v => v.dispose());
    this.volumeNode.dispose();
    return this;
  }
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
      this.masterCompressor.fan(this.analyser, this.recorder);
      this.masterVolume = new Tone.Volume(0).connect(this.masterCompressor);
      this.initialized = true;
      this.setupLoop();
    }
  }

  public static getAnalyser() {
    return this.initialized ? this.analyser : null;
  }

  public static async startRecording() {
    await this.initialize();
    if (this.recorder) this.recorder.start();
  }

  public static async stopRecording() {
    if (this.recorder) {
      const blob = await this.recorder.stop();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = "pixel_live_capture.webm";
      a.href = url;
      a.click();
    }
  }

  private static createSynthByType(type: InstrumentType, dest: Tone.ToneAudioNode, context: Tone.BaseContext): any {
    const common = { context };
    let synth: any;
    switch (type) {
      case 'kick':
        synth = new Tone.MembraneSynth({ ...common, pitchDecay: 0.05, octaves: 10, envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 } });
        break;
      case 'snare':
        synth = new Tone.NoiseSynth({ ...common, noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 } });
        break;
      case 'hihat':
        synth = new Tone.NoiseSynth({ ...common, noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 } });
        break;
      case 'clap':
        synth = new Tone.NoiseSynth({ ...common, noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.08 } });
        break;
      case 'crash':
        synth = new Tone.NoiseSynth({ ...common, noise: { type: 'white' }, envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.0 } });
        break;
      case 'noise':
        synth = new Tone.NoiseSynth({ ...common, envelope: { attack: 0.01, decay: 0.1, sustain: 0 } });
        break;
      case 'tom':
        synth = new Tone.MembraneSynth({ ...common, pitchDecay: 0.1, octaves: 4, envelope: { attack: 0.01, decay: 0.4, sustain: 0.01, release: 1.4 } });
        break;
      case 'conga':
        synth = new Tone.MembraneSynth({ ...common, pitchDecay: 0.008, octaves: 2, envelope: { attack: 0.01, decay: 0.2, sustain: 0 } });
        break;
      case 'cowbell':
        synth = new Tone.MetalSynth({ ...common, harmonicity: 12, resonance: 800, modulationIndex: 20, envelope: { attack: 0.001, decay: 0.1, release: 0.1 } });
        break;
      case 'woodblock':
        synth = new Tone.MembraneSynth({ ...common, pitchDecay: 0.001, octaves: 1, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } });
        break;
      case 'shaker':
        synth = new Tone.NoiseSynth({ ...common, noise: { type: 'white' }, envelope: { attack: 0.01, decay: 0.05, sustain: 0 } });
        break;
      case 'rimshot':
        synth = new Tone.NoiseSynth({ ...common, noise: { type: 'white' }, envelope: { attack: 0.001, decay: 0.02, sustain: 0 } });
        break;
      case 'bass_synth':
        synth = new Tone.PolySynth(Tone.FMSynth, { ...common, harmonicity: 0.5, modulationIndex: 5, envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.5 } });
        break;
      case 'sub_bass':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'sine' }, envelope: { attack: 0.05, decay: 0.2, sustain: 1, release: 0.8 } });
        break;
      case 'lead_synth':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'sawtooth' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 } });
        break;
      case 'super_saw':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.5 } });
        break;
      case 'acid_synth':
        synth = new Tone.PolySynth(Tone.MonoSynth, { ...common, oscillator: { type: 'sawtooth' }, filter: { Q: 10, type: 'lowpass', rolloff: -24 }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.1 }, filterEnvelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.1, baseFrequency: 200, octaves: 4 } });
        break;
      case 'pad':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'sine' }, envelope: { attack: 0.5, release: 2 } });
        break;
      case 'organ_pixel':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'pwm', modulationFrequency: 0.5 }, envelope: { attack: 0.01, sustain: 1, release: 0.1 } });
        break;
      case 'church_organ':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'sine' }, envelope: { attack: 0.1, sustain: 1, release: 0.5 } });
        break;
      case 'guitar_pixel':
        synth = new PolyPluckSynth({ context, dampening: 4000, resonance: 0.95 });
        break;
      case 'guitar_dist':
        synth = new Tone.PolySynth(Tone.MonoSynth, { ...common, oscillator: { type: 'sawtooth' }, envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.5 } });
        break;
      case 'piano_pixel':
        synth = new Tone.PolySynth(Tone.FMSynth, { ...common, harmonicity: 2, modulationIndex: 10, envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.1 } });
        break;
      case 'electric_piano':
        synth = new Tone.PolySynth(Tone.FMSynth, { ...common, harmonicity: 3.5, modulationIndex: 15, envelope: { attack: 0.005, decay: 1, sustain: 0, release: 1 } });
        break;
      case 'honky_tonk':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'triangle' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.1 } });
        break;
      case 'flute_pixel':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'sine' }, envelope: { attack: 0.1, decay: 0.1, sustain: 1, release: 0.2 } });
        break;
      case 'clarinet_pixel':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'square' }, envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.2 } });
        break;
      case 'retro_oboe':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'sawtooth' }, envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.2 } });
        break;
      case 'retro_brass':
        synth = new Tone.PolySynth(Tone.MonoSynth, { ...common, oscillator: { type: 'sawtooth' }, filter: { Q: 2, type: 'lowpass', rolloff: -12 }, envelope: { attack: 0.1, decay: 0.2, sustain: 1, release: 0.5 }, filterEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.5, baseFrequency: 200, octaves: 2 } });
        break;
      case 'ghost_synth':
        synth = new Tone.PolySynth(Tone.FMSynth, { ...common, harmonicity: 0.5, modulationIndex: 20, oscillator: { type: 'sine' }, envelope: { attack: 1, decay: 1, sustain: 1, release: 2 } });
        break;
      case 'fm_pluck':
        synth = new Tone.PolySynth(Tone.FMSynth, { ...common, modulationIndex: 10, envelope: { attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.1 } });
        break;
      case 'fm_bell':
        synth = new Tone.PolySynth(Tone.FMSynth, { ...common, harmonicity: 3, modulationIndex: 15, envelope: { attack: 0.01, decay: 1, sustain: 0, release: 1 } });
        break;
      default:
        synth = new Tone.PolySynth(Tone.Synth, { 
          ...common, 
          oscillator: { type: (['pulse', 'pwm', 'sine', 'triangle', 'sawtooth', 'square'].includes(type) ? type : 'square') as any }, 
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 } 
        });
    }
    return synth.connect(dest);
  }

  private static getOrCreateLiveNodes(key: string, type: InstrumentType): TrackNodes {
    const existing = this.trackNodes.get(key);
    const context = Tone.getContext();

    if (existing && existing.currentType !== type) {
      existing.synth.dispose();
      existing.synth = this.createSynthByType(type, existing.delay, context);
      existing.currentType = type;
      return existing;
    }

    if (existing) return existing;

    const reverb = new Tone.Freeverb({ context, roomSize: 0.7, dampening: 4000 }).connect(this.masterVolume);
    const delay = new Tone.FeedbackDelay({ context, delayTime: "8n.", feedback: 0.3, wet: 0 }).connect(reverb);
    const synth = this.createSynthByType(type, delay, context);
    const nodes = { synth, reverb, delay, currentType: type };
    this.trackNodes.set(key, nodes);
    return nodes;
  }

  public static resetSynth(trackKey: string) {
    if (this.trackNodes.has(trackKey)) {
      const nodes = this.trackNodes.get(trackKey)!;
      nodes.synth.dispose();
      nodes.reverb.dispose();
      nodes.delay.dispose();
      this.trackNodes.delete(trackKey);
    }
  }

  public static clearAllSynths(): void {
    this.trackNodes.forEach((nodes) => {
      nodes.synth.dispose();
      nodes.reverb.dispose();
      nodes.delay.dispose();
    });
    this.trackNodes.clear();
  }

  private static setupLoop() {
    const store = useSequencerStore();
    Tone.Transport.scheduleRepeat((time) => {
      const globalStep = Math.round(Tone.Transport.getSecondsAtTime(time) / Tone.Time('16n').toSeconds());
      let active: { patternId: number, stepInPattern: number, arrangerTrackId: number }[] = [];
      
      if (store.isSongMode) {
        let maxStep = 32;
        store.arrangerTracks.forEach(t => t.placements.forEach(p => {
          const s = store.patterns[p.patternId]?.gridSize || 32;
          if (p.startStep + s > maxStep) maxStep = p.startStep + s;
        }));
        const currentGlobalStep = globalStep % maxStep;
        Tone.Draw.schedule(() => {
          store.globalStep = currentGlobalStep;
          store.setCurrentStep(0);
        }, time);
        
        store.arrangerTracks.forEach(t => t.placements.forEach(p => {
          const s = store.patterns[p.patternId]?.gridSize || 32;
          if (currentGlobalStep >= p.startStep && currentGlobalStep < p.startStep + s) {
            active.push({ patternId: p.patternId, stepInPattern: (currentGlobalStep - p.startStep) + 1, arrangerTrackId: t.id });
          }
        }));
      } else {
        const pId = store.currentPatternId;
        const s = store.patterns[pId]?.gridSize || 32;
        const currentStep = (globalStep % s) + 1;
        Tone.Draw.schedule(() => {
          store.setCurrentStep(currentStep);
          store.globalStep = 0;
        }, time);
        active.push({ patternId: pId, stepInPattern: currentStep, arrangerTrackId: 0 });
      }

      active.forEach(({ patternId, stepInPattern, arrangerTrackId }) => {
        const pattern = store.patterns[patternId];
        if (!pattern) return;
        pattern.tracks.forEach(track => {
          if (track.muted) return;
          const notes = track.notes[stepInPattern];
          if (notes && notes.length > 0) {
            const nodes = this.getOrCreateLiveNodes(`${arrangerTrackId}_${track.name}`, track.type);
            
            if (nodes.synth.envelope) {
              nodes.synth.envelope.attack = track.attack;
              nodes.synth.envelope.decay = track.decay;
              nodes.synth.envelope.sustain = track.sustain;
              nodes.synth.envelope.release = track.release;
            } else if (nodes.synth.set) {
              nodes.synth.set({
                envelope: {
                  attack: track.attack,
                  decay: track.decay,
                  sustain: track.sustain,
                  release: track.release
                }
              });
            }
            if (track.type === 'guitar_pixel') {
              nodes.synth.set({
                dampening: track.dampening,
                resonance: track.resonance
              });
            }
            
            nodes.synth.volume.setValueAtTime(track.volume - 6, time);
            nodes.reverb.wet.setValueAtTime(track.reverbWet, time);
            nodes.delay.wet.setValueAtTime(track.delayWet, time);

            const type = track.type;
            if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot'].includes(type)) {
              if (['kick', 'tom', 'conga', 'woodblock'].includes(type)) {
                const noteToPlay = (notes && notes.length > 0) ? notes[0] : (type === 'kick' ? 'C2' : 'C3');
                nodes.synth.triggerAttackRelease(noteToPlay, '16n', time);
              } else {
                nodes.synth.triggerAttackRelease('16n', time);
              }
            } else {
              nodes.synth.triggerAttackRelease(notes, '16n', time);
            }
          }
        });
      });
    }, '16n');
  }

  public static async toggle() {
    await this.initialize();
    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      this.masterVolume.volume.rampTo(-Infinity, 0.05);
      this.trackNodes.forEach(n => {
        if (n.synth.triggerRelease) n.synth.triggerRelease();
      });
      useSequencerStore().setCurrentStep(0);
      useSequencerStore().globalStep = 0;
    } else {
      this.masterVolume.volume.value = 0;
      Tone.Transport.seconds = 0;
      Tone.Transport.start();
    }
  }

  public static playNote(note: string, duration: string, type: InstrumentType = 'square', trackName: string = 'Preview') {
    this.lastPlayedNote = note;
    this.initialize().then(() => {
      const context = Tone.getContext();
      const s = this.createSynthByType(type, context.destination, context);
      const store = useSequencerStore();
      const track = store.getTrackInPattern(trackName);
      if (track) {
        if (s.envelope) {
          s.envelope.attack = track.attack;
          s.envelope.decay = track.decay;
          s.envelope.sustain = track.sustain;
          s.envelope.release = track.release;
        } else if (s.set) {
          s.set({
            envelope: {
              attack: track.attack,
              decay: track.decay,
              sustain: track.sustain,
              release: track.release
            }
          });
        }
        if (track.type === 'guitar_pixel') {
          s.set({
            dampening: track.dampening,
            resonance: track.resonance
          });
        }
      }
      
      if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot'].includes(type)) {
        s.triggerAttackRelease(duration);
      } else {
        s.triggerAttackRelease(note, duration);
      }
      
      setTimeout(() => s.dispose(), 2000);
    });
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }

  public static async exportAudioOffline(): Promise<void> {
    const store = useSequencerStore();
    const secondsPerStep = (60 / store.bpm / 4);
    let maxSongStep = 32;
    const songData: any[] = [];

    if (store.isSongMode) {
      store.arrangerTracks.forEach(t => t.placements.forEach(p => {
        const pattern = store.patterns[p.patternId];
        if (!pattern) return;
        if (p.startStep + pattern.gridSize > maxSongStep) maxSongStep = p.startStep + pattern.gridSize;
        pattern.tracks.forEach(track => {
          if (track.muted) return;
          Object.entries(track.notes).forEach(([step, notes]) => {
            if (notes && notes.length > 0) {
              songData.push({ 
                t: (p.startStep + parseInt(step) - 1) * secondsPerStep, 
                n: notes, 
                track, 
                arrangerTrackId: t.id 
              });
            }
          });
        });
      }));
    } else {
      const p = store.patterns[store.currentPatternId];
      if (p) {
        maxSongStep = p.gridSize;
        p.tracks.forEach(track => {
          if (track.muted) return;
          Object.entries(track.notes).forEach(([step, notes]) => {
            if (notes && notes.length > 0) {
              songData.push({ 
                t: (parseInt(step) - 1) * secondsPerStep, 
                n: notes, 
                track, 
                arrangerTrackId: 0 
              });
            }
          });
        });
      }
    }

    const totalSeconds = (maxSongStep * secondsPerStep) + 3.0;
    await Tone.start();

    // Sort to prevent out-of-order scheduling errors
    songData.sort((a, b) => a.t - b.t);

    const buffer = await Tone.Offline((context) => {
      const master = new Tone.Gain({ context: context as any, gain: 1.0 }).toDestination();
      const synths = new Map();

      songData.forEach(d => {
        const key = `${d.arrangerTrackId}_${d.track.name}`;
        if (!synths.has(key)) {
          const reverb = new Tone.Freeverb({ context: context as any, roomSize: 0.7, dampening: 4000 }).connect(master);
          const delay = new Tone.FeedbackDelay({ context: context as any, delayTime: "8n.", feedback: 0.3, wet: 0 }).connect(reverb);
          const synth = AudioEngine.createSynthByType(d.track.type, delay, context as any);
          synths.set(key, { synth, reverb, delay });
        }
        const n = synths.get(key);
        if (n.synth.envelope) {
          n.synth.envelope.attack = d.track.attack;
          n.synth.envelope.decay = d.track.decay;
          n.synth.envelope.sustain = d.track.sustain;
          n.synth.envelope.release = d.track.release;
        } else if (n.synth.set) {
          n.synth.set({
            envelope: {
              attack: d.track.attack,
              decay: d.track.decay,
              sustain: d.track.sustain,
              release: d.track.release
            }
          });
        }
        if (d.track.type === 'guitar_pixel') {
          n.synth.set({
            dampening: d.track.dampening,
            resonance: d.track.resonance
          });
        }
        n.synth.volume.setValueAtTime(d.track.volume - 6, d.t);
        n.reverb.wet.setValueAtTime(d.track.reverbWet, d.t);
        n.delay.wet.setValueAtTime(d.track.delayWet, d.t);
        
        const type = d.track.type;
        if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot'].includes(type)) {
          n.synth.triggerAttackRelease('16n', d.t);
        } else {
          n.synth.triggerAttackRelease(d.n, '16n', d.t);
        }
      });
    }, totalSeconds);

    const wavBlob = await this.bufferToWav(buffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.download = `pixel_music_final.wav`;
    a.href = url;
    a.click();
  }

  private static async bufferToWav(buffer: Tone.ToneAudioBuffer): Promise<Blob> {
    const ab = buffer.get();
    if (!ab) throw "Error";
    const n = ab.numberOfChannels, len = ab.length * n * 2 + 44, data = new ArrayBuffer(len), view = new DataView(data);
    let offset = 44;
    const writeS = (o: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)); };
    const write32 = (o: number, v: number) => { view.setUint32(o, v, true); };
    const write16 = (o: number, v: number) => { view.setUint16(o, v, true); };
    writeS(0, 'RIFF'); write32(4, len - 8); writeS(8, 'WAVE'); writeS(12, 'fmt '); write32(16, 16);
    write16(20, 1); write16(22, n); write32(24, ab.sampleRate); write32(28, ab.sampleRate * n * 2);
    write16(32, n * 2); write16(34, 16); writeS(36, 'data'); write32(40, ab.length * n * 2);
    const chs = []; for (let i = 0; i < n; i++) chs.push(ab.getChannelData(i));
    for (let i = 0; i < ab.length; i++) {
      for (let c = 0; c < n; c++) {
        let v = Math.max(-1, Math.min(1, chs[c][i]));
        view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([data], { type: 'audio/wav' });
  }
}
