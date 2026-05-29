import { defineStore } from 'pinia';
import * as Tone from 'tone';
import { AudioEngine } from '../audio/AudioEngine';

export type InstrumentType = 
  | 'square' | 'triangle' | 'sawtooth' | 'noise' | 'sine' | 'pulse' | 'pwm' 
  | 'fm_pluck' | 'fm_bell' | 'bass_synth' | 'lead_synth' | 'pad'
  | 'kick' | 'snare' | 'hihat' | 'tom' | 'clap' | 'crash' | 'conga' | 'cowbell' | 'woodblock' | 'shaker' | 'rimshot'
  | 'organ_pixel' | 'church_organ' 
  | 'guitar_pixel' | 'guitar_dist' 
  | 'piano_pixel' | 'electric_piano' | 'honky_tonk'
  | 'flute_pixel' | 'clarinet_pixel' | 'retro_oboe'
  | 'acid_synth' | 'retro_brass' | 'ghost_synth' | 'sub_bass' | 'super_saw'
  | 'fat_square' | 'retro_laser' | 'retro_explosion';

export interface TrackInstance {
  name: string;
  notes: Record<number, string[]>; // step -> array of notes
  type: InstrumentType;
  volume: number;
  reverbWet: number;
  delayWet: number;
  muted: boolean;
  attack: number;
  release: number;
  decay: number;
  sustain: number;
  dampening: number;
  resonance: number;
}

export interface Pattern {
  gridSize: number;
  tracks: TrackInstance[];
}

export interface PatternPlacement {
  id: string;
  patternId: number;
  startStep: number;
}

export interface ArrangerTrack {
  id: number;
  name: string;
  placements: PatternPlacement[];
}

export interface PresetDefinition {
  name: string;
  bpm: number;
  tracks: TrackInstance[];
}

export const PATTERN_PRESETS: Record<string, PresetDefinition> = {
  'Chiptune Techno': {
    name: 'Chiptune Techno',
    bpm: 130,
    tracks: [
      {
        name: 'Kick',
        notes: { 1: ['C2'], 5: ['C2'], 9: ['C2'], 13: ['C2'], 17: ['C2'], 21: ['C2'], 25: ['C2'], 29: ['C2'] },
        type: 'kick',
        volume: -8,
        reverbWet: 0.1,
        delayWet: 0.0,
        muted: false,
        attack: 0.01,
        release: 0.4,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Hihat',
        notes: { 3: ['C4'], 7: ['C4'], 11: ['C4'], 15: ['C4'], 19: ['C4'], 23: ['C4'], 27: ['C4'], 31: ['C4'] },
        type: 'hihat',
        volume: -12,
        reverbWet: 0.2,
        delayWet: 0.1,
        muted: false,
        attack: 0.01,
        release: 0.05,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Bass',
        notes: { 1: ['C3'], 4: ['Eb3'], 7: ['G3'], 10: ['Bb3'], 13: ['C3'], 16: ['Eb3'], 19: ['G3'], 22: ['Bb3'], 25: ['C3'], 28: ['Eb3'], 31: ['G3'] },
        type: 'acid_synth',
        volume: -10,
        reverbWet: 0.1,
        delayWet: 0.2,
        muted: false,
        attack: 0.01,
        release: 0.2,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Lead',
        notes: { 5: ['C4'], 9: ['G4'], 13: ['C5'], 21: ['Bb4'], 25: ['G4'] },
        type: 'square',
        volume: -10,
        reverbWet: 0.3,
        delayWet: 0.3,
        muted: false,
        attack: 0.02,
        release: 0.4,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      }
    ]
  },
  'Synthwave Retro': {
    name: 'Synthwave Retro',
    bpm: 120,
    tracks: [
      {
        name: 'Kick',
        notes: { 1: ['C2'], 9: ['C2'], 17: ['C2'], 25: ['C2'] },
        type: 'kick',
        volume: -8,
        reverbWet: 0.1,
        delayWet: 0.0,
        muted: false,
        attack: 0.01,
        release: 0.4,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Snare',
        notes: { 5: ['C4'], 13: ['C4'], 21: ['C4'], 29: ['C4'] },
        type: 'snare',
        volume: -10,
        reverbWet: 0.3,
        delayWet: 0.0,
        muted: false,
        attack: 0.01,
        release: 0.1,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Bass',
        notes: { 1: ['C3'], 3: ['C3'], 5: ['C3'], 7: ['C3'], 9: ['C3'], 11: ['C3'], 13: ['C3'], 15: ['C3'], 17: ['C3'], 19: ['C3'], 21: ['C3'], 23: ['C3'], 25: ['C3'], 27: ['C3'], 29: ['C3'], 31: ['C3'] },
        type: 'bass_synth',
        volume: -8,
        reverbWet: 0.1,
        delayWet: 0.1,
        muted: false,
        attack: 0.01,
        release: 0.3,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Pad',
        notes: { 1: ['C4'], 17: ['G4'] },
        type: 'pad',
        volume: -12,
        reverbWet: 0.5,
        delayWet: 0.4,
        muted: false,
        attack: 0.4,
        release: 1.2,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      }
    ]
  },
  '8-Bit Rock': {
    name: '8-Bit Rock',
    bpm: 140,
    tracks: [
      {
        name: 'Drums',
        notes: { 1: ['C4'], 5: ['C4'], 9: ['C4'], 13: ['C4'], 17: ['C4'], 21: ['C4'], 25: ['C4'], 29: ['C4'] },
        type: 'noise',
        volume: -10,
        reverbWet: 0.1,
        delayWet: 0.0,
        muted: false,
        attack: 0.01,
        release: 0.05,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Bass',
        notes: { 1: ['C3'], 5: ['Eb3'], 9: ['F3'], 13: ['G3'], 17: ['C3'], 21: ['Eb3'], 25: ['F3'], 29: ['Bb3'] },
        type: 'sub_bass',
        volume: -6,
        reverbWet: 0.0,
        delayWet: 0.0,
        muted: false,
        attack: 0.01,
        release: 0.2,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Guitar',
        notes: { 1: ['C4'], 3: ['Eb4'], 5: ['F4'], 7: ['G4'], 9: ['C4'], 11: ['Eb4'], 13: ['F4'], 15: ['G4'] },
        type: 'guitar_dist',
        volume: -12,
        reverbWet: 0.2,
        delayWet: 0.2,
        muted: false,
        attack: 0.02,
        release: 0.4,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      }
    ]
  },
  'Ambient Space': {
    name: 'Ambient Space',
    bpm: 90,
    tracks: [
      {
        name: 'Pluck',
        notes: { 1: ['C4'], 5: ['G4'], 9: ['C5'], 13: ['D5'], 17: ['G4'], 21: ['C5'], 25: ['D5'], 29: ['G5'] },
        type: 'fm_pluck',
        volume: -12,
        reverbWet: 0.6,
        delayWet: 0.5,
        muted: false,
        attack: 0.1,
        release: 0.8,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Bell',
        notes: { 3: ['E5'], 11: ['G5'], 19: ['C6'], 27: ['B5'] },
        type: 'fm_bell',
        volume: -14,
        reverbWet: 0.7,
        delayWet: 0.6,
        muted: false,
        attack: 0.05,
        release: 1.5,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      },
      {
        name: 'Slow Pad',
        notes: { 1: ['C3'], 17: ['F3'] },
        type: 'pad',
        volume: -12,
        reverbWet: 0.8,
        delayWet: 0.4,
        muted: false,
        attack: 0.8,
        release: 2.0,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      }
    ]
  },
  'Empty': {
    name: 'Empty',
    bpm: 120,
    tracks: [
      {
        name: 'Track 1',
        notes: {},
        type: 'square',
        volume: -10,
        reverbWet: 0.1,
        delayWet: 0.1,
        muted: false,
        attack: 0.01,
        release: 0.5,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      }
    ]
  }
};

export const useSequencerStore = defineStore('sequencer', {
  state: () => ({
    patterns: {
      1: {
        gridSize: 32,
        tracks: [
          {
            name: 'Track 1',
            notes: {},
            type: 'square' as InstrumentType,
            volume: -10,
            reverbWet: 0.1,
            delayWet: 0.1,
            muted: false,
            attack: 0.01,
            release: 0.5,
            decay: 0.1,
            sustain: 0.8,
            dampening: 4000,
            resonance: 0.95
          }
        ]
      }
    } as Record<number, Pattern>,
    arrangerTracks: [
      { id: 1, name: 'Seq 1', placements: [] }
    ] as ArrangerTrack[],
    bpm: 120,
    currentStep: 0,
    globalStep: 0,
    selectedTrackName: 'Track 1',
    currentPatternId: 1,
    currentSequenceIndex: 0,
    isSongMode: false,
  }),
  getters: {
    currentPattern: (state) => state.patterns[state.currentPatternId],
    currentTracks: (state) => state.patterns[state.currentPatternId]?.tracks || [],
  },
  actions: {
    setCurrentStep(step: number) {
      this.currentStep = step;
    },
    setBpm(val: number) {
      this.bpm = val;
      Tone.Transport.bpm.value = val;
    },
    createDefaultTrack(name: string, type: InstrumentType = 'square'): TrackInstance {
      return {
        name,
        notes: {},
        type,
        volume: -10,
        reverbWet: 0.1,
        delayWet: 0.1,
        muted: false,
        attack: 0.01,
        release: 0.5,
        decay: 0.1,
        sustain: 0.8,
        dampening: 4000,
        resonance: 0.95
      };
    },
    addTrack(name: string, type: InstrumentType = 'square') {
      if (!this.currentPattern) return;
      this.currentPattern.tracks.push(this.createDefaultTrack(name, type));
    },
    duplicateTrack(name: string) {
      if (!this.currentPattern) return;
      const original = this.currentPattern.tracks.find(t => t.name === name);
      if (original) {
        let newName = `${original.name} (Copy)`;
        let counter = 1;
        while (this.currentPattern.tracks.find(t => t.name === newName)) {
          newName = `${original.name} (Copy ${counter})`;
          counter++;
        }
        this.currentPattern.tracks.push({
          ...JSON.parse(JSON.stringify(original)),
          name: newName
        });
        this.selectedTrackName = newName;
      }
    },
    removeTrack(name: string) {
      if (!this.currentPattern) return;
      this.currentPattern.tracks = this.currentPattern.tracks.filter(t => t.name !== name);
      if (this.selectedTrackName === name && this.currentPattern.tracks.length > 0) {
        this.selectedTrackName = this.currentPattern.tracks[0].name;
      }
    },
    ensureTrackExists(name: string) {
      if (!this.currentPattern) return;
      if (!this.currentPattern.tracks.find(t => t.name === name)) {
        this.addTrack(name);
      }
    },
    getTrackInPattern(trackName: string, patternId?: number): TrackInstance | undefined {
      const pId = patternId ?? this.currentPatternId;
      return this.patterns[pId]?.tracks.find(t => t.name === trackName);
    },
    setTrackType(trackName: string, type: InstrumentType) {
      const track = this.getTrackInPattern(trackName);
      if (track) track.type = type;
    },
    setTrackADSR(trackName: string, attack: number, decay: number, sustain: number, release: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) {
        track.attack = attack;
        track.decay = decay;
        track.sustain = sustain;
        track.release = release;
      }
    },
    setTrackPhysicalModel(trackName: string, dampening: number, resonance: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) {
        track.dampening = dampening;
        track.resonance = resonance;
      }
    },
    setTrackReverb(trackName: string, value: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) track.reverbWet = value;
    },
    setTrackDelay(trackName: string, value: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) track.delayWet = value;
    },
    toggleMute(trackName: string) {
      const track = this.getTrackInPattern(trackName);
      if (track) track.muted = !track.muted;
    },
    setVolume(trackName: string, volume: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) track.volume = volume;
    },
    addNote(trackName: string, step: number, note: string) {
      const track = this.getTrackInPattern(trackName);
      if (track) {
        if (!track.notes[step]) {
          track.notes[step] = [];
        }
        if (!track.notes[step].includes(note)) {
          track.notes[step].push(note);
        }
      }
    },
    removeNote(trackName: string, step: number, note?: string) {
      const track = this.getTrackInPattern(trackName);
      if (track) {
        if (note !== undefined && track.notes[step]) {
          track.notes[step] = track.notes[step].filter(n => n !== note);
          if (track.notes[step].length === 0) {
            delete track.notes[step];
          }
        } else {
          delete track.notes[step];
        }
      }
    },
    getNoteAt(trackName: string, step: number, patternId?: number): string[] | undefined {
      const track = this.getTrackInPattern(trackName, patternId);
      return track?.notes[step];
    },
    clearAll() {
      this.patterns = {
        1: { gridSize: 32, tracks: [this.createDefaultTrack('Track 1')] }
      };
      this.arrangerTracks = [{ id: 1, name: 'Seq 1', placements: [] }];
      this.currentPatternId = 1;
      this.globalStep = 0;
      this.selectedTrackName = 'Track 1';
      this.isSongMode = false;
    },
    loadProject(data: any) {
      if (data.patterns) {
        this.patterns = data.patterns;
        Object.values(this.patterns).forEach(p => {
          if (!p.gridSize) p.gridSize = 32;
          p.tracks.forEach(t => {
            if (t.attack === undefined) t.attack = 0.01;
            if (t.release === undefined) t.release = 0.5;
            if (t.decay === undefined) t.decay = 0.1;
            if (t.sustain === undefined) t.sustain = 0.8;
            if (t.dampening === undefined) t.dampening = 4000;
            if (t.resonance === undefined) t.resonance = 0.95;
            if (t.notes) {
              Object.keys(t.notes).forEach(stepKey => {
                const step = parseInt(stepKey);
                const val = t.notes[step];
                if (typeof val === 'string') {
                  t.notes[step] = [val];
                }
              });
            }
          });
        });
      }
      if (data.bpm) this.setBpm(data.bpm);
      if (data.arrangerTracks) {
        this.arrangerTracks = data.arrangerTracks;
      }
      this.isSongMode = !!data.isSongMode;
    },
    setPattern(id: number) {
      this.currentPatternId = id;
      if (!this.patterns[id]) {
        this.patterns[id] = {
          gridSize: 32,
          tracks: [this.createDefaultTrack('Track 1')]
        };
      }
      if (this.patterns[id].tracks.length > 0) {
        this.selectedTrackName = this.patterns[id].tracks[0].name;
      }
    },
    duplicatePattern(sourceId: number, targetId: number) {
      if (this.patterns[sourceId]) {
        this.patterns[targetId] = JSON.parse(JSON.stringify(this.patterns[sourceId]));
      }
    },
    addArrangerTrack() {
      const id = Math.max(0, ...this.arrangerTracks.map(t => t.id)) + 1;
      this.arrangerTracks.push({ id, name: `Seq ${id}`, placements: [] });
    },
    removeArrangerTrack(id: number) {
      if (this.arrangerTracks.length > 1) {
        this.arrangerTracks = this.arrangerTracks.filter(t => t.id !== id);
      } else {
        this.arrangerTracks[0].placements = [];
      }
    },
    addPlacement(arrangerTrackId: number, patternId: number, startStep: number) {
      const track = this.arrangerTracks.find(t => t.id === arrangerTrackId);
      if (track) {
        track.placements.push({
          id: Date.now().toString() + Math.random().toString(),
          patternId,
          startStep
        });
      }
    },
    removePlacement(arrangerTrackId: number, placementId: string) {
      const track = this.arrangerTracks.find(t => t.id === arrangerTrackId);
      if (track) {
        track.placements = track.placements.filter(p => p.id !== placementId);
      }
    },
    setGridSize(size: number) {
      if (this.currentPattern) {
        this.currentPattern.gridSize = size;
        this.currentPattern.tracks.forEach(track => {
          Object.keys(track.notes).forEach(step => {
            if (parseInt(step) > size) {
              delete track.notes[parseInt(step)];
            }
          });
        });
      }
    },
    clearCurrentPattern() {
      if (this.currentPattern) {
        this.currentPattern.tracks.forEach(track => {
          track.notes = {};
        });
      }
    },
    clearTrackNotes(trackName: string) {
      const track = this.getTrackInPattern(trackName);
      if (track) track.notes = {};
    },
    loadPreset(presetName: string) {
      const preset = PATTERN_PRESETS[presetName];
      if (!preset) return;

      // 1. Limpiar nodos del motor de audio
      AudioEngine.clearAllSynths();

      // 2. Sobreescribir las pistas del patrón activo
      const currentPattern = this.patterns[this.currentPatternId];
      if (currentPattern) {
        currentPattern.tracks = JSON.parse(JSON.stringify(preset.tracks));
        currentPattern.tracks.forEach(t => {
          if (t.attack === undefined) t.attack = 0.01;
          if (t.release === undefined) t.release = 0.5;
          if (t.decay === undefined) t.decay = 0.1;
          if (t.sustain === undefined) t.sustain = 0.8;
          if (t.dampening === undefined) t.dampening = 4000;
          if (t.resonance === undefined) t.resonance = 0.95;
          if (t.notes) {
            Object.keys(t.notes).forEach(stepKey => {
              const step = parseInt(stepKey);
              const val = t.notes[step];
              if (typeof val === 'string') {
                t.notes[step] = [val];
              }
            });
          }
        });
      }

      // 3. Modificar BPM
      this.setBpm(preset.bpm);

      // 4. Seleccionar la primera pista por defecto
      if (preset.tracks.length > 0) {
        this.selectedTrackName = preset.tracks[0].name;
      }
    }
  }
});
