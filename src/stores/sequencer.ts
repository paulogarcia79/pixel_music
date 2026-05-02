import { defineStore } from 'pinia';
import * as Tone from 'tone';

export type InstrumentType = 'square' | 'triangle' | 'sawtooth' | 'noise' | 'sine' | 'fm_pluck' | 'fm_bell';

interface Track {
  name: string;
  patterns: Record<number, Record<number, string>>; // patternId -> step -> note
  type: InstrumentType;
  volume: number;
  muted: boolean;
}

export const useSequencerStore = defineStore('sequencer', {
  state: () => ({
    tracks: [] as Track[],
    bpm: 120,
    currentStep: 0,
    selectedTrackName: 'Track 1',
    currentPatternId: 1,
    songSequence: [1], // Sequence of patterns to play
    currentSequenceIndex: 0,
    isSongMode: false,
  }),
  actions: {
    setCurrentStep(step: number) {
      this.currentStep = step;
    },
    setBpm(val: number) {
      this.bpm = val;
      Tone.Transport.bpm.value = val;
    },
    addTrack(name: string, type: InstrumentType = 'square') {
      this.tracks.push({ 
        name, 
        patterns: { 1: {} }, 
        type, 
        volume: -10, 
        muted: false 
      });
    },
    removeTrack(name: string) {
      this.tracks = this.tracks.filter(t => t.name !== name);
      if (this.selectedTrackName === name && this.tracks.length > 0) {
        this.selectedTrackName = this.tracks[0].name;
      }
    },
    ensureTrackExists(name: string) {
      if (!this.tracks.find(t => t.name === name)) {
        this.addTrack(name);
      }
    },
    setTrackType(trackName: string, type: InstrumentType) {
      this.ensureTrackExists(trackName);
      const track = this.tracks.find(t => t.name === trackName);
      if (track) {
        track.type = type;
      }
    },
    toggleMute(trackName: string) {
      const track = this.tracks.find(t => t.name === trackName);
      if (track) {
        track.muted = !track.muted;
      }
    },
    setVolume(trackName: string, volume: number) {
      const track = this.tracks.find(t => t.name === trackName);
      if (track) {
        track.volume = volume;
      }
    },
    addNote(trackName: string, step: number, note: string) {
      this.ensureTrackExists(trackName);
      const track = this.tracks.find(t => t.name === trackName);
      if (track) {
        if (!track.patterns[this.currentPatternId]) {
          track.patterns[this.currentPatternId] = {};
        }
        track.patterns[this.currentPatternId][step] = note;
      }
    },
    removeNote(trackName: string, step: number) {
      const track = this.tracks.find(t => t.name === trackName);
      if (track && track.patterns[this.currentPatternId]) {
        delete track.patterns[this.currentPatternId][step];
      }
    },
    getNoteAt(trackName: string, step: number, patternId?: number): string | undefined {
      const track = this.tracks.find(t => t.name === trackName);
      const pId = patternId ?? this.currentPatternId;
      return track?.patterns[pId]?.[step];
    },
    clearAll() {
      this.tracks.forEach(track => {
        track.patterns = { 1: {} };
      });
      this.currentPatternId = 1;
      this.songSequence = [1];
      this.currentSequenceIndex = 0;
    },
    loadProject(data: any) {
      if (data.tracks) {
        // Migration for old format
        this.tracks = data.tracks.map((t: any) => ({
          ...t,
          patterns: t.patterns || { 1: t.notes || {} }
        }));
      }
      if (data.bpm) this.setBpm(data.bpm);
      if (data.songSequence) this.songSequence = data.songSequence;
    },
    setPattern(id: number) {
      this.currentPatternId = id;
      this.tracks.forEach(t => {
        if (!t.patterns[id]) t.patterns[id] = {};
      });
    },
    addToSequence(patternId: number) {
      this.songSequence.push(patternId);
    },
    removeFromSequence(index: number) {
      this.songSequence.splice(index, 1);
      if (this.songSequence.length === 0) this.songSequence = [1];
    }
  }
});
