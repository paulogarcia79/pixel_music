import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createApp, nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { useSequencerStore } from '../src/stores/sequencer';
import { AudioEngine } from '../src/audio/AudioEngine';
import Transport from '../src/components/sequencer/Transport.vue';
import App from '../src/App.vue';
import * as Tone from 'tone';

describe('Pattern Presets', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  describe('Store & Business Logic (R1, R3, R4, R5, R6)', () => {
    it('R1: should initialize with Chiptune Techno preset and 130 BPM on startup (application mount)', async () => {
      const store = useSequencerStore();
      
      // Initially, it has the clean default state (Track 1 at 120 BPM)
      expect(store.bpm).toBe(120);

      const container = document.createElement('div');
      document.body.appendChild(container);

      const app = createApp(App);
      app.mount(container);
      await nextTick();

      // Verify BPM is now 130 (Chiptune Techno default)
      expect(store.bpm).toBe(130);
      
      // Verify the tracks match the Chiptune Techno preset
      const currentPattern = store.currentPattern;
      expect(currentPattern).toBeDefined();
      expect(currentPattern!.tracks.length).toBe(4);
      expect(currentPattern!.tracks[0].name).toBe('Kick');
      expect(currentPattern!.tracks[0].type).toBe('kick');
      expect(store.selectedTrackName).toBe('Kick');

      app.unmount();
      container.remove();
    });

    it('R3: should invoke AudioEngine.clearAllSynths when a preset is loaded', () => {
      const store = useSequencerStore();
      const clearSpy = vi.spyOn(AudioEngine, 'clearAllSynths');

      store.loadPreset('Synthwave Retro');

      expect(clearSpy).toHaveBeenCalled();
    });

    it('R4: should correctly overwrite tracks, synth types, volumes, ADSR, and note map', () => {
      const store = useSequencerStore();
      
      // Load Synthwave Retro
      store.loadPreset('Synthwave Retro');
      
      const pattern = store.currentPattern!;
      expect(pattern.tracks.length).toBe(4);
      
      const kick = pattern.tracks.find(t => t.name === 'Kick')!;
      expect(kick.type).toBe('kick');
      expect(kick.volume).toBe(-8);
      expect(kick.attack).toBe(0.01);
      expect(kick.release).toBe(0.4);
      expect(kick.notes[1]).toBe('C2');

      const pad = pattern.tracks.find(t => t.name === 'Pad')!;
      expect(pad.type).toBe('pad');
      expect(pad.volume).toBe(-12);
      expect(pad.attack).toBe(0.4);
      expect(pad.release).toBe(1.2);
      expect(pad.notes[1]).toBe('C4');
      expect(pad.notes[17]).toBe('G4');
    });

    it('R5: should correctly update the BPM when a preset is loaded', () => {
      const store = useSequencerStore();
      
      store.loadPreset('8-Bit Rock');
      expect(store.bpm).toBe(140);
      expect(Tone.Transport.bpm.value).toBe(140);

      store.loadPreset('Ambient Space');
      expect(store.bpm).toBe(90);
      expect(Tone.Transport.bpm.value).toBe(90);
    });

    it('R6: should correctly reset the pattern to default empty state and 120 BPM when Empty option is selected', () => {
      const store = useSequencerStore();
      
      store.loadPreset('Empty');
      
      expect(store.bpm).toBe(120);
      const pattern = store.currentPattern!;
      expect(pattern.tracks.length).toBe(1);
      expect(pattern.tracks[0].name).toBe('Track 1');
      expect(pattern.tracks[0].type).toBe('square');
      expect(Object.keys(pattern.tracks[0].notes).length).toBe(0);
    });
  });

  describe('UI Component Integration - Transport.vue (R2, R3, R4, R5, R6, R7)', () => {
    it('R2: should render a select dropdown containing all the specified options', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const app = createApp(Transport);
      app.mount(container);
      await nextTick();

      const select = container.querySelector('select');
      expect(select).not.toBeNull();

      const options = Array.from(select!.querySelectorAll('option')).map(opt => opt.value);
      expect(options).toContain('Chiptune Techno');
      expect(options).toContain('Synthwave Retro');
      expect(options).toContain('8-Bit Rock');
      expect(options).toContain('Ambient Space');
      expect(options).toContain('Empty');

      app.unmount();
      container.remove();
    });

    it('R3, R4, R5: should trigger loadPreset action on select element change', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const app = createApp(Transport);
      app.mount(container);
      await nextTick();

      const store = useSequencerStore();
      const loadPresetSpy = vi.spyOn(store, 'loadPreset');

      const select = container.querySelector('select') as HTMLSelectElement;
      expect(select).not.toBeNull();

      // Change selection to Synthwave Retro
      select.value = 'Synthwave Retro';
      select.dispatchEvent(new Event('change'));
      await nextTick();

      expect(loadPresetSpy).toHaveBeenCalledWith('Synthwave Retro');
      expect(store.bpm).toBe(120);

      app.unmount();
      container.remove();
    });

    it('R7: should maintain reproduction state active when preset is changed during playback', async () => {
      const store = useSequencerStore();
      
      // Simulate playback starting
      await AudioEngine.toggle();
      Tone.Transport.state = 'started';
      
      expect(Tone.Transport.state).toBe('started');

      // Change preset
      store.loadPreset('Ambient Space');

      // Playback must remain started without interruption
      expect(Tone.Transport.state).toBe('started');
      expect(store.bpm).toBe(90);

      // Clean up audio state
      await AudioEngine.toggle();
      Tone.Transport.state = 'stopped';
    });
  });
});
