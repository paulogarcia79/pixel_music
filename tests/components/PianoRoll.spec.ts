import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
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
import PianoRoll from '../../src/components/sequencer/PianoRoll.vue';
import { AudioEngine } from '../../src/audio/AudioEngine';

describe('PianoRoll.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('filters rows based on active octave selection', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(PianoRoll);
    app.mount(container);
    await nextTick();

    // Por defecto están las 3 octavas (36 filas de notas).
    // Excluimos la celda vacía de esquina (R14)
    let noteLabels = container.querySelectorAll('.grid > div.sticky.left-0:not(.top-0)');
    expect(noteLabels.length).toBe(36);

    // Simular clic en el botón de la octava "Low"
    const lowButton = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim().toLowerCase() === 'low'
    ) as HTMLButtonElement;
    
    expect(lowButton).not.toBeUndefined();
    lowButton.click();
    await nextTick();

    // Ahora sólo debe haber 12 notas de la octava 3 visibles (R14)
    noteLabels = container.querySelectorAll('.grid > div.sticky.left-0:not(.top-0)');
    expect(noteLabels.length).toBe(12);
    expect(noteLabels[0].textContent).toContain('B3');

    app.unmount();
    container.remove();
  });

  it('applies scale helper styling correctly', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(PianoRoll);
    app.mount(container);
    await nextTick();

    // Seleccionar escala "C Major"
    const select = container.querySelector('select') as HTMLSelectElement;
    expect(select).not.toBeNull();
    select.value = 'major';
    select.dispatchEvent(new Event('change'));
    await nextTick();

    // C Major tiene C, D, E, F, G, A, B.
    // C# (Sharp) no forma parte de Do Mayor, por lo que su fila debe estar atenuada/opaca (R16)
    const cSharpRow = Array.from(container.querySelectorAll('.grid > div.sticky.left-0:not(.top-0)')).find(
      (el) => el.textContent?.trim() === 'C#4'
    ) as HTMLElement;
    
    expect(cSharpRow).not.toBeUndefined();
    // Debe tener la clase opacity-40 o bg-black/60
    expect(cSharpRow.className).toContain('opacity-40');

    app.unmount();
    container.remove();
  });

  it('renders hover notes overlay when hovering an empty cell', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(PianoRoll);
    app.mount(container);
    await nextTick();

    // Buscamos las celdas interactivas reales (R17)
    const cells = container.querySelectorAll('.grid > div.cursor-pointer');
    const cell = cells[0] as HTMLElement; // step 1 of note B5
    expect(cell).not.toBeUndefined();

    // Simular hover (mouseenter)
    cell.dispatchEvent(new MouseEvent('mouseenter'));
    await nextTick();

    // Debería renderizar la letra de la nota (por ejemplo "B5") de forma sutil en la celda (R17)
    expect(cell.textContent).toContain('B5');

    // Simular salida (mouseleave)
    cell.dispatchEvent(new MouseEvent('mouseleave'));
    await nextTick();

    // Debería desaparecer
    expect(cell.textContent).not.toContain('B5');

    app.unmount();
    container.remove();
  });

  it('R13: Clicking an empty cell adds the note to the active track step and plays preview', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(PianoRoll);
    app.mount(container);
    await nextTick();

    const store = useSequencerStore();
    store.$reset();
    store.selectedTrackName = 'Track 1';
    store.ensureTrackExists('Track 1');

    // Spy on AudioEngine.playNote
    const playNoteSpy = vi.spyOn(AudioEngine, 'playNote');

    // B5 is at index 0 of visibleNotes
    // Let's click step 3 of B5 (index 2 in cells)
    const cells = container.querySelectorAll('.grid > div.cursor-pointer');
    const cell = cells[2] as HTMLElement; 
    expect(cell).not.toBeUndefined();

    // Verify it is not active initially
    expect(store.getNoteAt('Track 1', 3)).toBeUndefined();

    // Click to add note
    cell.click();
    await nextTick();

    // Should be added in the store as step notes array
    expect(store.getNoteAt('Track 1', 3)).toEqual(['B5']);
    
    // Should trigger preview playing only B5
    expect(playNoteSpy).toHaveBeenCalledWith('B5', '16n', 'square', 'Track 1');

    playNoteSpy.mockRestore();
    app.unmount();
    container.remove();
  });

  it('R14 & R15: Clicking an active cell removes only that individual note, and isNoteActive checks inclusion', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(PianoRoll);
    app.mount(container);
    await nextTick();

    const store = useSequencerStore();
    store.$reset();
    store.selectedTrackName = 'Track 1';
    store.ensureTrackExists('Track 1');

    // Add multiple notes manually to step 5 to create a chord
    store.addNote('Track 1', 5, 'B5');
    store.addNote('Track 1', 5, 'A5');
    await nextTick();

    expect(store.getNoteAt('Track 1', 5)).toEqual(['B5', 'A5']);

    // Find the cell for step 5 of note B5 (B5 is index 0 of visibleNotes, so cell is cells[4])
    const cells = container.querySelectorAll('.grid > div.cursor-pointer');
    const cellB5 = cells[4] as HTMLElement;
    expect(cellB5).not.toBeUndefined();

    // R15: Verify the cell reflects it is active (class bg-neon-pink)
    expect(cellB5.className).toContain('bg-neon-pink');

    // Click B5 cell to toggle it off (should remove only B5, leaving A5 active)
    cellB5.click();
    await nextTick();

    // Verify only B5 is removed
    expect(store.getNoteAt('Track 1', 5)).toEqual(['A5']);
    expect(cellB5.className).not.toContain('bg-neon-pink');

    app.unmount();
    container.remove();
  });

  it('R16: getGhostNotes correctly returns tracks that have the note programmed in that step', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp(PianoRoll);
    app.mount(container);
    await nextTick();

    const store = useSequencerStore();
    store.$reset();
    
    // Create 'Track 1' as active, and 'Track 2' as another track in the store
    store.selectedTrackName = 'Track 1';
    store.ensureTrackExists('Track 1');
    store.addTrack('Track 2', 'triangle');
    await nextTick();

    // Put B5 on Track 2 step 7
    store.addNote('Track 2', 7, 'B5');
    await nextTick();

    // Verify step 7 B5 cell (cells[6]) renders ghost note overlay
    const cells = container.querySelectorAll('.grid > div.cursor-pointer');
    const cellStep7 = cells[6] as HTMLElement;
    expect(cellStep7).not.toBeUndefined();

    // The ghost note overlay element (class border-neon-cyan/35) should be present inside the cell
    const ghostNoteOverlay = cellStep7.querySelector('.border-neon-cyan\\/35');
    expect(ghostNoteOverlay).not.toBeNull();

    app.unmount();
    container.remove();
  });
});
