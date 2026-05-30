import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp, h, nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useSequencerStore } from '../src/stores/sequencer';
import { AudioEngine } from '../src/audio/AudioEngine';
import DevicePanel from '../src/components/sequencer/DevicePanel.vue';
import * as Tone from 'tone';

describe('Modulation Effects, LFO, and Arpeggiator Spec Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    AudioEngine.clearAllSynths();
    AudioEngine['initialized'] = false;
  });

  // T8 - Test 1: Verificar que el loop corre a 32n y las notas convencionales se disparan cada 2 ticks
  it('R1, R2: should run setupLoop scheduled repeat at 32n and play conventional notes at step32 % 2 === 0', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.notes[1] = ['C4'];
    track.arp_enabled = false;

    const scheduleRepeatSpy = vi.spyOn(Tone.Transport, 'scheduleRepeat');
    await AudioEngine.initialize();

    expect(scheduleRepeatSpy).toHaveBeenCalledWith(expect.any(Function), '32n');
    const tickCallback = scheduleRepeatSpy.mock.lastCall![0];

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    const triggerAttackReleaseSpy = vi.spyOn(nodes.synth, 'triggerAttackRelease');

    // Simular paso de fusa par (tick 0 -> stepInPattern 1)
    vi.spyOn(Tone.Transport, 'getSecondsAtTime').mockReturnValue(0); // t = 0
    vi.spyOn(Tone.Time('32n'), 'toSeconds').mockReturnValue(0.125);
    tickCallback(0);

    // Debe dispararse el acorde convencional
    expect(triggerAttackReleaseSpy).toHaveBeenCalledWith(['C4'], '16n', 0);

    triggerAttackReleaseSpy.mockClear();

    // Simular paso de fusa impar (tick 1 -> step32 % 2 !== 0)
    // getSecondsAtTime retorna 0.125 (1 tick de 32n)
    vi.spyOn(Tone.Transport, 'getSecondsAtTime').mockReturnValue(0.125);
    tickCallback(0.125);

    // No debe dispararse en fusa impar
    expect(triggerAttackReleaseSpy).not.toHaveBeenCalled();
  });

  // T8 - Test 2: Verificar que con modFX_type = 'none' wet = 0 en toda la cadena
  it('R4: should set wet to 0 for chorus, flanger, and phaser when modFX_type is none', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.modFX_type = 'none';

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    
    const chorusWetSpy = vi.spyOn(nodes.chorus.wet, 'setValueAtTime');
    const flangerWetSpy = vi.spyOn(nodes.flanger.wet, 'setValueAtTime');
    const phaserWetSpy = vi.spyOn(nodes.phaser.wet, 'setValueAtTime');

    AudioEngine['updateModulationFX'](nodes, track, 0);

    expect(chorusWetSpy).toHaveBeenCalledWith(0, 0);
    expect(flangerWetSpy).toHaveBeenCalledWith(0, 0);
    expect(phaserWetSpy).toHaveBeenCalledWith(0, 0);
  });

  // T8 - Test 3: Verificar que activar 'chorus', 'flanger' o 'phaser' actualiza su wet y silencia los otros
  it('R5, R6: should apply correct parameters and wet mixing values to the active modFX slot and bypass the others', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.modFX_type = 'chorus';
    track.modFX_rate = 2.5;
    track.modFX_depth = 0.7;
    track.modFX_wet = 0.6;

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    
    const chorusWetSpy = vi.spyOn(nodes.chorus.wet, 'setValueAtTime');
    const flangerWetSpy = vi.spyOn(nodes.flanger.wet, 'setValueAtTime');
    const phaserWetSpy = vi.spyOn(nodes.phaser.wet, 'setValueAtTime');
    const chorusFreqSpy = vi.spyOn(nodes.chorus.frequency, 'setValueAtTime');

    AudioEngine['updateModulationFX'](nodes, track, 0);

    // Chorus activo
    expect(chorusWetSpy).toHaveBeenCalledWith(0.6, 0);
    expect(chorusFreqSpy).toHaveBeenCalledWith(2.5, 0);
    expect(nodes.chorus.depth).toBe(0.7);

    // Los otros inactivos
    expect(flangerWetSpy).toHaveBeenCalledWith(0, 0);
    expect(phaserWetSpy).toHaveBeenCalledWith(0, 0);

    // Cambiar a flanger
    track.modFX_type = 'flanger';
    track.modFX_rate = 3.0;
    track.modFX_depth = 0.8;
    track.modFX_wet = 0.4;

    const flangerFreqSpy = vi.spyOn(nodes.flanger.frequency, 'setValueAtTime');
    const flangerDepthSpy = vi.spyOn(nodes.flanger.depth, 'setValueAtTime');

    AudioEngine['updateModulationFX'](nodes, track, 0.1);

    expect(flangerWetSpy).toHaveBeenCalledWith(0.4, 0.1);
    expect(flangerFreqSpy).toHaveBeenCalledWith(3.0, 0.1);
    expect(flangerDepthSpy).toHaveBeenCalledWith(0.8, 0.1);
    expect(chorusWetSpy).toHaveBeenCalledWith(0, 0.1);
    expect(phaserWetSpy).toHaveBeenCalledWith(0, 0.1);
  });

  // T8 - Test 4: Verificar que el LFO en none desconecta y restablece afinación (0), filtro (20000) y ganancia (1.0)
  it('R8: should disconnect LFO and restore default parameters when lfo_target is none', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.lfo_target = 'none';

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    
    const lfoDisconnectSpy = vi.spyOn(nodes.lfo, 'disconnect');
    const lfoFilterFreqSpy = vi.spyOn(nodes.lfoFilter.frequency, 'setValueAtTime');
    const lfoGainSpy = vi.spyOn(nodes.lfoGain.gain, 'setValueAtTime');
    
    // Asignar un detune espía por si acaso
    nodes.synth.detune = { setValueAtTime: vi.fn(), value: 0 };
    const detuneSpy = vi.spyOn(nodes.synth.detune, 'setValueAtTime');

    AudioEngine['updateLFO'](nodes, track, 0);

    expect(lfoDisconnectSpy).toHaveBeenCalled();
    expect(detuneSpy).toHaveBeenCalledWith(0, 0);
    expect(lfoFilterFreqSpy).toHaveBeenCalledWith(20000, 0);
    expect(lfoGainSpy).toHaveBeenCalledWith(1.0, 0);
  });

  // T8 - Test 5: LFO en pitch conecta y modula detune (-100*depth a +100*depth)
  it('R9: should configure LFO to modulate synth detune when lfo_target is pitch', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.lfo_target = 'pitch';
    track.lfo_depth = 0.5; // cents range: -50 to 50
    track.lfo_rate = 6.0;

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    nodes.synth.detune = { setValueAtTime: vi.fn(), value: 0 };

    const lfoConnectSpy = vi.spyOn(nodes.lfo, 'connect');
    const lfoFreqSpy = vi.spyOn(nodes.lfo.frequency, 'setValueAtTime');

    AudioEngine['updateLFO'](nodes, track, 0);

    expect(lfoFreqSpy).toHaveBeenCalledWith(6.0, 0);
    expect(nodes.lfo.min).toBe(-50);
    expect(nodes.lfo.max).toBe(50);
    expect(lfoConnectSpy).toHaveBeenCalledWith(nodes.synth.detune);
  });

  // T8 - Test 6: LFO en filter conecta y modula lowpass (200 a 200 + 9800*depth)
  it('R10: should configure LFO to modulate dedicated lowpass filter frequency when lfo_target is filter', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.lfo_target = 'filter';
    track.lfo_depth = 0.5; // range: 200 to 200 + 4900 = 5100
    track.lfo_rate = 8.0;

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    nodes.synth.detune = { setValueAtTime: vi.fn(), value: 0 };

    const lfoConnectSpy = vi.spyOn(nodes.lfo, 'connect');

    AudioEngine['updateLFO'](nodes, track, 0);

    expect(nodes.lfo.min).toBe(200);
    expect(nodes.lfo.max).toBe(5100);
    expect(lfoConnectSpy).toHaveBeenCalledWith(nodes.lfoFilter.frequency);
  });

  // T8 - Test 7: LFO en volume conecta y modula tremolo (1.0-depth a 1.0)
  it('R11: should configure LFO to modulate dedicated gain nodes when lfo_target is volume', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.lfo_target = 'volume';
    track.lfo_depth = 0.4; // range: 0.6 to 1.0

    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    nodes.synth.detune = { setValueAtTime: vi.fn(), value: 0 };

    const lfoConnectSpy = vi.spyOn(nodes.lfo, 'connect');

    AudioEngine['updateLFO'](nodes, track, 0);

    expect(nodes.lfo.min).toBe(0.6);
    expect(nodes.lfo.max).toBe(1.0);
    expect(lfoConnectSpy).toHaveBeenCalledWith(nodes.lfoGain.gain);
  });

  // T8 - Test 8: Arpeggiator reproduce notas secuenciales según velocidad y dirección, reiniciándose en la semicorchea
  it('R13, R14, R15: should sequence notes chromatically through the arpeggiator and restart on a new step', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'square';
    track.notes[1] = ['E4', 'C4', 'G4']; // Acorde desordenado cromáticamente
    track.arp_enabled = true;
    track.arp_rate = '32n'; // corre cada tick de fusa (1 tick 32n)
    track.arp_direction = 'up';
    track.arp_octaves = 2; // expande octavas

    const scheduleRepeatSpy = vi.spyOn(Tone.Transport, 'scheduleRepeat');
    await AudioEngine.initialize();

    const tickCallback = scheduleRepeatSpy.mock.lastCall![0];
    const nodes = AudioEngine['getOrCreateLiveNodes']('0_Track 1', 'square');
    const triggerAttackReleaseSpy = vi.spyOn(nodes.synth, 'triggerAttackRelease');

    // 1. Primer tick (tick 0, step32 = 0) -> Cambio de semicorchea -> Carga y ordena notas
    // Ordenadas cromáticamente: C4 (60), E4 (64), G4 (67)
    // Expandidas 2 octavas: C4, E4, G4, C5 (72), E5 (76), G5 (79)
    vi.spyOn(Tone.Transport, 'getSecondsAtTime').mockReturnValue(0);
    tickCallback(0);

    // Debe tocar la primera nota C4
    expect(triggerAttackReleaseSpy).toHaveBeenCalledWith('C4', '32n', 0);
    expect(nodes.arpState?.notes).toEqual(['C4', 'E4', 'G4', 'C5', 'E5', 'G5']);

    triggerAttackReleaseSpy.mockClear();

    // 2. Segundo tick (tick 1, step32 = 1) -> No hay cambio de semicorchea pero arp_rate = 32n dispara en cada tick
    vi.spyOn(Tone.Transport, 'getSecondsAtTime').mockReturnValue(0.125);
    tickCallback(0.125);

    // Debe tocar la segunda nota E4
    expect(triggerAttackReleaseSpy).toHaveBeenCalledWith('E4', '32n', 0.125);
  });

  // T9 - Test 9: Unit Tests para la Interfaz de Usuario
  it('R16: should render three compact modular panels for modFX, LFO, and arpeggiator inside DevicePanel.vue', async () => {
    const store = useSequencerStore();
    store.clearAll();
    const track = store.currentTracks[0];
    track.name = 'Track 1';

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

    // Buscar encabezados de secciones por nombre de módulo en el DOM
    const htmlContent = container.innerHTML;
    expect(htmlContent).toContain('4. Modulation FX');
    expect(htmlContent).toContain('5. LFO Modulator');
    expect(htmlContent).toContain('6. Arpeggiator');

    // Verificar que los botones de opciones existen
    expect(htmlContent).toContain('chorus');
    expect(htmlContent).toContain('flanger');
    expect(htmlContent).toContain('phaser');
    expect(htmlContent).toContain('pitch');
    expect(htmlContent).toContain('filter');
    expect(htmlContent).toContain('volume');
    expect(htmlContent).toContain('sine');
    expect(htmlContent).toContain('triangle');
    expect(htmlContent).toContain('sawtooth');
    expect(htmlContent).toContain('OFF'); // o el switch text

    app.unmount();
    container.remove();
  });
});
