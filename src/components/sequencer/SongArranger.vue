<script setup lang="ts">
import { useSequencerStore } from '../../stores/sequencer';

const store = useSequencerStore();

const addPatternToSequence = (id: number) => {
  store.addToSequence(id);
};

const removePatternFromSequence = (index: number) => {
  store.removeFromSequence(index);
};
</script>

<template>
  <div class="bg-dark-bg border-t border-grid-line p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-neon-cyan text-xs uppercase tracking-widest font-bold">Song Arranger (Sequence)</h2>
      <div class="flex items-center gap-4">
        <button 
          @click="store.duplicatePattern(store.currentPatternId, store.currentPatternId + 1)"
          class="text-[9px] border border-neon-cyan px-2 py-1 text-neon-cyan hover:bg-neon-cyan hover:text-dark-bg transition-all uppercase"
          title="Copy current pattern to next slot"
        >
          Duplicate P{{ store.currentPatternId }}
        </button>
        <label class="flex items-center gap-2 cursor-pointer group">
          <span class="text-[10px] uppercase text-neon-pink group-hover:shadow-[0_0_5px_#ff2a6d]">Song Mode</span>
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

    <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <div 
        v-for="(patternId, index) in store.songSequence" 
        :key="index"
        class="flex-shrink-0 w-24 h-16 border relative group transition-all duration-300"
        :class="[
          store.currentSequenceIndex === index && store.isSongMode
            ? 'border-neon-green bg-neon-green/10 shadow-[0_0_15px_rgba(1,255,195,0.3)]'
            : 'border-grid-line bg-dark-bg hover:border-neon-cyan/50'
        ]"
      >
        <div class="absolute top-1 left-1 text-[8px] text-neon-cyan/50">#{{ index + 1 }}</div>
        <div class="flex items-center justify-center h-full text-xs font-bold" :class="store.currentSequenceIndex === index && store.isSongMode ? 'text-neon-green' : 'text-neon-cyan'">
          PAT {{ patternId }}
        </div>
        <button 
          @click="removePatternFromSequence(index)"
          class="absolute -top-1 -right-1 w-4 h-4 bg-neon-pink text-white text-[8px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          X
        </button>
      </div>

      <!-- Add Pattern Menu -->
      <div class="flex items-center gap-1 pl-4 border-l border-grid-line overflow-x-auto scrollbar-thin">
        <button 
          v-for="p in 16" 
          :key="p"
          @click="addPatternToSequence(p)"
          class="flex-shrink-0 w-10 h-10 border border-dashed border-grid-line text-[10px] text-grid-line hover:border-neon-cyan hover:text-neon-cyan flex items-center justify-center"
        >
          +P{{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}
</style>
