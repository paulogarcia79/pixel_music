import { describe, it, expect, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';

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

import Knob from '../../src/components/sequencer/Knob.vue';

describe('Knob.vue', () => {
  it('renders with correct default labels and values', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const modelValue = ref(0.5);
    const app = createApp({
      render() {
        return h(Knob, {
          modelValue: modelValue.value,
          min: 0,
          max: 1,
          label: 'ATTACK',
          unit: 's',
          'onUpdate:modelValue': (val: number) => {
            modelValue.value = val;
          }
        });
      }
    });

    app.mount(container);
    await nextTick();

    // Comprobar la etiqueta
    expect(container.textContent).toContain('ATTACK');
    // Comprobar el valor formateado
    expect(container.textContent).toContain('0.50s');

    // Comprobar la rotación de la perilla. 0.5 está justo en la mitad entre 0 y 1.
    // El porcentaje es 0.5. El ángulo es -135 + 0.5 * 270 = 0.
    const indicator = container.querySelector('.relative > div > div') as HTMLElement;
    expect(indicator.style.transform).toBe('rotate(0deg)');

    app.unmount();
    container.remove();
  });

  it('updates angle and format when modelValue changes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const modelValue = ref(0);
    const app = createApp({
      render() {
        return h(Knob, {
          modelValue: modelValue.value,
          min: 0,
          max: 1,
          label: 'RELEASE',
          unit: 's',
          'onUpdate:modelValue': (val: number) => {
            modelValue.value = val;
          }
        });
      }
    });

    app.mount(container);
    await nextTick();

    // 0 es el mínimo, ángulo = -135deg
    let indicator = container.querySelector('.relative > div > div') as HTMLElement;
    expect(indicator.style.transform).toBe('rotate(-135deg)');
    expect(container.textContent).toContain('0.00s');

    // Cambiar valor a 1
    modelValue.value = 1;
    await nextTick();

    // 1 es el máximo, ángulo = 135deg
    indicator = container.querySelector('.relative > div > div') as HTMLElement;
    expect(indicator.style.transform).toBe('rotate(135deg)');
    expect(container.textContent).toContain('1.00s');

    app.unmount();
    container.remove();
  });

  it('emits update:modelValue on wheel event', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const modelValue = ref(0.5);
    const updatedValue = ref<number | null>(null);

    const app = createApp({
      render() {
        return h(Knob, {
          modelValue: modelValue.value,
          min: 0,
          max: 1,
          step: 0.1,
          'onUpdate:modelValue': (val: number) => {
            modelValue.value = val;
            updatedValue.value = val;
          }
        });
      }
    });

    app.mount(container);
    await nextTick();

    const knobElement = container.querySelector('.cursor-ns-resize') as HTMLElement;
    expect(knobElement).not.toBeNull();

    // Simular evento wheel hacia arriba (deltaY < 0 aumenta valor)
    const wheelEvent = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
    knobElement.dispatchEvent(wheelEvent);
    await nextTick();

    expect(updatedValue.value).toBeCloseTo(0.6);

    // Simular evento wheel hacia abajo (deltaY > 0 disminuye valor)
    const wheelEventDown = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
    knobElement.dispatchEvent(wheelEventDown);
    await nextTick();

    expect(updatedValue.value).toBeCloseTo(0.5);

    app.unmount();
    container.remove();
  });
});
