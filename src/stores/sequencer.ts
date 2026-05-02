import { defineStore } from 'pinia';
import * as Tone from 'tone';

export type InstrumentType = 'square' | 'triangle' | 'sawtooth' | 'noise' | 'sine' | 'fm_pluck' | 'fm_bell' | 'kick' | 'snare' | 'hihat';

export interface TrackInstance {
  name: string;
  notes: Record<number, string>; // step -> note
  type: InstrumentType;
  volume: number;
  reverbWet: number;
  delayWet: number;
  muted: boolean;
}

export interface Pattern {
  tracks: TrackInstance[];
}

export const useSequencerStore = defineStore('sequencer', {
  state: () => ({
    patterns: {
      1: {
        tracks: [
          {
            name: 'Track 1',
            notes: {},
            type: 'square' as InstrumentType,
            volume: -10,
            reverbWet: 0.1,
            delayWet: 0.1,
            muted: false
          }
        ]
      }
    } as Record<number, Pattern>,
    bpm: 120,
    currentStep: 0,
    selectedTrackName: 'Track 1',
    currentPatternId: 1,
    songSequence: [1], // Sequence of patterns to play
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
        muted: false
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
        1: {
          tracks: [this.createDefaultTrack('Track 1')]
        }
      };
      this.currentPatternId = 1;
      this.songSequence = [1];
      this.currentSequenceIndex = 0;
      this.selectedTrackName = 'Track 1';
    },
    loadProject(data: any) {
      if (data.patterns) {
        this.patterns = data.patterns;
      } else if (data.tracks) {
        // Migration from very old format
        this.patterns = {
          1: { tracks: data.tracks }
        };
      }
      if (data.bpm) this.setBpm(data.bpm);
      if (data.songSequence) this.songSequence = data.songSequence;
    },
    setPattern(id: number) {
      this.currentPatternId = id;
      if (!this.patterns[id]) {
        this.patterns[id] = {
          tracks: [this.createDefaultTrack('Track 1')]
        };
      }
      // Select first track of the new pattern
      if (this.patterns[id].tracks.length > 0) {
        this.selectedTrackName = this.patterns[id].tracks[0].name;
      }
    },
    duplicatePattern(sourceId: number, targetId: number) {
      if (this.patterns[sourceId]) {
        this.patterns[targetId] = JSON.parse(JSON.stringify(this.patterns[sourceId]));
      }
    },
    addToSequence(patternId: number) {
      this.songSequence.push(patternId);
    },
    removeFromSequence(index: number) {
      this.songSequence.splice(index, 1);
      if (this.songSequence.length === 0) this.songSequence = [1];
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
