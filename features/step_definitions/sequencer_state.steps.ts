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
  expect(store.getNoteAt(trackName, step)).toBe(note);
  return state;
});

Then('{string} should only have the note {string} at step {int}', (state: any, [trackName, note, step]: [string, string, number]) => {
  const store = useSequencerStore();
  expect(store.getNoteAt(trackName, step)).toBe(note);
  return state;
});

Then('{string} should not have the note {string} at step {int}', (state: any, [trackName, note, step]: [string, string, number]) => {
  const store = useSequencerStore();
  expect(store.getNoteAt(trackName, step)).not.toBe(note);
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
