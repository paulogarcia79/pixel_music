import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';

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
    Freeverb: class extends GenericMock {},
    JCReverb: class extends GenericMock {},
    FeedbackDelay: class extends GenericMock {},
    Waveform: class extends GenericMock { getValue() { return new Float32Array(256); } },
    Recorder: class extends GenericMock { start() {} stop() { return Promise.resolve(new Blob()); } },
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn(() => 0),
    getContext: vi.fn(() => ({})),
    setContext: vi.fn(),
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

import { useSequencerStore } from '../../src/stores/sequencer';
import DevicePanel from '../../src/components/sequencer/DevicePanel.vue';

describe('DevicePanel.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders a message when no track is selected', async () => {
    const store = useSequencerStore();
    store.$patch({
      selectedTrackName: 'Non Existent Track'
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(DevicePanel, {
          isOpen: true,
          onToggle: () => {}
        });
      }
    });

    app.mount(container);
    await nextTick();

    expect(container.textContent).toContain('No active track selected');

    app.unmount();
    container.remove();
  });

  it('renders track controls and envelope shape when track is active', async () => {
    const store = useSequencerStore();
    // Creamos una pista de prueba
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.attack = 0.5;
    track.release = 1.0;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(DevicePanel, {
          isOpen: true,
          onToggle: () => {}
        });
      }
    });

    app.mount(container);
    await nextTick();

    expect(container.textContent).toContain('Track 1');
    expect(container.textContent).toContain('Oscillator Section');
    expect(container.textContent).toContain('ADSR Envelope');
    expect(container.textContent).toContain('FX Send Rack');

    // Corrected selector: selects the ADSR curve path instead of the PixelIcon SVG path
    const path = container.querySelector('svg path[stroke="#ff2a6d"]') as SVGPathElement;
    expect(path).not.toBeNull();
    const dAttributeBefore = path.getAttribute('d');

    // Modificar los parámetros del track en el store
    track.attack = 1.5;
    track.release = 3.0;
    await nextTick();

    const dAttributeAfter = path.getAttribute('d');
    // El path debe haber cambiado reactivamente en respuesta a la mutación de parámetros (R8)
    expect(dAttributeBefore).not.toBe(dAttributeAfter);

    app.unmount();
    container.remove();
  });
});
