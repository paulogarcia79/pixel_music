<script setup lang="ts">
import Transport from './components/sequencer/Transport.vue';
import PianoRoll from './components/sequencer/PianoRoll.vue';
import { useSequencerStore, type InstrumentType } from './stores/sequencer';

const store = useSequencerStore();

const instrumentTypes: InstrumentType[] = ['square', 'triangle', 'sawtooth', 'noise'];

const addTrack = () => {
  const newTrackName = `Track ${store.tracks.length + 1}`;
  store.addTrack(newTrackName);
  store.selectedTrackName = newTrackName;
};
</script>

<template>
  <div class="h-screen flex flex-col bg-dark-bg selection:bg-neon-pink selection:text-white">
    <!-- Header / Transport -->
    <Transport />

    <!-- Main Content -->
    <main class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <aside class="w-64 border-r border-grid-line bg-dark-bg/50 hidden md:block p-4 flex flex-col">
        <h2 class="text-neon-cyan text-xs uppercase tracking-tighter mb-4 border-b border-grid-line pb-2">Tracks</h2>
        
        <div class="flex-1 space-y-4 overflow-y-auto pr-2">
          <div 
            v-for="track in store.tracks" 
            :key="track.name"
            class="p-3 border transition-all duration-200"
            :class="[
              store.selectedTrackName === track.name 
                ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_10px_rgba(5,217,232,0.2)]' 
                : 'border-grid-line hover:border-neon-cyan/50 bg-transparent'
            ]"
            @click="store.selectedTrackName = track.name"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="text-neon-cyan text-xs font-bold uppercase">{{ track.name }}</span>
              <span class="text-[9px] text-neon-pink opacity-70">{{ track.type }}</span>
            </div>
            
            <select 
              :value="track.type"
              @change="(e) => store.setTrackType(track.name, (e.target as HTMLSelectElement).value as InstrumentType)"
              @click.stop
              class="w-full bg-dark-bg border border-grid-line text-neon-cyan text-[10px] p-1 focus:border-neon-pink outline-none uppercase"
            >
              <option v-for="type in instrumentTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
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
      <PianoRoll />
    </main>

    <!-- Footer / Status Bar -->
    <footer class="bg-dark-bg border-t border-grid-line px-4 py-1 flex justify-between items-center text-[9px] text-neon-cyan/40 uppercase tracking-widest">
      <div>Status: Ready</div>
      <div>Project: New_Composition_01</div>
      <div>Memory: Stable</div>
    </footer>
  </div>
</template>

<style>
/* Estilos globales adicionales si son necesarios */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}
::-webkit-scrollbar-track {
  background: #01012b;
}
::-webkit-scrollbar-thumb {
  background: #1a1a3a;
}
::-webkit-scrollbar-thumb:hover {
  background: #05d9e8;
}
</style>
