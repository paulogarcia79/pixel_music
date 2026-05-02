import { Given, When, Then } from 'vitest-cucumber-plugin';
import { expect, vi } from 'vitest';
import { AudioEngine } from '../../src/audio/AudioEngine';

// Mock de Tone.js para el entorno de pruebas
vi.mock('tone', () => {
  class GenericMock {
    toDestination() { return this; }
    connect() { return this; }
    fan() { return this; }
    triggerAttackRelease() {}
    dispose() {}
    setValueAtTime() {}
    volume = { value: 0, rampTo: vi.fn(), setValueAtTime: vi.fn() };
    wet = { value: 0, setValueAtTime: vi.fn() };
  }
  return {
    Synth: class extends GenericMock {},
    NoiseSynth: class extends GenericMock {},
    MembraneSynth: class extends GenericMock {},
    FMSynth: class extends GenericMock {},
    Reverb: class extends GenericMock {},
    FeedbackDelay: class extends GenericMock {},
    Limiter: class extends GenericMock {},
    Compressor: class extends GenericMock {},
    Volume: class extends GenericMock {},
    Waveform: class extends GenericMock { getValue() { return new Float32Array(256); } },
    Recorder: class extends GenericMock { start() {} stop() { return Promise.resolve(new Blob()); } },
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => 0),
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
    })),
    Draw: {
      schedule: vi.fn((f) => f())
    }
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
