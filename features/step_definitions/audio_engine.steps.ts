import { Given, When, Then } from 'vitest-cucumber-plugin';
import { expect, vi } from 'vitest';
import { AudioEngine } from '../../src/audio/AudioEngine';

// Mock de Tone.js para el entorno de pruebas
vi.mock('tone', () => {
  class SynthMock {
    toDestination() {
      return this;
    }
    triggerAttackRelease() {}
  }
  return {
    Synth: SynthMock,
    start: vi.fn(),
  };
});

Given('que el motor de audio está inicializado', (state: any) => {
  AudioEngine.initialize();
  return state;
});

When('envío la orden de tocar la nota {string} con duración {string}', (state: any, [nota, duracion]: string[]) => {
  AudioEngine.playNote(nota, duracion);
  return state;
});

Then('el motor debe haber registrado la nota para reproducirla', (state: any) => {
  expect(AudioEngine.getLastPlayedNote()).toBe('C4');
  return state;
});
