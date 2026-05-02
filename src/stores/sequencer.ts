import { defineStore } from 'pinia';

interface Track {
  name: string;
  notes: Record<number, string>; // step -> note
}

export const useSequencerStore = defineStore('sequencer', {
  state: () => ({
    tracks: [] as Track[],
    bpm: 120,
  }),
  actions: {
    addTrack(name: string) {
      this.tracks.push({ name, notes: {} });
    },
    ensureTrackExists(name: string) {
      if (!this.tracks.find(t => t.name === name)) {
        this.addTrack(name);
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
    }
  }
});
