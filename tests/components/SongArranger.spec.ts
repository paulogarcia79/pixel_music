import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
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
import SongArranger from '../../src/components/sequencer/SongArranger.vue';

describe('SongArranger.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('places a pattern aligned with the Snap grid on timeline click', async () => {
    const store = useSequencerStore();
    store.clearAll();
    
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(SongArranger);
    app.mount(container);
    await nextTick();

    // Comprobamos que inicialmente no hay placements
    expect(store.arrangerTracks[0].placements.length).toBe(0);

    // Buscamos el carril del arranger
    const trackRow = container.querySelector('.cursor-crosshair') as HTMLElement;
    expect(trackRow).not.toBeNull();

    // Simulamos un clic en el carril. La cabecera es de 80px.
    // Si queremos colocar en el paso 16, el offset de X es 80px + (16 * STEP_WIDTH) = 80 + 16 * 12 = 272px.
    // Hacemos mock de getBoundingClientRect para dar valores consistentes
    trackRow.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 1000,
      bottom: 40,
      width: 1000,
      height: 40,
      x: 0,
      y: 0,
      toJSON: () => {}
    });

    const clickEvent = new MouseEvent('click', {
      clientX: 275, // 275 - 80 = 195. Con step width 12: 195 / 12 = 16.25. Con snap a 8 pasos: Math.floor(16.25/8)*8 = 16.
      clientY: 20,
      bubbles: true
    });
    trackRow.dispatchEvent(clickEvent);
    await nextTick();

    // Comprobamos que se añadió un placement en la posición 16 alineado al snap (R20)
    expect(store.arrangerTracks[0].placements.length).toBe(1);
    expect(store.arrangerTracks[0].placements[0].startStep).toBe(16);

    app.unmount();
    container.remove();
  });

  it('removes a placement block instantly upon clicking it', async () => {
    const store = useSequencerStore();
    store.clearAll();
    // Añadir un placement de antemano
    store.addPlacement(1, 1, 8);
    expect(store.arrangerTracks[0].placements.length).toBe(1);

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(SongArranger);
    app.mount(container);
    await nextTick();

    // Buscamos el bloque de colocación en el DOM
    const block = container.querySelector('.bg-neon-pink\\/15') as HTMLElement;
    expect(block).not.toBeNull();

    // Simulamos clic sobre el bloque (click-to-remove)
    block.click();
    await nextTick();

    // El placement debe haber sido eliminado inmediatamente (R21)
    expect(store.arrangerTracks[0].placements.length).toBe(0);

    app.unmount();
    container.remove();
  });

  it('positions laser playhead correctly when isSongMode is active', async () => {
    const store = useSequencerStore();
    store.clearAll();
    store.isSongMode = true;
    store.globalStep = 24;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(SongArranger);
    app.mount(container);
    await nextTick();

    // Buscamos la línea del playhead en el DOM
    const playhead = container.querySelector('.bg-neon-pink.shadow-\\[0_0_12px_\\#ff2a6d\\,0_0_4px_\\#fff\\]') as HTMLElement;
    expect(playhead).not.toBeNull();

    // El offset left de la línea debe ser exactamente globalStep * STEP_WIDTH + 80 = 24 * 12 + 80 = 368px.
    expect(playhead.style.left).toBe('368px');

    app.unmount();
    container.remove();
  });
});
