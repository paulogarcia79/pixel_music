<script setup lang="ts">
import { useSequencerStore } from '../../stores/sequencer';
import { AudioEngine } from '../../audio/AudioEngine';

const store = useSequencerStore();

// Definimos una escala cromática de 3 octavas (C3 a B5)
const notes = [
  'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5', 'C5',
  'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4',
  'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'
];
const steps = Array.from({ length: 32 }, (_, i) => i + 1);

const isSharp = (note: string) => note.includes('#');

const isNoteActive = (trackName: string, step: number, note: string) => {
  return store.getNoteAt(trackName, step) === note;
};

const getGhostNotes = (step: number, note: string) => {
  return store.currentTracks.filter(t => t.name !== store.selectedTrackName && t.notes[step] === note);
};

const toggleNote = (step: number, note: string) => {
  const trackName = store.selectedTrackName;
  const track = store.getTrackInPattern(trackName);
  
  if (isNoteActive(trackName, step, note)) {
    store.removeNote(trackName, step);
  } else {
    store.addNote(trackName, step, note);
    if (track) {
      AudioEngine.playNote(note, '16n', track.type, trackName);
    }
  }
};

// Por ahora usamos una pista fija "Track 1"
store.ensureTrackExists(store.selectedTrackName);
</script>

<template>
  <div class="flex-1 overflow-auto bg-dark-bg p-4 md:p-8 custom-scrollbar">
    <div class="relative grid grid-cols-[80px_repeat(32,minmax(40px,1fr))] min-w-[max-content] border border-grid-line shadow-[0_0_30px_rgba(26,26,58,1)]">
      
      <!-- Línea Láser (Cursor de reproducción) -->
      <div 
        v-show="store.currentStep > 0"
        class="absolute top-0 bottom-0 w-0.5 bg-neon-cyan shadow-[0_0_15px_#05d9e8] z-50 pointer-events-none transition-all duration-100 ease-linear"
        :style="{ 
          left: `calc(80px + ((${store.currentStep} - 1) * (100% - 80px) / 32))`,
        }"
      ></div>

      <!-- Header de pasos -->
      <div class="w-[80px] bg-dark-bg border-r border-b border-grid-line p-2 sticky top-0 left-0 z-40"></div>
      <div 
        v-for="step in steps" 
        :key="step" 
        class="text-[10px] text-center border-r border-b border-grid-line py-1 transition-colors overflow-hidden sticky top-0 bg-dark-bg z-30"
        :class="[
          store.currentStep === step ? 'text-neon-cyan bg-neon-cyan/20' : 'text-neon-cyan/50'
        ]"
      >
        {{ step }}
      </div>

      <!-- Filas de notas -->
      <template v-for="note in notes" :key="note">
        <div 
          class="bg-dark-bg border-r border-b border-grid-line px-2 md:px-4 py-2 text-[10px] md:text-xs font-bold whitespace-nowrap sticky left-0 z-20"
          :class="isSharp(note) ? 'text-neon-pink bg-dark-bg/90' : 'text-neon-cyan bg-dark-bg'"
        >
          {{ note }}
        </div>
        <div 
          v-for="step in steps" 
          :key="step"
          @click="toggleNote(step, note)"
          class="border-r border-b border-grid-line cursor-pointer transition-colors relative min-h-[25px]"
          :class="[
            isNoteActive(store.selectedTrackName, step, note) 
              ? 'bg-neon-pink shadow-[inset_0_0_10px_rgba(255,42,109,0.8)]' 
              : isSharp(note) ? 'bg-black/40 hover:bg-neon-cyan/5' : 'hover:bg-neon-cyan/10',
            store.currentStep === step && !isNoteActive(store.selectedTrackName, step, note) ? 'bg-neon-cyan/5' : ''
          ]"
        >
          <!-- Efecto de brillo si está activa -->
          <div v-if="isNoteActive(store.selectedTrackName, step, note)" class="absolute inset-0 animate-pulse bg-white/20"></div>
          
          <!-- Ghost Notes de otras pistas -->
          <div 
            v-if="!isNoteActive(store.selectedTrackName, step, note) && getGhostNotes(step, note).length > 0"
            class="absolute inset-[4px] border border-neon-cyan/40 bg-neon-cyan/10 rounded-sm"
            :title="getGhostNotes(step, note).map(t => t.name).join(', ')"
          ></div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.grid-cols-32 {
  grid-template-columns: auto repeat(32, 1fr);
}
</style>
