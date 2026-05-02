<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSequencerStore } from '../../stores/sequencer';

const store = useSequencerStore();
const brushPatternId = ref(1);
const snapSteps = ref(8);
const STEP_WIDTH = 12; // pixels per step

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

const handleTimelineClick = (arrangerTrackId: number, event: MouseEvent) => {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const x = event.clientX - rect.left;
  const rawStep = x / STEP_WIDTH;
  const startStep = Math.floor(rawStep / snapSteps.value) * snapSteps.value;
  store.addPlacement(arrangerTrackId, brushPatternId.value, startStep);
};

const copyFromPattern = () => {
  const sourceId = brushPatternId.value;
  const targetId = store.currentPatternId;
  if (sourceId !== targetId) {
    if (confirm(`Sobreescribir P${targetId} con el contenido de P${sourceId}?`)) {
      store.duplicatePattern(sourceId, targetId);
    }
  }
};
</script>

<template>
  <div class="bg-dark-bg border-t border-grid-line p-4 flex flex-col h-72">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-neon-cyan text-xs uppercase tracking-widest font-bold flex items-center gap-2">
        <span class="w-2 h-2 bg-neon-cyan animate-pulse"></span>
        Song Arranger
      </h2>
      
      <div class="flex items-center gap-4">
        <!-- Pattern Brush & Tooling -->
        <div class="flex items-center gap-2 bg-grid-line/20 border border-grid-line p-1 px-2 rounded">
          <span class="text-[8px] text-neon-cyan uppercase">Brush P:</span>
          <select 
            v-model="brushPatternId"
            class="bg-dark-bg border border-grid-line text-neon-cyan text-[10px] p-0.5 outline-none w-12"
          >
            <option v-for="p in 16" :key="p" :value="p">P{{ p }}</option>
          </select>
          
          <button 
            @click="copyFromPattern"
            class="ml-2 text-[8px] bg-neon-cyan/10 px-2 py-1 text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg transition-all uppercase border border-neon-cyan/50"
          >
            Clone to current
          </button>

          <span class="text-[8px] text-neon-cyan uppercase ml-4">Snap:</span>
          <select 
            v-model="snapSteps"
            class="bg-dark-bg border border-grid-line text-neon-cyan text-[10px] p-0.5 outline-none w-12"
          >
            <option :value="1">1</option>
            <option :value="4">4</option>
            <option :value="8">8</option>
            <option :value="16">16</option>
            <option :value="32">32</option>
          </select>
        </div>

        <button 
          @click="store.addArrangerTrack"
          class="text-[9px] border border-neon-green px-3 py-1 text-neon-green hover:bg-neon-green hover:text-dark-bg transition-all uppercase font-bold"
        >
          + Layer
        </button>

        <label class="flex items-center gap-2 cursor-pointer group ml-2 bg-neon-pink/10 p-1 px-2 border border-neon-pink/30 rounded">
          <span class="text-[10px] uppercase text-neon-pink font-bold group-hover:shadow-[0_0_5px_#ff2a6d]">Song Mode</span>
          <input 
            type="checkbox" 
            v-model="store.isSongMode" 
            class="hidden"
          />
          <div 
            class="w-8 h-4 border border-neon-pink rounded-full relative transition-all"
            :class="store.isSongMode ? 'bg-neon-pink/30' : 'bg-transparent'"
          >
            <div 
              class="absolute top-0.5 w-2.5 h-2.5 rounded-full transition-all bg-neon-pink"
              :class="store.isSongMode ? 'left-4.5' : 'left-0.5'"
            ></div>
          </div>
        </label>
      </div>
    </div>

    <!-- Timeline Grid -->
    <div class="flex-1 overflow-x-auto relative border border-grid-line scrollbar-thin bg-dark-bg/80">
      <div class="relative min-h-full" :style="{ width: totalWidth + 'px' }">
        <!-- Ruler -->
        <div class="h-6 border-b border-grid-line sticky top-0 bg-dark-bg z-20 flex">
          <div class="w-20 flex-shrink-0 bg-dark-bg border-r border-grid-line"></div>
          <div 
            v-for="step in maxSteps" 
            :key="step"
            class="flex-shrink-0 h-full border-l border-grid-line/20 text-[7px] text-neon-cyan/40 pt-1"
            :style="{ width: STEP_WIDTH + 'px' }"
          >
            <span v-if="(step - 1) % 16 === 0" class="pl-1">{{ step - 1 }}</span>
          </div>
        </div>

        <!-- Arranger Tracks -->
        <div 
          v-for="track in store.arrangerTracks" 
          :key="track.id" 
          class="h-12 border-b border-grid-line relative group flex items-center cursor-crosshair hover:bg-neon-cyan/5 transition-colors"
          @click="handleTimelineClick(track.id, $event)"
        >
          <!-- Track Header -->
          <div class="sticky left-0 top-0 bottom-0 w-20 bg-dark-bg/90 border-r border-grid-line z-10 flex items-center justify-between text-[9px] text-neon-cyan font-bold px-2 shadow-[5px_0_10px_rgba(0,0,0,0.5)]">
            <span class="truncate">{{ track.name }}</span>
            <button 
              @click.stop="store.removeArrangerTrack(track.id)"
              class="text-neon-pink hover:text-white ml-1"
            >
              ×
            </button>
          </div>

          <!-- Placements -->
          <div 
            v-for="p in track.placements" 
            :key="p.id"
            class="absolute top-1 bottom-1 bg-neon-cyan/15 border border-neon-cyan/60 text-neon-cyan text-[10px] flex items-center justify-between px-1 hover:bg-neon-cyan/30 transition-all rounded-sm z-0"
            :style="{ left: (p.startStep * STEP_WIDTH + 80) + 'px', width: getPatternSize(p.patternId) * STEP_WIDTH + 'px' }"
            @click.stop
          >
            <span class="font-bold pointer-events-none truncate">P{{ p.patternId }}</span>
            <button 
              @click.stop="store.removePlacement(track.id, p.id)"
              class="text-neon-pink hover:text-white bg-dark-bg/80 w-4 h-4 flex items-center justify-center rounded-full text-[8px]"
            >
              ×
            </button>
          </div>
        </div>

        <!-- Playhead Cursor -->
        <div 
          v-if="store.isSongMode"
          class="absolute top-0 bottom-0 w-0.5 bg-neon-pink shadow-[0_0_15px_#ff2a6d] z-30 pointer-events-none transition-all duration-100 ease-linear"
          :style="{ left: (store.globalStep * STEP_WIDTH + 80) + 'px' }"
        ></div>
      </div>
    </div>
    
    <div class="mt-2 text-[8px] text-neon-cyan/40 uppercase tracking-tighter">
      Tip: Select a pattern in "Brush P", then click on a timeline layer to place it. Use "Snap" to align.
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
  background: #1a1a3a;
  border-radius: 3px;
}
.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background: #05d9e8;
}
</style>
