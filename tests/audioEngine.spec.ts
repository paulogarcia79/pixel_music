import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSequencerStore } from '../src/stores/sequencer';
import { AudioEngine, PolyPluckSynth } from '../src/audio/AudioEngine';
import * as Tone from 'tone';

describe('AudioEngine (ADSR and Physical Modeling)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    AudioEngine.clearAllSynths();
    AudioEngine['initialized'] = false;
  });

  it('R9, R10: setupLoop should dynamically apply ADSR and physical modeling parameters to track synths', async () => {
    const store = useSequencerStore();
    store.clearAll();
    
    // Configure Track 1 with custom values
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'guitar_pixel';
    track.attack = 0.15;
    track.decay = 0.25;
    track.sustain = 0.65;
    track.release = 0.75;
    track.dampening = 5000;
    track.resonance = 0.88;
    
    // Add notes to step 1
    track.notes[1] = ['C4'];

    // Capture the setupLoop callback
    const scheduleRepeatSpy = vi.spyOn(Tone.Transport, 'scheduleRepeat');
    
    // Initialize to trigger setupLoop
    await AudioEngine.initialize();
    
    expect(scheduleRepeatSpy).toHaveBeenCalled();
    const tickCallback = scheduleRepeatSpy.mock.calls[0][0];

    // Spy on PolyPluckSynth.prototype.set
    const setSpy = vi.spyOn(PolyPluckSynth.prototype, 'set');

    // Execute tick callback for step 1
    // We mock globalStep logic or isSongMode
    store.currentStep = 1;
    store.isSongMode = false;
    
    // Execute the callback with time = 0
    tickCallback(0);

    // Verify set was called with the ADSR envelope values
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
      envelope: expect.objectContaining({
        attack: 0.15,
        decay: 0.25,
        sustain: 0.65,
        release: 0.75
      })
    }));

    // Verify set was called with the physical modeling values for guitar_pixel
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
      dampening: 5000,
      resonance: 0.88
    }));
  });

  it('R11: playNote should apply ADSR envelope and physical modeling values to the preview synth', async () => {
    const store = useSequencerStore();
    store.clearAll();

    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'guitar_pixel';
    track.attack = 0.12;
    track.decay = 0.22;
    track.sustain = 0.62;
    track.release = 0.72;
    track.dampening = 3500;
    track.resonance = 0.91;

    const setSpy = vi.spyOn(PolyPluckSynth.prototype, 'set');

    // Trigger playNote
    AudioEngine.playNote('C4', '16n', 'guitar_pixel', 'Track 1');

    // Since playNote is async internally, wait a brief moment for the promise
    await new Promise(resolve => setTimeout(resolve, 50));

    // Verify that the synth is configured with target ADSR values
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
      envelope: expect.objectContaining({
        attack: 0.12,
        decay: 0.22,
        sustain: 0.62,
        release: 0.72
      })
    }));

    // Verify physical modeling parameters are applied
    expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
      dampening: 3500,
      resonance: 0.91
    }));
  });

  it('R12: exportAudioOffline should apply ADSR and physical modeling parameters to the offline synths', async () => {
    const store = useSequencerStore();
    store.clearAll();

    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'guitar_pixel';
    track.attack = 0.18;
    track.decay = 0.28;
    track.sustain = 0.58;
    track.release = 0.68;
    track.dampening = 4200;
    track.resonance = 0.89;
    track.notes[1] = ['C4'];

    const offlineSpy = vi.spyOn(Tone, 'Offline').mockImplementation(async (callback: any) => {
      // Simulate Tone.Offline context execution
      const mockContext = {
        destination: {}
      };
      
      const setSpy = vi.spyOn(PolyPluckSynth.prototype, 'set');
      
      await callback(mockContext);

      // Verify that offline synth had set called with our values
      expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
        envelope: expect.objectContaining({
          attack: 0.18,
          decay: 0.28,
          sustain: 0.58,
          release: 0.68
        })
      }));

      expect(setSpy).toHaveBeenCalledWith(expect.objectContaining({
        dampening: 4200,
        resonance: 0.89
      }));

      const mockBuffer = {
        get: vi.fn(() => ({
          numberOfChannels: 2,
          length: 100,
          sampleRate: 44100,
          getChannelData: vi.fn(() => new Float32Array(100))
        }))
      };

      return mockBuffer as any;
    });

    await AudioEngine.exportAudioOffline();

    expect(offlineSpy).toHaveBeenCalled();
  });

  it('should play guitar_pixel notes polyphonically using PolyPluckSynth without errors', async () => {
    const store = useSequencerStore();
    store.clearAll();

    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'guitar_pixel';
    track.notes[1] = ['C4', 'E4', 'G4']; // Chord!

    // Clear previous mock calls since Tone.Transport.scheduleRepeat is a persistent mock
    (Tone.Transport.scheduleRepeat as any).mockClear();
    const scheduleRepeatSpy = vi.spyOn(Tone.Transport, 'scheduleRepeat');
    
    // Initialize to trigger setupLoop
    await AudioEngine.initialize();
    
    expect(scheduleRepeatSpy).toHaveBeenCalled();
    const tickCallback = scheduleRepeatSpy.mock.calls[0][0];

    const triggerAttackReleaseSpy = vi.spyOn(PolyPluckSynth.prototype, 'triggerAttackRelease');

    store.currentStep = 1;
    store.isSongMode = false;
    
    // Execute callback with time = 0
    tickCallback(0);

    // Verify triggerAttackRelease was called with the chord notes
    expect(triggerAttackReleaseSpy).toHaveBeenCalledWith(['C4', 'E4', 'G4'], '16n', 0);
  });

  it('should trigger tonal percussion instruments with correct notes and 16n duration in setupLoop', async () => {
    const store = useSequencerStore();
    store.clearAll();

    // Configurar track 1 como kick
    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'kick';
    track.notes[1] = ['C2'];

    (Tone.Transport.scheduleRepeat as any).mockClear();
    const scheduleRepeatSpy = vi.spyOn(Tone.Transport, 'scheduleRepeat');
    await AudioEngine.initialize();
    const tickCallback = scheduleRepeatSpy.mock.calls[0][0];

    const triggerSpy = vi.spyOn(Tone.MembraneSynth.prototype, 'triggerAttackRelease');

    store.currentStep = 1;
    store.isSongMode = false;
    
    // Con notas en grid
    tickCallback(0);
    expect(triggerSpy).toHaveBeenCalledWith('C2', '16n', 0);

    // Con notas vacías o falsy, debería usar fallback 'C2' para kick
    track.notes[1] = [''];
    tickCallback(0.5);
    expect(triggerSpy).toHaveBeenCalledWith('C2', '16n', 0.5);

    // Probar tom con fallback 'C3'
    track.type = 'tom';
    track.notes[1] = [''];
    // Limpiamos los synths del engine para que cree uno nuevo de tipo 'tom'
    AudioEngine.clearAllSynths();
    tickCallback(1.0);
    expect(triggerSpy).toHaveBeenCalledWith('C3', '16n', 1.0);
  });

  it('should trigger tonal percussion instruments with correct note and duration in playNote', async () => {
    const triggerSpy = vi.spyOn(Tone.MembraneSynth.prototype, 'triggerAttackRelease');

    // playNote con note especificado
    AudioEngine.playNote('G2', '16n', 'tom', 'Preview');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(triggerSpy).toHaveBeenCalledWith('G2', '16n');

    // playNote con nota vacía (fallback a 'C2')
    AudioEngine.playNote('', '16n', 'kick', 'Preview');
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(triggerSpy).toHaveBeenCalledWith('C2', '16n');
  });

  it('should trigger tonal percussion instruments with correct note and duration in exportAudioOffline', async () => {
    const store = useSequencerStore();
    store.clearAll();

    const track = store.currentTracks[0];
    track.name = 'Track 1';
    track.type = 'conga';
    track.notes[1] = ['E3'];

    const offlineSpy = vi.spyOn(Tone, 'Offline').mockImplementation(async (callback: any) => {
      const mockContext = { destination: {} };
      const triggerSpy = vi.spyOn(Tone.MembraneSynth.prototype, 'triggerAttackRelease');
      
      await callback(mockContext);

      expect(triggerSpy).toHaveBeenCalledWith('E3', '16n', 0);

      const mockBuffer = {
        get: vi.fn(() => ({
          numberOfChannels: 2,
          length: 100,
          sampleRate: 44100,
          getChannelData: vi.fn(() => new Float32Array(100))
        }))
      };
      return mockBuffer as any;
    });

    await AudioEngine.exportAudioOffline();
    expect(offlineSpy).toHaveBeenCalled();
  });
});
