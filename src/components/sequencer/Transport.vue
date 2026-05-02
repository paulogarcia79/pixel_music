<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useSequencerStore } from '../../stores/sequencer';
import { AudioEngine } from '../../audio/AudioEngine';
import WaveVisualizer from './WaveVisualizer.vue';
import * as Tone from 'tone';

const store = useSequencerStore();
const isPlaying = ref(false);
const isRecording = ref(false);
let stateCheckInterval: number;

const togglePlay = async () => {
  await AudioEngine.toggle();
  isPlaying.value = Tone.Transport.state === 'started';
};

const toggleRecord = async () => {
  if (isRecording.value) {
    await AudioEngine.stopRecording();
    isRecording.value = false;
  } else {
    await AudioEngine.startRecording();
    isRecording.value = true;
    if (Tone.Transport.state !== 'started') {
      await togglePlay();
    }
  }
};

const exportProject = () => {
  const data = {
    patterns: store.patterns,
    arrangerTracks: store.arrangerTracks,
    bpm: store.bpm,
    isSongMode: store.isSongMode,
    version: "0.3.0"
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `composition_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const importProject = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string);
      store.loadProject(data);
    } catch (err) {
      alert("Error al importar el archivo JSON");
      console.error(err);
    }
  };
  reader.readAsText(file);
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

    <button 
      @click="toggleRecord"
      class="px-4 py-2 border text-[10px] uppercase transition-all duration-300 mr-2 flex items-center gap-2"
      :class="[
        isRecording 
          ? 'bg-neon-pink border-neon-pink text-white animate-pulse shadow-[0_0_15px_#ff2a6d]' 
          : 'border-neon-green text-neon-green hover:bg-neon-green/20'
      ]"
    >
      <div v-if="isRecording" class="w-2 h-2 bg-white rounded-full"></div>
      {{ isRecording ? 'Recording...' : 'Record' }}
    </button>

    <button 
      @click="AudioEngine.exportAudioOffline()"
      class="px-4 py-2 border border-neon-cyan text-neon-cyan text-[10px] uppercase hover:bg-neon-cyan hover:text-dark-bg transition-all mr-2"
      title="Render full song to WAV instantly"
    >
      Render WAV
    </button>

    <button 
      @click="store.clearCurrentPattern"
      class="px-4 py-2 border border-neon-cyan text-neon-cyan text-[10px] uppercase hover:bg-neon-cyan hover:text-dark-bg transition-all mr-2"
      title="Clear Current Pattern"
    >
      Clear Pattern
    </button>

    <button 
      @click="store.clearAll"
      class="px-4 py-2 border border-neon-pink text-neon-pink text-[10px] uppercase hover:bg-neon-pink hover:text-white transition-all mr-2"
      title="Reset Project"
    >
      Reset All
    </button>

    <div class="flex gap-1 mr-4">
      <button 
        @click="exportProject"
        class="px-3 py-1 border border-neon-green text-neon-green text-[9px] uppercase hover:bg-neon-green hover:text-dark-bg transition-all"
      >
        Export
      </button>
      <label class="px-3 py-1 border border-neon-cyan text-neon-cyan text-[9px] uppercase hover:bg-neon-cyan hover:text-dark-bg transition-all cursor-pointer">
        Import
        <input type="file" @change="importProject" class="hidden" accept=".json" />
      </label>
    </div>
    
    <div class="flex items-center gap-2">
      <span class="text-xs uppercase text-neon-pink">BPM:</span>
      <input 
        :value="store.bpm"
        @input="(e) => store.setBpm(Number((e.target as HTMLInputElement).value))"
        type="number" 
        class="w-16 bg-transparent border-b border-neon-pink text-neon-pink text-center focus:outline-none"
      />
    </div>

    <WaveVisualizer />
    
    <div class="ml-auto text-neon-green text-sm tracking-tighter">
      PIXEL MUSIC ENGINE // v0.1.0
    </div>
  </div>
</template>
