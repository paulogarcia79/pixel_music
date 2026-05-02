import { defineStore } from 'pinia';
import * as Tone from 'tone';

export type InstrumentType = 'square' | 'triangle' | 'sawtooth' | 'noise';

interface Track {
  name: string;
  notes: Record<number, string>; // step -> note
  type: InstrumentType;
}

export const useSequencerStore = defineStore('sequencer', {
  state: () => ({
    tracks: [] as Track[],
    bpm: 120,
    currentStep: 0,
    selectedTrackName: 'Track 1',
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
      this.tracks.push({ name, notes: {}, type });
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
    addNote(trackName: string, step: number, note: string) {
      this.ensureTrackExists(trackName);
      const track = this.tracks.find(t => t.name === trackName);
      if (track) {
        // Monophonic restriction: just set the note for the step
        track.notes[step] = note;
      }
    },
    removeNote(trackName: string, step: number) {
      const track = this.tracks.find(t => t.name === trackName);
      if (track) {
        delete track.notes[step];
      }
    },
    getNoteAt(trackName: string, step: number): string | undefined {
      const track = this.tracks.find(t => t.name === trackName);
      return track?.notes[step];
    },
    clearAll() {
      this.tracks.forEach(track => {
        track.notes = {};
      });
    }
  }
});
