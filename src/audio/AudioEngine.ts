import * as Tone from 'tone';
import { useSequencerStore, type InstrumentType } from '../stores/sequencer';

interface TrackNodes {
  synth: any;
  reverb: any;
  delay: any;
  currentType: InstrumentType;
  lfoFilter: Tone.Filter;
  lfoGain: Tone.Gain;
  lfo: Tone.LFO;
  chorus: Tone.Chorus;
  flanger: CustomFlanger;
  phaser: Tone.Phaser;
  arpState?: {
    notes: string[];
    currentIndex: number;
    lastStep16: number;
  };
}

export class ExplosionSynth {
  private noise: Tone.NoiseSynth;
  private filter: Tone.Filter;
  private volumeNode: Tone.Volume;
  public volume: Tone.Param<"decibels">;
  private context: Tone.BaseContext;

  constructor(options: { context: Tone.BaseContext }) {
    this.context = options.context;
    this.volumeNode = new Tone.Volume({ context: this.context });
    this.volume = this.volumeNode.volume;
    this.filter = new Tone.Filter({ context: this.context, type: 'lowpass', frequency: 800, Q: 2 }).connect(this.volumeNode);
    this.noise = new Tone.NoiseSynth({
      context: this.context,
      noise: { type: 'white' },
      envelope: { attack: 0.01, decay: 1.5, sustain: 0, release: 1.0 }
    }).connect(this.filter);
  }

  public connect(dest: Tone.ToneAudioNode) {
    this.volumeNode.connect(dest);
    return this;
  }

  public set(_options: any) {
    return this;
  }

  public triggerAttackRelease(duration: string | number, time?: number) {
    this.noise.triggerAttackRelease(duration, time);
    const t = time ?? Tone.now();
    this.filter.frequency.setValueAtTime(1000, t);
    this.filter.frequency.exponentialRampToValueAtTime(100, t + 1.5);
    return this;
  }

  public triggerRelease(time?: number) {
    if (this.noise.triggerRelease) this.noise.triggerRelease(time);
    return this;
  }

  public dispose() {
    this.noise.dispose();
    this.filter.dispose();
    this.volumeNode.dispose();
    return this;
  }
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

export class CustomFlanger extends Tone.FeedbackDelay {
  public frequency: Tone.Signal<"frequency">;
  public depth: Tone.Signal<"normalRange">;

  constructor(options?: any) {
    const context = options?.context ?? Tone.getContext();
    super({
      context,
      delayTime: 0.005,
      feedback: 0.5,
      wet: options?.wet ?? 0
    });
    
    this.frequency = new Tone.Signal({ context, value: options?.frequency ?? 1.5, units: "frequency" });
    this.depth = new Tone.Signal({ context, value: options?.depth ?? 0.5, units: "normalRange" });
  }

  public override dispose(): this {
    this.frequency.dispose();
    this.depth.dispose();
    super.dispose();
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
      case 'fat_square':
        synth = new Tone.PolySynth(Tone.Synth, { ...common, oscillator: { type: 'fatsquare', count: 3, spread: 25 }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.8, release: 0.5 } });
        break;
      case 'retro_laser':
        synth = new Tone.MembraneSynth({ ...common, pitchDecay: 0.15, octaves: 4, oscillator: { type: 'sawtooth' }, envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.3 } });
        break;
      case 'retro_explosion':
        synth = new ExplosionSynth({ context });
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
      existing.synth = this.createSynthByType(type, existing.lfoGain, context);
      existing.currentType = type;
      return existing;
    }

    if (existing) return existing;

    const reverb = new Tone.Freeverb({ context, roomSize: 0.7, dampening: 4000 }).connect(this.masterVolume);
    const delay = new Tone.FeedbackDelay({ context, delayTime: "8n.", feedback: 0.3, wet: 0 }).connect(reverb);
    
    const chorus = new Tone.Chorus({ context, frequency: 1.5, delayTime: 3.5, depth: 0.5, wet: 0 }).start();
    const flanger = new CustomFlanger({ context, frequency: 1.5, depth: 0.5, wet: 0 });
    const phaser = new Tone.Phaser({ context, frequency: 1.5, octaves: 3, Q: 10, wet: 0 });
    const lfoFilter = new Tone.Filter({ context, type: 'lowpass', frequency: 20000 });
    const lfoGain = new Tone.Gain({ context, gain: 1.0 });
    const lfo = new Tone.LFO({ context, frequency: 5.0, min: 0, max: 1 }).start();

    lfoGain.connect(lfoFilter);
    lfoFilter.connect(phaser);
    phaser.connect(flanger);
    flanger.connect(chorus);
    chorus.connect(delay);

    const synth = this.createSynthByType(type, lfoGain, context);
    const nodes: TrackNodes = { 
      synth, reverb, delay, currentType: type,
      lfoFilter, lfoGain, lfo, chorus, flanger, phaser
    };
    this.trackNodes.set(key, nodes);
    return nodes;
  }

  public static resetSynth(trackKey: string) {
    if (this.trackNodes.has(trackKey)) {
      const nodes = this.trackNodes.get(trackKey)!;
      nodes.synth.dispose();
      nodes.reverb.dispose();
      nodes.delay.dispose();
      nodes.lfoFilter.dispose();
      nodes.lfoGain.dispose();
      nodes.lfo.dispose();
      nodes.chorus.dispose();
      nodes.flanger.dispose();
      nodes.phaser.dispose();
      this.trackNodes.delete(trackKey);
    }
  }

  public static clearAllSynths(): void {
    this.trackNodes.forEach((nodes) => {
      nodes.synth.dispose();
      nodes.reverb.dispose();
      nodes.delay.dispose();
      nodes.lfoFilter.dispose();
      nodes.lfoGain.dispose();
      nodes.lfo.dispose();
      nodes.chorus.dispose();
      nodes.flanger.dispose();
      nodes.phaser.dispose();
    });
    this.trackNodes.clear();
  }

  private static updateModulationFX(nodes: any, track: any, time: number) {
    const type = track.modFX_type ?? 'none';
    const rate = track.modFX_rate ?? 1.5;
    const depth = track.modFX_depth ?? 0.5;
    const wet = track.modFX_wet ?? 0.5;

    if (type === 'none') {
      nodes.chorus.wet.setValueAtTime(0, time);
      nodes.flanger.wet.setValueAtTime(0, time);
      nodes.phaser.wet.setValueAtTime(0, time);
    } else if (type === 'chorus') {
      nodes.chorus.frequency.setValueAtTime(rate, time);
      nodes.chorus.depth = depth;
      nodes.chorus.wet.setValueAtTime(wet, time);
      nodes.flanger.wet.setValueAtTime(0, time);
      nodes.phaser.wet.setValueAtTime(0, time);
    } else if (type === 'flanger') {
      nodes.flanger.frequency.setValueAtTime(rate, time);
      nodes.flanger.depth.setValueAtTime(depth, time);
      nodes.flanger.wet.setValueAtTime(wet, time);
      nodes.chorus.wet.setValueAtTime(0, time);
      nodes.phaser.wet.setValueAtTime(0, time);
    } else if (type === 'phaser') {
      nodes.phaser.frequency.setValueAtTime(rate, time);
      nodes.phaser.wet.setValueAtTime(wet, time);
      nodes.chorus.wet.setValueAtTime(0, time);
      nodes.flanger.wet.setValueAtTime(0, time);
    }
  }

  private static updateLFO(nodes: any, track: any, time: number) {
    const target = track.lfo_target ?? 'none';
    const rate = track.lfo_rate ?? 5.0;
    const depth = track.lfo_depth ?? 0.5;
    const waveform = track.lfo_waveform ?? 'sine';
    
    nodes.lfo.disconnect();
    
    nodes.lfo.frequency.setValueAtTime(rate, time);
    nodes.lfo.type = waveform;

    if (target === 'pitch') {
      const range = 100 * depth;
      nodes.lfo.min = -range;
      nodes.lfo.max = range;
      
      nodes.lfoFilter.frequency.setValueAtTime(20000, time);
      nodes.lfoGain.gain.setValueAtTime(1.0, time);
      
      if (nodes.synth.detune) {
        nodes.lfo.connect(nodes.synth.detune);
      }
    } else if (target === 'filter') {
      nodes.lfo.min = 200;
      nodes.lfo.max = 200 + (10000 - 200) * depth;
      
      if (nodes.synth.detune && nodes.synth.detune.setValueAtTime) {
        nodes.synth.detune.setValueAtTime(0, time);
      } else if (nodes.synth.detune) {
        nodes.synth.detune.value = 0;
      }
      nodes.lfoGain.gain.setValueAtTime(1.0, time);
      
      nodes.lfo.connect(nodes.lfoFilter.frequency);
    } else if (target === 'volume') {
      nodes.lfo.min = 1.0 - depth;
      nodes.lfo.max = 1.0;
      
      if (nodes.synth.detune && nodes.synth.detune.setValueAtTime) {
        nodes.synth.detune.setValueAtTime(0, time);
      } else if (nodes.synth.detune) {
        nodes.synth.detune.value = 0;
      }
      nodes.lfoFilter.frequency.setValueAtTime(20000, time);
      
      nodes.lfo.connect(nodes.lfoGain.gain);
    } else {
      if (nodes.synth.detune && nodes.synth.detune.setValueAtTime) {
        nodes.synth.detune.setValueAtTime(0, time);
      } else if (nodes.synth.detune) {
        nodes.synth.detune.value = 0;
      }
      nodes.lfoFilter.frequency.setValueAtTime(20000, time);
      nodes.lfoGain.gain.setValueAtTime(1.0, time);
    }
  }

  private static setupLoop() {
    const store = useSequencerStore();
    Tone.Transport.scheduleRepeat((time) => {
      const step32 = Math.round(Tone.Transport.getSecondsAtTime(time) / Tone.Time('32n').toSeconds());
      const currentGlobalStep16 = Math.floor(step32 / 2);
      let active: { patternId: number, stepInPattern: number, arrangerTrackId: number }[] = [];
      
      if (store.isSongMode) {
        let maxStep = 32;
        store.arrangerTracks.forEach(t => t.placements.forEach(p => {
          const s = store.patterns[p.patternId]?.gridSize || 32;
          if (p.startStep + s > maxStep) maxStep = p.startStep + s;
        }));
        const currentGlobalStep = currentGlobalStep16 % maxStep;
        if (step32 % 2 === 0) {
          Tone.Draw.schedule(() => {
            store.globalStep = currentGlobalStep;
            store.setCurrentStep(0);
          }, time);
        }
        
        store.arrangerTracks.forEach(t => t.placements.forEach(p => {
          const s = store.patterns[p.patternId]?.gridSize || 32;
          if (currentGlobalStep >= p.startStep && currentGlobalStep < p.startStep + s) {
            active.push({ patternId: p.patternId, stepInPattern: (currentGlobalStep - p.startStep) + 1, arrangerTrackId: t.id });
          }
        }));
      } else {
        const pId = store.currentPatternId;
        const s = store.patterns[pId]?.gridSize || 32;
        const currentStep = (currentGlobalStep16 % s) + 1;
        if (step32 % 2 === 0) {
          Tone.Draw.schedule(() => {
            store.setCurrentStep(currentStep);
            store.globalStep = 0;
          }, time);
        }
        active.push({ patternId: pId, stepInPattern: currentStep, arrangerTrackId: 0 });
      }

      active.forEach(({ patternId, stepInPattern, arrangerTrackId }) => {
        const pattern = store.patterns[patternId];
        if (!pattern) return;
        pattern.tracks.forEach(track => {
          if (track.muted) return;
          const notes = track.notes[stepInPattern] || [];
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

          this.updateModulationFX(nodes, track, time);
          this.updateLFO(nodes, track, time);

          if ((track.arp_enabled ?? false) && notes.length > 0) {
            if (step32 % 2 === 0) {
              const sorted = [...notes].sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());
              const expanded: string[] = [];
              const octaves = track.arp_octaves ?? 1;
              for (let oct = 0; oct < octaves; oct++) {
                sorted.forEach(note => {
                  const midi = Tone.Frequency(note).toMidi() + oct * 12;
                  expanded.push(Tone.Frequency(midi, "midi").toNote());
                });
              }
              
              let finalNotes = expanded;
              const arp_direction = track.arp_direction ?? 'up';
              if (arp_direction === 'down') {
                finalNotes = [...expanded].reverse();
              } else if (arp_direction === 'updown') {
                if (expanded.length > 1) {
                  finalNotes = [...expanded, ...[...expanded].slice(1, -1).reverse()];
                } else {
                  finalNotes = expanded;
                }
              } else if (arp_direction === 'random') {
                const copy = [...expanded];
                for (let i = copy.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [copy[i], copy[j]] = [copy[j], copy[i]];
                }
                finalNotes = copy;
              }
              
              nodes.arpState = {
                notes: finalNotes,
                currentIndex: 0,
                lastStep16: stepInPattern
              };
            }

            let ticksPerArpNote = 2;
            const arp_rate = track.arp_rate ?? '16n';
            if (arp_rate === '32n') ticksPerArpNote = 1;
            else if (arp_rate === '8n') ticksPerArpNote = 4;

            if (step32 % ticksPerArpNote === 0) {
              const arpState = nodes.arpState;
              if (arpState && arpState.notes.length > 0) {
                const noteToPlay = arpState.notes[arpState.currentIndex % arpState.notes.length];
                arpState.currentIndex = (arpState.currentIndex + 1) % arpState.notes.length;
                
                const type = track.type;
                if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot', 'retro_laser', 'retro_explosion'].includes(type)) {
                  if (['kick', 'tom', 'conga', 'woodblock', 'retro_laser'].includes(type)) {
                    nodes.synth.triggerAttackRelease(noteToPlay, arp_rate, time);
                  } else {
                    nodes.synth.triggerAttackRelease(arp_rate, time);
                  }
                } else {
                  nodes.synth.triggerAttackRelease(noteToPlay, arp_rate, time);
                }
              }
            }
          } else {
            if (step32 % 2 === 0 && notes.length > 0) {
              const type = track.type;
              if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot', 'retro_laser', 'retro_explosion'].includes(type)) {
                if (['kick', 'tom', 'conga', 'woodblock', 'retro_laser'].includes(type)) {
                  const noteToPlay = notes[0] || (type === 'kick' ? 'C2' : 'C3');
                  nodes.synth.triggerAttackRelease(noteToPlay, '16n', time);
                } else {
                  nodes.synth.triggerAttackRelease('16n', time);
                }
              } else {
                nodes.synth.triggerAttackRelease(notes, '16n', time);
              }
            }
          }
        });
      });
    }, '32n');
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
      
      if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot', 'retro_laser', 'retro_explosion'].includes(type)) {
        if (['kick', 'tom', 'conga', 'woodblock', 'retro_laser'].includes(type)) {
          s.triggerAttackRelease(note || 'C2', duration);
        } else {
          s.triggerAttackRelease(duration);
        }
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
          
          const chorus = new Tone.Chorus({ context: context as any, frequency: 1.5, delayTime: 3.5, depth: 0.5, wet: 0 }).start();
          const flanger = new CustomFlanger({ context: context as any, frequency: 1.5, depth: 0.5, wet: 0 });
          const phaser = new Tone.Phaser({ context: context as any, frequency: 1.5, octaves: 3, Q: 10, wet: 0 });
          const lfoFilter = new Tone.Filter({ context: context as any, type: 'lowpass', frequency: 20000 });
          const lfoGain = new Tone.Gain({ context: context as any, gain: 1.0 });
          const lfo = new Tone.LFO({ context: context as any, frequency: 5.0, min: 0, max: 1 }).start();

          lfoGain.connect(lfoFilter);
          lfoFilter.connect(phaser);
          phaser.connect(flanger);
          flanger.connect(chorus);
          chorus.connect(delay);

          const synth = AudioEngine.createSynthByType(d.track.type, lfoGain, context as any);
          synths.set(key, { synth, reverb, delay, lfoFilter, lfoGain, lfo, chorus, flanger, phaser });
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
        
        // Actualizar efectos de modulación y LFO en offline
        AudioEngine.updateModulationFX(n, d.track, d.t);
        AudioEngine.updateLFO(n, d.track, d.t);

        const type = d.track.type;
        if ((d.track.arp_enabled ?? false) && d.n && d.n.length > 0) {
          // Ordenar cromáticamente y expandir octavas para arpegio offline
          const sorted = [...d.n].sort((a, b) => Tone.Frequency(a).toMidi() - Tone.Frequency(b).toMidi());
          const expanded: string[] = [];
          const octaves = d.track.arp_octaves ?? 1;
          for (let oct = 0; oct < octaves; oct++) {
            sorted.forEach(note => {
              const midi = Tone.Frequency(note).toMidi() + oct * 12;
              expanded.push(Tone.Frequency(midi, "midi").toNote());
            });
          }
          
          let finalNotes = expanded;
          const arp_direction = d.track.arp_direction ?? 'up';
          if (arp_direction === 'down') {
            finalNotes = [...expanded].reverse();
          } else if (arp_direction === 'updown') {
            if (expanded.length > 1) {
              finalNotes = [...expanded, ...[...expanded].slice(1, -1).reverse()];
            } else {
              finalNotes = expanded;
            }
          } else if (d.track.arp_direction === 'random') {
            const copy = [...expanded];
            for (let i = copy.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [copy[i], copy[j]] = [copy[j], copy[i]];
            }
            finalNotes = copy;
          }

          let ticks = 1;
          let dur = '16n';
          const arp_rate = d.track.arp_rate ?? '16n';
          if (arp_rate === '32n') {
            ticks = 2;
            dur = '32n';
          } else if (arp_rate === '8n') {
            ticks = 1;
            dur = '8n';
          }

          for (let i = 0; i < ticks; i++) {
            const noteToPlay = finalNotes[i % finalNotes.length];
            const noteTime = d.t + i * (secondsPerStep / ticks);
            
            if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot', 'retro_laser', 'retro_explosion'].includes(type)) {
              if (['kick', 'tom', 'conga', 'woodblock', 'retro_laser'].includes(type)) {
                n.synth.triggerAttackRelease(noteToPlay, dur, noteTime);
              } else {
                n.synth.triggerAttackRelease(dur, noteTime);
              }
            } else {
              n.synth.triggerAttackRelease(noteToPlay, dur, noteTime);
            }
          }
        } else {
          if (['kick', 'snare', 'hihat', 'clap', 'crash', 'noise', 'tom', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot', 'retro_laser', 'retro_explosion'].includes(type)) {
            if (['kick', 'tom', 'conga', 'woodblock', 'retro_laser'].includes(type)) {
              const rawNote = d.n ? (Array.isArray(d.n) ? d.n[0] : d.n) : null;
              const noteToPlay = rawNote || (type === 'kick' ? 'C2' : 'C3');
              n.synth.triggerAttackRelease(noteToPlay, '16n', d.t);
            } else {
              n.synth.triggerAttackRelease('16n', d.t);
            }
          } else {
            n.synth.triggerAttackRelease(d.n, '16n', d.t);
          }
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
