<script setup lang="ts">
import { useSequencerStore } from '../../stores/sequencer';
import { AudioEngine } from '../../audio/AudioEngine';

const store = useSequencerStore();

const togglePlay = async () => {
  AudioEngine.initialize(); // Asegurar que Tone.js está listo
  // Aquí iría la lógica de Tone.Transport.toggle()
  console.log("Play/Pause");
};
</script>

<template>
  <div class="flex items-center gap-4 p-4 bg-dark-bg border-b border-grid-line shadow-[0_0_15px_rgba(5,217,232,0.2)]">
    <button 
      @click="togglePlay"
      class="px-6 py-2 bg-transparent border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg transition-all duration-300 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(5,217,232,0.5)]"
    >
      Play / Stop
    </button>
    
    <div class="flex items-center gap-2">
      <span class="text-xs uppercase text-neon-pink">BPM:</span>
      <input 
        v-model="store.bpm" 
        type="number" 
        class="w-16 bg-transparent border-b border-neon-pink text-neon-pink text-center focus:outline-none"
      />
    </div>
    
    <div class="ml-auto text-neon-green text-sm tracking-tighter">
      PIXEL MUSIC ENGINE // v0.1.0
    </div>
  </div>
</template>
