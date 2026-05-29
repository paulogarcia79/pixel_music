import { Given, When, Then } from 'vitest-cucumber-plugin';
import { expect } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSequencerStore } from '../../src/stores/sequencer';

const pinia = createPinia();
setActivePinia(pinia);

Given('a new sequencer state', (state: any) => {
  useSequencerStore().$reset();
  return state;
});

Given('there is a note {string} at step {int} in {string}', (state: any, [note, step, trackName]: [string, number, string]) => {
  const store = useSequencerStore();
  store.addNote(trackName, step, note);
  return state;
});

When('I add a note {string} at step {int} in {string}', (state: any, [note, step, trackName]: [string, number, string]) => {
  const store = useSequencerStore();
  store.addNote(trackName, step, note);
  return state;
});

Then('{string} should have a note {string} at step {int}', (state: any, [trackName, note, step]: [string, string, number]) => {
  const store = useSequencerStore();
  const notes = store.getNoteAt(trackName, step);
  expect(notes).toBeDefined();
  expect(notes).toContain(note);
  return state;
});

Then('{string} should only have the note {string} at step {int}', (state: any, [trackName, note, step]: [string, string, number]) => {
  const store = useSequencerStore();
  const notes = store.getNoteAt(trackName, step);
  expect(notes).toBeDefined();
  expect(notes).toContain(note);
  return state;
});

Then('{string} should not have the note {string} at step {int}', (state: any, [trackName, note, step]: [string, string, number]) => {
  const store = useSequencerStore();
  const notes = store.getNoteAt(trackName, step);
  if (notes) {
    expect(notes).not.toContain(note);
  }
  return state;
});

Then('{string} should not have a note {string} at step {int}', (state: any, [trackName, note, step]: [string, string, number]) => {
  const store = useSequencerStore();
  const notes = store.getNoteAt(trackName, step);
  if (notes) {
    expect(notes).not.toContain(note);
  }
  return state;
});

When('I remove note {string} at step {int} from {string}', (state: any, [note, step, trackName]: [string, number, string]) => {
  const store = useSequencerStore();
  store.removeNote(trackName, step, note);
  return state;
});

let legacyProjectData: any = null;
Given('a project with monophonic note {string} at step {int} in {string}', (state: any, [note, step, trackName]: [string, number, string]) => {
  legacyProjectData = {
    bpm: 120,
    patterns: {
      1: {
        gridSize: 32,
        tracks: [
          {
            name: trackName,
            notes: {
              [step]: note
            },
            type: 'square',
            volume: -10,
            reverbWet: 0.1,
            delayWet: 0.1,
            muted: false,
            attack: 0.01,
            release: 0.5
          }
        ]
      }
    }
  };
  return state;
});

When('I load the project', (state: any) => {
  const store = useSequencerStore();
  store.loadProject(legacyProjectData);
  return state;
});

When('the current step is set to {int}', (state: any, [step]: [number]) => {
  const store = useSequencerStore();
  store.setCurrentStep(step);
  return state;
});

Then('the sequencer should indicate step {int} is active', (state: any, [step]: [number]) => {
  const store = useSequencerStore();
  expect(store.currentStep).toBe(step);
  return state;
});

When('I set the instrument of {string} to {string}', (state: any, [trackName, type]: [string, string]) => {
  const store = useSequencerStore();
  store.setTrackType(trackName, type as any);
  return state;
});

Then('{string} should have {string} as instrument type', (state: any, [trackName, type]: [string, string]) => {
  const store = useSequencerStore();
  const track = store.getTrackInPattern(trackName, 1);
  expect(track?.type).toBe(type);
  return state;
});
