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
  class NoiseSynthMock {
    toDestination() {
      return this;
    }
    triggerAttackRelease() {}
  }
  return {
    Synth: SynthMock,
    NoiseSynth: NoiseSynthMock,
    start: vi.fn(),
    Transport: {
      scheduleRepeat: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      seconds: 0,
      state: 'stopped',
      bpm: { value: 120 }
    },
    Time: vi.fn(() => ({
      toSeconds: () => 0.25
    }))
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
  expect(AudioEngine.getLastPlayedNote()).not.toBeNull();
  return state;
});

When('envío la orden de tocar la nota {string} con duración {string} usando {string}', (state: any, [nota, duracion, tipo]: [string, string, string]) => {
  AudioEngine.playNote(nota, duracion, tipo as any);
  return state;
});
