<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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

// T2: Definición de tipos rigurosos para las categorías del catálogo de instrumentos
type InstrumentCategory = 'WAV' | 'SYN' | 'DRM' | 'KEY';

interface InstrumentDefinition {
  type: InstrumentType;
  name: string;
  icon: string;
  category: InstrumentCategory;
}

// Lista completa de instrumentos agrupados por categoría según specs (con strings para PixelIcon)
const INSTRUMENTS: InstrumentDefinition[] = [
  // WAV
  { type: 'square', name: 'Square Wave', icon: 'cpu', category: 'WAV' },
  { type: 'triangle', name: 'Triangle Wave', icon: 'cpu', category: 'WAV' },
  { type: 'sawtooth', name: 'Sawtooth Wave', icon: 'cpu', category: 'WAV' },
  { type: 'sine', name: 'Sine Wave', icon: 'cpu', category: 'WAV' },
  { type: 'noise', name: 'Noise Generator', icon: 'cpu', category: 'WAV' },
  { type: 'pulse', name: 'Pulse Wave', icon: 'cpu', category: 'WAV' },
  { type: 'pwm', name: 'PWM Oscillator', icon: 'cpu', category: 'WAV' },

  // SYN
  { type: 'bass_synth', name: 'Pixel Bass', icon: 'waves', category: 'SYN' },
  { type: 'sub_bass', name: 'Sub Bass', icon: 'waves', category: 'SYN' },
  { type: 'lead_synth', name: 'Lead Chiptune', icon: 'waves', category: 'SYN' },
  { type: 'super_saw', name: 'Hyper Saw', icon: 'waves', category: 'SYN' },
  { type: 'acid_synth', name: 'Acid Bassline', icon: 'waves', category: 'SYN' },
  { type: 'pad', name: 'Chamber Pad', icon: 'waves', category: 'SYN' },
  { type: 'fm_pluck', name: 'FM Pluck', icon: 'waves', category: 'SYN' },
  { type: 'fm_bell', name: 'FM Bell', icon: 'waves', category: 'SYN' },

  // DRM
  { type: 'kick', name: '8bit Kick', icon: 'drum', category: 'DRM' },
  { type: 'snare', name: 'Pixel Snare', icon: 'drum', category: 'DRM' },
  { type: 'hihat', name: 'Metal HiHat', icon: 'drum', category: 'DRM' },
  { type: 'tom', name: 'Retro Tom', icon: 'drum', category: 'DRM' },
  { type: 'clap', name: 'Chipped Clap', icon: 'drum', category: 'DRM' },
  { type: 'rimshot', name: 'Rimshot', icon: 'drum', category: 'DRM' },
  { type: 'cowbell', name: 'Cowbell', icon: 'drum', category: 'DRM' },

  // KEY
  { type: 'piano_pixel', name: 'Pixel Piano', icon: 'keyboard', category: 'KEY' },
  { type: 'electric_piano', name: 'E-Piano', icon: 'keyboard', category: 'KEY' },
  { type: 'organ_pixel', name: 'Pixel Organ', icon: 'keyboard', category: 'KEY' },
  { type: 'church_organ', name: 'Church Organ', icon: 'keyboard', category: 'KEY' },
  { type: 'guitar_pixel', name: 'Classic Guitar', icon: 'music', category: 'KEY' },
  { type: 'guitar_dist', name: 'Power Chord', icon: 'music', category: 'KEY' },
  { type: 'flute_pixel', name: 'Blowing Flute', icon: 'music', category: 'KEY' },
  { type: 'retro_brass', name: 'Retro Brass', icon: 'music', category: 'KEY' }
];

// T3: Estado reactivo local para la pestaña de categoría activa
const activeTab = ref<InstrumentCategory>('WAV');

// T4: Pistas filtradas rigurosamente por la pestaña activa
const filteredInstruments = computed(() => {
  return INSTRUMENTS.filter(inst => inst.category === activeTab.value);
});

// T5: Auto-foco reactivo bidireccional síncrono (watch de pista activa -> pestaña de categoría)
watch(
  () => selectedTrack.value?.type,
  (newType) => {
    if (newType) {
      const matchedInstrument = INSTRUMENTS.find(inst => inst.type === newType);
      if (matchedInstrument) {
        activeTab.value = matchedInstrument.category;
      }
    }
  },
  { immediate: true }
);

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
      store.setTrackADSR(
        selectedTrack.value.name,
        val,
        selectedTrack.value.decay,
        selectedTrack.value.sustain,
        selectedTrack.value.release
      );
    }
  }
});

const trackDecay = computed({
  get() {
    return selectedTrack.value?.decay ?? 0.1;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackADSR(
        selectedTrack.value.name,
        selectedTrack.value.attack,
        val,
        selectedTrack.value.sustain,
        selectedTrack.value.release
      );
    }
  }
});

const trackSustain = computed({
  get() {
    return selectedTrack.value?.sustain ?? 0.8;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackADSR(
        selectedTrack.value.name,
        selectedTrack.value.attack,
        selectedTrack.value.decay,
        val,
        selectedTrack.value.release
      );
    }
  }
});

const trackRelease = computed({
  get() {
    return selectedTrack.value?.release ?? 0.5;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackADSR(
        selectedTrack.value.name,
        selectedTrack.value.attack,
        selectedTrack.value.decay,
        selectedTrack.value.sustain,
        val
      );
    }
  }
});

const trackDampening = computed({
  get() {
    return selectedTrack.value?.dampening ?? 4000;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackPhysicalModel(selectedTrack.value.name, val, selectedTrack.value.resonance);
    }
  }
});

const trackResonance = computed({
  get() {
    return selectedTrack.value?.resonance ?? 0.95;
  },
  set(val) {
    if (selectedTrack.value) {
      store.setTrackPhysicalModel(selectedTrack.value.name, selectedTrack.value.dampening, val);
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
const aw = computed(() => {
  const attack = trackAttack.value;
  return ((attack - 0.001) / 2) * 45;
});

const dw = computed(() => {
  const decay = trackDecay.value;
  return ((decay - 0.01) / 2) * 45;
});

const sh = computed(() => {
  const sustain = trackSustain.value;
  return 80 - (sustain * 70);
});

const rw = computed(() => {
  const release = trackRelease.value;
  return ((release - 0.01) / 4) * 50;
});

const sw = 25; // constante

const envelopePath = computed(() => {
  const a = aw.value;
  const d = dw.value;
  const h = sh.value;
  const r = rw.value;
  const s = sw;

  return `M 0 80 L ${a} 10 L ${a + d} ${h} L ${a + d + s} ${h} L ${a + d + s + r} 80`;
});

const isPercussion = computed(() => {
  if (!selectedTrack.value) return false;
  const percussionTypes = ['kick', 'snare', 'hihat', 'tom', 'clap', 'crash', 'conga', 'cowbell', 'woodblock', 'shaker', 'rimshot'];
  return percussionTypes.includes(selectedTrack.value.type);
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

          <!-- T6: Barra de pestañas (WAV, SYN, DRM, KEY) -->
          <div class="flex border-b border-gray-800/80 mb-2 gap-1">
            <button
              v-for="tab in (['WAV', 'SYN', 'DRM', 'KEY'] as const)"
              :key="tab"
              @click="activeTab = tab"
              class="flex-1 py-1 font-mono text-[9px] font-bold tracking-wider uppercase border-t border-x rounded-t transition-all cursor-pointer text-center"
              :class="[
                activeTab === tab 
                  ? 'bg-[#181822] border-neon-cyan/50 text-neon-cyan shadow-[0_-2px_6px_rgba(5,217,232,0.1)]' 
                  : 'bg-black/20 border-transparent text-gray-500 hover:text-gray-300 hover:bg-black/40'
              ]"
            >
              {{ tab }}
            </button>
          </div>

          <!-- T7, T8, T9: Rejilla compacta de dos columnas con botones de 24px -->
          <div class="grid grid-cols-2 gap-1 overflow-y-auto max-h-[104px] pr-1 custom-scrollbar">
            <button
              v-for="inst in filteredInstruments"
              :key="inst.type"
              class="flex items-center gap-1.5 px-1.5 h-6 bg-black/40 border text-left font-mono text-[8px] rounded uppercase transition-all duration-150 active:scale-95 cursor-pointer min-w-0"
              :class="[
                trackType === inst.type 
                  ? 'border-neon-cyan text-neon-cyan bg-neon-cyan/5 shadow-[0_0_8px_rgba(5,217,232,0.15)] font-bold' 
                  : 'border-gray-800/60 text-gray-400 hover:border-gray-700 hover:text-gray-300'
              ]"
              @click="trackType = inst.type"
            >
              <PixelIcon :name="inst.icon" class="w-2.5 h-2.5 flex-shrink-0" />
              <span class="truncate">{{ inst.name }}</span>
            </button>
          </div>
        </div>

        <!-- 2. ADSR ENVELOPE SECTION (Attack / Decay / Sustain / Release + Visualizador) -->
        <div class="flex-[1.5] px-4 flex justify-between gap-4">
          <template v-if="!isPercussion">
            <div class="flex flex-col justify-between">
              <div class="flex items-center gap-1.5 mb-2">
                <PixelIcon name="activity" class="w-3.5 h-3.5 text-neon-pink" />
                <span class="font-mono text-[10px] font-bold tracking-wider text-gray-400 uppercase">2. ADSR Envelope</span>
              </div>

              <!-- Perillas de control ADSR -->
              <div class="flex gap-2 items-center">
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
                  v-model="trackDecay"
                  :min="0.01"
                  :max="2.0"
                  :step="0.01"
                  :defaultValue="0.1"
                  label="Decay"
                  unit="s"
                />
                <Knob 
                  v-model="trackSustain"
                  :min="0.0"
                  :max="1.0"
                  :step="0.05"
                  :defaultValue="0.8"
                  label="Sustain"
                  unit=""
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
                  <circle :cx="aw" cy="10" r="2.5" fill="#05d9e8" class="shadow-lg" />
                  <circle :cx="aw + dw" :cy="sh" r="2.5" fill="#05d9e8" />
                  <circle :cx="aw + dw + sw" :cy="sh" r="2.5" fill="#05d9e8" />
                  <circle :cx="aw + dw + sw + rw" cy="80" r="2.5" fill="#05d9e8" />
                </svg>
              </div>
            </div>
          </template>
          <div v-else class="w-full h-full flex flex-col justify-center bg-black/50 border border-dashed border-neon-cyan/30 rounded p-3 select-none">
            <div class="flex items-center gap-2 mb-1.5 text-neon-cyan filter drop-shadow-[0_0_2px_rgba(5,217,232,0.4)]">
              <PixelIcon name="drum" class="w-4 h-4 animate-bounce" />
              <span class="font-mono text-[10px] font-bold tracking-widest uppercase">
                DRUM SYNTHESIS: TRANSIENT ENVELOPE IS AUTOMATIC
              </span>
            </div>
            <p class="font-mono text-[9px] text-gray-400 leading-normal">
              Short-duration transient pulses are automatically managed by the dedicated retro percussion synthesis engine. Prolonged ADSR envelope shaping is disabled to maintain snappy transient response.
            </p>
          </div>
        </div>

        <!-- PHYSICAL MODELING SECTION (guitar_pixel only) -->
        <div v-if="selectedTrack.type === 'guitar_pixel'" class="flex-1 px-4 flex flex-col justify-between">
          <div class="flex items-center gap-1.5 mb-2">
            <PixelIcon name="music" class="w-3.5 h-3.5 text-neon-pink" />
            <span class="font-mono text-[10px] font-bold tracking-wider text-gray-400 uppercase">Physical Modeling</span>
          </div>

          <!-- Perillas de control Physical Modeling -->
          <div class="flex gap-4 items-center flex-1 justify-center">
            <Knob 
              v-model="trackDampening"
              :min="100"
              :max="8000"
              :step="100"
              :defaultValue="4000"
              label="Dampening"
              unit="Hz"
            />
            <Knob 
              v-model="trackResonance"
              :min="0.0"
              :max="0.99"
              :step="0.01"
              :defaultValue="0.95"
              label="Resonance"
              unit=""
            />
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
