<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSequencerStore } from '../../stores/sequencer';
import { AudioEngine } from '../../audio/AudioEngine';
import PixelIcon from './PixelIcon.vue';

const store = useSequencerStore();

// Definimos la escala cromática base de 3 octavas (C3 a B5)
const notes = [
  'B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5', 'C5',
  'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4',
  'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'
];
const steps = Array.from({ length: 32 }, (_, i) => i + 1);

// Estado de interacción local
const activeOctave = ref<'all' | 'low' | 'mid' | 'high'>('all');
const activeScale = ref<'chromatic' | 'major' | 'minor' | 'aminor'>('chromatic');
const hoveredCell = ref<{ step: number; note: string } | null>(null);

// Lógica de filtrado de octavas (R13, R14)
const visibleNotes = computed(() => {
  if (activeOctave.value === 'low') {
    return ['B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3'];
  }
  if (activeOctave.value === 'mid') {
    return ['B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4'];
  }
  if (activeOctave.value === 'high') {
    return ['B5', 'A#5', 'A5', 'G#5', 'G5', 'F#5', 'F5', 'E5', 'D#5', 'D5', 'C#5', 'C5'];
  }
  return notes;
});

// Lógica de validación del Scale Helper (R15, R16)
const isNoteInSelectedScale = (note: string) => {
  if (activeScale.value === 'chromatic') return true;
  const noteName = note.replace(/\d+/, ''); // Extrae el nombre de la nota sin la octava (ej. "C#", "F")
  
  if (activeScale.value === 'major') {
    return ['C', 'D', 'E', 'F', 'G', 'A', 'B'].includes(noteName);
  }
  if (activeScale.value === 'minor') {
    return ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'].includes(noteName);
  }
  if (activeScale.value === 'aminor') {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(noteName);
  }
  return true;
};

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

store.ensureTrackExists(store.selectedTrackName);
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-[#0d0d11]">
    <!-- Piano Roll Toolbar (Header) -->
    <div class="h-10 border-b border-grid-line px-4 flex items-center justify-between flex-shrink-0 bg-[#121216]">
      <div class="flex items-center gap-4">
        <!-- Octave Filter Buttons (R13) -->
        <div class="flex items-center gap-1 bg-black/40 p-0.5 border border-gray-800 rounded">
          <span class="text-[8px] font-mono text-gray-500 uppercase px-1.5 font-bold flex items-center gap-1">
            <PixelIcon name="layers" class="w-2.5 h-2.5" /> Octaves:
          </span>
          <button 
            @click="activeOctave = 'all'" 
            class="px-2 py-0.5 text-[8px] font-bold font-mono rounded cursor-pointer transition-all uppercase"
            :class="[activeOctave === 'all' ? 'bg-neon-cyan text-black shadow-[0_0_6px_#05d9e8]' : 'text-gray-400 hover:text-gray-200']"
          >
            All
          </button>
          <button 
            @click="activeOctave = 'low'" 
            class="px-2 py-0.5 text-[8px] font-bold font-mono rounded cursor-pointer transition-all uppercase"
            :class="[activeOctave === 'low' ? 'bg-neon-cyan text-black shadow-[0_0_6px_#05d9e8]' : 'text-gray-400 hover:text-gray-200']"
            title="Filter to C3 - B3"
          >
            Low
          </button>
          <button 
            @click="activeOctave = 'mid'" 
            class="px-2 py-0.5 text-[8px] font-bold font-mono rounded cursor-pointer transition-all uppercase"
            :class="[activeOctave === 'mid' ? 'bg-neon-cyan text-black shadow-[0_0_6px_#05d9e8]' : 'text-gray-400 hover:text-gray-200']"
            title="Filter to C4 - B4"
          >
            Mid
          </button>
          <button 
            @click="activeOctave = 'high'" 
            class="px-2 py-0.5 text-[8px] font-bold font-mono rounded cursor-pointer transition-all uppercase"
            :class="[activeOctave === 'high' ? 'bg-neon-cyan text-black shadow-[0_0_6px_#05d9e8]' : 'text-gray-400 hover:text-gray-200']"
            title="Filter to C5 - B5"
          >
            High
          </button>
        </div>

        <!-- Scale Helper Selector (R15) -->
        <div class="flex items-center gap-1 bg-black/40 p-0.5 border border-gray-800 rounded">
          <span class="text-[8px] font-mono text-gray-500 uppercase px-1.5 font-bold flex items-center gap-1">
            <PixelIcon name="helpcircle" class="w-2.5 h-2.5" /> Scale Helper:
          </span>
          <select 
            v-model="activeScale"
            class="bg-transparent border-0 text-neon-pink text-[9px] font-mono outline-none font-bold py-0.5 px-1 uppercase tracking-wider cursor-pointer"
          >
            <option value="chromatic" class="bg-[#121216]">Chromatic</option>
            <option value="major" class="bg-[#121216]">C Major</option>
            <option value="minor" class="bg-[#121216]">C Minor</option>
            <option value="aminor" class="bg-[#121216]">A Minor</option>
          </select>
        </div>
      </div>

      <!-- Info Overlay -->
      <div class="font-mono text-[9px] text-neon-cyan/60 uppercase tracking-widest hidden sm:block">
        Piano Roll :: Double Click Knob to reset
      </div>
    </div>

    <!-- Piano Roll Grid Area -->
    <div class="flex-1 overflow-auto p-4 custom-scrollbar">
      <div class="relative grid grid-cols-[80px_repeat(32,minmax(40px,1fr))] min-w-[max-content] border border-grid-line shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        
        <!-- Línea Láser del Cursor de reproducción -->
        <div 
          v-show="store.currentStep > 0"
          class="absolute top-0 bottom-0 w-0.5 bg-neon-cyan shadow-[0_0_12px_#05d9e8] z-50 pointer-events-none transition-all duration-100 ease-linear"
          :style="{ 
            left: `calc(80px + ((${store.currentStep} - 1) * (100% - 80px) / 32))`,
          }"
        ></div>

        <!-- Columna de esquina vacía -->
        <div class="w-[80px] bg-[#121216] border-r border-b border-grid-line p-2 sticky top-0 left-0 z-40"></div>
        
        <!-- Cabecera de Pasos -->
        <div 
          v-for="step in steps" 
          :key="step" 
          class="text-[9px] text-center border-r border-b border-grid-line py-1 transition-colors sticky top-0 bg-[#121216] z-30 font-mono"
          :class="[
            store.currentStep === step ? 'text-neon-cyan bg-neon-cyan/20 font-bold' : 'text-neon-cyan/40'
          ]"
        >
          {{ step }}
        </div>

        <!-- Filas de notas (R14) -->
        <template v-for="note in visibleNotes" :key="note">
          <!-- Etiqueta de la Nota en el lateral izquierdo -->
          <div 
            class="bg-[#121216] border-r border-b border-grid-line px-3 py-1.5 text-[9px] font-bold font-mono whitespace-nowrap sticky left-0 z-20 flex justify-between items-center"
            :class="[
              isSharp(note) ? 'text-neon-pink' : 'text-neon-cyan',
              !isNoteInSelectedScale(note) ? 'opacity-40 bg-black/60' : ''
            ]"
          >
            <span>{{ note }}</span>
            <!-- Indicador visual si forma parte de la escala seleccionada -->
            <span 
              v-if="activeScale !== 'chromatic' && isNoteInSelectedScale(note)" 
              class="w-1 h-1 rounded-full bg-neon-green/80 shadow-[0_0_4px_#39ff14] ml-1"
            ></span>
          </div>

          <!-- Celdas de la cuadrícula -->
          <div 
            v-for="step in steps" 
            :key="step"
            @click="toggleNote(step, note)"
            @mouseenter="hoveredCell = { step, note }"
            @mouseleave="hoveredCell = null"
            class="border-r border-b border-grid-line cursor-pointer transition-all duration-100 relative min-h-[22px]"
            :class="[
              // Nota activa
              isNoteActive(store.selectedTrackName, step, note) 
                ? 'bg-neon-pink shadow-[inset_0_0_8px_rgba(255,42,109,0.8)]' 
                : isSharp(note) ? 'bg-black/30' : 'bg-transparent',
              
              // Sombreado si está fuera de la escala seleccionada (R16)
              !isNoteInSelectedScale(note) ? 'bg-black/55 opacity-40 border-gray-900/60' : '',
              
              // Celda hover (R17)
              hoveredCell?.step === step && hoveredCell?.note === note && !isNoteActive(store.selectedTrackName, step, note) && isNoteInSelectedScale(note)
                ? 'bg-neon-cyan/15'
                : '',
              
              // Cursor de reproducción actual
              store.currentStep === step && !isNoteActive(store.selectedTrackName, step, note) ? 'bg-neon-cyan/5' : ''
            ]"
          >
            <!-- Overlay interactivo sutil (letra de nota con baja opacidad al hacer hover - R17) -->
            <span 
              v-if="!isNoteActive(store.selectedTrackName, step, note) && hoveredCell?.step === step && hoveredCell?.note === note && isNoteInSelectedScale(note)"
              class="absolute inset-0 flex items-center justify-center text-[7px] font-mono text-neon-cyan/50 font-bold pointer-events-none"
            >
              {{ note }}
            </span>

            <!-- Brillo de la nota activa -->
            <div v-if="isNoteActive(store.selectedTrackName, step, note)" class="absolute inset-0 animate-pulse bg-white/10"></div>
            
            <!-- Ghost Notes de otras pistas -->
            <div 
              v-if="!isNoteActive(store.selectedTrackName, step, note) && getGhostNotes(step, note).length > 0"
              class="absolute inset-[3px] border border-neon-cyan/35 bg-neon-cyan/5 rounded-xs pointer-events-none"
              :title="getGhostNotes(step, note).map(t => t.name).join(', ')"
            ></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Transiciones suaves de opacidad y color */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 100ms;
}
</style>
