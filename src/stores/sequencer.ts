import { defineStore } from 'pinia';
import * as Tone from 'tone';

export type InstrumentType = 
  | 'square' | 'triangle' | 'sawtooth' | 'noise' | 'sine' | 'pulse' | 'pwm' 
  | 'fm_pluck' | 'fm_bell' | 'bass_synth' | 'lead_synth' | 'pad'
  | 'kick' | 'snare' | 'hihat' | 'tom' | 'clap' | 'crash' | 'conga' | 'cowbell' | 'woodblock' | 'shaker' | 'rimshot'
  | 'organ_pixel' | 'church_organ' 
  | 'guitar_pixel' | 'guitar_dist' 
  | 'piano_pixel' | 'electric_piano' | 'honky_tonk'
  | 'flute_pixel' | 'clarinet_pixel' | 'retro_oboe'
  | 'acid_synth' | 'retro_brass' | 'ghost_synth' | 'sub_bass' | 'super_saw';

export interface TrackInstance {
  name: string;
  notes: Record<number, string>; // step -> note
  type: InstrumentType;
  volume: number;
  reverbWet: number;
  delayWet: number;
  muted: boolean;
  attack: number;
  release: number;
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
            release: 0.5
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
        release: 0.5
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
    setTrackADSR(trackName: string, attack: number, release: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) {
        track.attack = attack;
        track.release = release;
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
      if (track) track.notes[step] = note;
    },
    removeNote(trackName: string, step: number) {
      const track = this.getTrackInPattern(trackName);
      if (track) delete track.notes[step];
    },
    getNoteAt(trackName: string, step: number, patternId?: number): string | undefined {
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
    }
  }
});
