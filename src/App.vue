<script setup lang="ts">
import Transport from './components/sequencer/Transport.vue';
import PianoRoll from './components/sequencer/PianoRoll.vue';
import SongArranger from './components/sequencer/SongArranger.vue';
import { useSequencerStore, type InstrumentType } from './stores/sequencer';
import { AudioEngine } from './audio/AudioEngine';

const store = useSequencerStore();

const instrumentTypes: InstrumentType[] = ['square', 'triangle', 'sawtooth', 'noise', 'sine', 'fm_pluck', 'fm_bell', 'kick', 'snare', 'hihat'];

const addTrack = () => {
  const newTrackName = `Track ${store.tracks.length + 1}`;
  store.addTrack(newTrackName);
  store.selectedTrackName = newTrackName;
};

const handleTypeChange = (trackName: string, type: InstrumentType) => {
  store.setTrackType(trackName, type);
  AudioEngine.resetSynth(trackName); // Force recreate synth with new type
};
</script>

<template>
  <div class="h-screen flex flex-col bg-dark-bg selection:bg-neon-pink selection:text-white">
    <!-- Header / Transport -->
    <Transport />

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-72 border-r border-grid-line bg-dark-bg/50 hidden md:block p-4 flex flex-col">
        <div class="flex items-center justify-between mb-4 border-b border-grid-line pb-2">
          <h2 class="text-neon-cyan text-xs uppercase tracking-tighter font-bold">Tracks</h2>
          <div class="flex gap-1">
            <button 
              v-for="p in 4" 
              :key="p"
              @click="store.setPattern(p)"
              class="px-2 py-1 text-[8px] border transition-all"
              :class="store.currentPatternId === p ? 'bg-neon-pink border-neon-pink text-white shadow-[0_0_5px_#ff2a6d]' : 'border-grid-line text-neon-cyan/50 hover:text-neon-cyan'"
            >
              P{{ p }}
            </button>
          </div>
        </div>
        
        <div class="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <div 
            v-for="track in store.tracks" 
            :key="track.name"
            class="p-3 border transition-all duration-200 cursor-pointer group"
            :class="[
              store.selectedTrackName === track.name 
                ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(5,217,232,0.2)]' 
                : 'border-grid-line hover:border-neon-cyan/50 bg-transparent'
            ]"
            @click="store.selectedTrackName = track.name"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="text-neon-cyan text-xs font-bold uppercase truncate pr-2">{{ track.name }}</span>
              <div class="flex items-center gap-1">
                <button 
                  @click.stop="store.duplicateTrack(track.name)"
                  class="w-4 h-4 text-[8px] border border-neon-cyan text-neon-cyan flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-neon-cyan hover:text-white transition-all mr-1"
                  title="Duplicate Track"
                >
                  D
                </button>
                <button 
                  @click.stop="store.removeTrack(track.name)"
                  class="w-4 h-4 text-[8px] border border-neon-pink text-neon-pink flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-neon-pink hover:text-white transition-all"
                >
                  X
                </button>
                <button 
                  @click.stop="store.toggleMute(track.name)"
                  class="px-1 text-[8px] border transition-colors"
                  :class="track.muted ? 'bg-neon-pink border-neon-pink text-white' : 'border-grid-line text-grid-line hover:text-neon-cyan'"
                >
                  MUTE
                </button>
              </div>
            </div>
            
            <div class="space-y-2">
              <select 
                :value="track.type"
                @change="(e) => handleTypeChange(track.name, (e.target as HTMLSelectElement).value as InstrumentType)"
                @click.stop
                class="w-full bg-dark-bg border border-grid-line text-neon-cyan text-[10px] p-1 focus:border-neon-pink outline-none uppercase"
              >
                <option v-for="type in instrumentTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>

              <div class="flex items-center gap-2" @click.stop>
                <span class="text-[8px] text-neon-cyan/50 w-6">VOL</span>
                <input 
                  type="range" 
                  min="-40" 
                  max="0" 
                  step="1"
                  :value="track.volume"
                  @input="(e) => store.setVolume(track.name, Number((e.target as HTMLInputElement).value))"
                  class="flex-1 accent-neon-cyan h-1 bg-grid-line appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        <button 
          @click="addTrack"
          class="mt-4 w-full p-2 border border-dashed border-grid-line text-grid-line text-[10px] hover:border-neon-cyan hover:text-neon-cyan transition-colors uppercase tracking-widest"
        >
          + ADD TRACK
        </button>
      </aside>

      <!-- Piano Roll Area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <PianoRoll />
        <SongArranger />
      </div>
    </main>

    <!-- Footer / Status Bar -->
    <footer class="bg-dark-bg border-t border-grid-line px-4 py-1 flex justify-between items-center text-[9px] text-neon-cyan/40 uppercase tracking-widest">
      <div>Status: {{ store.isSongMode ? 'SONG MODE ACTIVE' : 'PATTERN MODE' }}</div>
      <div>Pattern: {{ store.currentPatternId }} | Step: {{ store.currentStep }}</div>
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
