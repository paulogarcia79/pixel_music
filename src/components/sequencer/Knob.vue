<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  defaultValue?: number;
}>(), {
  min: 0,
  max: 1,
  step: 0.01,
  label: '',
  unit: '',
  defaultValue: 0
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const isDragging = ref(false);
const startY = ref(0);
const startValue = ref(0);

// Calcula el ángulo de rotación de -135 a 135 grados (270 grados en total)
const angle = computed(() => {
  const range = props.max - props.min;
  if (range === 0) return 0;
  const percentage = (props.modelValue - props.min) / range;
  return -135 + percentage * 270;
});

// Formatea el valor para mostrarlo
const formattedValue = computed(() => {
  if (props.step >= 0.1) {
    return props.modelValue.toFixed(1);
  }
  return props.modelValue.toFixed(2);
});

// Lógica de arrastre
function handleMouseDown(e: MouseEvent) {
  isDragging.value = true;
  startY.value = e.clientY;
  startValue.value = props.modelValue;

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;

  const deltaY = startY.value - e.clientY; // Mover hacia arriba incrementa
  const range = props.max - props.min;
  const sensitivity = 150; // Píxeles necesarios para recorrer de min a max
  
  let newValue = startValue.value + (deltaY / sensitivity) * range;
  
  // Limitar rango
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  
  // Ajustar al step
  const steps = Math.round((newValue - props.min) / props.step);
  newValue = props.min + steps * props.step;
  
  // Redondear para evitar flotantes raros
  newValue = parseFloat(newValue.toFixed(4));
  newValue = Math.max(props.min, Math.min(props.max, newValue));

  emit('update:modelValue', newValue);
}

function handleMouseUp() {
  if (isDragging.value) {
    isDragging.value = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }
}

// Soporte táctil
function handleTouchStart(e: TouchEvent) {
  if (e.touches.length !== 1) return;
  isDragging.value = true;
  startY.value = e.touches[0].clientY;
  startValue.value = props.modelValue;

  window.addEventListener('touchmove', handleTouchMove);
  window.addEventListener('touchend', handleTouchEnd);
}

function handleTouchMove(e: TouchEvent) {
  if (!isDragging.value || e.touches.length !== 1) return;

  const deltaY = startY.value - e.touches[0].clientY;
  const range = props.max - props.min;
  const sensitivity = 150;
  
  let newValue = startValue.value + (deltaY / sensitivity) * range;
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  
  const steps = Math.round((newValue - props.min) / props.step);
  newValue = props.min + steps * props.step;
  
  newValue = parseFloat(newValue.toFixed(4));
  newValue = Math.max(props.min, Math.min(props.max, newValue));

  emit('update:modelValue', newValue);
}

function handleTouchEnd() {
  if (isDragging.value) {
    isDragging.value = false;
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', handleTouchEnd);
  }
}

// Reset al valor por defecto con doble clic
function handleDoubleClick() {
  emit('update:modelValue', props.defaultValue);
}

// Soporte para la rueda del ratón
function handleWheel(e: WheelEvent) {
  e.preventDefault();
  const direction = e.deltaY > 0 ? -1 : 1;
  let newValue = props.modelValue + direction * props.step;
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  
  newValue = parseFloat(newValue.toFixed(4));
  newValue = Math.max(props.min, Math.min(props.max, newValue));
  
  emit('update:modelValue', newValue);
}

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('touchmove', handleTouchMove);
  window.removeEventListener('touchend', handleTouchEnd);
});
</script>

<template>
  <div class="flex flex-col items-center select-none font-mono text-center">
    <!-- Etiqueta superior -->
    <span class="text-[9px] uppercase tracking-wider text-gray-400 mb-1 font-bold">{{ label }}</span>

    <!-- Estructura visual de la perilla Eurorack -->
    <div 
      class="relative w-12 h-12 rounded-full border border-gray-700 bg-gradient-to-b from-gray-800 to-black flex items-center justify-center cursor-ns-resize shadow-md hover:border-neon-pink/50 transition-colors duration-150"
      :class="{ 'border-neon-pink shadow-[0_0_8px_rgba(255,42,109,0.3)]': isDragging }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
      @dblclick="handleDoubleClick"
      @wheel="handleWheel"
    >
      <!-- Capa de estrías metálicas retro -->
      <div class="absolute inset-0.5 rounded-full border border-gray-900 bg-radial from-gray-700 to-gray-900 shadow-inner flex items-center justify-center">
        <!-- Indicador físico que rota -->
        <div 
          class="w-full h-full relative" 
          :style="{ transform: `rotate(${angle}deg)` }"
        >
          <!-- Línea indicadora fluorescente -->
          <div class="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-neon-pink rounded-full shadow-[0_0_4px_#ff2a6d]"></div>
        </div>
      </div>
    </div>

    <!-- Pantalla digital de valor -->
    <div class="mt-1 px-1 bg-black/40 border border-gray-800/60 rounded text-[9px] min-w-10 py-0.5 font-mono text-neon-cyan shadow-inner">
      {{ formattedValue }}<span class="text-[7px] text-gray-500 ml-0.5">{{ unit }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Estilos adicionales de microinteracciones */
.bg-radial {
  background-image: radial-gradient(circle, var(--tw-gradient-stops));
}
</style>
