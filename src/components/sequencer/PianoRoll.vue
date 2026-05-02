<script setup lang="ts">
import { useSequencerStore } from '../../stores/sequencer';
import { AudioEngine } from '../../audio/AudioEngine';

const store = useSequencerStore();

// Definimos una escala simple para el ejemplo (C4 a C5)
const notes = ['C5', 'B4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
const steps = Array.from({ length: 16 }, (_, i) => i + 1);

const isNoteActive = (trackName: string, step: number, note: string) => {
  return store.getNoteAt(trackName, step) === note;
};

const toggleNote = (trackName: string, step: number, note: string) => {
  if (isNoteActive(trackName, step, note)) {
    store.removeNote(trackName, step);
  } else {
    store.addNote(trackName, step, note);
    AudioEngine.playNote(note, '16n');
  }
};

// Por ahora usamos una pista fija "Track 1"
const currentTrack = "Track 1";
store.ensureTrackExists(currentTrack);
</script>

<template>
  <div class="flex-1 overflow-auto bg-dark-bg p-8">
    <div class="inline-grid grid-cols-[auto_repeat(16,minmax(40px,1fr))] border border-grid-line shadow-[0_0_30px_rgba(26,26,58,1)]">
      <!-- Header de pasos -->
      <div class="bg-dark-bg border-r border-b border-grid-line p-2"></div>
      <div 
        v-for="step in steps" 
        :key="step" 
        class="text-[10px] text-center border-r border-b border-grid-line py-1 text-neon-cyan/50"
      >
        {{ step }}
      </div>

      <!-- Filas de notas -->
      <template v-for="note in notes" :key="note">
        <div class="bg-dark-bg border-r border-b border-grid-line px-4 py-2 text-xs font-bold text-neon-cyan whitespace-nowrap">
          {{ note }}
        </div>
        <div 
          v-for="step in steps" 
          :key="step"
          @click="toggleNote(currentTrack, step, note)"
          class="border-r border-b border-grid-line cursor-pointer transition-colors relative"
          :class="[
            isNoteActive(currentTrack, step, note) 
              ? 'bg-neon-pink shadow-[inset_0_0_10px_rgba(255,42,109,0.8)]' 
              : 'hover:bg-neon-cyan/10'
          ]"
        >
          <!-- Efecto de brillo si está activa -->
          <div v-if="isNoteActive(currentTrack, step, note)" class="absolute inset-0 animate-pulse bg-white/20"></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.grid-cols-16 {
  grid-template-columns: auto repeat(16, 1fr);
}
</style>
