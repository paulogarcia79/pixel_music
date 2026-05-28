<script setup lang="ts">
import { computed } from 'vue';
import { useSequencerStore, type InstrumentType } from '../../stores/sequencer';
import Knob from './Knob.vue';
import PixelIcon from './PixelIcon.vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle'): void;
}>();

const store = useSequencerStore();

// Obtener el track seleccionado actualmente
const selectedTrack = computed(() => {
  return store.currentTracks.find(t => t.name === store.selectedTrackName);
});

// Lista completa de instrumentos agrupados por categoría según specs (con strings para PixelIcon)
const INSTRUMENTS: { type: InstrumentType; name: string; icon: string }[] = [
  // Basic waveforms
  { type: 'square', name: 'Square Wave', icon: 'cpu' },
  { type: 'triangle', name: 'Triangle Wave', icon: 'cpu' },
  { type: 'sawtooth', name: 'Sawtooth Wave', icon: 'cpu' },
  { type: 'sine', name: 'Sine Wave', icon: 'cpu' },
  { type: 'noise', name: 'Noise Generator', icon: 'cpu' },
  
  // Retro Synths
  { type: 'bass_synth', name: 'Pixel Bass', icon: 'waves' },
  { type: 'sub_bass', name: 'Sub Bass', icon: 'waves' },
  { type: 'lead_synth', name: 'Lead Chiptune', icon: 'waves' },
  { type: 'super_saw', name: 'Hyper Saw', icon: 'waves' },
  { type: 'acid_synth', name: 'Acid Bassline', icon: 'waves' },
  { type: 'pad', name: 'Chamber Pad', icon: 'waves' },
  { type: 'fm_pluck', name: 'FM Pluck', icon: 'waves' },
  { type: 'fm_bell', name: 'FM Bell', icon: 'waves' },

  // Percussion
  { type: 'kick', name: '8bit Kick', icon: 'drum' },
  { type: 'snare', name: 'Pixel Snare', icon: 'drum' },
  { type: 'hihat', name: 'Metal HiHat', icon: 'drum' },
  { type: 'tom', name: 'Retro Tom', icon: 'drum' },
  { type: 'clap', name: 'Chipped Clap', icon: 'drum' },
  
  // Keys & Strings
  { type: 'piano_pixel', name: 'Pixel Piano', icon: 'keyboard' },
  { type: 'electric_piano', name: 'E-Piano', icon: 'keyboard' },
  { type: 'organ_pixel', name: 'Pixel Organ', icon: 'keyboard' },
  { type: 'guitar_pixel', name: 'Classic Guitar', icon: 'music' },
  { type: 'guitar_dist', name: 'Power Chord', icon: 'music' },
  { type: 'flute_pixel', name: 'Blowing Flute', icon: 'music' }
];

// Propiedades computadas reactivas bidireccionales vinculadas al store
const trackType = computed({
  get() {
    return selectedTrack.value?.type ?? 'square';
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackType(selectedTrack.value.name, val);
    }
  }
});

const trackAttack = computed({
  get() {
    return selectedTrack.value?.attack ?? 0.01;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackADSR(selectedTrack.value.name, val, selectedTrack.value.release);
    }
  }
});

const trackRelease = computed({
  get() {
    return selectedTrack.value?.release ?? 0.5;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackADSR(selectedTrack.value.name, selectedTrack.value.attack, val);
    }
  }
});

const trackReverb = computed({
  get() {
    return selectedTrack.value?.reverbWet ?? 0.1;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackReverb(selectedTrack.value.name, val);
    }
  }
});

const trackDelay = computed({
  get() {
    return selectedTrack.value?.delayWet ?? 0.1;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackDelay(selectedTrack.value.name, val);
    }
  }
});

// Lógica de cálculo para el visualizador interactivo SVG de la envolvente ADSR
const aWidth = computed(() => {
  const attack = trackAttack.value;
  // Mapea linealmente de 0.001s a 2.0s al rango 0px a 80px
  const pct = (attack - 0.001) / (2.0 - 0.001);
  return pct * 80;
});

const rWidth = computed(() => {
  const release = trackRelease.value;
  // Mapea linealmente de 0.01s a 4.0s al rango 5px a 80px
  const pct = (release - 0.01) / (4.0 - 0.01);
  return 5 + pct * 75;
});

const envelopePath = computed(() => {
  const aw = aWidth.value;
  const rw = rWidth.value;
  
  const pStart = 'M 0 80';
  const pAttack = `L ${aw} 10`;
  const pDecay = `L ${aw + 15} 31`;
  const pSustain = `L ${aw + 15 + 40} 31`;
  const pRelease = `L ${aw + 15 + 40 + rw} 80`;
  
  return `${pStart} ${pAttack} ${pDecay} ${pSustain} ${pRelease}`;
});
</script>

<template>
  <div 
    class="w-full bg-[#121216] border-t border-grid-line transition-all duration-300 ease-in-out select-none"
    :class="[isOpen ? 'h-52' : 'h-8']"
  >
    <!-- Barra superior de control / Expansión y Colapso -->
    <div 
      class="h-8 w-full bg-[#181822] border-b border-grid-line px-4 flex items-center justify-between cursor-pointer hover:bg-[#1d1d2b] transition-colors"
      @click="emit('toggle')"
    >
      <div class="flex items-center gap-2">
        <PixelIcon name="radio" class="w-3.5 h-3.5 text-neon-pink animate-pulse" />
        <span class="font-mono text-[10px] font-bold text-gray-300 uppercase tracking-widest">
          Eurorack Device Panel 
          <span v-if="selectedTrack" class="text-neon-cyan ml-1">:: {{ selectedTrack.name }} ({{ selectedTrack.type }})</span>
        </span>
      </div>

      <button class="text-gray-400 hover:text-white transition-colors p-0.5">
        <PixelIcon v-if="isOpen" name="chevrondown" class="w-4 h-4 text-neon-cyan" />
        <PixelIcon v-else name="chevronup" class="w-4 h-4 text-neon-pink" />
      </button>
    </div>

    <!-- Contenido del Panel Eurorack (Visible sólo cuando isOpen está activo) -->
    <div 
      v-if="isOpen"
      class="h-44 w-full p-4 flex gap-4 overflow-x-auto overflow-y-hidden"
    >
      <div v-if="!selectedTrack" class="w-full h-full flex items-center justify-center font-mono text-xs text-gray-500 uppercase">
        No active track selected
      </div>

      <div v-else class="flex w-full divide-x divide-gray-800/80">
        <!-- 1. OSCILLATOR SECTION (Selector de Sintetizador / Tipo) -->
        <div class="flex-1 pr-4 flex flex-col justify-between">
          <div class="flex items-center gap-1.5 mb-2">
            <PixelIcon name="sliders" class="w-3.5 h-3.5 text-neon-pink" />
            <span class="font-mono text-[10px] font-bold tracking-wider text-gray-400 uppercase">1. Oscillator Section</span>
          </div>

          <div class="flex flex-col gap-1.5 overflow-y-auto max-h-28 pr-1 custom-scrollbar">
            <button
              v-for="inst in INSTRUMENTS"
              :key="inst.type"
              class="flex items-center gap-2 px-2 py-1 bg-black/40 border text-left font-mono text-[9px] rounded uppercase transition-all duration-150 active:scale-95 cursor-pointer"
              :class="[
                trackType === inst.type 
                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-[0_0_8px_rgba(5,217,232,0.15)] font-bold' 
                  : 'border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
              ]"
              @click="trackType = inst.type"
            >
              <PixelIcon :name="inst.icon" class="w-3 h-3 flex-shrink-0" />
              <span class="truncate">{{ inst.name }}</span>
            </button>
          </div>
        </div>

        <!-- 2. ADSR ENVELOPE SECTION (Attack / Release + Visualizador) -->
        <div class="flex-[1.5] px-4 flex justify-between gap-4">
          <div class="flex flex-col justify-between">
            <div class="flex items-center gap-1.5 mb-2">
              <PixelIcon name="activity" class="w-3.5 h-3.5 text-neon-pink" />
              <span class="font-mono text-[10px] font-bold tracking-wider text-gray-400 uppercase">2. ADSR Envelope</span>
            </div>

            <!-- Perillas de control ADSR -->
            <div class="flex gap-4 items-center">
              <Knob 
                v-model="trackAttack"
                :min="0.001"
                :max="2.0"
                :step="0.01"
                :defaultValue="0.01"
                label="Attack"
                unit="s"
              />
              <Knob 
                v-model="trackRelease"
                :min="0.01"
                :max="4.0"
                :step="0.05"
                :defaultValue="0.5"
                label="Release"
                unit="s"
              />
            </div>
          </div>

          <!-- Mini-visualizador interactivo de envolvente -->
          <div class="flex flex-col justify-between w-48 h-full">
            <span class="text-[8px] font-mono text-gray-500 uppercase tracking-widest text-right">Envelope Shape</span>
            <div class="relative w-full h-[80px] bg-black/60 rounded border border-gray-800/80 shadow-inner overflow-hidden">
              <svg class="w-full h-full" viewBox="0 0 200 80">
                <!-- Grilla fluorescente retro -->
                <defs>
                  <pattern id="device-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(5, 217, 232, 0.05)" stroke-width="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#device-grid)" />
                
                <!-- Curva ADSR fluorescente -->
                <path 
                  :d="envelopePath" 
                  fill="none" 
                  stroke="#ff2a6d" 
                  stroke-width="1.8" 
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="filter drop-shadow-[0_0_3px_#ff2a6d]" 
                />
                
                <!-- Nodos interactivos/visuales -->
                <circle :cx="aWidth" cy="10" r="2.5" fill="#05d9e8" class="shadow-lg" />
                <circle :cx="aWidth + 15" cy="31" r="2.5" fill="#05d9e8" />
                <circle :cx="aWidth + 15 + 40" cy="31" r="2.5" fill="#05d9e8" />
                <circle :cx="aWidth + 15 + 40 + rWidth" cy="80" r="2.5" fill="#05d9e8" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 3. FX RACK SECTION (Reverb / Delay) -->
        <div class="flex-1 pl-4 flex flex-col justify-between">
          <div class="flex items-center gap-1.5 mb-2">
            <PixelIcon name="sliders" class="w-3.5 h-3.5 text-neon-pink" />
            <span class="font-mono text-[10px] font-bold tracking-wider text-gray-400 uppercase">3. FX Send Rack</span>
          </div>

          <!-- Perillas de control FX -->
          <div class="flex gap-6 items-center flex-1 justify-center">
            <Knob 
              v-model="trackReverb"
              :min="0.0"
              :max="1.0"
              :step="0.01"
              :defaultValue="0.1"
              label="Reverb"
              unit="%"
            />
            <Knob 
              v-model="trackDelay"
              :min="0.0"
              :max="1.0"
              :step="0.01"
              :defaultValue="0.1"
              label="Delay"
              unit="%"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 42, 109, 0.3);
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 42, 109, 0.6);
}
</style>
