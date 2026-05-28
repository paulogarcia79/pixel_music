<script setup lang="ts">
import { ref } from 'vue';
import Transport from './components/sequencer/Transport.vue';
import PianoRoll from './components/sequencer/PianoRoll.vue';
import SongArranger from './components/sequencer/SongArranger.vue';
import DevicePanel from './components/sequencer/DevicePanel.vue';
import PixelIcon from './components/sequencer/PixelIcon.vue';
import { useSequencerStore, type InstrumentType } from './stores/sequencer';
import { AudioEngine } from './audio/AudioEngine';

const store = useSequencerStore();

const isDevicePanelOpen = ref(true);

// Mapeo estructurado de tipos de instrumentos a iconos y categorías (R10)
const INSTRUMENT_CATEGORIES: Record<InstrumentType, { icon: string; category: string }> = {
  // Retro Basics
  square: { icon: 'cpu', category: 'Basic' },
  triangle: { icon: 'cpu', category: 'Basic' },
  sawtooth: { icon: 'cpu', category: 'Basic' },
  noise: { icon: 'cpu', category: 'Basic' },
  sine: { icon: 'cpu', category: 'Basic' },
  pulse: { icon: 'cpu', category: 'Basic' },
  pwm: { icon: 'cpu', category: 'Basic' },

  // Percussion
  kick: { icon: 'drum', category: 'Drum' },
  snare: { icon: 'drum', category: 'Drum' },
  hihat: { icon: 'drum', category: 'Drum' },
  tom: { icon: 'drum', category: 'Drum' },
  clap: { icon: 'drum', category: 'Drum' },
  crash: { icon: 'drum', category: 'Drum' },
  conga: { icon: 'drum', category: 'Drum' },
  cowbell: { icon: 'drum', category: 'Drum' },
  woodblock: { icon: 'drum', category: 'Drum' },
  shaker: { icon: 'drum', category: 'Drum' },
  rimshot: { icon: 'drum', category: 'Drum' },

  // Keys & Organs
  piano_pixel: { icon: 'keyboard', category: 'Keys' },
  electric_piano: { icon: 'keyboard', category: 'Keys' },
  honky_tonk: { icon: 'keyboard', category: 'Keys' },
  organ_pixel: { icon: 'keyboard', category: 'Keys' },
  church_organ: { icon: 'keyboard', category: 'Keys' },

  // Strings & Vents
  guitar_pixel: { icon: 'music', category: 'Strings' },
  guitar_dist: { icon: 'music', category: 'Strings' },
  flute_pixel: { icon: 'music', category: 'Strings' },
  clarinet_pixel: { icon: 'music', category: 'Strings' },
  retro_oboe: { icon: 'music', category: 'Strings' },

  // Synths
  bass_synth: { icon: 'waves', category: 'Synth' },
  sub_bass: { icon: 'waves', category: 'Synth' },
  lead_synth: { icon: 'waves', category: 'Synth' },
  super_saw: { icon: 'waves', category: 'Synth' },
  acid_synth: { icon: 'waves', category: 'Synth' },
  pad: { icon: 'waves', category: 'Synth' },
  fm_pluck: { icon: 'waves', category: 'Synth' },
  fm_bell: { icon: 'waves', category: 'Synth' },
  retro_brass: { icon: 'waves', category: 'Synth' },
  ghost_synth: { icon: 'waves', category: 'Synth' }
};

const getTrackIcon = (type: InstrumentType) => {
  return INSTRUMENT_CATEGORIES[type]?.icon || 'cpu';
};

const addTrack = () => {
  const newTrackName = `Track ${store.currentTracks.length + 1}`;
  store.addTrack(newTrackName);
  store.selectedTrackName = newTrackName;
};

const removeTrack = (name: string) => {
  store.removeTrack(name);
  AudioEngine.resetSynth(name);
};
</script>

<template>
  <div class="h-screen flex flex-col bg-dark-bg selection:bg-neon-pink selection:text-white">
    <!-- Header / Transport Controls -->
    <Transport />

    <!-- Main Content Workspace -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Sidebar (Slim Track Strips - R9) -->
      <aside class="w-60 border-r border-grid-line bg-[#0d0d11] hidden md:flex flex-col flex-shrink-0 p-3">
        <!-- Sidebar Header -->
        <div class="flex items-center justify-between mb-3 border-b border-grid-line pb-2">
          <h2 class="text-neon-cyan text-[10px] uppercase tracking-widest font-bold font-mono">Tracks</h2>
          <div class="flex items-center gap-1.5">
            <span class="text-[8px] font-mono text-neon-cyan/60 uppercase">Grid:</span>
            <select 
              :value="store.currentPattern?.gridSize || 32"
              @change="(e) => store.setGridSize(Number((e.target as HTMLSelectElement).value))"
              class="bg-black/60 border border-grid-line text-neon-cyan text-[9px] px-1 py-0.5 outline-none font-mono"
            >
              <option :value="8">8</option>
              <option :value="16">16</option>
              <option :value="32">32</option>
            </select>
          </div>
        </div>
        
        <!-- Compact Pattern Selector (8 patterns) -->
        <div class="grid grid-cols-4 gap-1 mb-3">
          <button 
            v-for="p in 8" 
            :key="p"
            @click="store.setPattern(p)"
            class="py-1 text-[8px] border transition-all text-center relative font-mono cursor-pointer"
            :class="[
              store.currentPatternId === p 
                ? 'bg-neon-pink border-neon-pink text-white shadow-[0_0_5px_#ff2a6d] z-10 font-bold' 
                : 'border-grid-line text-neon-cyan/40 hover:border-neon-cyan/60'
            ]"
          >
            P{{ p }}
            <div 
              v-if="store.patterns[p] && store.patterns[p].tracks.some(t => Object.keys(t.notes).length > 0)"
              class="absolute bottom-0.5 right-0.5 w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_2px_#05d9e8]"
            ></div>
          </button>
        </div>
        
        <!-- Slim Track Strips Container -->
        <div class="flex-1 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
          <div 
            v-for="track in store.currentTracks" 
            :key="track.name"
            class="p-2 border transition-all duration-200 cursor-pointer rounded flex flex-col gap-1.5 relative overflow-hidden bg-black/30"
            :class="[
              store.selectedTrackName === track.name 
                ? 'border-neon-cyan shadow-[0_0_8px_rgba(5,217,232,0.25)] bg-neon-cyan/5' 
                : 'border-grid-line hover:border-neon-cyan/40'
            ]"
            @click="store.selectedTrackName = track.name"
          >
            <!-- Track Info & Controls -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 min-w-0">
                <PixelIcon :name="getTrackIcon(track.type)" class="w-3.5 h-3.5 text-neon-cyan flex-shrink-0" />
                <span class="text-neon-cyan text-[10px] font-bold uppercase truncate max-w-[80px] font-mono">{{ track.name }}</span>
              </div>
              
              <!-- Compact Actions (R11) -->
              <div class="flex items-center gap-1">
                <!-- Mute toggle button -->
                <button 
                  @click.stop="store.toggleMute(track.name)"
                  class="px-1 py-0.5 text-[7px] font-bold border transition-all uppercase rounded cursor-pointer font-mono"
                  :class="track.muted 
                    ? 'bg-neon-pink border-neon-pink text-white shadow-[0_0_4px_#ff2a6d]' 
                    : 'border-gray-800 text-gray-500 hover:text-neon-pink hover:border-neon-pink/40'"
                >
                  MUTE
                </button>
                
                <!-- Duplicate -->
                <button 
                  @click.stop="store.duplicateTrack(track.name)"
                  class="p-0.5 text-gray-500 hover:text-neon-cyan rounded transition-colors cursor-pointer"
                  title="Duplicate Track"
                >
                  <PixelIcon name="copy" class="w-2.5 h-2.5" />
                </button>
                
                <!-- Remove -->
                <button 
                  @click.stop="removeTrack(track.name)"
                  class="p-0.5 text-gray-500 hover:text-neon-pink rounded transition-colors cursor-pointer"
                  title="Remove Track"
                >
                  <PixelIcon name="trash" class="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
            
            <!-- Compact Volume Slider (R11) -->
            <div class="flex items-center gap-1.5" @click.stop>
              <PixelIcon name="volume2" class="w-3 h-3 text-neon-cyan/40" />
              <input 
                type="range" 
                min="-40" 
                max="0" 
                step="1"
                :value="track.volume"
                @input="(e) => store.setVolume(track.name, Number((e.target as HTMLInputElement).value))"
                class="flex-1 accent-neon-cyan h-1 bg-grid-line appearance-none cursor-pointer rounded-full"
              />
            </div>
          </div>
        </div>

        <button 
          @click="addTrack"
          class="mt-3 w-full py-1.5 border border-dashed border-grid-line text-grid-line text-[9px] hover:border-neon-cyan hover:text-neon-cyan transition-colors uppercase tracking-widest font-mono cursor-pointer"
        >
          + Add Track
        </button>
      </aside>

      <!-- Central Workspace: PianoRoll + SongArranger + DevicePanel (R1) -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 flex flex-col overflow-hidden">
          <PianoRoll />
          <SongArranger />
        </div>
        
        <!-- Bottom colapsable Device Panel (Eurorack Rack) -->
        <DevicePanel 
          :isOpen="isDevicePanelOpen"
          @toggle="isDevicePanelOpen = !isDevicePanelOpen"
        />
      </div>
    </main>

    <!-- Footer / Status Bar -->
    <footer class="bg-dark-bg border-t border-grid-line px-4 py-1 flex justify-between items-center text-[9px] text-neon-cyan/40 uppercase tracking-widest font-mono">
      <div>Status: {{ store.isSongMode ? 'SONG MODE ACTIVE' : 'PATTERN MODE' }}</div>
      <div>
        <span v-if="!store.isSongMode">Pattern: {{ store.currentPatternId }} | Step: {{ store.currentStep }}</span>
        <span v-else>Global Step: {{ store.globalStep }}</span>
      </div>
      <div>Project: PIXEL_COMP_01</div>
    </footer>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #1a1a3a;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #05d9e8;
}
</style>
