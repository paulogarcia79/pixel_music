<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSequencerStore } from '../../stores/sequencer';
import PixelIcon from './PixelIcon.vue';

const store = useSequencerStore();
const brushPatternId = ref(1);
const copySourceId = ref(1);
const snapSteps = ref(8);
const STEP_WIDTH = 12; // pixels por step

const showCopyModal = ref(false);
const modalData = ref({ source: 0, target: 0 });

const maxSteps = computed(() => {
  let max = 64; 
  store.arrangerTracks.forEach(t => {
    t.placements.forEach(p => {
      const size = store.patterns[p.patternId]?.gridSize || 32;
      if (p.startStep + size > max) max = p.startStep + size;
    });
  });
  return max + 64; 
});

const totalWidth = computed(() => maxSteps.value * STEP_WIDTH);

const getPatternSize = (patternId: number) => {
  return store.patterns[patternId]?.gridSize || 32;
};

// Asigna clases de neón fluorescente distintivas según el patternId (R19)
const getPatternNeonClasses = (patternId: number) => {
  const colors = [
    'bg-neon-pink/15 border-neon-pink text-neon-pink hover:bg-neon-pink/25 shadow-[0_0_6px_rgba(255,42,109,0.15)]', // P1
    'bg-neon-cyan/15 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/25 shadow-[0_0_6px_rgba(5,217,232,0.15)]', // P2
    'bg-neon-green/15 border-neon-green text-neon-green hover:bg-neon-green/25 shadow-[0_0_6px_rgba(57,255,20,0.15)]', // P3
    'bg-amber-500/15 border-amber-500 text-amber-400 hover:bg-amber-500/25 shadow-[0_0_6px_rgba(245,158,11,0.15)]', // P4
    'bg-purple-500/15 border-purple-500 text-purple-400 hover:bg-purple-500/25 shadow-[0_0_6px_rgba(168,85,247,0.15)]', // P5
    'bg-orange-500/15 border-orange-500 text-orange-400 hover:bg-orange-500/25 shadow-[0_0_6px_rgba(249,115,22,0.15)]', // P6
    'bg-blue-500/15 border-blue-500 text-blue-400 hover:bg-blue-500/25 shadow-[0_0_6px_rgba(59,130,246,0.15)]', // P7
    'bg-rose-500/15 border-rose-500 text-rose-400 hover:bg-rose-500/25 shadow-[0_0_6px_rgba(244,63,94,0.15)]', // P8
  ];
  const idx = (patternId - 1) % colors.length;
  return colors[idx];
};

// Colocación alineada al Snap de rejilla (R20)
const handleTimelineClick = (arrangerTrackId: number, event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  // Desplazamiento por la columna de cabecera lateral fija (80px)
  const adjustedX = x - 80;
  if (adjustedX < 0) return;
  
  const rawStep = adjustedX / STEP_WIDTH;
  const startStep = Math.floor(rawStep / snapSteps.value) * snapSteps.value;
  store.addPlacement(arrangerTrackId, brushPatternId.value, startStep);
};

const openCopyModal = () => {
  const sourceId = copySourceId.value;
  const targetId = store.currentPatternId;
  if (sourceId !== targetId) {
    modalData.value = { source: sourceId, target: targetId };
    showCopyModal.value = true;
  }
};

const confirmCopy = () => {
  store.duplicatePattern(modalData.value.source, modalData.value.target);
  showCopyModal.value = false;
};
</script>

<template>
  <div class="bg-[#0f0f13] border-t border-grid-line p-4 flex flex-col h-72 flex-shrink-0 select-none">
    <!-- Diálogo modal retro-futurista de alerta de sobreescritura -->
    <div v-if="showCopyModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm">
      <div class="bg-[#121216] border border-neon-cyan p-6 max-w-sm w-full shadow-[0_0_30px_rgba(5,217,232,0.35)] relative rounded">
        <h3 class="text-neon-cyan text-xs font-black uppercase tracking-widest mb-4 border-b border-grid-line pb-2 flex items-center gap-2 font-mono">
          <PixelIcon name="shieldalert" class="w-4 h-4 text-neon-pink" />
          Overwrite Alert
        </h3>
        
        <p class="text-[10px] text-gray-300 leading-relaxed mb-6 font-mono">
          ACTION: OVERWRITE DATA<br/>
          TARGET: <span class="text-neon-pink font-bold">PATTERN {{ modalData.target }}</span><br/>
          SOURCE: <span class="text-neon-cyan font-bold">PATTERN {{ modalData.source }}</span><br/>
          <br/>
          ALL DATA IN PATTERN {{ modalData.target }} WILL BE COMPLETELY REPLACED. PROCEED?
        </p>
        
        <div class="flex gap-4">
          <button 
            @click="confirmCopy"
            class="flex-1 py-2 bg-neon-cyan text-black text-[9px] font-bold uppercase tracking-widest hover:bg-white hover:shadow-[0_0_10px_#05d9e8] transition-all cursor-pointer rounded font-mono"
          >
            Execute
          </button>
          <button 
            @click="showCopyModal = false"
            class="flex-1 py-2 border border-neon-pink text-neon-pink text-[9px] font-bold uppercase tracking-widest hover:bg-neon-pink/20 transition-all cursor-pointer rounded font-mono"
          >
            Abort
          </button>
        </div>
      </div>
    </div>

    <!-- Barra de Herramientas del Arranger -->
    <div class="flex items-center justify-between mb-3 flex-shrink-0">
      <h2 class="text-neon-cyan text-[11px] uppercase tracking-widest font-bold flex items-center gap-2 font-mono">
        <span class="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_4px_#05d9e8]"></span>
        Song Arranger
      </h2>
      
      <div class="flex items-center gap-3">
        <!-- Controles rápidos y snap -->
        <div class="flex items-center gap-2 bg-black/40 border border-gray-800 p-0.5 px-2 rounded">
          <div class="flex items-center gap-1 border-r border-gray-800 pr-2 mr-1">
            <span class="text-[8px] font-mono text-gray-500 uppercase">Copy from:</span>
            <select 
              v-model="copySourceId"
              class="bg-transparent border-0 text-neon-cyan text-[9px] font-mono outline-none font-bold py-0.5 px-1 uppercase tracking-wider cursor-pointer"
            >
              <option v-for="p in 8" :key="p" :value="p" class="bg-[#121216]">P{{ p }}</option>
            </select>
            
            <button 
              @click="openCopyModal"
              class="ml-1 text-[8px] bg-neon-cyan/10 px-2 py-0.5 text-neon-cyan hover:bg-neon-cyan hover:text-black transition-all uppercase border border-neon-cyan/40 font-bold rounded cursor-pointer"
            >
              Copy to P{{ store.currentPatternId }}
            </button>
          </div>

          <span class="text-[8px] font-mono text-gray-500 uppercase">Brush P:</span>
          <select 
            v-model="brushPatternId"
            class="bg-transparent border-0 text-neon-pink text-[9px] font-mono outline-none font-bold py-0.5 px-1 uppercase tracking-wider cursor-pointer"
          >
            <option v-for="p in 8" :key="p" :value="p" class="bg-[#121216]">P{{ p }}</option>
          </select>
          
          <span class="text-[8px] font-mono text-gray-500 uppercase ml-2 border-l border-gray-800 pl-2">Snap:</span>
          <select 
            v-model="snapSteps"
            class="bg-transparent border-0 text-neon-cyan text-[9px] font-mono outline-none font-bold py-0.5 px-1 uppercase tracking-wider cursor-pointer"
          >
            <option :value="1" class="bg-[#121216]">1</option>
            <option :value="4" class="bg-[#121216]">4</option>
            <option :value="8" class="bg-[#121216]">8</option>
            <option :value="16" class="bg-[#121216]">16</option>
            <option :value="32" class="bg-[#121216]">32</option>
          </select>
        </div>

        <button 
          @click="store.addArrangerTrack"
          class="text-[8px] border border-neon-green px-2.5 py-1 text-neon-green hover:bg-neon-green hover:text-black transition-all uppercase font-bold rounded cursor-pointer font-mono"
        >
          + Layer
        </button>

        <!-- Conmutador de modo canción (R22) -->
        <label class="flex items-center gap-2 cursor-pointer group ml-1 bg-neon-pink/5 p-1 px-2 border border-neon-pink/30 rounded">
          <span class="text-[9px] uppercase text-neon-pink font-bold font-mono tracking-wider">Song Mode</span>
          <input 
            type="checkbox" 
            v-model="store.isSongMode" 
            class="hidden"
          />
          <div 
            class="w-7 h-3.5 border border-neon-pink rounded-full relative transition-all"
            :class="store.isSongMode ? 'bg-neon-pink/20' : 'bg-transparent'"
          >
            <div 
              class="absolute top-0.5 w-2 h-2 rounded-full transition-all bg-neon-pink"
              :class="store.isSongMode ? 'left-4' : 'left-0.5'"
            ></div>
          </div>
        </label>
      </div>
    </div>

    <!-- Timeline Grid Matrix (R18) -->
    <div class="flex-1 overflow-x-auto relative border border-grid-line bg-black/40 rounded scrollbar-thin">
      <div class="relative min-h-full" :style="{ width: (totalWidth + 80) + 'px' }">
        <!-- Ruler / Escala Temporal -->
        <div class="h-6 border-b border-grid-line sticky top-0 bg-[#0d0d11] z-20 flex font-mono">
          <div class="w-20 flex-shrink-0 bg-[#121216] border-r border-grid-line"></div>
          <div 
            v-for="step in maxSteps" 
            :key="step"
            class="flex-shrink-0 h-full border-l border-grid-line/10 text-[7px] text-neon-cyan/35 pt-1"
            :style="{ width: STEP_WIDTH + 'px' }"
          >
            <span v-if="(step - 1) % 16 === 0" class="pl-1">{{ step - 1 }}</span>
          </div>
        </div>

        <!-- Arranger Carriles visuales (R18) -->
        <div 
          v-for="track in store.arrangerTracks" 
          :key="track.id" 
          class="h-10 border-b border-grid-line relative flex items-center cursor-crosshair hover:bg-neon-cyan/5 transition-colors"
          @click="handleTimelineClick(track.id, $event)"
        >
          <!-- Track Header -->
          <div class="sticky left-0 top-0 bottom-0 w-20 bg-[#121216]/95 border-r border-grid-line z-10 flex items-center justify-between text-[9px] text-neon-cyan font-bold font-mono px-2 shadow-[2px_0_5px_rgba(0,0,0,0.5)]">
            <span class="truncate">{{ track.name }}</span>
            <button 
              @click.stop="store.removeArrangerTrack(track.id)"
              class="text-neon-pink hover:text-white font-bold cursor-pointer text-xs p-0.5 ml-1"
            >
              ×
            </button>
          </div>

          <!-- Placements / Bloques de patrones coloreados reactivamente (R19, R21) -->
          <div 
            v-for="p in track.placements" 
            :key="p.id"
            class="absolute top-1 bottom-1 border text-[9px] font-mono flex items-center justify-center transition-all rounded-xs z-0 cursor-pointer"
            :class="getPatternNeonClasses(p.patternId)"
            :style="{ left: (p.startStep * STEP_WIDTH + 80) + 'px', width: getPatternSize(p.patternId) * STEP_WIDTH + 'px' }"
            @click.stop="store.removePlacement(track.id, p.id)"
            title="Click to remove placement"
          >
            <span class="font-bold pointer-events-none truncate uppercase tracking-widest">P{{ p.patternId }}</span>
          </div>
        </div>

        <!-- Laser Playhead Line (R22) -->
        <div 
          v-if="store.isSongMode"
          class="absolute top-0 bottom-0 w-0.5 bg-neon-pink shadow-[0_0_12px_#ff2a6d,0_0_4px_#fff] z-30 pointer-events-none transition-all duration-100 ease-linear"
          :style="{ left: (store.globalStep * STEP_WIDTH + 80) + 'px' }"
        ></div>
      </div>
    </div>
    
    <div class="mt-2 text-[8px] text-neon-cyan/40 uppercase tracking-widest font-mono flex items-center gap-1 flex-shrink-0">
      <span class="w-1 h-1 bg-neon-cyan/60 rounded-full"></span>
      Interactive Guide: Select P# in "Brush P", then click layer to place. Click any block to remove (click-to-remove).
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #151522;
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #05d9e8;
}
</style>
