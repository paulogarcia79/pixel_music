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
    PolySynth: class extends GenericMock { set() { return this; } },
    MonoSynth: class extends GenericMock {},
    PluckSynth: class extends GenericMock {},
    MetalSynth: class extends GenericMock {},
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

  it('R5, R6, R7, R8: supports Decay/Sustain knobs, conditional Physical Modeling and SVG updates', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.attack = 0.1;
    track.decay = 0.2;
    track.sustain = 0.7;
    track.release = 0.5;

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

    // R5: Verify the page contains labels/controls for Attack, Decay, Sustain, Release
    expect(container.textContent).toContain('Attack');
    expect(container.textContent).toContain('Decay');
    expect(container.textContent).toContain('Sustain');
    expect(container.textContent).toContain('Release');

    // R7: Since instrument is 'square' (not guitar_pixel), Dampening and Resonance must NOT be shown
    expect(container.textContent).not.toContain('Physical Modeling');
    expect(container.textContent).not.toContain('Dampening');
    expect(container.textContent).not.toContain('Resonance');

    // Change instrument to 'guitar_pixel'
    track.type = 'guitar_pixel';
    await nextTick();

    // R6: Since instrument is now 'guitar_pixel', Physical Modeling controls must be visible
    expect(container.textContent).toContain('Physical Modeling');
    expect(container.textContent).toContain('Dampening');
    expect(container.textContent).toContain('Resonance');

    // Get SVG path for envelope
    const path = container.querySelector('svg path[stroke="#ff2a6d"]') as SVGPathElement;
    expect(path).not.toBeNull();
    const dBefore = path.getAttribute('d');

    // R8: Modify decay and sustain, SVG must react
    track.decay = 0.5;
    track.sustain = 0.3;
    await nextTick();

    const dAfter = path.getAttribute('d');
    expect(dBefore).not.toBe(dAfter);

    app.unmount();
    container.remove();
  });

  it('R13: hides ADSR controls and SVG envelope shape when active track is percussion, displaying instead the transient envelope explanation', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'kick'; // Un tipo percusivo

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

    // R13: Should NOT show ADSR Envelope controls (Attack, Decay, Sustain, Release)
    expect(container.textContent).not.toContain('Attack');
    expect(container.textContent).not.toContain('Decay');
    expect(container.textContent).not.toContain('Sustain');
    expect(container.textContent).not.toContain('Release');
    expect(container.textContent).not.toContain('Envelope Shape');

    // R13: Should NOT show the ADSR curve path
    const path = container.querySelector('svg path[stroke="#ff2a6d"]');
    expect(path).toBeNull();

    // R13: Should show the explanatory block message
    expect(container.textContent).toContain('DRUM SYNTHESIS: TRANSIENT ENVELOPE IS AUTOMATIC');
    expect(container.textContent).toContain('Short-duration transient pulses are automatically managed');

    app.unmount();
    container.remove();
  });

  it('R1-R10: verifies the complete redesigned instrument selector, layout grid, tabs, active classes, reactive store update and bidirectional auto-focus', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square'; // WAV type

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

    // 1. Verify 4 tabs are visible
    const tabs = Array.from(container.querySelectorAll('button')).filter(
      btn => ['WAV', 'SYN', 'DRM', 'KEY'].includes(btn.textContent?.trim() || '')
    );
    expect(tabs.length).toBe(4);
    expect(tabs[0].textContent?.trim()).toBe('WAV');
    expect(tabs[1].textContent?.trim()).toBe('SYN');
    expect(tabs[2].textContent?.trim()).toBe('DRM');
    expect(tabs[3].textContent?.trim()).toBe('KEY');

    // 2. Verify activeTab highlights correctly
    // 'WAV' is active because track.type is 'square'
    expect(tabs[0].className).toContain('text-neon-cyan');

    // 3. Verify grid layout of 2 columns
    const gridDiv = container.querySelector('.grid.grid-cols-2');
    expect(gridDiv).not.toBeNull();

    // 4. Verify compact height of 24px (h-6) on instrument buttons
    const instButtons = Array.from(gridDiv!.querySelectorAll('button'));
    expect(instButtons.length).toBeGreaterThan(0);
    instButtons.forEach(btn => {
      expect(btn.className).toContain('h-6');
    });

    // 5. Verify WAV instruments filter (square, triangle, sawtooth, sine, noise, pulse, pwm)
    const wavNames = instButtons.map(btn => btn.textContent?.trim().toLowerCase());
    expect(wavNames).toContain('square wave');
    expect(wavNames).toContain('sawtooth wave');
    expect(wavNames).not.toContain('pixel bass');

    // 6. Verify clicking another tab changes category activeTab and filters
    const synTab = tabs.find(t => t.textContent?.trim() === 'SYN');
    expect(synTab).not.toBeUndefined();
    
    // Simular click
    synTab!.dispatchEvent(new Event('click'));
    await nextTick();

    // Now active tab is 'SYN'
    expect(synTab!.className).toContain('text-neon-cyan');
    
    const synGridDiv = container.querySelector('.grid.grid-cols-2');
    const synButtons = Array.from(synGridDiv!.querySelectorAll('button'));
    const synNames = synButtons.map(btn => btn.textContent?.trim().toLowerCase());
    expect(synNames).toContain('pixel bass');
    expect(synNames).toContain('sub bass');
    expect(synNames).not.toContain('square wave');

    // 7. Verify clicking instrument button updates the store reactively
    const bassBtn = synButtons.find(btn => btn.textContent?.trim().toLowerCase() === 'pixel bass');
    expect(bassBtn).not.toBeUndefined();
    bassBtn!.dispatchEvent(new Event('click'));
    await nextTick();

    // Store is updated
    expect(track.type).toBe('bass_synth');

    // 8. Verify reactive bidirectional auto-focus: when track type changes externally, activeTab switches
    track.type = 'kick'; // DRM category
    await nextTick();

    const drmTab = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent?.trim() === 'DRM'
    );
    expect(drmTab).not.toBeUndefined();
    // DRM tab is automatically highlighted
    expect(drmTab!.className).toContain('text-neon-cyan');

    // Verify grid filters to DRM instruments
    const drmGridDiv = container.querySelector('.grid.grid-cols-2');
    const drmButtons = Array.from(drmGridDiv!.querySelectorAll('button'));
    const drmNames = drmButtons.map(btn => btn.textContent?.trim().toLowerCase());
    expect(drmNames).toContain('8bit kick');
    expect(drmNames).toContain('pixel snare');
    expect(drmNames).not.toContain('pixel bass');

    // Switch to trad key instrument externally
    track.type = 'piano_pixel'; // KEY category
    await nextTick();

    const keyTab = Array.from(container.querySelectorAll('button')).find(
      btn => btn.textContent?.trim() === 'KEY'
    );
    expect(keyTab).not.toBeUndefined();
    expect(keyTab!.className).toContain('text-neon-cyan');

    app.unmount();
    container.remove();
  });
});

