import { vi } from 'vitest';

// Mock global de Tone.js para todo el entorno de pruebas
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
    PolySynth: class extends GenericMock {
      set() { return this; }
      triggerAttackRelease() {}
    },
    MonoSynth: class extends GenericMock {},
    PluckSynth: class extends GenericMock {},
    MetalSynth: class extends GenericMock {},
    NoiseSynth: class extends GenericMock {
      triggerAttackRelease() {}
    },
    MembraneSynth: class extends GenericMock {
      triggerAttackRelease() {}
    },
    FMSynth: class extends GenericMock {},
    Reverb: class extends GenericMock {},
    FeedbackDelay: class extends GenericMock {},
    Filter: class extends GenericMock {
      _frequency = {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn()
      };
      get frequency() {
        return this._frequency;
      }
    },
    Limiter: class extends GenericMock {},
    Compressor: class extends GenericMock {},
    Volume: class extends GenericMock {},
    Freeverb: class extends GenericMock {},
    JCReverb: class extends GenericMock {},
    FeedbackDelay: class extends GenericMock {},
    Waveform: class extends GenericMock { getValue() { return new Float32Array(256); } },
    Recorder: class extends GenericMock { start() {} stop() { return Promise.resolve(new Blob()); } },
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => 0),
    getContext: vi.fn(() => ({})),
    setContext: vi.fn(),
    Offline: vi.fn().mockImplementation(async (callback) => {
      class MockContext {
        destination = {};
      }
      return callback(new MockContext());
    }),
    Gain: class extends GenericMock {
      gain = { value: 1.0, setValueAtTime: vi.fn() };
    },
    Signal: class extends GenericMock {},
    Chorus: class extends GenericMock {
      start() { return this; }
      frequency = { setValueAtTime: vi.fn() };
      depth = 0.5;
    },
    Flanger: class extends GenericMock {
      frequency = { setValueAtTime: vi.fn() };
      depth = { setValueAtTime: vi.fn() };
    },
    Phaser: class extends GenericMock {
      frequency = { setValueAtTime: vi.fn() };
      Q = { setValueAtTime: vi.fn() };
    },
    LFO: class extends GenericMock {
      start() { return this; }
      frequency = { setValueAtTime: vi.fn() };
      type = 'sine';
      min = 0;
      max = 1;
      disconnect() {}
      connect() { return this; }
    },
    Frequency: vi.fn().mockImplementation((val) => {
      return {
        toMidi: () => {
          if (typeof val === 'number') return val;
          const noteMap: Record<string, number> = {
            'C2': 36, 'C3': 48, 'Eb3': 51, 'G3': 55, 'Bb3': 58,
            'C4': 60, 'E4': 64, 'Eb4': 63, 'F4': 65, 'G4': 67,
            'A4': 69, 'B4': 71, 'C5': 72, 'D5': 74, 'E5': 76,
            'G5': 79, 'Bb4': 70, 'C6': 84, 'B5': 83
          };
          return noteMap[val] || 60;
        },
        toNote: () => {
          if (typeof val === 'number') {
            const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            const octave = Math.floor(val / 12) - 1;
            const noteName = notes[val % 12];
            return `${noteName}${octave}`;
          }
          return val;
        }
      };
    }),
    Transport: {
      scheduleRepeat: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      getSecondsAtTime: vi.fn(() => 0),
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
