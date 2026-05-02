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
      clap: () => new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
      }),
      crash: () => new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 0.5 }
      }),
      tom: () => new Tone.MembraneSynth({
        pitchDecay: 0.1, octaves: 4, oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.01, release: 1.4 }
      }),
      bass_synth: () => new Tone.FMSynth({
        harmonicity: 0.5, modulationIndex: 5,
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.8, release: 0.5 }
      }),
      lead_synth: () => new Tone.Synth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.5 }
      }),
      pad: () => new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 2 }
      }),
      noise: () => new Tone.NoiseSynth({ 
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.0 } 
      }),
      sine: () => new Tone.Synth({ 
        oscillator: { type: 'sine' }, 
        envelope: { attack: 0.05, release: 1 } 
      }),
      pulse: () => new Tone.Synth({ 
        oscillator: { type: 'pulse' }, 
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 } 
      }),
      pwm: () => new Tone.Synth({ 
        oscillator: { type: 'pwm' }, 
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.5 } 
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

  private static stepCounter = 0;
  private static sequenceIndex = 0;

  private static setupLoop() {
    const store = useSequencerStore();
    
    Tone.Transport.scheduleRepeat((time) => {
      let patternId = store.currentPatternId;
      if (store.isSongMode && store.songSequence.length > 0) {
        patternId = store.songSequence[this.sequenceIndex];
      }

      const currentPattern = store.patterns[patternId];
      if (!currentPattern) return;

      const gridSize = currentPattern.gridSize || 32;
      const stepInBar = this.stepCounter + 1;
      const currentSeqIndex = this.sequenceIndex;

      Tone.Draw.schedule(() => {
        store.setCurrentStep(stepInBar);
        if (store.isSongMode) {
          store.currentSequenceIndex = currentSeqIndex;
          store.currentPatternId = patternId; // follow sequence
        }
      }, time);

      currentPattern.tracks.forEach(track => {
        if (track.muted) return;

        const note = track.notes[stepInBar];
        if (note) {
          const nodes = this.getOrCreateNodesForTrack(track.name, track.type);
          
          nodes.synth.volume.setValueAtTime(track.volume - 6, time);
          nodes.reverb.wet.setValueAtTime(track.reverbWet, time);
          nodes.delay.wet.setValueAtTime(track.delayWet, time);

          if (['noise', 'snare', 'hihat', 'clap', 'crash'].includes(track.type)) {
            (nodes.synth as Tone.NoiseSynth).triggerAttackRelease('16n', time);
          } else if (['kick', 'tom'].includes(track.type)) {
            (nodes.synth as Tone.MembraneSynth).triggerAttackRelease(note, '16n', time);
          } else {
            nodes.synth.triggerAttackRelease(note, '16n', time);
          }
        }
      });

      this.stepCounter++;
      if (this.stepCounter >= gridSize) {
        this.stepCounter = 0;
        if (store.isSongMode && store.songSequence.length > 0) {
          this.sequenceIndex = (this.sequenceIndex + 1) % store.songSequence.length;
        }
      }
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
      
      this.stepCounter = 0;
      this.sequenceIndex = 0;
      useSequencerStore().setCurrentStep(0);
    } else {
      this.stepCounter = 0;
      this.sequenceIndex = 0;
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

    if (['noise', 'snare', 'hihat', 'clap', 'crash'].includes(type)) {
      (nodes.synth as Tone.NoiseSynth).triggerAttackRelease(duration, time);
    } else if (['kick', 'tom'].includes(type)) {
      (nodes.synth as Tone.MembraneSynth).triggerAttackRelease(note, duration, time);
    } else {
      nodes.synth.triggerAttackRelease(note, duration, time);
    }
  }

  public static getLastPlayedNote(): string | null {
    return this.lastPlayedNote;
  }

  public static async exportAudioOffline(): Promise<void> {
    await Tone.start();
    const store = useSequencerStore();
    const secondsPerStep = Tone.Time('16n').toSeconds();
    
    // Calculate total duration based on song mode or single pattern
    let totalStepsToRender = 0;
    if (store.isSongMode) {
      store.songSequence.forEach(pid => {
        const p = store.patterns[pid];
        if (p) totalStepsToRender += (p.gridSize || 32);
      });
    } else {
      const p = store.patterns[store.currentPatternId];
      if (p) totalStepsToRender = (p.gridSize || 32);
    }
    const duration = totalStepsToRender * secondsPerStep + 3; // +3 seconds for reverb/delay tails

    const buffer = await Tone.Offline(({ transport }) => {
      // Recreate master chain for offline context
      const masterLimiter = new Tone.Limiter(-1).toDestination();
      const masterCompressor = new Tone.Compressor({
        threshold: -12, ratio: 4, attack: 0.003, release: 0.25
      }).connect(masterLimiter);
      const masterVolume = new Tone.Volume(0).connect(masterCompressor);

      const synths = new Map<string, TrackNodes>();

      const getOfflineNodes = (trackName: string, type: InstrumentType) => {
        const existing = synths.get(trackName);
        if (existing && existing.currentType !== type) {
          existing.synth.dispose();
          existing.synth = AudioEngine.createSynthByType(type, existing.delay);
          existing.currentType = type;
          return existing;
        }
        if (existing) return existing;

        const reverb = new Tone.Reverb({ decay: 1.5, wet: 0 }).connect(masterVolume);
        const delay = new Tone.FeedbackDelay({ delayTime: "8n.", feedback: 0.3, wet: 0 }).connect(reverb);
        const synth = AudioEngine.createSynthByType(type, delay);
        
        synth.volume.value = -16;
        const nodes = { synth, reverb, delay, currentType: type };
        synths.set(trackName, nodes);
        return nodes;
      };

      let stepCounter = 0;
      let sequenceIndex = 0;

      transport.scheduleRepeat((time) => {
        let patternId = store.currentPatternId;
        if (store.isSongMode && store.songSequence.length > 0) {
          patternId = store.songSequence[sequenceIndex];
        }

        const currentPattern = store.patterns[patternId];
        if (!currentPattern) return;

        const gridSize = currentPattern.gridSize || 32;
        const stepInBar = stepCounter + 1;

        currentPattern.tracks.forEach(track => {
          if (track.muted) return;
          const note = track.notes[stepInBar];
          if (note) {
            const nodes = getOfflineNodes(track.name, track.type);
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

        stepCounter++;
        if (stepCounter >= gridSize) {
          stepCounter = 0;
          if (store.isSongMode && store.songSequence.length > 0) {
            sequenceIndex = (sequenceIndex + 1) % store.songSequence.length;
          }
        }
      }, '16n');

      transport.start(0);
    }, duration);

    // Convert buffer to WAV Blob
    const wavBlob = await this.bufferToWav(buffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.download = `pixel_music_export_${Date.now()}.wav`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  private static async bufferToWav(buffer: Tone.ToneAudioBuffer): Promise<Blob> {
    const audioBuffer = buffer.get();
    if (!audioBuffer) throw new Error("Audio buffer is empty");
    
    const numOfChan = audioBuffer.numberOfChannels,
          length = audioBuffer.length * numOfChan * 2 + 44,
          bufferData = new ArrayBuffer(length),
          view = new DataView(bufferData);
          
    let channels = [], i, sample, offset = 0, pos = 0;

    const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"
    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    for(i = 0; i < audioBuffer.numberOfChannels; i++)
      channels.push(audioBuffer.getChannelData(i));

    while(pos < length) {
      for(i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
        view.setInt16(pos, sample, true); // write 16-bit sample
        pos += 2;
      }
      offset++
    }

    return new Blob([bufferData], { type: "audio/wav" });
  }
}
