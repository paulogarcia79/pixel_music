<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSequencerStore } from '../../stores/sequencer';
import { AudioEngine } from '../../audio/AudioEngine';
import * as Tone from 'tone';

const store = useSequencerStore();
const isPlaying = ref(false);
let stateCheckInterval: number;

const togglePlay = async () => {
  await AudioEngine.toggle();
  isPlaying.value = Tone.Transport.state === 'started';
};

onMounted(() => {
  stateCheckInterval = window.setInterval(() => {
    isPlaying.value = Tone.Transport.state === 'started';
  }, 100);
});

onUnmounted(() => {
  clearInterval(stateCheckInterval);
});
</script>

<template>
  <div class="flex items-center gap-4 p-4 bg-dark-bg border-b border-grid-line shadow-[0_0_15px_rgba(5,217,232,0.2)]">
    <button 
      @click="togglePlay"
      class="px-6 py-2 bg-transparent border text-neon-cyan transition-all duration-300 font-bold uppercase tracking-widest"
      :class="[
        isPlaying 
          ? 'bg-neon-pink border-neon-pink text-white shadow-[0_0_20px_rgba(255,42,109,0.8)]' 
          : 'border-neon-cyan hover:bg-neon-cyan hover:text-dark-bg shadow-[0_0_10px_rgba(5,217,232,0.5)]'
      ]"
    >
      {{ isPlaying ? 'Stop' : 'Play' }}
    </button>
    
    <div class="flex items-center gap-2">
      <span class="text-xs uppercase text-neon-pink">BPM:</span>
      <input 
        :value="store.bpm"
        @input="(e) => store.setBpm(Number((e.target as HTMLInputElement).value))"
        type="number" 
        class="w-16 bg-transparent border-b border-neon-pink text-neon-pink text-center focus:outline-none"
      />
    </div>
    
    <div class="ml-auto text-neon-green text-sm tracking-tighter">
      PIXEL MUSIC ENGINE // v0.1.0
    </div>
  </div>
</template>
